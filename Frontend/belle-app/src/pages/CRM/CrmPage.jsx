import React, { useState, useEffect } from 'react'
import {
  Users,
  Search,
  AlertTriangle,
  MessageCircle,
  X,
  Send,
  CheckCircle2
} from 'lucide-react'
import { getClientesCRM, enviarCampanaRetencion } from '../../services/apiServices'

export const CrmPage = () => {
  const [clientes, setClientes] = useState([])
  const [segmentoSeleccionado, setSegmentoSeleccionado] = useState('TODOS')
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)

  // Modal Campaña de Retención
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [descuento, setDescuento] = useState('20%')
  const [mensajePersonalizado, setMensajePersonalizado] = useState('')
  const [enviandoCampana, setEnviandoCampana] = useState(false)
  const [exitoEnvio, setExitoEnvio] = useState(false)

  const cargarClientes = async () => {
    const data = await getClientesCRM()
    setClientes(data)
    setCargando(false)
  }

  useEffect(() => {
    cargarClientes()
  }, [])

  const handleAbrirModalRetencion = (cliente) => {
    setClienteSeleccionado(cliente)
    setDescuento('20%')
    setMensajePersonalizado(
      `Hola ${cliente.nombre.split(' ')[0]} ✨ En Belle Studio te extrañamos. Notamos que hace ${cliente.ultimaVisitaDias} días no nos visitas. Tenemos un 20% de descuento especial en ${cliente.ultimoServicio || 'nuestros tratamientos'} válido para ti esta semana. ¿Te gustaría consultar horarios?`
    )
    setExitoEnvio(false)
  }

  const handleEnviarCampana = async (e) => {
    e.preventDefault()
    setEnviandoCampana(true)
    await enviarCampanaRetencion(clienteSeleccionado.id, 'WhatsApp', descuento)
    setEnviandoCampana(false)
    setExitoEnvio(true)
    setTimeout(() => {
      setClienteSeleccionado(null)
      cargarClientes()
    }, 1500)
  }

  const clientesFiltrados = clientes.filter((c) => {
    const coincideSegmento =
      segmentoSeleccionado === 'TODOS' || c.clasificacion === segmentoSeleccionado
    const coincideBusqueda =
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.telefono.includes(busqueda)
    return coincideSegmento && coincideBusqueda
  })

  const getBesColor = (bes) => {
    if (bes >= 80) return { bar: 'bg-[#2D7A58]', text: 'text-[#2D7A58]', badge: 'bg-[#EBF5F0] text-[#2D7A58] border-[#CDE5D8]' }
    if (bes >= 60) return { bar: 'bg-[#1E5C8A]', text: 'text-[#1E5C8A]', badge: 'bg-[#EBF2F7] text-[#1E5C8A] border-[#C8DFEE]' }
    if (bes >= 40) return { bar: 'bg-[#A66E38]', text: 'text-[#A66E38]', badge: 'bg-[#FDF4E7] text-[#A66E38] border-[#F3DFC4]' }
    if (bes >= 20) return { bar: 'bg-[#8A2035]', text: 'text-[#8A2035]', badge: 'bg-[#FDF0F2] text-[#8A2035] border-[#F5CDD3]' }
    return { bar: 'bg-[#7A6E65]', text: 'text-[#7A6E65]', badge: 'bg-[#FAF7F2] text-[#7A6E65] border-[#EDE5DA]' }
  }

  const segmentos = [
    { key: 'TODOS', label: 'Todos' },
    { key: 'EN RIESGO', label: 'En Riesgo ⚠️' },
    { key: 'COMPROMETIDO', label: 'Comprometidos' },
    { key: 'ACTIVO', label: 'Activos' },
    { key: 'OCASIONAL', label: 'Ocasionales' }
  ]

  return (
    <div className="space-y-4">
      {/* Header Móvil */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-bold text-[#6E1C36] uppercase tracking-wider">
            Módulo 7 · CRM Predictivo
          </span>
          <h2 className="text-lg font-bold text-[#241E1C] tracking-tight">
            Belle Engagement Score (BES)
          </h2>
          <p className="text-[11px] text-[#70645B]">
            Detección preventiva de riesgo de abandono y reactivación.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EBF5F0] border border-[#CDE5D8] text-[9px] font-bold text-[#2D7A58] shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2D7A58] animate-pulse"></span>
          Azure SQL
        </span>
      </div>

      {/* Segmentos Móviles en Carrusel Horizontal */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {segmentos.map((s) => (
          <button
            key={s.key}
            onClick={() => setSegmentoSeleccionado(s.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              segmentoSeleccionado === s.key
                ? 'bg-[#581427] text-[#FAF7F2] shadow-xs'
                : 'bg-white text-[#5C5047] border border-[#EDE5DA] hover:bg-[#F7F2EC]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-[#96897E] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar cliente por nombre..."
          className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-[#EDE5DA] rounded-xl focus:outline-none focus:border-[#6E1C36] text-[#241E1C] shadow-xs"
        />
      </div>

      {/* Lista de Tarjetas de Cliente */}
      <div className="space-y-3">
        {cargando ? (
          <div className="py-8 text-center text-[#96897E] text-xs">Calculando BES...</div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="py-8 bg-white rounded-3xl border border-dashed border-[#D9CEBE] text-center p-4">
            <Users className="w-7 h-7 text-[#C9BEAE] mx-auto mb-1.5" />
            <p className="text-[#6B5E55] font-semibold text-xs">No hay clientes en este segmento</p>
          </div>
        ) : (
          clientesFiltrados.map((cliente) => {
            const estilo = getBesColor(cliente.bes)
            const esRiesgo = cliente.clasificacion === 'EN RIESGO'
            return (
              <div
                key={cliente.id}
                className={`bg-white rounded-2xl p-4 border border-[#EDE5DA] shadow-xs space-y-3 ${
                  esRiesgo ? 'ring-1 ring-[#F0DCD0] bg-[#FAF3EE]/40' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={cliente.avatar}
                      alt={cliente.nombre}
                      className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-[#EDE5DA]"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-[#241E1C] truncate">{cliente.nombre}</h4>
                        {(cliente.id == 260 || cliente.nombre?.toLowerCase().includes('huamani') || cliente.nombre?.toLowerCase().includes('luis')) && (
                          <span className="text-[9px] bg-[#6E1C36] text-[#FAF7F2] px-1.5 py-0.2 rounded-full font-bold shadow-2xs shrink-0">
                            TÚ (Owner)
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#8C7E74]">{cliente.telefono}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border shrink-0 ${estilo.badge}`}>
                    {cliente.clasificacion}
                  </span>
                </div>

                {/* Barra de Score BES */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#70645B] font-medium">Belle Engagement Score:</span>
                    <span className={`font-bold ${estilo.text}`}>{cliente.bes} / 100</span>
                  </div>
                  <div className="w-full bg-[#EFE9DF] rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${estilo.bar}`}
                      style={{ width: `${cliente.bes}%` }}
                    ></div>
                  </div>
                </div>

                {/* Info rápida y Botón de Acción */}
                <div className="pt-2 border-t border-[#F2ECE3] flex items-center justify-between">
                  <div className="text-[10px] text-[#70645B]">
                    Última visita: <strong className={esRiesgo ? 'text-[#8A2035]' : 'text-[#3D322C]'}>hace {cliente.ultimaVisitaDias} días</strong>
                  </div>

                  <button
                    onClick={() => handleAbrirModalRetencion(cliente)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-[10px] shadow-xs cursor-pointer transition-all ${
                      esRiesgo
                        ? 'bg-[#6E1C36] hover:bg-[#501225] text-white shadow-[#6E1C36]/20'
                        : 'bg-[#EFE9DF] hover:bg-[#EAE2D5] text-[#3D322C]'
                    }`}
                  >
                    <MessageCircle className="w-3 h-3 text-[#E6CBA8]" />
                    {esRiesgo ? 'Recuperar' : 'Contactar'}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Bottom Sheet: Modal de Campaña WhatsApp */}
      {clienteSeleccionado && (
        <div className="absolute inset-0 bg-[#1F1917]/65 backdrop-blur-xs z-50 flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-[#FFFDFB] rounded-t-3xl p-5 max-h-[88%] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300 space-y-3.5 border-t border-[#EDE5DA]">
            <div className="flex items-center justify-between border-b border-[#EDE5DA] pb-2.5">
              <div>
                <h3 className="font-bold text-sm text-[#241E1C]">Retención WhatsApp</h3>
                <p className="text-[10px] text-[#2D7A58] font-semibold">Asistente Belle AI en automático</p>
              </div>
              <button
                onClick={() => setClienteSeleccionado(null)}
                className="w-7 h-7 rounded-full bg-[#EFE9DF] flex items-center justify-center text-[#5C5047]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {exitoEnvio ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-[#2D7A58] mx-auto" />
                <h4 className="font-bold text-sm text-[#241E1C]">¡Campaña Enviada!</h4>
                <p className="text-xs text-[#70645B]">
                  Mensaje remitido al WhatsApp de {clienteSeleccionado.nombre}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEnviarCampana} className="space-y-3">
                <div className="flex items-center gap-2.5 bg-[#FAF7F2] p-2.5 rounded-2xl border border-[#EDE5DA]">
                  <img
                    src={clienteSeleccionado.avatar}
                    alt={clienteSeleccionado.nombre}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#241E1C]">{clienteSeleccionado.nombre}</p>
                    <p className="text-[10px] text-[#70645B]">Score BES: <strong>{clienteSeleccionado.bes}/100</strong></p>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#3D322C] mb-1">Incentivo</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['15%', '20%', '25%'].map((desc) => (
                      <button
                        type="button"
                        key={desc}
                        onClick={() => setDescuento(desc)}
                        className={`py-1.5 text-xs font-bold rounded-xl border ${
                          descuento === desc
                            ? 'bg-[#EBF5F0] border-[#2D7A58] text-[#2D7A58]'
                            : 'bg-white border-[#EDE5DA] text-[#5C5047]'
                        }`}
                      >
                        {desc}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#3D322C] mb-1">Mensaje de WhatsApp</label>
                  <textarea
                    value={mensajePersonalizado}
                    onChange={(e) => setMensajePersonalizado(e.target.value)}
                    rows={3}
                    className="w-full text-xs bg-[#FAF7F2] border border-[#EDE5DA] rounded-xl p-2.5 text-[#241E1C]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setClienteSeleccionado(null)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-[#5C5047] bg-[#EFE9DF]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={enviandoCampana}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2D7A58] text-white shadow-md shadow-[#2D7A58]/20 inline-flex items-center gap-1.5"
                  >
                    <Send className="w-3 h-3 text-[#E6CBA8]" />
                    {enviandoCampana ? 'Enviando...' : 'Enviar WhatsApp'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
