namespace Belle.Api.DTOs
{
    public class ClaseDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Instructor { get; set; } = string.Empty;
        public DateTime FechaHoraInicio { get; set; }
        public int DuracionMinutos { get; set; }
        public int CuposDisponibles { get; set; }
    }

    public class CrearReservaDto
    {
        public int ClaseId { get; set; }
    }

    public class EngagementDto
    {
        public int UsuarioId { get; set; }
        public string NombreCompleto { get; set; } = string.Empty;
        public double Puntaje { get; set; }
        public string Riesgo { get; set; } = string.Empty;
        public int RachaSemanasActivas { get; set; }
        public DateTime UltimaClaseAsistida { get; set; }
    }
}