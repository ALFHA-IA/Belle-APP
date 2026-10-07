using System.Security.Claims;
using Belle.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Belle.Api.Controllers;

[ApiController]
[Route("api/notificaciones")]
[Authorize(Roles = "Cliente,Instructor,Admin")]
public class NotificacionesController(ServicioNotificacionesPush servicio) : ControllerBase
{
    private string? UsuarioId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpGet("clave-publica")]
    public IActionResult ClavePublica() => Ok(new { clavePublica = servicio.ClavePublica });

    [HttpPost("suscripciones")]
    public IActionResult Registrar(SuscripcionNotificaciones suscripcion)
    {
        if (UsuarioId is null) return Unauthorized();
        if (!ServicioNotificacionesPush.EsValida(suscripcion)) return BadRequest(new { mensaje = "La suscripción push no es válida o el proveedor no es compatible." });
        servicio.Registrar(UsuarioId, User.FindFirstValue(ClaimTypes.Role)!, suscripcion);
        return NoContent();
    }

    public record BajaNotificaciones(string Endpoint);

    [HttpDelete("suscripciones")]
    public IActionResult Eliminar(BajaNotificaciones datos)
    {
        if (UsuarioId is null) return Unauthorized();
        servicio.Eliminar(UsuarioId, datos.Endpoint);
        return NoContent();
    }

    [HttpPost("prueba")]
    public IActionResult Prueba()
    {
        if (UsuarioId is null) return Unauthorized();
        return servicio.ProgramarPrueba(UsuarioId, User.FindFirstValue(ClaimTypes.Role)!) switch
        {
            "sin-dispositivo" => BadRequest(new { mensaje = "Activa primero las notificaciones en este dispositivo." }),
            "ocupado" => StatusCode(429, new { mensaje = "Ya hay una prueba en curso. Espera unos segundos antes de repetirla." }),
            _ => Accepted(new { mensaje = "Prueba programada para dentro de 15 segundos. Puedes cerrar la app. Los administradores suscritos también recibirán estos avisos." })
        };
    }
}
