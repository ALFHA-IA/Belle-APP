import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  MessageSquare,
  ScanFace,
  Sparkles,
  Scissors
} from 'lucide-react'

export const Sidebar = () => {
  const menuItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: 'Módulo 10'
    },
    {
      to: '/reservas',
      label: 'Reservas & Agenda',
      icon: CalendarDays,
      badge: 'Módulo 5'
    },
    {
      to: '/crm',
      label: 'CRM Predictivo (BES)',
      icon: Users,
      badge: 'Módulo 7'
    },
    {
      to: '/whatsapp',
      label: 'WhatsApp & Bot',
      icon: MessageSquare,
      badge: 'Módulo 8'
    },
    {
      to: '/vision',
      label: 'Belle Vision',
      icon: ScanFace,
      badge: 'Módulo 9'
    }
  ]

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 shadow-sm z-20">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-rose-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-800 tracking-tight flex items-center gap-1.5">
              Belle AI
              <span className="text-[10px] font-semibold tracking-wider bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-full border border-rose-100 uppercase">
                v2.0
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Beauty & Wellness Suite</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          <p className="px-3 pt-3 pb-1 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
            Módulos del Sistema
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-rose-50/80 text-rose-600 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-rose-600'
                            : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                        isActive
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Footer Info / Reception Profile */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-semibold flex items-center justify-center text-xs shadow-sm">
            RP
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">Recepción Principal</p>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              En Línea · Salón Central
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
