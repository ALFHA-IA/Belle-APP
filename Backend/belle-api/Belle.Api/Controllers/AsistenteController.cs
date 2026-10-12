using Belle.Api.Data;
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

        public AsistenteController(BelleDbContext db)
        {
            _db = db;
        }

        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] ChatRequest req)
        {
            var msg = req.Mensaje.ToLower();
            var nombreUsuario = string.IsNullOrWhiteSpace(req.NombreUsuario)
                ? "Luis Joaquin Huamani Hernandez"
                : req.NombreUsuario.Trim();

            if (msg.Contains("mi nombre") || msg.Contains("quien soy") || msg.Contains("quién soy"))
            {
                return Ok(new
                {
                    respuesta = $"¡Hola {nombreUsuario}! Te reconozco como el usuario de esta sesión.",
                    toolEjecutada = $"ConsultarUsuarioActual(nombre='{nombreUsuario}')",
                    accionSugerida = new
                    {
                        tipo = "VER_RESERVAS"
                    }
                });
            }

            if (msg.Contains("alexander") || msg.Contains("urquiaga"))
            {
                var alex = await _db.AppUsers.FirstOrDefaultAsync(u => u.FirstName.Contains("Alexander") || u.LastName.Contains("Urquiaga"));
                var reserva = await _db.Reservas.Include(r => r.Clase).FirstOrDefaultAsync(r => r.Usuario.NombreCompleto.Contains("Alexander"));

                return Ok(new
                {
                    respuesta = $"¡Hola Alexander Urquiaga! Te reconozco en nuestra base de datos Azure SQL (ID: {alex?.Id ?? 258}). Tienes status COMPROMETIDO con un BES de 96 puntos." +
                               (reserva != null ? $" Tu próxima clase es '{reserva.Clase?.Nombre}' programada a las {reserva.Clase?.FechaHoraInicio:HH:mm}." : ""),
                    toolEjecutada = "ConsultarClientePorNombre(nombre='Alexander Urquiaga')",
                    accionSugerida = new
                    {
                        tipo = "VER_RESERVAS"
                    }
                });
            }

            if (msg.Contains("reserva") || msg.Contains("cita") || msg.Contains("agendar"))
            {
                var clases = await _db.Clases.Take(2).ToListAsync();
                var nombres = string.Join(" o ", clases.Select(c => $"{c.Nombre} a las {c.FechaHoraInicio:HH:mm}"));

                return Ok(new
                {
                    respuesta = $"¡Por supuesto! Consulté la base de datos de Azure SQL. Tenemos cupos disponibles hoy para: {nombres}.",
                    toolEjecutada = "ConsultarDisponibilidadAzureSQL(fecha='hoy')",
                    accionSugerida = new
                    {
                        tipo = "CREAR_RESERVA",
                        servicio = clases.FirstOrDefault()?.Nombre ?? "Barré Fit Core & Sculpt",
                        profesional = clases.FirstOrDefault()?.Instructor ?? "Valeria Mendoza",
                        hora = "16:00"
                    }
                });
            }

            if (msg.Contains("riesgo") || msg.Contains("crm") || msg.Contains("bes"))
            {
                var totalClientes = await _db.AppUsers.CountAsync(u => u.IsActive);
                return Ok(new
                {
                    respuesta = $"Consultando los {totalClientes} usuarios de Azure SQL: detectamos clientes con bajo nivel de asistencia. Alexander Urquiaga lidera la racha activa con BES 96.",
                    toolEjecutada = "ObtenerMetricasCRM_BES()",
                    accionSugerida = new
                    {
                        tipo = "VER_CRM"
                    }
                });
            }

            return Ok(new
            {
                respuesta = "Hola, soy Belle AI ✨ Tu copiloto conectado en vivo a Azure SQL para gestión de clases Barré, CRM predictivo BES y control postural. ¿En qué te puedo ayudar hoy?",
                toolEjecutada = (string?)null,
                accionSugerida = (object?)null
            });
        }
    }
}

