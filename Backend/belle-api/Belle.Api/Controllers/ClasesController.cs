using Belle.Api.Data;
using Belle.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Belle.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClasesController : ControllerBase
    {
        private readonly BelleDbContext _db;

        public ClasesController(BelleDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> ListarProximas()
        {
            var clases = await _db.Clases
                .OrderBy(c => c.FechaHoraInicio)
                .Select(c => new
                {
                    id = c.Id,
                    nombre = c.Nombre,
                    instructor = c.Instructor,
                    fechaHoraInicio = c.FechaHoraInicio,
                    duracionMinutos = c.DuracionMinutos,
                    cupoMaximo = c.CupoMaximo,
                    cuposDisponibles = c.CupoMaximo - c.Reservas.Count(r => r.Estado != Models.EstadoReserva.Cancelada)
                })
                .ToListAsync();

            return Ok(clases);
        }
    }
}
