import React from 'react'
import { Camera, CameraOff, RefreshCw, SwitchCamera, ScanFace, ShieldCheck, AlertTriangle } from 'lucide-react'
import { usePoseCamera } from '../../hooks/usePoseCamera'

export const VisionPage = () => {
  const { videoRef, canvasRef, status, error, metrics, facing, start, stop } = usePoseCamera()
  const busy = status === 'starting'
  const live = status === 'live'
  const active = live || busy
  const button = 'flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

  return (
    <div className="space-y-4 pb-3">
      <header>
        <span className="text-[10px] font-bold text-[#6E1C36] uppercase tracking-wider">Belle Vision · Cámara en vivo</span>
        <h2 className="text-lg font-bold text-[#241E1C]">Observa tu movimiento</h2>
        <p className="text-xs text-[#70645B] mt-1">Colócate de frente y encuadra hombros y caderas para ver las medidas en tiempo real.</p>
      </header>

      <div className="relative rounded-3xl overflow-hidden bg-[#241E1C] border border-[#3D322C] shadow-md min-h-64 flex flex-col justify-center">
        <div className={`relative w-full ${facing === 'user' ? '-scale-x-100' : ''}`}>
          <video ref={videoRef} autoPlay muted playsInline aria-label="Vista en vivo de la cámara" className="block w-full h-auto min-h-48" />
          <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none" />
        </div>
        {!active && <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-[#FAF7F2] gap-3">
          <div className="rounded-full bg-white/10 p-4"><ScanFace className="w-9 h-9 text-[#E6CBA8]" /></div>
          <p className="text-sm font-bold">Tu espacio de movimiento</p>
          <p className="text-xs text-[#D8CCC1] max-w-60">Activa la cámara para comenzar. Las líneas aparecerán cuando se detecte tu cuerpo.</p>
        </div>}
        {busy && <div className="absolute inset-0 bg-[#241E1C]/85 flex flex-col items-center justify-center gap-3 text-white p-6 text-center" role="status">
          <RefreshCw className="w-7 h-7 animate-spin text-[#E6CBA8]" />
          <p className="text-sm">Preparando cámara y detector…</p>
          <p className="text-xs text-[#D8CCC1]">Acepta el permiso del navegador. La primera carga puede tardar unos segundos.</p>
        </div>}
        {live && <div className="absolute top-3 left-3 rounded-full bg-black/65 px-3 py-1 text-[10px] text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />En vivo · {metrics ? 'Cuerpo detectado' : 'Buscando postura'}
        </div>}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => active ? stop() : start()} className={`${button} ${active ? 'bg-[#EFE9DF] text-[#6E1C36]' : 'bg-[#6E1C36] text-white'}`}>
          {active ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
          {busy ? 'Cancelar' : live ? 'Apagar cámara' : 'Activar cámara'}
        </button>
        <button type="button" disabled={!live} onClick={() => start(facing === 'user' ? 'environment' : 'user')} className={`${button} bg-white border border-[#EDE5DA] text-[#5C5047]`}>
          <SwitchCamera className="w-4 h-4" />Cambiar cámara
        </button>
      </div>

      {error && <div role="alert" className="flex gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
        <AlertTriangle className="w-4 h-4 shrink-0" /><p>{error}</p>
      </div>}

      {!window.isSecureContext && <div className="rounded-2xl border border-[#EDE5DA] bg-white p-4 space-y-2 text-xs">
        <p className="font-bold">Abre una dirección compatible con la cámara</p>
        <a className="block underline text-[#6E1C36]" href={`http://localhost:${window.location.port || '5173'}/vision`}>Estoy en la computadora: abrir localhost</a>
        <a className="block underline text-[#6E1C36]" href={`https://${window.location.hostname}:5174/vision`}>Abrir HTTPS en la red local</a>
        <p className="text-[#70645B]">En el celular se necesita confiar en el certificado local. Al cambiar de dirección, vuelve a iniciar sesión.</p>
      </div>}

      <section className="bg-white rounded-2xl border border-[#EDE5DA] p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-[#241E1C]">Medidas en vivo</h3>
          <span className="text-[10px] text-[#70645B]">{metrics ? 'Actualizando' : 'Sin lectura'}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[['Hombros', metrics?.shoulders], ['Caderas', metrics?.hips], ['Tronco', metrics?.trunk]].map(([label, value]) => <div key={label} className="rounded-xl bg-[#FAF7F2] p-2 text-center">
            <p className="text-[10px] text-[#70645B]">{label}</p>
            <p className="text-lg font-bold text-[#6E1C36]">{value == null ? '—' : `${value.toFixed(1)}°`}</p>
          </div>)}
        </div>
        <p className="text-[11px] text-[#70645B] leading-relaxed">{metrics
          ? `Visibilidad de los puntos del torso: ${(metrics.visibility * 100).toFixed(0)}%. Hombros y caderas se miden respecto a la horizontal; el tronco, respecto a la vertical de la imagen.`
          : live ? 'Aléjate un poco, mira de frente y asegúrate de que ambos hombros y caderas estén visibles y bien iluminados.' : 'Las medidas aparecerán al activar la cámara y detectar una postura visible.'}</p>
      </section>

      <section className="rounded-2xl bg-[#F2EBE2] p-4 text-xs text-[#5C5047] space-y-2">
        <h3 className="font-bold">Para una lectura más clara</h3>
        <p>Apoya el dispositivo recto y a la altura del torso. Evita contraluz y deja espacio alrededor del cuerpo. El movimiento y la inclinación de la cámara cambian los ángulos.</p>
        <p>Esta vista ofrece una referencia visual de movimiento; no realiza un diagnóstico médico ni califica tu postura.</p>
      </section>
      <p className="flex gap-2 text-[10px] text-[#70645B] leading-relaxed"><ShieldCheck className="w-4 h-4 shrink-0 text-[#2D7A58]" />El video se procesa en este dispositivo. No se graba ni se envía al servidor. La cámara se apaga al salir de esta pantalla o al ocultar la aplicación.</p>
    </div>
  )
}
