import { test } from 'node:test'
import assert from 'node:assert/strict'
import { activarPush, consultarPush, desactivarPush, limitacionPush, probarPush } from './notificacionesPush.js'

test('push: compatibilidad, gesto de permiso, registro autenticado, prueba y cierre de sesión', async () => {
  let permisos = 0
  let sesion = null
  let suscripcion = null
  const llamadas = []
  const clave = new Uint8Array(65).fill(1)
  const usuario = { id: 10, rol: 'Cliente', token: 'token-simulado' }
  const registro = {
    active: { postMessage: (datos, puertos) => {
      if (datos.accion === 'sesion') sesion = datos.sesion
      puertos[0].postMessage({ resultado: datos.accion === 'consultar' ? sesion : true })
      puertos[0].close()
    } },
    pushManager: {
      getSubscription: async () => suscripcion,
      subscribe: async (opciones) => {
        assert.equal(opciones.userVisibleOnly, true)
        assert.deepEqual(opciones.applicationServerKey, clave)
        suscripcion = {
          endpoint: 'https://fcm.googleapis.com/prueba', options: { applicationServerKey: clave.buffer },
          toJSON: () => ({ endpoint: 'https://fcm.googleapis.com/prueba', keys: { p256dh: 'punto', auth: 'secreto' } }),
          unsubscribe: async () => { suscripcion = null; return true },
        }
        return suscripcion
      },
    },
  }
  const originales = Object.fromEntries(['window', 'navigator', 'Notification', 'fetch'].map((nombre) => [nombre, Object.getOwnPropertyDescriptor(globalThis, nombre)]))
  try {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { isSecureContext: true, PushManager: {}, Notification: {}, matchMedia: () => ({ matches: false }) } })
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { userAgent: 'Android', platform: 'Linux', serviceWorker: { register: async () => registro, ready: Promise.resolve(registro), getRegistration: async () => registro } } })
    Object.defineProperty(globalThis, 'Notification', { configurable: true, value: { permission: 'default', requestPermission: () => { permisos++; return Promise.resolve('granted') } } })
    globalThis.fetch = async (ruta, opciones) => {
      llamadas.push({ ruta, ...opciones })
      return { ok: true, status: ruta.endsWith('suscripciones') ? 204 : 200, json: async () => ruta.endsWith('clave-publica') ? { clavePublica: Buffer.from(clave).toString('base64url') } : { mensaje: 'Programada' } }
    }
    assert.equal(limitacionPush(), '')
    window.isSecureContext = false
    assert.match(limitacionPush(), /HTTPS/)
    window.isSecureContext = true
    navigator.userAgent = 'iPhone'
    assert.match(limitacionPush(), /pantalla de inicio/)
    navigator.standalone = true
    assert.equal(limitacionPush(), '')
    Notification.permission = 'denied'
    assert.match(limitacionPush(), /bloqueadas/)
    Notification.permission = 'default'
    await assert.rejects(activarPush({ id: 1 }), /cuenta real/)
    assert.equal(permisos, 0)
    const activacion = activarPush(usuario)
    assert.equal(permisos, 1, 'Debe solicitar permiso antes de ceder el gesto del clic.')
    await activacion
    assert.deepEqual(sesion, { usuario: '10', rol: 'Cliente' })
    assert.equal(llamadas[1].headers.Authorization, 'Bearer token-simulado')
    assert.equal(await consultarPush(usuario), true)
    assert.equal(await consultarPush({ ...usuario, id: 11 }), false)
    assert.equal((await probarPush(usuario)).mensaje, 'Programada')
    await desactivarPush(usuario)
    assert.equal(sesion, null)
    assert.equal(suscripcion, null)
    assert.equal(llamadas.at(-1).method, 'DELETE')
    globalThis.fetch = async () => ({ ok: false, status: 401, json: async () => ({}) })
    await assert.rejects(probarPush(usuario), /sesión venció/)
  } finally {
    for (const [nombre, descriptor] of Object.entries(originales)) {
      if (descriptor) Object.defineProperty(globalThis, nombre, descriptor)
      else delete globalThis[nombre]
    }
  }
})
