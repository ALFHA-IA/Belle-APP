using Belle.Api.Data;
using Belle.Api.DTOs;
using Belle.Api.Models;
using Belle.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Belle.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class CrmController : ControllerBase
    {
        private readonly BelleDbContext _db;
        private readonly IWhatsAppService _whatsApp;

        public CrmController(BelleDbContext db, IWhatsAppService whatsApp)
        {
            _db = db;
            _whatsApp = whatsApp;
        }

        [HttpGet("fidelizacion")]
        public async Task<IActionResult> TablaFidelizacion()
        {
            var datos = await _db.EngagementScores
                .Include(e => e.Usuario)
                .OrderBy(e => e.Puntaje)
                .Select(e => new EngagementDto
                {
                    UsuarioId = e.UsuarioId,
                    NombreCompleto = e.Usuario.NombreCompleto,
                    Puntaje = e.Puntaje,
                    Riesgo = e.Riesgo.ToString(),
                    RachaSemanasActivas = e.RachaSemanasActivas,
                    UltimaClaseAsistida = e.UltimaClaseAsistida
                })
                .ToListAsync();

            return Ok(datos);
        }

        [HttpPost("alerta/{usuarioId}")]
        public async Task<IActionResult> DispararAlertaWhatsApp(int usuarioId)
        {
            var engagement = await _db.EngagementScores
                .Include(e => e.Usuario)
                .FirstOrDefaultAsync(e => e.UsuarioId == usuarioId);

            if (engagement is null) return NotFound();
            if (string.IsNullOrWhiteSpace(engagement.Usuario.Telefono))
                return BadRequest(new { mensaje = "El cliente no tiene teléfono registrado." });

            await _whatsApp.EnviarAlertaRiesgoAsync(engagement.Usuario.Telefono, engagement.Usuario.NombreCompleto);

            engagement.AlertaEnviada = true;
            await _db.SaveChangesAsync();

            return Ok(new { mensaje = "Alerta enviada por WhatsApp." });
        }
    }
}