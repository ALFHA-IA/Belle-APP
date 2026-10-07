// Fuente temporal: reemplazar por la API cuando exista la tabla de notificaciones.
const ejemplos = [
  { tipo: 'clase', destinatario: 'Cliente', titulo: 'Recordatorio de clase', mensaje: 'Tu clase de Barre de ejemplo es mañana a las 9:00 a. m. Llega 10 minutos antes.' },
  { tipo: 'promocion', destinatario: 'Cliente', titulo: 'Promoción especial', mensaje: 'Promoción de ejemplo: 20 % de descuento en tu próximo paquete de clases.' },
  { tipo: 'horario', destinatario: 'Instructor', titulo: 'Horario de clases', mensaje: 'Horario de ejemplo para mañana: Barre a las 9:00 a. m. y Pilates a las 11:00 a. m.' },
]

export function crearNotificacionesPrueba(rol) {
  const fecha = new Date().toISOString()
  return ejemplos
    .filter((aviso) => rol === 'Admin' || aviso.destinatario === rol)
    .map((aviso) => ({ ...aviso, id: crypto.randomUUID(), fecha, leida: false }))
}

export function claveNotificaciones(usuario) {
  return `belle_notificaciones_prueba_v1:${JSON.stringify([usuario.id, usuario.correo, usuario.rol])}`
}

export function cargarNotificaciones(clave, rol) {
  try {
    const datos = JSON.parse(localStorage.getItem(clave))
    if (Array.isArray(datos) && datos.every((aviso) =>
      aviso && typeof aviso.id === 'string' && typeof aviso.titulo === 'string' &&
      typeof aviso.mensaje === 'string' && typeof aviso.leida === 'boolean' &&
      Number.isFinite(Date.parse(aviso.fecha)) &&
      ejemplos.some((ejemplo) => ejemplo.tipo === aviso.tipo && ejemplo.destinatario === aviso.destinatario) &&
      (rol === 'Admin' || aviso.destinatario === rol)
    )) return datos
  } catch {
    // Si el almacenamiento no está disponible, la prueba funciona en memoria.
  }
  return crearNotificacionesPrueba(rol)
}
