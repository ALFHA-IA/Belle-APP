namespace Belle.Api.Models
{
    public enum RolUsuario
    {
        Cliente = 0,
        Admin = 1
    }

    public class Usuario
    {
        public int Id { get; set; }
        public string NombreCompleto { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string ContrasenaHash { get; set; } = string.Empty;
        public string? Telefono { get; set; }
        public RolUsuario Rol { get; set; } = RolUsuario.Cliente;
        public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;
        public bool Activo { get; set; } = true;

        public ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();
        public EngagementScore? Engagement { get; set; }
    }
}