namespace Belle.Api.Models
{
    public enum EstadoReserva
    {
        Confirmada = 0,
        Cancelada = 1,
        Asistio = 2,
        NoAsistio = 3
    }

    public class Reserva
    {
        public int Id { get; set; }

        public int UsuarioId { get; set; }
        public Usuario Usuario { get; set; } = null!;

        public int ClaseId { get; set; }
        public Clase Clase { get; set; } = null!;

        public DateTime FechaReserva { get; set; } = DateTime.UtcNow;
        public EstadoReserva Estado { get; set; } = EstadoReserva.Confirmada;
    }
}