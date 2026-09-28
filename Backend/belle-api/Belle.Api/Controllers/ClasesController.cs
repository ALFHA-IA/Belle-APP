using Belle.Api.Data;
using Belle.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Belle.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClasesController : ControllerBase
    {
        private readonly BelleDbContext _db;

        public ClasesController(BelleDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> ListarProximas()
        {
            var clases = await _db.Clases
                .Where(c => c.FechaHoraInicio >= DateTime.UtcNow)
                .OrderBy(c => c.FechaHoraInicio)
                .Select(c => new ClaseDto
                {
                    Id = c.Id,
                    Nombre = c.Nombre,
                    Instructor = c.Instructor,
                    FechaHoraInicio = c.FechaHoraInicio,
                    DuracionMinutos = c.DuracionMinutos,
                    CuposDisponibles = c.CupoMaximo - c.Reservas.Count(r => r.Estado != Models.EstadoReserva.Cancelada)
                })
                .ToListAsync();

            return Ok(clases);
        }
    }
}