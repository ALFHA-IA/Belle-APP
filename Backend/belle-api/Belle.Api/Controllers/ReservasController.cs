using System.Security.Claims;
using Belle.Api.Data;
using Belle.Api.DTOs;
using Belle.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Belle.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReservasController : ControllerBase
    {
        private readonly BelleDbContext _db;

        public ReservasController(BelleDbContext db)
        {
            _db = db;
        }

        private int UsuarioIdActual =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub")!);

        [HttpPost]
        public async Task<IActionResult> Crear(CrearReservaDto dto)
        {
            var clase = await _db.Clases
                .Include(c => c.Reservas)
                .FirstOrDefaultAsync(c => c.Id == dto.ClaseId);

            if (clase is null) return NotFound(new { mensaje = "Clase no encontrada." });

            var cuposOcupados = clase.Reservas.Count(r => r.Estado != EstadoReserva.Cancelada);
            if (cuposOcupados >= clase.CupoMaximo)
                return BadRequest(new { mensaje = "No hay cupos disponibles para esta clase." });

            var reserva = new Reserva
            {
                UsuarioId = UsuarioIdActual,
                ClaseId = dto.ClaseId,
                Estado = EstadoReserva.Confirmada
            };

            _db.Reservas.Add(reserva);
            await _db.SaveChangesAsync();
            return Ok(new { mensaje = "Reserva confirmada.", reservaId = reserva.Id });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Cancelar(int id)
        {
            var reserva = await _db.Reservas.FirstOrDefaultAsync(r => r.Id == id && r.UsuarioId == UsuarioIdActual);
            if (reserva is null) return NotFound();

            reserva.Estado = EstadoReserva.Cancelada;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("mias")]
        public async Task<IActionResult> MisReservas()
        {
            var reservas = await _db.Reservas
                .Include(r => r.Clase)
                .Where(r => r.UsuarioId == UsuarioIdActual)
                .OrderByDescending(r => r.Clase.FechaHoraInicio)
                .Select(r => new
                {
                    r.Id,
                    r.Clase.Nombre,
                    r.Clase.FechaHoraInicio,
                    Estado = r.Estado.ToString()
                })
                .ToListAsync();

            return Ok(reservas);
        }
    }
}