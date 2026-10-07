import { useEffect, useState } from 'react'
import { activarPush, consultarPush, desactivarPush, limitacionPush, probarPush } from '../../services/notificacionesPush'

export function ActivacionNotificaciones({ usuario }) {
  const [activo, setActivo] = useState(false)
  const [ocupado, setOcupado] = useState(true)
  const [mensaje, setMensaje] = useState('')
  const limitacion = limitacionPush()

  useEffect(() => {
    let vigente = true
    consultarPush(usuario)
      .then((valor) => { if (vigente) setActivo(valor) })
      .catch((error) => { if (vigente) setMensaje(error.message) })
      .finally(() => { if (vigente) setOcupado(false) })
    return () => { vigente = false }
  }, [usuario])

  const ejecutar = async (accion) => {
    setOcupado(true)
    setMensaje('')
    try { await accion() }
    catch (error) { setMensaje(error.message || 'No se pudo completar la operación. Inténtalo nuevamente.') }
    finally { setOcupado(false) }
  }

  return (
    <section className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E3D9CC] space-y-2" aria-label="Notificaciones del celular">
      <h3 className="text-sm font-bold">Notificaciones en tu celular</h3>
      <p className="text-xs text-[#63554C]">{activo ? 'Activadas para esta cuenta y dispositivo.' : 'Recibe avisos aunque Belle no esté abierta.'}</p>
      {limitacion && <p className="text-xs text-[#7A6E65]">{limitacion}</p>}
      {!usuario.token && <p className="text-xs text-[#7A6E65]">Inicia sesión con una cuenta real. El acceso rápido de demostración no permite enviar push.</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={ocupado || !!limitacion || !usuario.token} onClick={() => ejecutar(async () => {
          if (activo) { await desactivarPush(usuario); setActivo(false); setMensaje('Notificaciones desactivadas en este dispositivo.') }
          else { await activarPush(usuario); setActivo(true); setMensaje('Permiso y registro completados. Ya puedes enviar una prueba.') }
        })} className="px-3 py-2 rounded-xl bg-[#6E1C36] text-white text-xs font-semibold disabled:opacity-50 cursor-pointer">{ocupado ? 'Procesando…' : activo ? 'Desactivar en este dispositivo' : 'Activar notificaciones'}</button>
        {activo && <button type="button" disabled={ocupado || !!limitacion} onClick={() => ejecutar(async () => {
          const resultado = await probarPush(usuario)
          setMensaje(resultado.mensaje)
        })} className="px-3 py-2 rounded-xl bg-[#EFE9DF] text-xs font-semibold disabled:opacity-50 cursor-pointer">Probar en 15 segundos</button>}
      </div>
      <p role="status" className="text-xs text-[#63554C]">{mensaje}</p>
    </section>
  )
}
