# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Belle Vision: cámara real

- Abre `http://localhost:5173` en la computadora que ejecuta Vite, entra a Visión y pulsa **Activar cámara**. Acepta el permiso del navegador.
- En un celular, utiliza HTTPS con un certificado válido y confiable para ese dispositivo. `http://172.31.54.56:5173` no permite acceso a cámara. En una vista integrada también puede ser necesario abrir la app directamente en el navegador.
- **Cambiar cámara** solicita la cámara frontal o trasera si el dispositivo dispone de ellas. **Apagar cámara** libera el dispositivo. Salir de Visión u ocultar la pestaña también lo libera.
- La detección se ejecuta localmente con MediaPipe. No se graba video ni se envían imágenes a la API. No requiere ejecutar el servidor Python.
- El modelo oficial Pose Landmarker Lite está incluido en `public/models/pose_landmarker_lite.task`; los recursos WASM se empaquetan desde la dependencia instalada. Mantén estos recursos al publicar la aplicación.
- Los ángulos son referencias en dos dimensiones, no diagnósticos ni una clasificación clínica de postura. Se ocultan cuando hombros/caderas no tienen suficiente visibilidad.

### Validación

Ejecuta `npm run build`, `npm run lint` y `node --test src/services/visionUtils.test.js`.

En un dispositivo real comprueba: aceptar y denegar permisos; cambiar cámara; encuadrar y retirar el cuerpo; apagar; salir a otra pantalla; ocultar la pestaña. Confirma que el indicador de cámara se apague y que no queden lecturas antiguas cuando desaparece el cuerpo.

Modelo: https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task
Documentación: https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker/web_js
