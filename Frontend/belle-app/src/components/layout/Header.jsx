import React from 'react'
import { Bell, Sparkles, Server, Cpu } from 'lucide-react'

export const Header = () => {
  const hoyFormatted = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  // Capitalizar primera letra de la fecha
  const fechaCapitalizada = hoyFormatted.charAt(0).toUpperCase() + hoyFormatted.slice(1)

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10 shadow-xs">
      {/* Date & Location */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">{fechaCapitalizada}</h2>
          <p className="text-xs text-slate-400">Panel de Control & Gestión Operativa</p>
        </div>
      </div>

      {/* System Status Indicators (Shows .NET Gateway & OpenAI Integration) */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium">
          <Server className="w-3.5 h-3.5 text-indigo-500" />
          <span>Gateway: <strong className="text-slate-800">.NET 10</strong></span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50/80 border border-rose-100 text-xs text-rose-700 font-medium">
          <Cpu className="w-3.5 h-3.5 text-rose-500" />
          <span>Asistente: <strong>Function Calling</strong></span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
            <Bell className="w-4 h-4" />
          </button>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
        </div>
      </div>
    </header>
  )
}
