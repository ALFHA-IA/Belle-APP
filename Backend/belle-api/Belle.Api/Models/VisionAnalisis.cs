namespace Belle.Api.Models
{
    public class VisionAnalisis
    {
        public int Id { get; set; }
        public int? UsuarioId { get; set; }
        public Usuario? Usuario { get; set; }
        public string ImagenUrl { get; set; } = string.Empty;
        public string Postura { get; set; } = "Adecuada";
        public double AnguloHombros { get; set; }
        public double Inclinacion { get; set; }
        public double Confianza { get; set; }
        public string Diagnostico { get; set; } = string.Empty;
        public string Recomendacion { get; set; } = string.Empty;
        public DateTime FechaAnalisis { get; set; } = DateTime.UtcNow;
    }
}

