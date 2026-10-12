import React, { useState } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  CalendarDays,
  Sparkles,
  Users,
  ScanFace,
  MessageSquare,
  ChevronLeft,
  ShieldCheck,
  UserCheck,
  LogOut,
  X,
  CreditCard,
  Lock
} from 'lucide-react'
import { BelleChatWidget } from '../chat/BelleChatWidget'
import { dashboardPorRol, useAuth } from '../../context/AuthContext'
import { LoginPage } from '../../pages/Auth/LoginPage'
import { Notificaciones } from '../notificaciones/Notificaciones'

export const AppLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { usuario, esAdmin, esCliente, esInstructor, loginRapido, logout } = useAuth()
  const [chatAbierto, setChatAbierto] = useState(false)
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false)
  const nombreRol = esAdmin ? 'Administrador' : esInstructor ? 'Instructor(a)' : 'Cliente'

  // Si no hay sesión iniciada, mostrar la pantalla de Login
  if (!usuario) {
    return (
      <div className="min-h-screen bg-[#1F1917] flex justify-center items-center sm:p-4">
        <div className="w-full sm:max-w-md h-screen sm:h-[844px] bg-[#FAF7F2] text-[#241E1C] flex flex-col relative overflow-hidden sm:rounded-[40px] shadow-2xl sm:border-[8px] sm:border-[#2C2420]">
          <LoginPage onLoginExitoso={(user) => navigate(dashboardPorRol(user.rol))} />
        </div>
      </div>
    )
  }

  const getTituloRuta = () => {
    switch (location.pathname) {
      case '/admin':
        return 'Studio Dashboard'
      case '/instructor':
        return 'Panel de Instructor(a)'
      case '/cliente':
        return 'Mi Portal Alumna'
      case '/reservas':
        return esAdmin ? 'Agenda & Citas' : 'Mis Clases & Agenda'
      case '/crm':
        return esAdmin ? 'CRM Predictivo (BES)' : 'Mi Plan & Estado'
      case '/whatsapp':
        return 'WhatsApp Bot'
      case '/vision':
        return 'Belle Vision'
      default:
        return 'Belle AI'
    }
  }

  const esRutaSecundaria = !['/admin', '/instructor', '/cliente'].includes(location.pathname)

  return (
    <div className="min-h-screen bg-[#1F1917] flex justify-center items-center sm:p-4">
      {/* Contenedor Móvil con estética Belle Studio (Fondo Crema & Arena Cálido) */}
      <div className="w-full sm:max-w-md h-screen sm:h-[844px] bg-[#FAF7F2] text-[#241E1C] flex flex-col relative overflow-hidden sm:rounded-[40px] shadow-2xl sm:border-[8px] sm:border-[#2C2420]">
        
        {/* Barra superior (Top App Bar) en tono Crema Traslúcido */}
        <header className="h-16 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EDE5DA] px-4 flex items-center justify-between sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-2.5">
            {esRutaSecundaria ? (
              <button
                onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-full bg-[#EFE9DF] flex items-center justify-center text-[#241E1C] active:scale-95 transition-transform cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#581427] via-[#6E1C36] to-[#8A2B46] flex items-center justify-center text-white shadow-md shadow-[#581427]/25">
                <Sparkles className="w-4 h-4 text-[#E6CBA8]" />
              </div>
            )}
            <div>
              <h1 className="text-sm font-bold text-[#241E1C] tracking-tight flex items-center gap-1.5">
                {getTituloRuta()}
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                  esAdmin ? 'bg-[#F4ECE3] text-[#6E1C36] border border-[#E3D4C4]' : 'bg-[#EBF5F0] text-[#2D7A58] border border-[#CDE5D8]'
                }`}>
                  {esAdmin ? '👑 Admin' : esInstructor ? '🧘‍♀️ Instructor(a)' : '👤 Cliente'}
                </span>
              </h1>
              <p className="text-[10px] text-[#8C7E74] font-medium">
                {esAdmin ? 'Studio & Management Suite' : esInstructor ? 'Belle Barre Instructor Suite' : 'Belle Barre Member Suite'}
              </p>
            </div>
          </div>

          {/* Accesos rápidos superiores */}
          <div className="flex items-center gap-2">
            <Notificaciones />
            {esAdmin && (
              <NavLink
                to="/whatsapp"
                title="Bandeja WhatsApp Bot"
                className={({ isActive }) =>
                  `w-9 h-9 rounded-full flex items-center justify-center transition-colors relative ${
                    isActive ? 'bg-[#EAE0D2] text-[#581427]' : 'bg-[#EFE9DF] text-[#63554C] hover:bg-[#EAE2D5]'
                  }`
                }
              >
                <MessageSquare className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2D7A58] rounded-full"></span>
              </NavLink>
            )}

            {/* Perfil & Switcher de Roles (Clickeable) */}
            <button
              onClick={() => setMenuUsuarioAbierto(true)}
              title="Cambiar de Rol o Ver Perfil"
              className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full bg-[#EFE9DF] border border-[#E3D9CC] shadow-2xs hover:bg-[#EAE2D5] transition-all cursor-pointer"
            >
              <span className="text-[10px] font-bold text-[#3D322C] max-w-[70px] truncate">
                {usuario.nombre.split(' ')[0]}
              </span>
              <div className={`w-6 h-6 rounded-full text-white font-bold text-[9px] flex items-center justify-center ring-1 ring-white shadow-xs ${
                esAdmin ? 'bg-[#6E1C36]' : 'bg-[#2D7A58]'
              }`}>
                {usuario.iniciales || 'U'}
              </div>
            </button>
          </div>
        </header>

        {/* Área scrolleable de la pantalla móvil */}
        <main className="flex-1 overflow-y-auto pb-24 p-4">
          <Outlet />
        </main>

        {/* Barra de Navegación Inferior Móvil (Bottom Navigation Bar) */}
        <nav className="absolute bottom-0 left-0 right-0 h-18 bg-[#FFFDFB]/95 backdrop-blur-md border-t border-[#EDE5DA] px-2 flex items-center justify-around z-40">
          {/* 1. Inicio */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
                isActive ? 'text-[#6E1C36] font-bold' : 'text-[#96897E] hover:text-[#581427]'
              }`
            }
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Inicio</span>
          </NavLink>

          {/* 2. Agenda */}
          <NavLink
            to="/reservas"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
                isActive ? 'text-[#6E1C36] font-bold' : 'text-[#96897E] hover:text-[#581427]'
              }`
            }
          >
            <CalendarDays className="w-5 h-5" />
            <span className="text-[10px]">{esAdmin ? 'Agenda' : 'Mis Citas'}</span>
          </NavLink>

          {/* 3. BOTÓN CENTRAL: Belle AI (Asistente Flotante) */}
          <button
            onClick={() => setChatAbierto(true)}
            className="flex flex-col items-center -mt-6 group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#4E0E20] via-[#6E1C36] to-[#922D4B] flex items-center justify-center text-white shadow-lg shadow-[#581427]/30 ring-4 ring-[#FAF7F2] group-active:scale-95 transition-all">
              <Sparkles className="w-6 h-6 text-[#E6CBA8] animate-pulse" />
            </div>
            <span className="text-[10px] font-bold text-[#6E1C36] mt-1">Belle AI</span>
          </button>

          {/* 4. CRM (Admin) / Mi Plan (Cliente) */}
          <NavLink
            to="/crm"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
                isActive ? 'text-[#6E1C36] font-bold' : 'text-[#96897E] hover:text-[#581427]'
              }`
            }
          >
            {esAdmin ? <Users className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
            <span className="text-[10px]">{esAdmin ? 'CRM' : 'Mi Plan'}</span>
          </NavLink>

          {/* 5. Belle Vision */}
          <NavLink
            to="/vision"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
                isActive ? 'text-[#6E1C36] font-bold' : 'text-[#96897E] hover:text-[#581427]'
              }`
            }
          >
            <ScanFace className="w-5 h-5" />
            <span className="text-[10px]">Visión</span>
          </NavLink>
        </nav>

        {/* Modal / Sheet del Asistente Belle AI */}
        <BelleChatWidget key={usuario.id + ':' + usuario.correo} abiertoExterno={chatAbierto} alCerrar={() => setChatAbierto(false)} />

        {/* Modal / Bottom Sheet: Selector de Rol y Perfil */}
        {menuUsuarioAbierto && (
          <div className="absolute inset-0 bg-[#1F1917]/70 backdrop-blur-xs z-50 flex flex-col justify-end animate-in fade-in duration-200">
            <div className="bg-[#FFFDFB] rounded-t-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-300 space-y-4 border-t border-[#EDE5DA]">
              <div className="flex items-center justify-between border-b border-[#EDE5DA] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-full text-white font-bold text-xs flex items-center justify-center ${
                    esAdmin ? 'bg-[#6E1C36]' : 'bg-[#2D7A58]'
                  }`}>
                    {usuario.iniciales}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#241E1C]">{usuario.nombre}</h3>
                    <p className="text-[10px] text-[#7A6E65]">{usuario.correo}</p>
                  </div>
                </div>
                <button
                  onClick={() => setMenuUsuarioAbierto(false)}
                  className="w-7 h-7 rounded-full bg-[#EFE9DF] flex items-center justify-center text-[#5C5047]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Estado actual */}
              <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EBE3D8] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#7A6E65] block">Rol Activo:</span>
                  <span className="text-xs font-bold text-[#241E1C]">
                    {nombreRol}
                  </span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  esAdmin ? 'bg-[#F4ECE3] text-[#6E1C36]' : 'bg-[#EBF5F0] text-[#2D7A58]'
                }`}>
                  {esAdmin ? 'Acceso Total' : 'Restringido'}
                </span>
              </div>

              {/* Botones de cambio rápido de Rol */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-[#8C7E74] uppercase tracking-wider px-1">
                  Cambiar Rol al instante
                </p>

                <button
                  onClick={() => {
                    loginRapido('admin')
                    setMenuUsuarioAbierto(false)
                    navigate('/')
                  }}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    esAdmin
                      ? 'bg-[#F9F4EE] border-[#6E1C36] text-[#6E1C36] font-bold'
                      : 'bg-white border-[#E0D5C7] text-[#3D322C] hover:border-[#6E1C36]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#6E1C36]" />
                    <div className="text-left">
                      <p className="text-xs">Luis Joaquin Huamani Hernandez</p>
                      <p className="text-[9px] text-[#7A6E65]">👑 Admin (Ver ingresos, atender citas, CRM predictivo)</p>
                    </div>
                  </div>
                  {esAdmin && <span className="text-[9px] font-bold bg-[#6E1C36] text-white px-1.5 py-0.5 rounded-full">Activo</span>}
                </button>

                <button
                  onClick={() => {
                    loginRapido('cliente')
                    setMenuUsuarioAbierto(false)
                    navigate('/')
                  }}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    esCliente
                      ? 'bg-[#EBF5F0] border-[#2D7A58] text-[#2D7A58] font-bold'
                      : 'bg-white border-[#E0D5C7] text-[#3D322C] hover:border-[#2D7A58]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#2D7A58]" />
                    <div className="text-left">
                      <p className="text-xs">Camila Rodriguez</p>
                      <p className="text-[9px] text-[#7A6E65]">🌸 Alumna (Solo mis clases, sin finanzas ni CRM)</p>
                    </div>
                  </div>
                  {esCliente && <span className="text-[9px] font-bold bg-[#2D7A58] text-white px-1.5 py-0.5 rounded-full">Activa</span>}
                </button>
              </div>

              {/* Botón Cerrar Sesión */}
              <button
                onClick={() => {
                  logout()
                  setMenuUsuarioAbierto(false)
                }}
                className="w-full py-2.5 rounded-xl bg-[#FAF0F2] text-[#8A2035] hover:bg-[#FBE5E9] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
