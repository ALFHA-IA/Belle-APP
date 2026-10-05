namespace Belle.Api.Models
{
    public class Clase
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public string Instructor { get; set; } = string.Empty;
        public DateTime FechaHoraInicio { get; set; }
        public int DuracionMinutos { get; set; } = 60;
        public int CupoMaximo { get; set; } = 15;

        public ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();
    }
}