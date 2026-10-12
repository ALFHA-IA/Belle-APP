import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The published MediaPipe bundle references a map absent from the package.
// Strip only that missing development map reference; leave the runtime intact.
const mediaPipeSourceMap = {
  name: 'mediapipe-missing-source-map',
  enforce: 'pre',
  load(id) {
    const file = id.split('?')[0].replaceAll('\\', '/')
    if (!file.endsWith('/@mediapipe/tasks-vision/vision_bundle.mjs') || /[?&](url|raw)(?:&|$)/.test(id)) return
    const map = file.replace(/vision_bundle\.mjs$/, 'vision_bundle_mjs.js.map')
    if (!existsSync(map)) {
      return { code: readFileSync(file, 'utf8').replace(/\/\/# sourceMappingURL=vision_bundle_mjs\.js\.map\s*$/, ''), map: null }
    }
  },
}

export default defineConfig(({ mode }) => {
  let https
  if (mode === 'https') {
    const cert = fileURLToPath(new URL('../../belle-vision/.certs/localhost.pem', import.meta.url))
    const key = fileURLToPath(new URL('../../belle-vision/.certs/localhost-key.pem', import.meta.url))
    if (!existsSync(cert) || !existsSync(key)) {
      throw new Error('Primero ejecuta belle-vision/setup-https.ps1 para preparar los certificados locales.')
    }
    https = { cert: readFileSync(cert), key: readFileSync(key) }
  }
  return {
    plugins: [mediaPipeSourceMap, react(), tailwindcss()],
    server: {
      host: true,
      https,
      port: mode === 'https' ? 5174 : 5173,
      strictPort: true,
      fs: { deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/.certs/**'] },
      proxy: {
        '/api': { target: 'http://127.0.0.1:5213', changeOrigin: true },
      },
    },
  }
})
