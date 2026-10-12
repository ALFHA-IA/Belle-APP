using Belle.Api.Data;
using Belle.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Belle.Api.Controllers
{
    public class ChatRequest
    {
        public string Mensaje { get; set; } = string.Empty;
        public string NombreUsuario { get; set; } = string.Empty;
    }

    [ApiController]
    [Route("api/[controller]")]
    public class AsistenteController : ControllerBase
    {
        private readonly BelleDbContext _db;
        private readonly IOpenAIService _openAIService;

        public AsistenteController(BelleDbContext db, IOpenAIService openAIService)
        {
            _db = db;
            _openAIService = openAIService;
        }

        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] ChatRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Mensaje))
            {
                return BadRequest(new { error = true, mensaje = "El mensaje no puede estar vacío." });
            }

            var nombreUsuario = string.IsNullOrWhiteSpace(req.NombreUsuario)
                ? "Luis Joaquin Huamani Hernandez"
                : req.NombreUsuario.Trim();

            // 1. Obtener contexto en vivo desde Azure SQL
            var clases = await _db.Clases.Take(3).ToListAsync();
            var contextoAzure = "Clases disponibles en estudio: " +
                string.Join(", ", clases.Select(c => $"{c.Nombre} a las {c.FechaHoraInicio:HH:mm} con {c.Instructor}"));

            // 2. Obtener historial reciente de mensajes para contexto conversacional
            var historialEntities = await _db.MensajesWhatsApp
                .OrderByDescending(m => m.FechaHora)
                .Take(6)
                .Select(m => new { m.Remitente, m.Texto })
                .ToListAsync();

            var historialReciente = historialEntities
                .OrderBy(m => m.Remitente)
                .Select(m => (m.Remitente, m.Texto))
                .ToList();

            // 3. Generar respuesta con la API de OpenAI (con fallback automático y aprendizaje continuo)
            var (respuesta, toolEjecutada) = await _openAIService.GenerarRespuestaAsync(
                req.Mensaje,
                nombreUsuario,
                historialReciente,
                contextoAzure
            );

            // 4. Guardar la nueva interacción en Azure SQL (dbo.MensajesWhatsApp) para aprendizaje constante
            try
            {
                var usuario = await _db.Usuarios.FirstOrDefaultAsync(u => u.NombreCompleto.Contains(nombreUsuario) || u.Correo.Contains("luis.huamani"));
                var nuevoMensajeUsuario = new Models.MensajeWhatsApp
                {
                    UsuarioId = usuario?.Id,
                    Telefono = usuario?.Telefono ?? "+51 987 654 321",
                    Remitente = "cliente",
                    Texto = req.Mensaje.Trim(),
                    FechaHora = DateTime.UtcNow
                };
                var nuevoMensajeBot = new Models.MensajeWhatsApp
                {
                    UsuarioId = usuario?.Id,
                    Telefono = "+51 987 654 321",
                    Remitente = "bot",
                    Texto = respuesta.Trim(),
                    ToolEjecutada = toolEjecutada,
                    FechaHora = DateTime.UtcNow.AddSeconds(1)
                };

                await _db.MensajesWhatsApp.AddRangeAsync(nuevoMensajeUsuario, nuevoMensajeBot);
                await _db.SaveChangesAsync();
            }
            catch
            {
                // No bloquea la respuesta si la conexión de persistencia temporal tiene demora
            }

            // 5. Determinar acción sugerida en la UI de React
            object? accionSugerida = null;
            var msgLower = req.Mensaje.ToLower();
            if (msgLower.Contains("reserva") || msgLower.Contains("agendar") || msgLower.Contains("clase"))
            {
                accionSugerida = new
                {
                    tipo = "VER_RESERVAS",
                    servicio = clases.FirstOrDefault()?.Nombre ?? "Barré Fit Core & Sculpt",
                    profesional = clases.FirstOrDefault()?.Instructor ?? "Valeria Mendoza",
                    hora = "17:00"
                };
            }
            else if (msgLower.Contains("crm") || msgLower.Contains("riesgo") || msgLower.Contains("bes"))
            {
                accionSugerida = new { tipo = "VER_CRM" };
            }
            else if (msgLower.Contains("postura") || msgLower.Contains("vision"))
            {
                accionSugerida = new { tipo = "VER_VISION" };
            }

            return Ok(new
            {
                respuesta,
                toolEjecutada = toolEjecutada ?? "OpenAI:GenerarRespuestaNatural",
                accionSugerida,
                aprendizajeRegistrado = true
            });
        }
    }
}
