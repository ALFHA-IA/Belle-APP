using System.ComponentModel.DataAnnotations;
using Belle.Api.Models;

namespace Belle.Api.DTOs
{
    public class RegistroDto
    {
        [Required] public string NombreCompleto { get; set; } = string.Empty;
        [Required, EmailAddress] public string Correo { get; set; } = string.Empty;
        [Required, MinLength(6)] public string Contrasena { get; set; } = string.Empty;
        public string? Telefono { get; set; }
    }

    public class LoginDto
    {
        [Required, EmailAddress] public string Correo { get; set; } = string.Empty;
        [Required] public string Contrasena { get; set; } = string.Empty;
        [Required, EnumDataType(typeof(RolUsuario))]
        public RolUsuario? Rol { get; set; }
    }

    public class TokenRespuestaDto
    {
        public string Token { get; set; } = string.Empty;
        public int Id { get; set; }
        public string NombreCompleto { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string Rol { get; set; } = string.Empty;
        public DateTime ExpiraEn { get; set; }
    }
}
