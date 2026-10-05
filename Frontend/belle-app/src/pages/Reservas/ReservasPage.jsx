import React, { useState, useEffect } from 'react'
import {
  CalendarDays,
  Plus,
  Search,
  Clock,
  User,
  Scissors,
  Check,
  X,
  AlertCircle
} from 'lucide-react'
import {
  getReservas,
  crearReserva,
  actualizarEstadoReserva,
  getClientesCRM
} from '../../services/apiServices'
import { PROFESIONALES, SERVICIOS } from '../../services/mockData'

import { useAuth } from '../../context/AuthContext'

export const ReservasPage = () => {
  const { usuario } = useAuth()
  const [reservas, setReservas] = useState([])
  const [clientes, setClientes] = useState([])
  const [filtroProfesional, setFiltroProfesional] = useState('todos')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [cargando, setCargando] = useState(true)

  // Selector de días de la semana
  const [diaSeleccionado, setDiaSeleccionado] = useState(1) // 1 = Martes 29
  const diasSemana = [
    { num: 28, dia: 'Lun', id: 0 },
    { num: 29, dia: 'Mar', id: 1, esHoy: true },
    { num: 30, dia: 'Mié', id: 2 },
    { num: 1, dia: 'Jue', id: 3 },
    { num: 2, dia: 'Vie', id: 4 },
    { num: 3, dia: 'Sáb', id: 5 }
  ]

  // Form State para nueva reserva
  const [nuevoClienteId, setNuevoClienteId] = useState('')
  const [nuevoServicioId, setNuevoServicioId] = useState(SERVICIOS[0]?.id || '')
  const [nuevoProfesionalId, setNuevoProfesionalId] = useState(PROFESIONALES[0]?.id || '')
  const [nuevaFecha, setNuevaFecha] = useState(new Date().toISOString().split('T')[0])
  const [nuevaHora, setNuevaHora] = useState('14:00')
  const [nuevasObservaciones, setNuevasObservaciones] = useState('')

  const cargarDatos = async () => {
    const [reservasData, clientesData] = await Promise.all([
      getReservas(),
      getClientesCRM()
    ])
    setReservas(reservasData)
    setClientes(clientesData)
    if (clientesData.length > 0) {
      setNuevoClienteId(clientesData[0].id)
    }
    setCargando(false)
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const handleCrearReserva = async (e) => {
    e.preventDefault()
    await crearReserva({
      clienteId: nuevoClienteId,
      servicioId: nuevoServicioId,
      profesionalId: nuevoProfesionalId,
      fecha: nuevaFecha,
      hora: nuevaHora,
      observaciones: nuevasObservaciones
    })
    setModalAbierto(false)
    cargarDatos()
  }

  const handleCambiarEstado = async (id, estado) => {
    await actualizarEstadoReserva(id, estado)
    cargarDatos()
  }

  const reservasFiltradas = reservas.filter((r) => {
    const coincideProfesional = filtroProfesional === 'todos' || r.profesionalId === filtroProfesional
    const coincideEstado = filtroEstado === 'todos' || r.estado === filtroEstado
    const coincideBusqueda =
      r.clienteNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.servicioNombre.toLowerCase().includes(busqueda.toLowerCase())

    return coincideProfesional && coincideEstado && coincideBusqueda
  })

  const slotsHorarios = [
    '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ]

  return (
    <div className="space-y-4">
      {/* Header móvil y Botón Agendar */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-[#6E1C36] uppercase tracking-wider">
            Módulo 5 · Citas
          </span>
          <h2 className="text-lg font-bold text-[#241E1C] tracking-tight">Agenda Diaria</h2>
        </div>

        <button
          onClick={() => setModalAbierto(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[#4E0E20] to-[#6E1C36] text-white font-semibold text-xs rounded-xl shadow-md shadow-[#4E0E20]/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#E6CBA8]" />
          Agendar
        </button>
      </div>

      {/* Selector Horizontal de Días (Tonos Crema & Vino) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {diasSemana.map((d) => (
          <button
            key={d.id}
            onClick={() => setDiaSeleccionado(d.id)}
            className={`flex flex-col items-center justify-center min-w-[50px] py-2.5 rounded-2xl transition-all cursor-pointer ${
              diaSeleccionado === d.id
                ? 'bg-[#6E1C36] text-white shadow-md shadow-[#6E1C36]/25'
                : 'bg-white text-[#574A42] border border-[#EDE5DA] hover:bg-[#F7F2EC]'
            }`}
          >
            <span className="text-[10px] font-medium uppercase opacity-80">{d.dia}</span>
            <span className="text-sm font-bold mt-0.5">{d.num}</span>
          </button>
        ))}
      </div>

      {/* Buscador y Filtro Rápido */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#96897E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por cliente o servicio..."
            className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-[#EDE5DA] rounded-xl focus:outline-none focus:border-[#6E1C36] text-[#241E1C] shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filtroProfesional}
            onChange={(e) => setFiltroProfesional(e.target.value)}
            className="flex-1 text-[11px] bg-white border border-[#EDE5DA] rounded-xl px-2.5 py-1.5 text-[#3D322C] focus:outline-none shadow-xs"
          >
            <option value="todos">Todos los profesionales</option>
            {PROFESIONALES.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="text-[11px] bg-white border border-[#EDE5DA] rounded-xl px-2.5 py-1.5 text-[#3D322C] focus:outline-none shadow-xs"
          >
            <option value="todos">Todos</option>
            <option value="CONFIRMADA">Confirmadas</option>
            <option value="ATENDIDA">Atendidas</option>
            <option value="PENDIENTE">Pendientes</option>
          </select>
        </div>
      </div>

      {/* Lista de Reservas (Tarjetas con fondo blanco y borde arena) */}
      <div className="space-y-2.5">
        {cargando ? (
          <div className="py-8 text-center text-[#96897E] text-xs">Cargando citas...</div>
        ) : reservasFiltradas.length === 0 ? (
          <div className="py-8 bg-white rounded-3xl border border-dashed border-[#D9CEBE] text-center p-4">
            <AlertCircle className="w-7 h-7 text-[#C9BEAE] mx-auto mb-1.5" />
            <p className="text-[#6B5E55] font-semibold text-xs">No hay reservas para este filtro</p>
          </div>
        ) : (
          reservasFiltradas.map((reserva) => (
            <div
              key={reserva.id}
              className="bg-white rounded-2xl p-3.5 border border-[#EDE5DA] shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-[11px] font-bold text-[#241E1C] bg-[#FAF7F2] px-2 py-0.5 rounded-lg border border-[#EDE5DA]">
                  <Clock className="w-3 h-3 text-[#7A6E65]" />
                  {reserva.hora} ({reserva.duracion} min)
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    reserva.estado === 'CONFIRMADA'
                      ? 'bg-[#EBF2F7] text-[#1E5C8A] border border-[#C8DFEE]'
                      : reserva.estado === 'ATENDIDA'
                      ? 'bg-[#EBF5F0] text-[#2D7A58] border border-[#CDE5D8]'
                      : 'bg-[#FDF4E7] text-[#A66E38] border border-[#F3DFC4]'
                  }`}
                >
                  {reserva.estado}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-xs text-[#241E1C]">{reserva.servicioNombre}</h4>
                <p className="text-[11px] text-[#6E1C36] font-semibold">S/. {reserva.precio.toFixed(2)}</p>
              </div>

              <div className="pt-2 border-t border-[#F2ECE3] flex items-center justify-between text-[11px] text-[#5C5047]">
                <div className="flex items-center gap-1.5 truncate">
                  <User className="w-3 h-3 text-[#96897E] shrink-0" />
                  <span className="font-semibold text-[#241E1C] truncate">{reserva.clienteNombre}</span>
                  {(reserva.clienteNombre?.toLowerCase().includes('huamani') || reserva.clienteNombre?.toLowerCase().includes('luis') || reserva.clienteId == 260 || reserva.clienteId == 8) && (
                    <span className="text-[9px] bg-[#6E1C36] text-[#FAF7F2] px-1.5 py-0.2 rounded-full font-bold shadow-2xs shrink-0">
                      TÚ
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[#8C7E74] shrink-0">
                  <Scissors className="w-3 h-3" />
                  <span>{reserva.profesionalNombre.split(' ')[0]}</span>
                </div>
              </div>

              {reserva.estado !== 'ATENDIDA' && reserva.estado !== 'CANCELADA' && (
                <div className="pt-1.5 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => handleCambiarEstado(reserva.id, 'CANCELADA')}
                    className="px-2 py-1 rounded-lg text-[10px] font-semibold text-[#8A2035] hover:bg-[#FDF0F2] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleCambiarEstado(reserva.id, 'ATENDIDA')}
                    className="px-3 py-1 rounded-lg bg-[#2D7A58] text-white font-semibold text-[10px] hover:bg-[#236347] shadow-xs flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Atendido
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal / Bottom Sheet: Agendar Nueva Reserva */}
      {modalAbierto && (
        <div className="absolute inset-0 bg-[#1F1917]/65 backdrop-blur-xs z-50 flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-[#FFFDFB] rounded-t-3xl p-5 max-h-[88%] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300 space-y-3.5 border-t border-[#EDE5DA]">
            <div className="flex items-center justify-between border-b border-[#EDE5DA] pb-2.5">
              <div>
                <h3 className="font-bold text-sm text-[#241E1C]">Agendar Nueva Cita</h3>
                <p className="text-[10px] text-[#7A6E65]">Validado en Gateway .NET 10</p>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="w-7 h-7 rounded-full bg-[#EFE9DF] flex items-center justify-center text-[#5C5047]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCrearReserva} className="space-y-3">
              {/* Cliente */}
              <div>
                <label className="block text-[11px] font-semibold text-[#3D322C] mb-1">Cliente</label>
                <select
                  value={nuevoClienteId}
                  onChange={(e) => setNuevoClienteId(e.target.value)}
                  className="w-full text-xs bg-[#FAF7F2] border border-[#EDE5DA] rounded-xl px-2.5 py-2 text-[#241E1C]"
                >
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} {String(c.id) === String(usuario?.id) ? '⭐ (TÚ)' : `(BES: ${c.bes})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Servicio */}
              <div>
                <label className="block text-[11px] font-semibold text-[#3D322C] mb-1">Servicio</label>
                <select
                  value={nuevoServicioId}
                  onChange={(e) => setNuevoServicioId(e.target.value)}
                  className="w-full text-xs bg-[#FAF7F2] border border-[#EDE5DA] rounded-xl px-2.5 py-2 text-[#241E1C]"
                >
                  {SERVICIOS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} · S/. {s.precio} ({s.duracion} min)
                    </option>
                  ))}
                </select>
              </div>

              {/* Profesional */}
              <div>
                <label className="block text-[11px] font-semibold text-[#3D322C] mb-1">Especialista</label>
                <select
                  value={nuevoProfesionalId}
                  onChange={(e) => setNuevoProfesionalId(e.target.value)}
                  className="w-full text-xs bg-[#FAF7F2] border border-[#EDE5DA] rounded-xl px-2.5 py-2 text-[#241E1C]"
                >
                  {PROFESIONALES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({p.especialidad})
                    </option>
                  ))}
                </select>
              </div>

              {/* Horario */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#3D322C] mb-1">Fecha</label>
                  <input
                    type="date"
                    value={nuevaFecha}
                    onChange={(e) => setNuevaFecha(e.target.value)}
                    className="w-full text-xs bg-[#FAF7F2] border border-[#EDE5DA] rounded-xl px-2.5 py-1.5 text-[#241E1C]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#3D322C] mb-1">Hora</label>
                  <select
                    value={nuevaHora}
                    onChange={(e) => setNuevaHora(e.target.value)}
                    className="w-full text-xs bg-[#FAF7F2] border border-[#EDE5DA] rounded-xl px-2.5 py-1.5 text-[#241E1C]"
                  >
                    {slotsHorarios.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-[#5C5047] bg-[#EFE9DF]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#6E1C36] text-white shadow-md shadow-[#6E1C36]/25"
                >
                  Confirmar Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
