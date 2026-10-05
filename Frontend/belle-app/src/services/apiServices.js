import axios from 'axios'
import {
  PROFESIONALES,
  SERVICIOS,
  CLIENTES,
  RESERVAS_INICIALES,
  DASHBOARD_STATS,
  WHATSAPP_CHATS,
  POSTURA_SAMPLES
} from './mockData'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Memoria local de respaldo y estado reactivo
let reservasState = [...RESERVAS_INICIALES]
let clientesState = [...CLIENTES]
let whatsappChatsState = [...WHATSAPP_CHATS]

// ==========================================
// MÓDULO 10: DASHBOARD SERVICE
// ==========================================
export const getDashboardStats = async () => {
  try {
    const res = await api.get('/dashboard/stats')
    return res.data
  } catch (err) {
    console.warn('Usando fallback local para Dashboard Stats:', err.message)
    return {
      ...DASHBOARD_STATS,
      citasHoy: {
        total: reservasState.length,
        atendidas: reservasState.filter(r => r.estado === 'ATENDIDA').length,
        confirmadas: reservasState.filter(r => r.estado === 'CONFIRMADA').length,
        pendientes: 0
      },
      clientesEnRiesgo: {
        total: clientesState.filter(c => c.clasificacion === 'EN RIESGO').length,
        recuperablesInmediatos: clientesState.filter(c => c.clasificacion === 'EN RIESGO' && c.bes > 25).length
      }
    }
  }
}

// ==========================================
// MÓDULO 5: RESERVAS SERVICE (Agenda Azure SQL)
// ==========================================
export const getReservas = async () => {
  try {
    const res = await api.get('/reservas')
    if (Array.isArray(res.data) && res.data.length > 0) {
      reservasState = res.data
      return res.data
    }
    return reservasState
  } catch (err) {
    console.warn('Usando fallback local para Reservas:', err.message)
    return reservasState
  }
}

export const crearReserva = async (nuevaReserva) => {
  try {
    const res = await api.post('/reservas', {
      usuarioId: typeof nuevaReserva.clienteId === 'number' ? nuevaReserva.clienteId : parseInt(nuevaReserva.clienteId, 10) || 258,
      claseId: parseInt(nuevaReserva.servicioId, 10) || 1,
      fecha: nuevaReserva.fecha,
      hora: nuevaReserva.hora,
      observaciones: nuevaReserva.observaciones
    })

    const data = res.data
    const reservaCreada = {
      id: data.id || `r${Date.now()}`,
      clienteId: nuevaReserva.clienteId,
      clienteNombre: data.clienteNombre || 'Alexander Urquiaga',
      servicioId: nuevaReserva.servicioId,
      servicioNombre: data.servicioNombre || 'Barré Fit Core & Sculpt',
      profesionalId: nuevaReserva.profesionalId || 'p1',
      profesionalNombre: data.profesionalNombre || 'Valeria Mendoza',
      fecha: data.fecha || nuevaReserva.fecha,
      hora: data.hora || nuevaReserva.hora,
      duracion: 50,
      precio: 65.0,
      estado: 'CONFIRMADA',
      observaciones: nuevaReserva.observaciones || 'Registrado desde recepción'
    }

    reservasState = [reservaCreada, ...reservasState]
    return reservaCreada
  } catch (err) {
    console.warn('Fallback al crear reserva:', err.message)
    const cliente = clientesState.find(c => c.id == nuevaReserva.clienteId)
    const servicio = SERVICIOS.find(s => s.id == nuevaReserva.servicioId)
    const profesional = PROFESIONALES.find(p => p.id == nuevaReserva.profesionalId)

    const reservaCreada = {
      id: `r${Date.now()}`,
      clienteId: nuevaReserva.clienteId,
      clienteNombre: cliente ? cliente.nombre : 'Alexander Urquiaga',
      servicioId: nuevaReserva.servicioId,
      servicioNombre: servicio ? servicio.nombre : 'Barré Fit Core & Sculpt',
      profesionalId: nuevaReserva.profesionalId,
      profesionalNombre: profesional ? profesional.nombre : 'Valeria Mendoza',
      fecha: nuevaReserva.fecha,
      hora: nuevaReserva.hora,
      duracion: 50,
      precio: 65.0,
      estado: 'CONFIRMADA',
      observaciones: nuevaReserva.observaciones || 'Registrado desde recepción'
    }

    reservasState = [reservaCreada, ...reservasState]
    return reservaCreada
  }
}

export const actualizarEstadoReserva = async (reservaId, nuevoEstado) => {
  try {
    const numericId = typeof reservaId === 'string' ? reservaId.replace('r', '') : reservaId
    await api.put(`/reservas/${numericId}/estado`, { estado: nuevoEstado })
  } catch (err) {
    console.warn('Fallback al actualizar estado reserva:', err.message)
  }

  reservasState = reservasState.map(r => 
    r.id === reservaId ? { ...r, estado: nuevoEstado } : r
  )
  return { success: true, id: reservaId, estado: nuevoEstado }
}

// ==========================================
// MÓDULO 7: CRM PREDICTIVO & BES (Azure SQL AppUsers)
// ==========================================
export const getClientesCRM = async () => {
  try {
    const res = await api.get('/clientes')
    if (Array.isArray(res.data) && res.data.length > 0) {
      clientesState = res.data
      return res.data
    }
    return clientesState
  } catch (err) {
    console.warn('Usando fallback local para Clientes CRM:', err.message)
    return clientesState
  }
}

