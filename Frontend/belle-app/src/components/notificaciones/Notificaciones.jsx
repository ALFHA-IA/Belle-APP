import { useEffect, useRef, useState } from 'react'
import { Bell, CalendarDays, Check, Gift, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cargarNotificaciones, claveNotificaciones, crearNotificacionesPrueba } from '../../services/notificaciones'
import { ActivacionNotificaciones } from './ActivacionNotificaciones'
import { leerAvisosPush } from '../../services/notificacionesPush'

export function Notificaciones() {
  const { usuario } = useAuth()
  if (!usuario) return null
  const clave = claveNotificaciones(usuario)
  return <BandejaNotificaciones key={clave} clave={clave} rol={usuario.rol} usuario={usuario} />
}

function BandejaNotificaciones({ clave, rol, usuario }) {
  const [avisos, setAvisos] = useState(() => cargarNotificaciones(clave, rol))
  const [resultado, setResultado] = useState('')
  const dialogo = useRef(null)
  const pendientes = avisos.filter((aviso) => !aviso.leida).length

  useEffect(() => {
    let vigente = true
    const actualizar = () => leerAvisosPush(usuario).then((nuevos) => {
      if (vigente && nuevos.length) setAvisos((anteriores) => {
        const ids = new Set(anteriores.map((aviso) => aviso.id))
        return [...nuevos.filter((aviso) => !ids.has(aviso.id)), ...anteriores].slice(0, 100)
      })
    }).catch(() => {})
    const recibir = ({ data }) => {
      if (data?.tipo === 'notificacion-recibida' || data?.tipo === 'abrir-notificaciones') actualizar()
      if (data?.tipo === 'abrir-notificaciones' && !dialogo.current.open) dialogo.current.showModal()
    }
    actualizar()
    const url = new URL(window.location.href)
    if (url.searchParams.get('notificaciones') === '1') {
      dialogo.current.showModal()
      url.searchParams.delete('notificaciones')
      window.history.replaceState(window.history.state, '', url)
    }
    navigator.serviceWorker?.addEventListener('message', recibir)
    window.addEventListener('focus', actualizar)
    return () => {
      vigente = false
      navigator.serviceWorker?.removeEventListener('message', recibir)
      window.removeEventListener('focus', actualizar)
    }
  }, [usuario])

  useEffect(() => {
    try {
      localStorage.setItem(clave, JSON.stringify(avisos))
    } catch {
      // El modo de prueba sigue disponible en memoria si el navegador no permite guardar.
    }
  }, [clave, avisos])

  const simularEnvio = () => {
    const nuevos = crearNotificacionesPrueba(rol)
    setAvisos((anteriores) => [...nuevos, ...anteriores].slice(0, 100))
    setResultado(`Se recibieron ${nuevos.length} notificaciones de prueba.`)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogo.current.showModal()}
        aria-label={`Notificaciones: ${pendientes} sin leer`}
        aria-haspopup="dialog"
        title="Notificaciones"
        className="relative w-9 h-9 shrink-0 rounded-full bg-[#EFE9DF] text-[#63554C] flex items-center justify-center hover:bg-[#EAE2D5] cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {pendientes > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#6E1C36] text-white text-[9px] font-bold flex items-center justify-center">{pendientes > 99 ? '99+' : pendientes}</span>}
      </button>

      <dialog
        ref={dialogo}
        aria-labelledby="titulo-notificaciones"
        className="m-auto w-[calc(100%-2rem)] max-w-sm max-h-[85dvh] rounded-3xl border border-[#E3D9CC] bg-[#FFFDFB] text-[#241E1C] p-0 shadow-2xl backdrop:bg-[#1F1917]/60"
      >
        <div className="p-4 border-b border-[#EDE5DA] flex items-center justify-between gap-2">
          <div>
            <h2 id="titulo-notificaciones" className="font-bold text-base">Notificaciones</h2>
            <p className="text-xs text-[#7A6E65]">{pendientes} sin leer · {rol === 'Admin' ? 'Clientes y profesores' : rol === 'Instructor' ? 'Profesores' : 'Clientes'}</p>
          </div>
          <button type="button" autoFocus onClick={() => dialogo.current.close()} aria-label="Cerrar notificaciones" className="p-2 rounded-full bg-[#EFE9DF] cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4 space-y-3">
          <ActivacionNotificaciones usuario={usuario} />
          <p className="text-xs text-[#7A6E65]">Modo de prueba: avisos de ejemplo dentro de la app, pendientes de conectar a los datos reales.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={simularEnvio} className="px-3 py-2 rounded-xl bg-[#6E1C36] text-white text-xs font-semibold cursor-pointer">Simular envío</button>
            <button type="button" disabled={!pendientes} onClick={() => setAvisos((anteriores) => anteriores.map((aviso) => ({ ...aviso, leida: true })))} className="px-3 py-2 rounded-xl bg-[#EFE9DF] text-xs font-semibold disabled:opacity-50 cursor-pointer">Marcar todas como leídas</button>
          </div>
          <p role="status" className="text-xs text-[#2D7A58]">{resultado}</p>
          {avisos.length === 0 ? <p className="py-6 text-center text-sm text-[#7A6E65]">No tienes notificaciones.</p> : (
            <ul className="space-y-2">
              {avisos.map((aviso) => (
                <li key={aviso.id} className={`p-3 rounded-2xl border ${aviso.leida ? 'bg-white border-[#EDE5DA]' : 'bg-[#F9F0F2] border-[#E5CCD3]'}`}>
                  <div className="flex items-start gap-2">
                    {aviso.tipo === 'promocion' ? <Gift className="w-4 h-4 mt-0.5 shrink-0 text-[#6E1C36]" /> : <CalendarDays className="w-4 h-4 mt-0.5 shrink-0 text-[#6E1C36]" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-[#7A6E65]">{aviso.destinatario === 'Cliente' ? 'Clientes' : 'Profesores'} · {aviso.leida ? 'Leída' : 'Sin leer'}</p>
                      <h3 className="text-sm font-bold">{aviso.titulo}</h3>
                      <p className="text-xs text-[#63554C] mt-1">{aviso.mensaje}</p>
                      <time dateTime={aviso.fecha} className="block text-[10px] text-[#7A6E65] mt-2">{new Date(aviso.fecha).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}</time>
                      {!aviso.leida && <button type="button" onClick={() => setAvisos((anteriores) => anteriores.map((actual) => actual.id === aviso.id ? { ...actual, leida: true } : actual))} className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#6E1C36] cursor-pointer"><Check className="w-3 h-3" />Marcar como leída</button>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </dialog>
    </>
  )
}
