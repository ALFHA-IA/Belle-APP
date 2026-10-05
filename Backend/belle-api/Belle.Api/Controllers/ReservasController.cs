using System.Security.Claims;
using Belle.Api.Data;
using Belle.Api.DTOs;
using Belle.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Belle.Api.Controllers
{
    public class CrearReservaAppDto
    {
        public int? UsuarioId { get; set; }
        public int ClaseId { get; set; }
        public string? Fecha { get; set; }
        public string? Hora { get; set; }
        public string? Observaciones { get; set; }
    }

    public class ActualizarEstadoDto
    {
        public string Estado { get; set; } = "ATENDIDA";
    }

    [ApiController]
    [Route("api/[controller]")]
    public class ReservasController : ControllerBase
    {
        private readonly BelleDbContext _db;

        public ReservasController(BelleDbContext db)
        {
            _db = db;
        }

        private int? UsuarioIdActual
        {
            get
            {
                var claim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
                return int.TryParse(claim, out var id) ? id : null;
            }
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> ListarTodas()
        {
            var reservas = await _db.Reservas
                .Include(r => r.Usuario)
                .Include(r => r.Clase)
                .OrderByDescending(r => r.Id) // Las más recientes (como la de Luis) primero
                .Select(r => new
                {
                    id = $"r{r.Id}",
                    idReal = r.Id,
                    clienteId = r.UsuarioId.ToString(),
                    clienteNombre = r.Usuario.NombreCompleto,
                    servicioId = r.ClaseId.ToString(),
                    servicioNombre = r.Clase.Nombre,
                    profesionalId = "p1",
                    profesionalNombre = r.Clase.Instructor,
                    fecha = r.Clase.FechaHoraInicio.ToString("yyyy-MM-dd"),
                    hora = r.Clase.FechaHoraInicio.ToString("HH:mm"),
                    duracion = r.Clase.DuracionMinutos,
                    precio = 65.0,
                    estado = r.Estado == EstadoReserva.Asistio ? "ATENDIDA" :
                             r.Estado == EstadoReserva.Cancelada ? "CANCELADA" : "CONFIRMADA",
                    observaciones = "Reserva en Azure SQL"
                })
                .ToListAsync();

            return Ok(reservas);
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Crear([FromBody] CrearReservaAppDto dto)
        {
            var clase = await _db.Clases
                .Include(c => c.Reservas)
                .FirstOrDefaultAsync(c => c.Id == dto.ClaseId);

            if (clase is null)
            {
                clase = await _db.Clases.FirstOrDefaultAsync();
                if (clase is null) return NotFound(new { mensaje = "Clase no encontrada." });
            }

            int finalUsuarioId;
            if (dto.UsuarioId.HasValue && await _db.Usuarios.AnyAsync(u => u.Id == dto.UsuarioId.Value))
            {
                finalUsuarioId = dto.UsuarioId.Value;
            }
            else if (dto.UsuarioId.HasValue)
            {
                // Es un Id de AppUsers (por ejemplo 258 para Alexander Urquiaga)
                var appUser = await _db.AppUsers.FindAsync(dto.UsuarioId.Value);
                if (appUser != null)
                {
                    var match = await _db.Usuarios.FirstOrDefaultAsync(u =>
                        u.NombreCompleto.Contains(appUser.FirstName) ||
                        (!string.IsNullOrEmpty(appUser.Email) && u.Correo == appUser.Email));
                    if (match != null)
                    {
                        finalUsuarioId = match.Id;
                    }
                    else
                    {
                        var nuevo = new Usuario
                        {
                            NombreCompleto = $"{appUser.FirstName} {appUser.LastName}".Trim(),
                            Correo = !string.IsNullOrEmpty(appUser.Email) ? appUser.Email : $"{appUser.FirstName.ToLower()}@ejemplo.com",
                            Telefono = appUser.Phone,
                            Rol = RolUsuario.Cliente,
                            ContrasenaHash = "TempHash123!",
                            FechaRegistro = DateTime.UtcNow,
                            Activo = true
                        };
                        _db.Usuarios.Add(nuevo);
                        await _db.SaveChangesAsync();
                        finalUsuarioId = nuevo.Id;
                    }
                }
                else
                {
                    var alex = await _db.Usuarios.FirstOrDefaultAsync(u => u.NombreCompleto.Contains("Alexander Urquiaga"));
                    finalUsuarioId = alex?.Id ?? 7;
                }
            }
            else
            {
                var alex = await _db.Usuarios.FirstOrDefaultAsync(u => u.NombreCompleto.Contains("Alexander Urquiaga"));
                finalUsuarioId = alex?.Id ?? 7;
            }

            var reserva = new Reserva
            {
                UsuarioId = finalUsuarioId,
                ClaseId = clase.Id,
                Estado = EstadoReserva.Confirmada,
                FechaReserva = DateTime.UtcNow
            };

            _db.Reservas.Add(reserva);
            await _db.SaveChangesAsync();

            var usuario = await _db.Usuarios.FindAsync(finalUsuarioId);

            return Ok(new
            {
                mensaje = "Reserva confirmada en Azure SQL.",
                id = $"r{reserva.Id}",
                idReal = reserva.Id,
                clienteNombre = usuario?.NombreCompleto ?? "Alexander Urquiaga",
                servicioNombre = clase.Nombre,
                profesionalNombre = clase.Instructor,
                fecha = clase.FechaHoraInicio.ToString("yyyy-MM-dd"),
                hora = clase.FechaHoraInicio.ToString("HH:mm"),
                estado = "CONFIRMADA"
            });
        }

        [HttpPut("{id}/estado")]
        [AllowAnonymous]
        public async Task<IActionResult> ActualizarEstado(int id, [FromBody] ActualizarEstadoDto dto)
        {
            var reserva = await _db.Reservas.FindAsync(id);
            if (reserva is null) return NotFound();

            if (dto.Estado.ToUpper() == "ATENDIDA")
                reserva.Estado = EstadoReserva.Asistio;
            else if (dto.Estado.ToUpper() == "CANCELADA")
                reserva.Estado = EstadoReserva.Cancelada;
            else
                reserva.Estado = EstadoReserva.Confirmada;

            await _db.SaveChangesAsync();
            return Ok(new { success = true, estado = dto.Estado });
        }

        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Cancelar(int id)
        {
            var reserva = await _db.Reservas.FindAsync(id);
            if (reserva is null) return NotFound();

            reserva.Estado = EstadoReserva.Cancelada;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("mias")]
        [AllowAnonymous]
        public async Task<IActionResult> MisReservas()
        {
            var reservas = await _db.Reservas
                .Include(r => r.Clase)
                .Include(r => r.Usuario)
                .OrderByDescending(r => r.Clase.FechaHoraInicio)
                .Select(r => new
                {
                    r.Id,
                    r.Clase.Nombre,
                    r.Clase.FechaHoraInicio,
                    clienteNombre = r.Usuario.NombreCompleto,
                    Estado = r.Estado.ToString()
                })
                .ToListAsync();

            return Ok(reservas);
        }
    }
}