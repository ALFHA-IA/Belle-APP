import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  DollarSign,
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
  Plus,
  ScanFace,
  MessageSquare,
  Sparkles,
  ChevronRight
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { getDashboardStats, getReservas, actualizarEstadoReserva } from '../../services/apiServices'

import { useAuth } from '../../context/AuthContext'

export const DashboardPage = () => {
  const { usuario } = useAuth()
  const [stats, setStats] = useState(null)
  const [reservasHoy, setReservasHoy] = useState([])
  const [loading, setLoading] = useState(true)

  const cargarDatos = async () => {
    try {
      const [statsData, reservasData] = await Promise.all([
        getDashboardStats(),
        getReservas()
      ])
      setStats(statsData)
      setReservasHoy(reservasData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const handleMarcarAtendida = async (id) => {
    await actualizarEstadoReserva(id, 'ATENDIDA')
    cargarDatos()
  }

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2 text-[#96897E] text-xs">
        <span className="w-6 h-6 border-2 border-[#6E1C36] border-t-transparent rounded-full animate-spin"></span>
        Cargando Belle Studio...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Saludo y Tarjeta Principal con Estética Studio (Vino & Oro Cálido) */}
      <div className="bg-gradient-to-br from-[#450C1B] via-[#651A31] to-[#802540] rounded-3xl p-5 text-[#FAF7F2] shadow-xl shadow-[#450C1B]/20 relative overflow-hidden">
        {/* Arco sutil de fondo que evoca el estudio */}
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full border border-white/10 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-semibold text-[#EEDBC5]">
              <Sparkles className="w-3 h-3 text-[#E6CBA8]" />
              <span>Módulo 10 · Dashboard Studio</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#2D7A58]/40 border border-[#2D7A58]/50 text-[9px] font-bold text-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Azure SQL
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#FAF7F2]">
            ¡Hola, {usuario?.nombre || 'Usuario'}! ✨
          </h2>
          <p className="text-xs text-[#EAD8CB] mt-0.5">
            {usuario?.cargo || usuario?.rol || 'Usuario'} · Hoy tienes <strong>{stats.citasHoy.total} citas</strong> en Azure SQL.
          </p>

          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#D8C4B5]">Ingresos del Mes</p>
              <p className="text-lg font-bold text-white">S/. {stats.ingresosMes.total.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#FAF7F2]/20 px-2 py-0.5 rounded-full text-[#EEDBC5]">
                <TrendingUp className="w-3 h-3 text-[#E6CBA8]" />
                {stats.ingresosMes.comparativaPorcentaje}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Atajos Rápidos Móviles (Estilo Crema y Arena) */}
      <div className="flex items-center justify-between gap-2 px-1">
        <Link
          to="/reservas"
          className="flex-1 flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-[#EDE5DA] shadow-xs hover:border-[#D6C7B7] transition-all text-center"
        >
          <div className="w-9 h-9 rounded-xl bg-[#F6EFE9] text-[#6E1C36] flex items-center justify-center mb-1">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-[#241E1C]">Nueva Cita</span>
        </Link>

        <Link
          to="/vision"
          className="flex-1 flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-[#EDE5DA] shadow-xs hover:border-[#D6C7B7] transition-all text-center"
        >
          <div className="w-9 h-9 rounded-xl bg-[#EFE9DF] text-[#734A38] flex items-center justify-center mb-1">
            <ScanFace className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-[#241E1C]">Escanear</span>
        </Link>

        <Link
          to="/crm"
          className="flex-1 flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-[#EDE5DA] shadow-xs hover:border-[#D6C7B7] transition-all text-center"
        >
          <div className="w-9 h-9 rounded-xl bg-[#FAF0E4] text-[#A66E38] flex items-center justify-center mb-1">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-[#241E1C]">Score BES</span>
        </Link>

        <Link
          to="/whatsapp"
          className="flex-1 flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-[#EDE5DA] shadow-xs hover:border-[#D6C7B7] transition-all text-center"
        >
          <div className="w-9 h-9 rounded-xl bg-[#EDF6F1] text-[#2D7A58] flex items-center justify-center mb-1">
            <MessageSquare className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-[#241E1C]">WhatsApp</span>
        </Link>
      </div>

      {/* Alerta de Retención CRM */}
      <Link
        to="/crm"
        className="flex items-center justify-between p-3.5 bg-[#FAF0E8] border border-[#ECD9CC] rounded-2xl text-[#6E1C36] shadow-xs hover:bg-[#F5E8DD] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#F0DCD0] flex items-center justify-center text-[#6E1C36] shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold">{stats.clientesEnRiesgo.total} clientes en riesgo de abandono</p>
            <p className="text-[10px] text-[#8C4638]">BES &lt; 40 · Envía campaña de recuperación</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-[#8C4638] shrink-0" />
      </Link>

      {/* Citas de Hoy (Feed Móvil) */}
      <div className="bg-white rounded-3xl p-4 border border-[#EDE5DA] shadow-xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold text-[#241E1C] uppercase tracking-wider">
            Citas de Hoy ({reservasHoy.length})
          </h3>
          <Link to="/reservas" className="text-[11px] font-semibold text-[#6E1C36] hover:text-[#450C1B]">
            Ver todas →
          </Link>
        </div>

        <div className="space-y-2.5">
          {reservasHoy.map((reserva) => (
            <div
              key={reserva.id}
              className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EFE8DD] flex items-center justify-between gap-3 hover:bg-[#F5EFEB] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E5DACD] flex flex-col items-center justify-center shrink-0">
                  <Clock className="w-3 h-3 text-[#96897E]" />
                  <span className="text-[10px] font-bold text-[#241E1C] mt-0.5">{reserva.hora}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#241E1C] truncate">{reserva.clienteNombre}</p>
                  <p className="text-[11px] text-[#70645B] truncate">{reserva.servicioNombre}</p>
                  <p className="text-[10px] text-[#9E9085] truncate">con {reserva.profesionalNombre}</p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                {reserva.estado === 'CONFIRMADA' ? (
                  <button
                    onClick={() => handleMarcarAtendida(reserva.id)}
                    className="px-2.5 py-1 rounded-lg bg-[#2D7A58] text-white font-semibold text-[10px] hover:bg-[#236347] transition-colors cursor-pointer shadow-xs"
                  >
                    Atender
                  </button>
                ) : (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      reserva.estado === 'ATENDIDA'
                        ? 'bg-[#EBF5F0] text-[#2D7A58] border border-[#CDE5D8]'
                        : 'bg-[#FDF4E7] text-[#A66E38] border border-[#F3DFC4]'
                    }`}
                  >
                    {reserva.estado}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico de Evolución Semanal */}
      <div className="bg-white rounded-3xl p-4 border border-[#EDE5DA] shadow-xs">
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-bold text-[#241E1C] uppercase tracking-wider">
            Reservas Semanales
          </h3>
          <span className="text-[10px] text-[#96897E] font-medium">Último mes</span>
        </div>

        <div className="h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.reservasSemanales} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReservasStudio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6E1C36" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6E1C36" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="semana" tick={{ fontSize: 10, fill: '#7A6E65' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#2C221E', borderRadius: '8px', border: 'none', color: '#FAF7F2', fontSize: '11px' }}
              />
              <Area type="monotone" dataKey="realizadas" stroke="#6E1C36" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReservasStudio)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
