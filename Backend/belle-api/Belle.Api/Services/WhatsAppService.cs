using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace Belle.Api.Services
{
    public interface IWhatsAppService
    {
        Task EnviarAlertaRiesgoAsync(string telefonoDestino, string nombreCliente);
    }

    public class WhatsAppService : IWhatsAppService
    {
        private readonly IConfiguration _config;

        public WhatsAppService(IConfiguration config)
        {
            _config = config;
            TwilioClient.Init(_config["Twilio:AccountSid"], _config["Twilio:AuthToken"]);
        }

        public async Task EnviarAlertaRiesgoAsync(string telefonoDestino, string nombreCliente)
        {
            var numeroOrigen = _config["Twilio:NumeroWhatsApp"]!;
            var mensaje = $"Hola {nombreCliente}, notamos que no has venido a tus clases últimamente. " +
                          "¡Te extrañamos en Belle! Responde este mensaje si necesitas reprogramar.";

            await MessageResource.CreateAsync(
                body: mensaje,
                from: new PhoneNumber(numeroOrigen),
                to: new PhoneNumber($"whatsapp:{telefonoDestino}")
            );
        }
    }
}