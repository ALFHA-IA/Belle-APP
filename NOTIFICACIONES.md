# Notificaciones de prueba de Belle

La campana permite consultar avisos internos y activar **Web Push real**, enviado por el backend .NET mediante VAPID. No son mensajes de WhatsApp ni SMS. No requiere una cuenta de Firebase.

## Probar desde el celular

1. Mantener el backend actualizado y ejecutándose. Desde `Backend/belle-api/Belle.Api`: `dotnet run --launch-profile http`.
2. Abrir el frontend por **HTTPS con un certificado confiable en el teléfono**. Una dirección `http://192.168...` no permite push. El proxy existente de Vite reenvía `/api` al backend en el puerto 5213.
3. Iniciar sesión con una cuenta real de Cliente, Instructor o Admin. El selector rápido de demostración no entrega JWT y solo permite notificaciones internas.
4. En Android, abrir en Chrome u otro navegador con Web Push. En iPhone con iOS 16.4 o posterior, abrir en Safari → Compartir → Agregar a pantalla de inicio; después abrir Belle desde ese icono.
5. Tocar la campana → **Activar notificaciones** y aceptar el permiso del sistema.
6. Tocar **Probar en 15 segundos**, cerrar Belle o bloquear el teléfono y esperar. El backend debe seguir encendido y tener acceso a Internet. La entrega final depende del proveedor push, la conexión y los ajustes del sistema.

El cliente recibe una clase y una promoción; el profesor recibe su horario; el administrador recibe las tres categorías. Además, cada prueba de cliente/profesor envía copia a los administradores que hayan activado push. La prueba solo envía a las cuentas participantes y los administradores, no a todos los clientes del estudio.

Al tocar la notificación se abre la bandeja. Los avisos recibidos quedan disponibles al volver a abrir Belle. Cerrar sesión o cambiar de cuenta desactiva la suscripción de ese navegador; la cuenta siguiente debe activarla. El botón **Desactivar en este dispositivo** permite detenerlos manualmente.

## HTTPS local existente

El proyecto ya incluye [setup-https.ps1](belle-vision/setup-https.ps1). Ejecutarlo prepara certificados; después ejecutar `npm run dev:https` desde `Frontend/belle-app`. El teléfono debe estar en la misma red y confiar en el certificado público de la CA local, como indica el script. No compartir claves privadas. Para pruebas sin instalar certificados, desplegar el frontend en un dominio HTTPS válido con `/api` dirigido a este backend.

En producción, servir [notificaciones-sw.js](Frontend/belle-app/public/notificaciones-sw.js) y [manifiesto.webmanifest](Frontend/belle-app/public/manifiesto.webmanifest) desde la raíz y conservar los iconos de `public`. El worker no almacena páginas para uso sin conexión. El despliegue debe conservar la redirección de rutas de React hacia `index.html`.

## Almacenamiento provisional

El backend crea automáticamente `DatosNotificaciones/claves.json` y `DatosNotificaciones/suscripciones.json`, fuera de la carpeta pública y excluidos de Git. Conservarlos en un volumen persistente y restringir el acceso al proceso del servidor. Las claves privadas nunca se envían al frontend. No borrar las claves entre reinicios: invalidaría las suscripciones existentes.

`NotificacionesPush__Contacto` permite establecer el contacto VAPID (URL HTTPS o `mailto:`); el valor provisional es `https://bellebarre.pe`. El almacén de archivos está diseñado para **una sola instancia de pruebas**. Al conectar la tabla, reemplazar el almacenamiento en [ServicioNotificacionesPush.cs](Backend/belle-api/Belle.Api/Services/ServicioNotificacionesPush.cs) y conectar allí los eventos reales de clases, promociones y horarios. Las pruebas programadas permanecen en memoria: reiniciar el backend cancela las que aún no se enviaron.

Las rutas `/api/notificaciones/clave-publica`, `/suscripciones` y `/prueba` requieren JWT. El rol y usuario se toman del token, no del cuerpo de la petición. Se validan los proveedores y claves, se evita duplicar pruebas pendientes y se eliminan suscripciones que respondan 404/410. Los avisos push de prueba caducan a los cinco minutos en el proveedor.

## Verificación

- Frontend: `npm run build` y `node --test src/services/notificacionesPush.test.js` desde `Frontend/belle-app`.
- Backend: `dotnet run --project PruebasNotificaciones/PruebasNotificaciones.csproj` desde `Backend/belle-api` (detener previamente la API si Windows bloquea sus archivos de compilación).
- Las pruebas del backend usan un proveedor simulado: comprueban cifrado y VAPID, reparto por rol, copia a administradores, persistencia, aislamiento y bajas por suscripciones vencidas. No envían avisos a teléfonos reales.
- La recepción real en Android/iPhone requiere completar los pasos de activación en cada dispositivo.
