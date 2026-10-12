using Microsoft.AspNetCore.Mvc;

namespace Belle.Api.Controllers
{
    public class AnalisisVisionRequest
    {
        public string? ImagenBase64 { get; set; }
        public string TipoMuestra { get; set; } = "adecuada";
    }

    [ApiController]
    [Route("api/[controller]")]
    public class VisionController : ControllerBase
    {
        [HttpPost("analizar")]
        public IActionResult Analizar([FromBody] AnalisisVisionRequest req)
        {
            bool esAdecuada = req.TipoMuestra.ToLower() != "inadecuada";

            var resultado = new
            {
                posturaCorrecta = esAdecuada,
                scoreSimetria = esAdecuada ? 92 : 54,
                desalineacion = esAdecuada ? "Alineación postural óptima en eje espinal y pelvis" : "Inclinación de pelvis y rotación interna de rodillas detectada",
                anguloHombros = esAdecuada ? 1.8 : 7.4,
                anguloCaderas = esAdecuada ? 2.1 : 8.2,
                sugerencias = esAdecuada ? new[] { "Mantener contracción isométrica del core", "Buena elongación axial" } : new[] { "Elevar el arco longitudinal del pie", "Corregir anteversión pélvica", "Bajar hombros lejos de las orejas" }
            };

            return Ok(resultado);
        }
    }
}

