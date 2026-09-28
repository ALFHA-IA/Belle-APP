namespace Belle.Api.Models
{
    public enum NivelRiesgo
    {
        Bajo = 0,
        Medio = 1,
        Alto = 2
    }

    public class EngagementScore
    {
        public int Id { get; set; }

        public int UsuarioId { get; set; }
        public Usuario Usuario { get; set; } = null!;

        public double Puntaje { get; set; } // 0 a 100, calculado por el microservicio Python
        public NivelRiesgo Riesgo { get; set; } = NivelRiesgo.Bajo;
        public int RachaSemanasActivas { get; set; }
        public DateTime UltimaClaseAsistida { get; set; }
        public DateTime FechaCalculo { get; set; } = DateTime.UtcNow;
        public bool AlertaEnviada { get; set; } = false;
    }
}