using Belle.Api.Data;
using Belle.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Belle.Api.Controllers
{
    public class AnalisisVisionRequest
    {
        public string? ImagenBase64 { get; set; }
        public string TipoMuestra { get; set; } = "adecuada";
        public double? AnguloHombros { get; set; }
        public double? AnguloCaderas { get; set; }
        public double? Inclinacion { get; set; }
        public double? Confianza { get; set; }
        public int? UsuarioId { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class VisionController : ControllerBase
    {
        private readonly BelleDbContext _db;
        private readonly ILogger<VisionController> _logger;

        public VisionController(BelleDbContext db, ILogger<VisionController> logger)
        {
            _db = db;
            _logger = logger;
        }

        [HttpPost("analizar")]
        public async Task<IActionResult> Analizar([FromBody] AnalisisVisionRequest req)
        {
            bool esAdecuada = req.TipoMuestra.ToLower() != "inadecuada";

            double anguloHombros = req.AnguloHombros ?? (esAdecuada ? 1.8 : 7.4);
            double anguloCaderas = req.AnguloCaderas ?? (esAdecuada ? 2.1 : 8.2);
            double inclinacion = req.Inclinacion ?? (esAdecuada ? 1.2 : 5.8);
            double confianza = req.Confianza ?? (esAdecuada ? 96.5 : 88.0);
            int scoreSimetria = esAdecuada ? 92 : 54;

            string diagnostico = esAdecuada 
                ? "Alineación postural óptima en eje espinal, escápulas y pelvis." 
                : "Inclinación de pelvis y rotación interna leve detectada.";

            string recomendacion = esAdecuada 
                ? "Mantener contracción isométrica del core y elongación axial." 
                : "Elevar el arco longitudinal del pie, corregir anteversión pélvica y relajar hombros.";

            // 1. Identificar usuario para asociar el análisis en la base de datos
            int? usuarioId = req.UsuarioId;
            if (!usuarioId.HasValue)
            {
                var usuario = await _db.Usuarios.FirstOrDefaultAsync(u => u.Correo.Contains("luis.huamani"))
                              ?? await _db.Usuarios.FirstOrDefaultAsync();
                usuarioId = usuario?.Id;
            }

            // 2. Guardar en la tabla VisionAnalisis
            var entidadAnalisis = new VisionAnalisis
            {
                UsuarioId = usuarioId,
                ImagenUrl = !string.IsNullOrEmpty(req.ImagenBase64) && req.ImagenBase64.Length < 200 
                    ? req.ImagenBase64 
                    : "mediapipe_capture.jpg",
                Postura = esAdecuada ? "Adecuada" : "Requiere Corrección",
                AnguloHombros = anguloHombros,
                Inclinacion = inclinacion,
                Confianza = confianza,
                Diagnostico = diagnostico,
                Recomendacion = recomendacion,
                FechaAnalisis = DateTime.UtcNow
            };

            await _db.VisionAnalisis.AddAsync(entidadAnalisis);
            await _db.SaveChangesAsync();

            _logger.LogInformation("Análisis de postura guardado en BD con ID {Id}", entidadAnalisis.Id);

            var resultado = new
            {
                id = entidadAnalisis.Id,
                posturaCorrecta = esAdecuada,
                scoreSimetria = scoreSimetria,
                desalineacion = diagnostico,
                anguloHombros = anguloHombros,
                anguloCaderas = anguloCaderas,
                inclinacion = inclinacion,
                confianza = confianza,
                sugerencias = esAdecuada 
                    ? new[] { "Mantener contracción isométrica del core", "Buena elongación axial" } 
                    : new[] { "Elevar el arco longitudinal del pie", "Corregir anteversión pélvica", "Bajar hombros lejos de las orejas" },
                fechaAnalisis = entidadAnalisis.FechaAnalisis
            };

            return Ok(resultado);
        }

        [HttpGet("historial")]
        public async Task<IActionResult> ObtenerHistorial([FromQuery] int? usuarioId)
        {
            var consulta = _db.VisionAnalisis.AsQueryable();

            if (usuarioId.HasValue)
            {
                consulta = consulta.Where(v => v.UsuarioId == usuarioId.Value);
            }

            var historial = await consulta
                .OrderByDescending(v => v.FechaAnalisis)
                .Take(20)
                .Select(v => new
                {
                    v.Id,
                    v.UsuarioId,
                    v.Postura,
                    v.AnguloHombros,
                    v.Inclinacion,
                    v.Confianza,
                    v.Diagnostico,
                    v.Recomendacion,
                    v.FechaAnalisis
                })
                .ToListAsync();

            return Ok(historial);
        }
    }
}