export const enviarCampanaRetencion = async (clienteId, canal = 'WhatsApp', descuento = '20%') => {
  try {
    await api.post(`/crm/alerta/${clienteId}`)
  } catch (err) {
    console.warn('Campaña procesada localmente:', err.message)
  }

  const cliente = clientesState.find(c => c.id == clienteId)
  if (cliente) {
    const nuevoMensaje = {
      id: `camp_${Date.now()}`,
      clienteId: cliente.id,
      clienteNombre: cliente.nombre,
      telefono: cliente.telefono,
      avatar: cliente.avatar,
      ultimoMensaje: `Campaña enviada: Descuento de ${descuento} en su próximo servicio.`,
      hora: 'Justo ahora',
      noLeidos: 0,
      estadoBot: 'Esperando respuesta del cliente',
      mensajes: [
        {
          id: `m_${Date.now()}`,
          remitente: 'bot',
          texto: `Hola ${cliente.nombre.split(' ')[0]} ✨ En Belle Studio te extrañamos. Tenemos un ${descuento} especial en ${cliente.ultimoServicio || 'nuestras clases Barré'}. ¿Te gustaría consultar horarios disponibles?`,
          hora: 'Justo ahora'
        }
      ]
    }

    const existeChat = whatsappChatsState.find(w => w.clienteId == clienteId)
    if (existeChat) {
      existeChat.mensajes.push(nuevoMensaje.mensajes[0])
      existeChat.ultimoMensaje = nuevoMensaje.ultimoMensaje
      existeChat.hora = 'Justo ahora'
    } else {
      whatsappChatsState = [nuevoMensaje, ...whatsappChatsState]
    }
  }

  return { success: true, clienteId, canal }
}

// ==========================================
// MÓDULO 8: WHATSAPP SERVICE
// ==========================================
export const getWhatsAppChats = async () => {
  try {
    const res = await api.get('/whatsapp/chats')
    if (Array.isArray(res.data) && res.data.length > 0) {
      whatsappChatsState = res.data
      return res.data
    }
    return whatsappChatsState
  } catch (err) {
    console.warn('Fallback WhatsApp chats:', err.message)
    return whatsappChatsState
  }
}

export const enviarMensajeWhatsApp = async (chatId, texto) => {
  try {
    await api.post('/whatsapp/enviar', { chatId, texto })
  } catch (err) {
    console.warn('Fallback enviar WhatsApp:', err.message)
  }

  whatsappChatsState = whatsappChatsState.map(chat => {
    if (chat.id === chatId) {
      return {
        ...chat,
        ultimoMensaje: texto,
        hora: 'Justo ahora',
        mensajes: [
          ...chat.mensajes,
          {
            id: `msg_${Date.now()}`,
            remitente: 'cliente',
            texto,
            hora: 'Justo ahora'
          }
        ]
      }
    }
    return chat
  })
  return { success: true }
}

// ==========================================
// MÓDULO 9: BELLE VISION SERVICE (MediaPipe)
// ==========================================
export const analizarPosturaVision = async (tipoMuestra = 'adecuada') => {
  try {
    const res = await api.post('/vision/analizar', { tipoMuestra })
    return {
      ...(POSTURA_SAMPLES[tipoMuestra] || POSTURA_SAMPLES.adecuada),
      ...res.data
    }
  } catch (err) {
    console.warn('Fallback Vision:', err.message)
    return POSTURA_SAMPLES[tipoMuestra] || POSTURA_SAMPLES.adecuada
  }
}

// ==========================================
// MÓDULO 6: ASISTENTE BELLE AI (Function Calling)
// ==========================================
export const consultarAsistenteBelle = async (mensajeUsuario, nombreUsuario = 'Usuario') => {
  try {
    const res = await api.post('/asistente/chat', { mensaje: mensajeUsuario, nombreUsuario })
    return res.data
  } catch (err) {
    console.warn('Fallback Asistente:', err.message)
    const msg = mensajeUsuario.toLowerCase()

    if (msg.includes('mi nombre') || msg.includes('quien soy') || msg.includes('quién soy')) {
      return {
        respuesta: `¡Hola ${nombreUsuario}! Te reconozco como el usuario de esta sesión.`,
        toolEjecutada: `ConsultarUsuarioActual(nombre="${nombreUsuario}")`,
        accionSugerida: { tipo: 'VER_RESERVAS' }
      }
    }

    if (msg.includes('alexander') || msg.includes('urquiaga')) {
      return {
        respuesta: '¡Hola Alexander Urquiaga! Te reconozco en nuestra base de datos Azure SQL (ID: 258). Tienes status COMPROMETIDO con un BES de 96 puntos.',
        toolEjecutada: 'ConsultarClientePorNombre(nombre="Alexander Urquiaga")',
        accionSugerida: { tipo: 'VER_RESERVAS' }
      }
    }

    if (msg.includes('reserva') || msg.includes('cita') || msg.includes('agendar')) {
      return {
        respuesta: '¡Por supuesto! Consulté la disponibilidad en tiempo real con Azure SQL. Tenemos cupos disponibles hoy a las 10:00 AM para Barré Fit Core & Sculpt con Valeria Mendoza.',
        toolEjecutada: 'ConsultarDisponibilidad(servicio="Barré Fit", fecha="hoy")',
        accionSugerida: {
          tipo: 'CREAR_RESERVA',
          servicio: 'Barré Fit Core & Sculpt',
          profesional: 'Valeria Mendoza',
          hora: '10:00'
        }
      }
    }

    return {
      respuesta: `Hola ${nombreUsuario.split(' ')[0]}, soy Belle AI ✨ Tu copiloto inteligente conectado en vivo a Azure SQL. ¿En qué te puedo ayudar hoy?`,
      toolEjecutada: null,
      accionSugerida: null
    }
  }
}

