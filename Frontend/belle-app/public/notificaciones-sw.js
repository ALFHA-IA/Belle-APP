// Worker exclusivo de notificaciones: no intercepta ni almacena peticiones de la app.
let tareas = Promise.resolve()
const enOrden = (accion) => {
  const resultado = tareas.then(accion)
  tareas = resultado.catch(() => {})
  return resultado
}
const abrirDatos = () => new Promise((resolve, reject) => {
  const peticion = indexedDB.open('belle-push', 1)
  peticion.onupgradeneeded = () => peticion.result.createObjectStore('datos')
  peticion.onsuccess = () => resolve(peticion.result)
  peticion.onerror = () => reject(peticion.error)
})

async function consultar(clave) {
  const db = await abrirDatos()
  try {
    return await new Promise((resolve, reject) => {
      const peticion = db.transaction('datos').objectStore('datos').get(clave)
      peticion.onsuccess = () => resolve(peticion.result)
      peticion.onerror = () => reject(peticion.error)
    })
  } finally { db.close() }
}

async function guardar(clave, valor) {
  const db = await abrirDatos()
  try {
    await new Promise((resolve, reject) => {
      const transaccion = db.transaction('datos', 'readwrite')
      transaccion.objectStore('datos').put(valor, clave)
      transaccion.oncomplete = resolve
      transaccion.onerror = () => reject(transaccion.error)
      transaccion.onabort = () => reject(transaccion.error)
    })
  } finally { db.close() }
}

self.addEventListener('install', (evento) => evento.waitUntil(self.skipWaiting()))
self.addEventListener('activate', (evento) => evento.waitUntil(self.clients.claim()))

self.addEventListener('message', (evento) => {
  evento.waitUntil(enOrden(async () => {
    try {
      const { accion, sesion } = evento.data || {}
      let resultado
      if (accion === 'sesion') {
        await guardar('sesion', sesion)
        if (!sesion) {
          const visibles = await self.registration.getNotifications()
          visibles.forEach((aviso) => aviso.close())
        }
        resultado = true
      } else if (accion === 'consultar') resultado = await consultar('sesion')
      else if (accion === 'avisos') resultado = await consultar(`avisos:${sesion.usuario}:${sesion.rol}`) || []
      evento.ports[0]?.postMessage({ resultado })
    } catch { evento.ports[0]?.postMessage({ error: 'No se pudo acceder al almacenamiento de notificaciones.' }) }
  }))
})

self.addEventListener('push', (evento) => {
  evento.waitUntil(enOrden(async () => {
    const aviso = evento.data?.json()
    const sesion = await consultar('sesion')
    if (!aviso || !sesion || aviso.usuario !== sesion.usuario || aviso.rol !== sesion.rol) return
    await self.registration.showNotification(aviso.titulo, {
      body: aviso.mensaje,
      icon: '/icono-notificaciones-192.png',
      badge: '/insignia-notificaciones.png',
      tag: aviso.id,
      data: { usuario: aviso.usuario, rol: aviso.rol },
    })
    const clave = `avisos:${sesion.usuario}:${sesion.rol}`
    const anteriores = await consultar(clave) || []
    await guardar(clave, [{ ...aviso, leida: false }, ...anteriores.filter((a) => a.id !== aviso.id)].slice(0, 100))
    const ventanas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    ventanas.forEach((ventana) => ventana.postMessage({ tipo: 'notificacion-recibida' }))
  }))
})

self.addEventListener('notificationclick', (evento) => {
  evento.notification.close()
  evento.waitUntil((async () => {
    const ventanas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    if (ventanas.length) {
      await ventanas[0].focus()
      ventanas[0].postMessage({ tipo: 'abrir-notificaciones' })
      return
    }
    await self.clients.openWindow('/?notificaciones=1')
  })())
})
