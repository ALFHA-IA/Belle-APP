using Belle.Api.Data;
using Belle.Api.DTOs;
using Belle.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Belle.Api.Services
{
    public interface IAuthService
    {
        Task<Usuario?> RegistrarAsync(RegistroDto dto);
        Task<Usuario?> ValidarCredencialesAsync(LoginDto dto);
    }

    public class AuthService : IAuthService
    {
        private readonly BelleDbContext _db;

        public AuthService(BelleDbContext db)
        {
            _db = db;
        }

        public async Task<Usuario?> RegistrarAsync(RegistroDto dto)
        {
            var existe = await _db.Usuarios.AnyAsync(u => u.Correo == dto.Correo);
            if (existe) return null;

            var usuario = new Usuario
            {
                NombreCompleto = dto.NombreCompleto,
                Correo = dto.Correo,
                Telefono = dto.Telefono,
                ContrasenaHash = BCrypt.Net.BCrypt.HashPassword(dto.Contrasena),
                Rol = RolUsuario.Cliente
            };

            _db.Usuarios.Add(usuario);
            await _db.SaveChangesAsync();
            return usuario;
        }

        public async Task<Usuario?> ValidarCredencialesAsync(LoginDto dto)
        {
            var usuario = await _db.Usuarios.FirstOrDefaultAsync(u => u.Correo == dto.Correo && u.Activo);
            if (usuario is null) return null;

            var valido = BCrypt.Net.BCrypt.Verify(dto.Contrasena, usuario.ContrasenaHash);
            return valido ? usuario : null;
        }
    }
}