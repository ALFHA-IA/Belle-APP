using Belle.Api.Data;
using Belle.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Belle.Api.Controllers
{
    public class EnviarMensajeDto
    {
        public string ChatId { get; set; } = string.Empty;
        public string Texto { get; set; } = string.Empty;
    }

    [ApiController]
    [Route("api/[controller]")]
    public class WhatsAppController : ControllerBase
    {
        private readonly BelleDbContext _db;

        public WhatsAppController(BelleDbContext db)
        {
            _db = db;
        }

        [HttpGet("chats")]
        public async Task<IActionResult> GetChats()
        {
            var alex = await _db.AppUsers.FirstOrDefaultAsync(u => u.FirstName.Contains("Alexander") || u.LastName.Contains("Urquiaga"));

            var chats = new List<object>
            {
                new
                {
                    id = "w_alex",
                    clienteId = alex?.Id ?? 258,
                    clienteNombre = alex != null ? $"{alex.FirstName} {alex.LastName}".Trim() : "Alexander Urquiaga",
                    telefono = alex?.Phone ?? "987654321",
                    avatar = alex?.PhotoUrl ?? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
                    ultimoMensaje = "Hola Alexander, tu reserva para Barré Fit Core & Sculpt está confirmada para hoy a las 10:00 AM.",
                    hora = "10:02",
                    noLeidos = 0,
                    estadoBot = "Confirmación Automática Enviada",
                    mensajes = new[]
                    {
                        new { id = "m1", remitente = "bot", texto = "¡Hola Alexander! 👋 Bienvenido a Belle Barre Studio. Tu cita está agendada.", hora = "10:00" },
                        new { id = "m2", remitente = "cliente", texto = "Perfecto, muchas gracias por confirmar.", hora = "10:01" },
                        new { id = "m3", remitente = "bot", texto = "¡Te esperamos con entusiasmo! ✨ Recuerda llegar 5 minutos antes.", hora = "10:02" }
                    }
                },
                new
                {
                    id = "w1",
                    clienteId = 3,
                    clienteNombre = "Camila Rodriguez",
                    telefono = "+51 987 654 321",
                    avatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
                    ultimoMensaje = "¿Tienen disponibilidad de Barré Signature Flow hoy por la tarde?",
                    hora = "09:42",
                    noLeidos = 1,
                    estadoBot = "Function Calling: ConsultarDisponibilidad",
                    mensajes = new[]
                    {
                        new { id = "m10", remitente = "cliente", texto = "¿Tienen disponibilidad de Barré Signature Flow hoy por la tarde?", hora = "09:42" }
                    }
                }
            };

            return Ok(chats);
        }

        [HttpPost("enviar")]
        public IActionResult Enviar([FromBody] EnviarMensajeDto dto)
        {
            return Ok(new { success = true, mensaje = "Mensaje enviado exitosamente vía WhatsApp API." });
        }
    }
}

