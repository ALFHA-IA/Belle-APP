# Belle Vision

La cámara y MediaPipe se ejecutan en el navegador. El modelo Pose Landmarker Lite ya está entrenado y está en `../Frontend/belle-app/public/models/pose_landmarker_lite.task`. No hace falta entrenar un modelo ni ejecutar Python para activar la cámara.

`main.py` está vacío; no es un servicio activo. `requirements.txt` contiene dependencias para un posible servicio Python, pero instalarlo no resuelve el bloqueo HTTP del navegador. No se han agregado endpoints ficticios ni entrenamientos sin datos.

## Acceso seguro en desarrollo

1. Desde PowerShell, ejecuta `./setup-https.ps1`. Descarga mkcert oficial v1.4.4, instala una CA local y genera un certificado para localhost y las IP actuales de la computadora.
2. En `../Frontend/belle-app`, ejecuta `npm run dev:https`.
3. Computadora: abre https://localhost:5174/vision. El servidor HTTP existente puede seguir en el puerto 5173.
4. Celular: utiliza la misma red, instala el certificado público `.certs/belle-local-ca.crt` y habilita su confianza. Abre `https://IP-DE-LA-COMPUTADORA:5174/vision`. En iPhone instala el perfil y activa la confianza completa en Ajustes > General > Información > Ajustes de confianza de certificados. Si cambia la IP, vuelve a ejecutar el script.
5. Inicia sesión en la nueva dirección y permite la cámara. Las sesiones del origen HTTP no se transfieren a HTTPS.

La red debe permitir conexiones al puerto 5174. Los certificados son solo para desarrollo. En producción utiliza HTTPS con un certificado público válido. No publiques `.certs` ni compartas archivos `*key.pem`; comparte únicamente el certificado público indicado para tus dispositivos de prueba.

## Lógica conservada

- `../Frontend/belle-app/src/hooks/usePoseCamera.js`: permiso de cámara, detector local, cambio de cámara y liberación de recursos.
- `../Frontend/belle-app/src/services/visionUtils.js`: medidas geométricas y validación de visibilidad.
- `../Frontend/belle-app/src/pages/Vision/VisionPage.jsx`: video, puntos y resultados.

Para entrenar un clasificador propio de ejercicios, primero se necesitarían ejercicios definidos, datos etiquetados y evaluación. Esa tarea es independiente de habilitar la cámara; el proyecto actual no contiene un conjunto de entrenamiento.

Documentación de certificados: https://github.com/FiloSottile/mkcert
