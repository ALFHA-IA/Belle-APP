using System.Net;
using System.Security.Cryptography;
using System.Text.Json;
using Lib.Net.Http.WebPush;
using Lib.Net.Http.WebPush.Authentication;

namespace Belle.Api.Services;

public record SuscripcionNotificaciones(string Endpoint, string P256dh, string Auth);
public record DispositivoNotificaciones(string Usuario, string Rol, SuscripcionNotificaciones Suscripcion);
public record ClavesNotificaciones(string Publica, string Privada);
public record PruebaNotificaciones(string Usuario, string Rol, DateTimeOffset EnviarEn);

// Almacén temporal de una sola instancia. Sustituir por repositorio SQL al conectar la tabla.
public sealed class ServicioNotificacionesPush : BackgroundService
{
    private readonly object cerrojo = new();
    private readonly string archivoDispositivos;
    private readonly ClavesNotificaciones claves;
    private readonly string contacto;
    private readonly ILogger<ServicioNotificacionesPush> logger;
    private readonly List<DispositivoNotificaciones> dispositivos;
    private readonly Dictionary<string, PruebaNotificaciones> pruebas = new();
    private readonly PushServiceClient cliente;
    private readonly HttpClient transporte;

    public ServicioNotificacionesPush(IWebHostEnvironment entorno, IConfiguration configuracion, ILogger<ServicioNotificacionesPush> logger, IHttpClientFactory clientes)
    {
        this.logger = logger;
        transporte = clientes.CreateClient("NotificacionesPush");
        cliente = new PushServiceClient(transporte) { AutoRetryAfter = false };
        var carpeta = Path.Combine(entorno.ContentRootPath, "DatosNotificaciones");
        Directory.CreateDirectory(carpeta);
        var archivoClaves = Path.Combine(carpeta, "claves.json");
        if (File.Exists(archivoClaves))
            claves = JsonSerializer.Deserialize<ClavesNotificaciones>(File.ReadAllText(archivoClaves))
                ?? throw new InvalidOperationException("El archivo de claves push no es válido.");
        else
        {
            using var curva = ECDsa.Create(ECCurve.NamedCurves.nistP256);
            var parametros = curva.ExportParameters(true);
            static string Codificar(byte[] datos) => Convert.ToBase64String(datos).TrimEnd('=').Replace('+', '-').Replace('/', '_');
            claves = new(Codificar([4, .. parametros.Q.X!, .. parametros.Q.Y!]), Codificar(parametros.D!));
            GuardarArchivo(archivoClaves, claves);
        }
        archivoDispositivos = Path.Combine(carpeta, "suscripciones.json");
        dispositivos = File.Exists(archivoDispositivos)
            ? JsonSerializer.Deserialize<List<DispositivoNotificaciones>>(File.ReadAllText(archivoDispositivos))
                ?? throw new InvalidOperationException("El archivo de suscripciones push no es válido.")
            : [];
        contacto = configuracion["NotificacionesPush:Contacto"] ?? "https://bellebarre.pe";
    }

    public string ClavePublica => claves.Publica;

    public static bool EsValida(SuscripcionNotificaciones suscripcion)
    {
        if (suscripcion.Endpoint?.Length > 4096 || !Uri.TryCreate(suscripcion.Endpoint, UriKind.Absolute, out var uri) ||
            uri.Scheme != "https" || !uri.IsDefaultPort || uri.UserInfo.Length > 0 || uri.Fragment.Length > 0) return false;
        // Solo proveedores Web Push conocidos: no permitir destinos arbitrarios desde el cliente.
        var host = uri.IdnHost;
        if (!(host == "fcm.googleapis.com" || host == "updates.push.services.mozilla.com" ||
            host == "web.push.apple.com" || host.EndsWith(".push.apple.com", StringComparison.Ordinal) ||
            host.EndsWith(".notify.windows.com", StringComparison.Ordinal))) return false;
        try
        {
            static byte[] Decodificar(string valor) => Convert.FromBase64String(valor.Replace('-', '+').Replace('_', '/').PadRight((valor.Length + 3) / 4 * 4, '='));
            if (suscripcion.P256dh is null || suscripcion.Auth is null || suscripcion.P256dh.Length > 100 || suscripcion.Auth.Length > 30) return false;
            var punto = Decodificar(suscripcion.P256dh);
            if (punto.Length != 65 || punto[0] != 4 || Decodificar(suscripcion.Auth).Length != 16) return false;
            using var curva = ECDiffieHellman.Create(new ECParameters
            {
                Curve = ECCurve.NamedCurves.nistP256,
                Q = new ECPoint { X = punto[1..33], Y = punto[33..65] }
            });
            return true;
        }
        catch (Exception error) when (error is FormatException or CryptographicException or ArgumentException) { return false; }
    }

