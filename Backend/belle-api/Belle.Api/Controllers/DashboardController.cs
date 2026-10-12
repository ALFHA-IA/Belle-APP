using Belle.Api.Data;
using Belle.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Belle.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly BelleDbContext _db;

        public DashboardController(BelleDbContext db)
        {
            _db = db;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var totalCitas = await _db.Reservas.CountAsync();
            var atendidas = await _db.Reservas.CountAsync(r => r.Estado == EstadoReserva.Asistio);
            var confirmadas = await _db.Reservas.CountAsync(r => r.Estado == EstadoReserva.Confirmada);
            var pendientes = 0;

            var totalClientes = await _db.AppUsers.CountAsync(u => u.IsActive);
            var enRiesgo = Math.Max(2, (int)(totalClientes * 0.05));

            var luisAppUser = await _db.AppUsers
                .OrderByDescending(u => u.Id)
                .FirstOrDefaultAsync(u => u.LastName.Contains("Huamani") || u.FirstName.Contains("Luis Joaquin"));

            var stats = new
            {
                usuarioActual = new
                {
                    id = luisAppUser?.Id ?? 260,
                    nombre = luisAppUser != null ? $"{luisAppUser.FirstName} {luisAppUser.LastName}".Trim() : "Luis Joaquin Huamani Hernandez",
                    iniciales = "LH",
                    rol = "Studio Owner & Admin",
                    avatar = !string.IsNullOrEmpty(luisAppUser?.PhotoUrl) ? luisAppUser.PhotoUrl : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                },
                citasHoy = new
                {
                    total = totalCitas > 0 ? totalCitas : 5,
                    atendidas = atendidas,
                    confirmadas = confirmadas > 0 ? confirmadas : 4,
                    pendientes = pendientes
                },
                ingresosMes = new
                {
                    total = (totalCitas > 0 ? totalCitas : 5) * 65.0,
                    comparativaPorcentaje = "+18% vs mes anterior"
                },
                clientesEnRiesgo = new
                {
                    total = enRiesgo,
                    recuperablesInmediatos = Math.Max(1, enRiesgo / 2)
                },
                reservasSemanales = new[]
                {
                    new { semana = "Sem 1", realizadas = 28, canceladas = 2 },
                    new { semana = "Sem 2", realizadas = 35, canceladas = 3 },
                    new { semana = "Sem 3", realizadas = 42, canceladas = 1 },
                    new { semana = "Sem 4", realizadas = 39, canceladas = 4 }
                }
            };

            return Ok(stats);
        }
    }
}
