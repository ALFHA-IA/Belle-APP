using System.Collections.Concurrent;
using System.Net;
using System.Security.Cryptography;
using Belle.Api.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Logging.Abstractions;

var carpeta = Path.Combine(Path.GetTempPath(), "belle-pruebas-push-" + Guid.NewGuid());
Directory.CreateDirectory(carpeta);
var builder = WebApplication.CreateBuilder(new WebApplicationOptions { ContentRootPath = carpeta });
var proveedor = new ProveedorSimulado();
ServicioNotificacionesPush CrearServicio() => new(builder.Environment, builder.Configuration,
    NullLogger<ServicioNotificacionesPush>.Instance, proveedor);
static void Verificar(bool condicion, string mensaje) { if (!condicion) throw new Exception(mensaje); }
static SuscripcionNotificaciones Suscripcion(string nombre)
{
    using var curva = ECDiffieHellman.Create(ECCurve.NamedCurves.nistP256);
    var punto = curva.ExportParameters(false).Q;
    static string Codificar(byte[] bytes) => Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    return new("https://fcm.googleapis.com/fcm/send/" + nombre,
        Codificar([4, .. punto.X!, .. punto.Y!]), Codificar(RandomNumberGenerator.GetBytes(16)));
}

using var servicio = CrearServicio();
var cliente = Suscripcion("cliente");
var instructor = Suscripcion("instructor");
var admin = Suscripcion("admin");
Verificar(ServicioNotificacionesPush.EsValida(cliente), "Debe aceptar una suscripción Web Push válida.");
foreach (var endpoint in new[] { "http://fcm.googleapis.com/test", "https://localhost/test", "https://127.0.0.1/test", "https://fcm.googleapis.com.ejemplo.com/test", "https://fcm.googleapis.com:444/test" })
    Verificar(!ServicioNotificacionesPush.EsValida(cliente with { Endpoint = endpoint }), "Debe rechazar destinos no autorizados.");
Verificar(!ServicioNotificacionesPush.EsValida(cliente with { Auth = "invalida" }), "Debe validar las claves.");
Verificar(servicio.ProgramarPrueba("sin-cuenta", "Cliente") == "sin-dispositivo", "No debe programar sin dispositivo.");
servicio.Registrar("1", "Cliente", cliente);
servicio.Registrar("2", "Instructor", instructor);
servicio.Registrar("3", "Admin", admin);
servicio.Eliminar("2", cliente.Endpoint);
Verificar(servicio.ProgramarPrueba("1", "Cliente") == "programada", "Otra cuenta no puede eliminar la suscripción.");
Verificar(servicio.ProgramarPrueba("1", "Cliente") == "ocupado", "Debe limitar pruebas simultáneas.");
Verificar(servicio.ProgramarPrueba("2", "Instructor") == "programada", "Debe programar para profesor.");
Verificar(servicio.ProgramarPrueba("3", "Admin") == "programada", "Debe programar para admin.");
using (var reabierto = CrearServicio())
{
    Verificar(reabierto.ClavePublica == servicio.ClavePublica, "Las claves deben sobrevivir a reinicios.");
    Verificar(reabierto.ProgramarPrueba("1", "Cliente") == "programada", "Las suscripciones deben persistir.");
}
await servicio.StartAsync(CancellationToken.None);
var limite = DateTime.UtcNow.AddSeconds(25);
while (proveedor.Envios.Count < 9 && DateTime.UtcNow < limite) await Task.Delay(100);
await servicio.StopAsync(CancellationToken.None);
Verificar(proveedor.Envios.Count(e => e.EndsWith("/cliente")) == 2, "Cliente recibe dos avisos.");
Verificar(proveedor.Envios.Count(e => e.EndsWith("/instructor")) == 1, "Profesor recibe un horario.");
Verificar(proveedor.Envios.Count(e => e.EndsWith("/admin")) == 6, "Admin recibe sus tres avisos y copia de clientes/profesores.");
Verificar(proveedor.Cifrados == 9, "Todos los envíos deben estar cifrados y firmados con VAPID.");

using var vencidas = CrearServicio();
var caducado = Suscripcion("caducado");
vencidas.Registrar("4", "Cliente", caducado);
vencidas.ProgramarPrueba("4", "Cliente");
await vencidas.StartAsync(CancellationToken.None);
limite = DateTime.UtcNow.AddSeconds(25);
while (!proveedor.Envios.Any(e => e.EndsWith("/caducado")) && DateTime.UtcNow < limite) await Task.Delay(100);
await vencidas.StopAsync(CancellationToken.None);
Verificar(vencidas.ProgramarPrueba("4", "Cliente") == "sin-dispositivo", "Una respuesta 410 debe eliminar la suscripción.");
vencidas.Registrar("5", "Instructor", cliente);
Verificar(vencidas.ProgramarPrueba("1", "Cliente") == "sin-dispositivo", "Cambiar de cuenta debe reemplazar al propietario del dispositivo.");
Console.WriteLine("OK: cifrado/VAPID, destinatarios por rol, copia a admin, persistencia, aislamiento, límite de pruebas y baja de suscripciones vencidas.");

sealed class ProveedorSimulado : HttpMessageHandler, IHttpClientFactory
{
    public ConcurrentBag<string> Envios { get; } = [];
    public int Cifrados;
    public HttpClient CreateClient(string name) => new(this, disposeHandler: false);
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var contenido = await request.Content!.ReadAsByteArrayAsync(cancellationToken);
        if (contenido.Length > 0 && request.Headers.Authorization?.Scheme == "vapid" && request.Content.Headers.ContentEncoding.Contains("aes128gcm"))
            Interlocked.Increment(ref Cifrados);
        var endpoint = request.RequestUri!.AbsoluteUri;
        Envios.Add(endpoint);
        return new(endpoint.EndsWith("/caducado") ? HttpStatusCode.Gone : HttpStatusCode.Created);
    }
}
