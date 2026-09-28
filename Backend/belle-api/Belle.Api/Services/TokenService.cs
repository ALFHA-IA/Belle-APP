using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Belle.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace Belle.Api.Services
{
    public interface ITokenService
    {
        (string token, DateTime expira) GenerarToken(Usuario usuario);
    }

    public class TokenService : ITokenService
    {
        private readonly IConfiguration _config;

        public TokenService(IConfiguration config)
        {
            _config = config;
        }

        public (string token, DateTime expira) GenerarToken(Usuario usuario)
        {
            var claveSecreta = _config["Jwt:ClaveSecreta"]!;
            var minutos = int.Parse(_config["Jwt:MinutosExpiracion"] ?? "120");
            var expira = DateTime.UtcNow.AddMinutes(minutos);

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
                new(ClaimTypes.Name, usuario.NombreCompleto),
                new(ClaimTypes.Email, usuario.Correo),
                new(ClaimTypes.Role, usuario.Rol.ToString())
            };

            var clave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(claveSecreta));
            var credenciales = new SigningCredentials(clave, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Emisor"],
                audience: _config["Jwt:Audiencia"],
                claims: claims,
                expires: expira,
                signingCredentials: credenciales
            );

            return (new JwtSecurityTokenHandler().WriteToken(token), expira);
        }
    }
}