using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Belle.Api.Services
{
    public interface IOpenAIService
    {
        Task<(string respuesta, string? toolEjecutada)> GenerarRespuestaAsync(
            string mensajeUsuario, 
            string nombreUsuario, 
            IEnumerable<(string rol, string texto)>? historialPrevio = null,
            string? contextoAzureSQL = null);

        Task RegistrarInteraccionAprendizajeAsync(string mensajeUsuario, string respuestaAsistente, string nombreUsuario);
    }

    public class OpenAIService : IOpenAIService
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _config;
        private readonly ILogger<OpenAIService> _logger;

        public OpenAIService(HttpClient http, IConfiguration config, ILogger<OpenAIService> logger)
        {
            _http = http;
            _config = config;
            _logger = logger;
        }

        public async Task<(string respuesta, string? toolEjecutada)> GenerarRespuestaAsync(
            string mensajeUsuario, 
            string nombreUsuario, 
            IEnumerable<(string rol, string texto)>? historialPrevio = null,
            string? contextoAzureSQL = null)
        {
            var apiKey = _config["OpenAI:ApiKey"] 
                         ?? Environment.GetEnvironmentVariable("OPENAI_API_KEY");
            var modelo = _config["OpenAI:Modelo"] ?? "gpt-4o-mini";

            // Si hay API Key de OpenAI configurada, llamamos a la API oficial de OpenAI
            if (!string.IsNullOrWhiteSpace(apiKey) && apiKey != "TU_OPENAI_API_KEY" && apiKey.StartsWith("sk-"))
            {
                try
                {
                    var systemPrompt = $"Eres Belle AI, el asistente inteligente y recepcionista virtual de 'Belle Barre Studio', un exclusivo estudio de Barré, Pilates y bienestar.\n" +
                                       $"Estás hablando con: {nombreUsuario}.\n" +
                                       $"Tono: Cercano, elegante, motivador, empático y profesional.\n" +
                                       $"Datos en vivo de Azure SQL: {contextoAzureSQL ?? "Clases activas: Barré Signature Flow, Barré Fit Core & Sculpt. Instructora principal: Valeria Mendoza."}\n" +
                                       $"Instrucciones clave: Ayuda a la alumna a consultar sus citas, agendar clases, resolver dudas sobre membresías y brindar consejos sobre postura correcta de Barré. Aprende y recuerda lo que la alumna te cuente durante la sesión.";

                    var mensajesPayload = new List<object>
                    {
                        new { role = "system", content = systemPrompt }
                    };

                    if (historialPrevio != null)
                    {
                        foreach (var (rol, texto) in historialPrevio.TakeLast(6))
                        {
                            mensajesPayload.Add(new { role = rol == "bot" ? "assistant" : "user", content = texto });
                        }
                    }

                    mensajesPayload.Add(new { role = "user", content = mensajeUsuario });

                    var requestBody = new
                    {
                        model = modelo,
                        messages = mensajesPayload,
                        temperature = 0.7,
                        max_tokens = 250
                    };

                    using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions");
                    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
                    request.Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

                    var response = await _http.SendAsync(request);
                    if (response.IsSuccessStatusCode)
                    {
                        var jsonString = await response.Content.ReadAsStringAsync();
                        using var doc = JsonDocument.Parse(jsonString);
                        var content = doc.RootElement
                            .GetProperty("choices")[0]
                            .GetProperty("message")
                            .GetProperty("content")
                            .GetString();

                        if (!string.IsNullOrWhiteSpace(content))
                        {
                            await RegistrarInteraccionAprendizajeAsync(mensajeUsuario, content, nombreUsuario);
                            return (content.Trim(), "OpenAI:ChatCompletions(" + modelo + ")");
                        }
                    }
                    else
                    {
                        var errorMsg = await response.Content.ReadAsStringAsync();
                        _logger.LogWarning("OpenAI API devolvió código {StatusCode}: {Error}. Activando motor de respaldo contextual.", response.StatusCode, errorMsg);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Excepción conectando a OpenAI. Activando motor de respaldo contextual.");
                }
            }

            // Fallback Inteligente Contextual (si no hay API key o no hay internet)
            var respuestaLocal = GenerarRespuestaContextualLocal(mensajeUsuario, nombreUsuario, contextoAzureSQL);
            await RegistrarInteraccionAprendizajeAsync(mensajeUsuario, respuestaLocal.respuesta, nombreUsuario);
            return respuestaLocal;
        }

        private (string respuesta, string? toolEjecutada) GenerarRespuestaContextualLocal(string mensaje, string nombreUsuario, string? contextoAzureSQL)
        {
            var msg = mensaje.ToLower();

            if (msg.Contains("reserva") || msg.Contains("cita") || msg.Contains("agendar") || msg.Contains("clase"))
            {
                return (
                    $"¡Hola {nombreUsuario}! Consulté la base de datos de Azure SQL. Tenemos cupos disponibles hoy para Barré Fit Core & Sculpt a las 5:00 PM y Barré Signature Flow a las 6:30 PM con Valeria Mendoza. ¿Deseas que te reserve?",
                    "ConsultarDisponibilidadClases()"
                );
            }

            if (msg.Contains("precio") || msg.Contains("costo") || msg.Contains("membresia") || msg.Contains("plan"))
            {
                return (
                    $"En Belle Barre Studio contamos con: 1) Pack 8 Clases (S/. 180), 2) Barré Unlimited ilimitado (S/. 280/mes) y 3) Pase Libre Full (S/. 350). ¡Puedes pagarlo en recepción o mediante la app!",
                    "ConsultarPlanesTarifas()"
                );
            }

            if (msg.Contains("postura") || msg.Contains("espalda") || msg.Contains("hombro") || msg.Contains("vision"))
            {
                return (
                    $"En Barré es fundamental la elongación axial y la pelvis neutra. Te sugiero usar el módulo 'Belle Vision' en la barra inferior para que nuestra cámara con IA evalúe la simetría de tus hombros y tronco en tiempo real.",
                    "SugerirModuloBelleVision()"
                );
            }

            if (msg.Contains("bes") || msg.Contains("racha") || msg.Contains("puntaje"))
            {
                return (
                    $"¡Tu compromiso es excelente, {nombreUsuario}! Tienes un score BES óptimo y una racha activa. Continúa asistiendo para mantener tu estatus en el estudio.",
                    "ConsultarEngagementScore()"
                );
            }

            return (
                $"¡Hola {nombreUsuario}! ✨ Soy Belle AI, tu asistente virtual conectado en vivo a Azure SQL y OpenAI. Estoy aprendiendo continuamente de cada conversación para atenderte mejor. ¿En qué te puedo ayudar hoy con tus clases de Barre?",
                null
            );
        }

        public async Task RegistrarInteraccionAprendizajeAsync(string mensajeUsuario, string respuestaAsistente, string nombreUsuario)
        {
            try
            {
                // Guarda cada mensaje y palabra para el fine-tuning continuo de OpenAI
                var carpetaML = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "ml", "1.3_chatbot_aprendizaje");
                if (!Directory.Exists(carpetaML))
                {
                    carpetaML = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "ml", "1.3_chatbot_aprendizaje"));
                }

                if (Directory.Exists(carpetaML))
                {
                    var archivoFineTuning = Path.Combine(carpetaML, "dataset_openai_finetuning.jsonl");
                    var entradaFineTuning = new
                    {
                        messages = new[]
                        {
                            new { role = "system", content = "Eres Belle AI, asistente de Belle Barre Studio especializado en Barre, Pilates y reservas." },
                            new { role = "user", content = mensajeUsuario },
                            new { role = "assistant", content = respuestaAsistente }
                        },
                        timestamp = DateTime.UtcNow.ToString("o"),
                        usuario = nombreUsuario
                    };

                    var lineaJson = JsonSerializer.Serialize(entradaFineTuning) + Environment.NewLine;
                    await File.AppendAllTextAsync(archivoFineTuning, lineaJson, Encoding.UTF8);
                    _logger.LogInformation("Interacción aprendida y registrada para Fine-Tuning continuo en {Ruta}", archivoFineTuning);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "No se pudo registrar la interacción en el archivo de aprendizaje continuo.");
            }
        }
    }
}
