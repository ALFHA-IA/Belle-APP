const API = import.meta.env?.VITE_API_BASE_URL || '/api'
let operaciones = Promise.resolve()
const enOrden = (accion) => {
  const resultado = operaciones.then(accion)
  operaciones = resultado.catch(() => {})
  return resultado
}

export function limitacionPush() {
  if (!window.isSecureContext) return 'Abre Belle con HTTPS para activar las notificaciones del celular.'
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  if (ios && !window.matchMedia('(display-mode: standalone)').matches && !navigator.standalone) {
    return 'En iPhone (iOS 16.4 o posterior): abre Belle en Safari, toca Compartir → Agregar a pantalla de inicio y ábrela desde ese icono.'
  }
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'Este navegador no admite notificaciones push. Usa un navegador compatible.'
  if (Notification.permission === 'denied') return 'Las notificaciones están bloqueadas. Permítelas en la configuración de este sitio y vuelve a intentarlo.'
  return ''
}

async function peticion(usuario, ruta, metodo = 'GET', datos) {
  if (!usuario?.token) throw new Error('Inicia sesión con una cuenta real para activar push. El acceso rápido de demostración solo permite avisos dentro de la app.')
  const respuesta = await fetch(`${API}/notificaciones/${ruta}`, {
    method: metodo,
    headers: { Authorization: `Bearer ${usuario.token}`, ...(datos ? { 'Content-Type': 'application/json' } : {}) },
    body: datos ? JSON.stringify(datos) : undefined,
    signal: AbortSignal.timeout(20000),
  })
  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}))
    throw new Error(respuesta.status === 401 ? 'Tu sesión venció. Vuelve a iniciar sesión.' : error.mensaje || 'No se pudo conectar con el servicio de notificaciones.')
  }
  return respuesta.status === 204 ? null : respuesta.json()
}

export function comunicarWorker(registro, datos) {
  return new Promise((resolve, reject) => {
    if (!registro?.active) return reject(new Error('El servicio de notificaciones aún no está listo. Inténtalo nuevamente.'))
    const canal = new MessageChannel()
    const tiempo = setTimeout(() => { canal.port1.close(); reject(new Error('El servicio de notificaciones no respondió.')) }, 10000)
    canal.port1.onmessage = ({ data }) => {
      clearTimeout(tiempo)
      canal.port1.close()
      if (data.error) reject(new Error(data.error))
      else resolve(data.resultado)
    }
    registro.active.postMessage(datos, [canal.port2])
  })
}

const sesionDe = (usuario) => ({ usuario: String(usuario.id), rol: usuario.rol })
const coincide = (sesion, usuario) => sesion?.usuario === String(usuario.id) && sesion?.rol === usuario.rol

async function registrarEnServidor(usuario, suscripcion) {
  const datos = suscripcion.toJSON()
  await peticion(usuario, 'suscripciones', 'POST', { endpoint: datos.endpoint, p256dh: datos.keys.p256dh, auth: datos.keys.auth })
}

export function activarPush(usuario) {
  const limitacion = limitacionPush()
  if (limitacion) return Promise.reject(new Error(limitacion))
  if (!usuario?.token) return Promise.reject(new Error('Inicia sesión con una cuenta real para activar push.'))
  // Solicitar directamente desde el clic, antes de esperar red o registrar el worker (iOS).
  const permiso = Notification.requestPermission()
  return enOrden(async () => {
    if (await permiso !== 'granted') throw new Error('Debes permitir las notificaciones para recibirlas en el celular.')
    await navigator.serviceWorker.register('/notificaciones-sw.js', { scope: '/' })
    let tiempo
    const registro = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) => { tiempo = setTimeout(() => reject(new Error('No se pudo iniciar el servicio push. Recarga e inténtalo otra vez.')), 15000) }),
    ]).finally(() => clearTimeout(tiempo))
    const { clavePublica } = await peticion(usuario, 'clave-publica')
    const base64 = clavePublica.replace(/-/g, '+').replace(/_/g, '/')
    const clave = Uint8Array.from(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')), (letra) => letra.charCodeAt(0))
    let suscripcion = await registro.pushManager.getSubscription()
    if (suscripcion) {
      const anterior = new Uint8Array(suscripcion.options.applicationServerKey || [])
      if (anterior.length !== clave.length || anterior.some((valor, i) => valor !== clave[i])) {
        await suscripcion.unsubscribe()
        suscripcion = null
      }
    }
    suscripcion ||= await registro.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: clave })
    await comunicarWorker(registro, { accion: 'sesion', sesion: sesionDe(usuario) })
    await registrarEnServidor(usuario, suscripcion)
    return true
  })
}

export function consultarPush(usuario) {
  return enOrden(async () => {
    if (!window.isSecureContext || !('serviceWorker' in navigator) || !usuario?.token) return false
    const registro = await navigator.serviceWorker.getRegistration('/')
    if (!registro?.active || !registro.pushManager) return false
    const sesion = await comunicarWorker(registro, { accion: 'consultar' })
    const suscripcion = await registro.pushManager.getSubscription()
    if (!suscripcion || !coincide(sesion, usuario)) return false
    await registrarEnServidor(usuario, suscripcion)
    return true
  })
}

export function desactivarPush(usuario) {
  return enOrden(async () => {
    if (!window.isSecureContext || !('serviceWorker' in navigator)) return
    const registro = await navigator.serviceWorker.getRegistration('/')
    if (!registro?.active) return
    await comunicarWorker(registro, { accion: 'sesion', sesion: null })
    const suscripcion = await registro.pushManager.getSubscription()
    if (!suscripcion) return
    if (!await suscripcion.unsubscribe()) throw new Error('No se pudo desactivar la suscripción. Inténtalo nuevamente.')
    if (usuario?.token) await peticion(usuario, 'suscripciones', 'DELETE', { endpoint: suscripcion.endpoint }).catch(() => {})
  })
}

export async function leerAvisosPush(usuario) {
  if (!window.isSecureContext || !('serviceWorker' in navigator)) return []
  const registro = await navigator.serviceWorker.getRegistration('/')
  if (!registro?.active) return []
  return comunicarWorker(registro, { accion: 'avisos', sesion: sesionDe(usuario) })
}

export const probarPush = (usuario) => peticion(usuario, 'prueba', 'POST')
