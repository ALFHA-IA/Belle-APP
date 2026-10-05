using Belle.Api.DTOs;
using Belle.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Belle.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ITokenService _tokenService;

        public AuthController(IAuthService authService, ITokenService tokenService)
        {
            _authService = authService;
            _tokenService = tokenService;
        }

        [HttpPost("registro")]
        public async Task<IActionResult> Registro(RegistroDto dto)
        {
            var usuario = await _authService.RegistrarAsync(dto);
            if (usuario is null)
                return Conflict(new { mensaje = "Ya existe una cuenta con ese correo." });

            var (token, expira) = _tokenService.GenerarToken(usuario);
            return Ok(new TokenRespuestaDto
            {
                Token = token,
                NombreCompleto = usuario.NombreCompleto,
                Rol = usuario.Rol.ToString(),
                ExpiraEn = expira
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var usuario = await _authService.ValidarCredencialesAsync(dto);
            if (usuario is null)
                return Unauthorized(new { mensaje = "Correo o contraseña incorrectos." });

            var (token, expira) = _tokenService.GenerarToken(usuario);
            return Ok(new TokenRespuestaDto
            {
                Token = token,
                Id = usuario.Id,
                NombreCompleto = usuario.NombreCompleto,
                Correo = usuario.Correo,
                Rol = usuario.Rol.ToString(),
                ExpiraEn = expira
            });
        }
    }
}