    public void Registrar(string usuario, string rol, SuscripcionNotificaciones suscripcion)
    {
        lock (cerrojo)
        {
            dispositivos.RemoveAll(d => d.Suscripcion.Endpoint == suscripcion.Endpoint);
            // Evitar acumulación ilimitada de dispositivos en este almacén de pruebas.
            while (dispositivos.Count(d => d.Usuario == usuario) >= 10)
                dispositivos.Remove(dispositivos.First(d => d.Usuario == usuario));
            dispositivos.Add(new(usuario, rol, suscripcion));
            GuardarArchivo(archivoDispositivos, dispositivos);
        }
    }

    public void Eliminar(string usuario, string endpoint)
    {
        lock (cerrojo)
        {
            dispositivos.RemoveAll(d => d.Usuario == usuario && d.Suscripcion.Endpoint == endpoint);
            GuardarArchivo(archivoDispositivos, dispositivos);
        }
    }

    public string ProgramarPrueba(string usuario, string rol)
    {
        lock (cerrojo)
        {
            if (!dispositivos.Any(d => d.Usuario == usuario && d.Rol == rol)) return "sin-dispositivo";
            if (pruebas.ContainsKey(usuario) || pruebas.Count >= 100) return "ocupado";
            pruebas.Add(usuario, new(usuario, rol, DateTimeOffset.UtcNow.AddSeconds(15)));
            return "programada";
        }
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var reloj = new PeriodicTimer(TimeSpan.FromSeconds(1));
        while (await reloj.WaitForNextTickAsync(stoppingToken))
        {
            List<PruebaNotificaciones> pendientes;
            lock (cerrojo) pendientes = pruebas.Values.Where(p => p.EnviarEn <= DateTimeOffset.UtcNow).ToList();
            foreach (var prueba in pendientes)
            {
                try { await EnviarPrueba(prueba, stoppingToken); }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { return; }
                catch (Exception error) { logger.LogWarning("No se pudo completar la prueba push ({Tipo}).", error.GetType().Name); }
                finally { lock (cerrojo) pruebas.Remove(prueba.Usuario); }
            }
        }
    }

    private async Task EnviarPrueba(PruebaNotificaciones prueba, CancellationToken cancelacion)
    {
        var avisos = new[]
        {
            new { rol = "Cliente", titulo = "Recordatorio de clase", mensaje = "Prueba Belle: tu clase de Barre es mañana a las 9:00 a. m." },
            new { rol = "Cliente", titulo = "Promoción especial", mensaje = "Prueba Belle: 20 % de descuento en tu próximo paquete." },
            new { rol = "Instructor", titulo = "Horario de clases", mensaje = "Prueba Belle: mañana tienes Barre a las 9:00 a. m. y Pilates a las 11:00 a. m." }
        };
        foreach (var aviso in avisos.Where(a => prueba.Rol == "Admin" || a.rol == prueba.Rol))
        {
            List<DispositivoNotificaciones> destinos;
            lock (cerrojo) destinos = dispositivos.Where(d =>
                (d.Usuario == prueba.Usuario && d.Rol == prueba.Rol) || d.Rol == "Admin").ToList();
            foreach (var dispositivo in destinos)
            {
                // Revalidar por si se desactivó o cambió la cuenta mientras se procesaba la cola.
                lock (cerrojo) { if (!dispositivos.Contains(dispositivo)) continue; }
                if (!EsValida(dispositivo.Suscripcion)) continue;
                var payload = JsonSerializer.Serialize(new
                {
                    id = Guid.NewGuid().ToString(), titulo = aviso.titulo, mensaje = aviso.mensaje,
                    destinatario = aviso.rol, fecha = DateTimeOffset.UtcNow,
                    tipo = aviso.titulo == "Promoción especial" ? "promocion" : aviso.rol == "Instructor" ? "horario" : "clase",
                    usuario = dispositivo.Usuario, rol = dispositivo.Rol
                });
                try
                {
                    var s = dispositivo.Suscripcion;
                    using var autenticacion = new VapidAuthentication(claves.Publica, claves.Privada) { Subject = contacto };
                    await cliente.RequestPushMessageDeliveryAsync(new PushSubscription
                    {
                        Endpoint = s.Endpoint,
                        Keys = new Dictionary<string, string> { ["p256dh"] = s.P256dh, ["auth"] = s.Auth }
                    }, new PushMessage(payload) { TimeToLive = 300, Urgency = PushMessageUrgency.High }, autenticacion, cancelacion);
                }
                catch (PushServiceClientException error) when (error.StatusCode is HttpStatusCode.Gone or HttpStatusCode.NotFound)
                {
                    Eliminar(dispositivo.Usuario, dispositivo.Suscripcion.Endpoint);
                }
                catch (OperationCanceledException) when (cancelacion.IsCancellationRequested) { throw; }
                catch (Exception error)
                {
                    // No registrar endpoints ni claves del dispositivo.
                    logger.LogWarning("El proveedor no aceptó la notificación push ({Tipo}).", error.GetType().Name);
                }
            }
        }
    }

    private static void GuardarArchivo<T>(string ruta, T datos)
    {
        var temporal = ruta + ".tmp";
        File.WriteAllText(temporal, JsonSerializer.Serialize(datos));
        File.Move(temporal, ruta, true);
    }

    public override void Dispose() { transporte.Dispose(); base.Dispose(); }
}
