namespace Belle.Api.Models
{
    public class MensajeWhatsApp
    {
        public int Id { get; set; }
        public int? UsuarioId { get; set; }
        public Usuario? Usuario { get; set; }
        public string Remitente { get; set; } = "bot";
        public string Telefono { get; set; } = string.Empty;
        public string Texto { get; set; } = string.Empty;
        public string? ToolEjecutada { get; set; }
        public DateTime FechaHora { get; set; } = DateTime.UtcNow;
    }
}

