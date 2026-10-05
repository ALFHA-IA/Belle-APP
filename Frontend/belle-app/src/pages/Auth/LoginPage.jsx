import React, { useState } from 'react'
import {
  Sparkles,
  ShieldCheck,
  UserCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { useAuth, USUARIOS_DEMO } from '../../context/AuthContext'

export const LoginPage = ({ onLoginExitoso }) => {
  const { login, loginRapido, cargando } = useAuth()
  const [correo, setCorreo] = useState('luis.huamani@bellebarre.pe')
  const [contrasena, setContrasena] = useState('123456')
  const [mostrarPass, setMostrarPass] = useState(false)
  const [errorLocal, setErrorLocal] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorLocal('')
    const res = await login(correo, contrasena)
    if (res.success) {
      if (onLoginExitoso) onLoginExitoso()
    } else {
      setErrorLocal('Credenciales inválidas. Verifica tu correo y contraseña.')
    }
  }

  const handleSeleccionarRol = (tipo) => {
    loginRapido(tipo)
    if (onLoginExitoso) onLoginExitoso()
  }

  return (
    <div className="w-full h-full flex flex-col justify-between p-5 bg-gradient-to-b from-[#FAF7F2] via-[#F6EFE8] to-[#EFE7DE] text-[#241E1C] overflow-y-auto">
      {/* Cabecera & Branding */}
      <div className="text-center pt-3 pb-2">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-[#450C1B] via-[#6E1C36] to-[#8C2344] flex items-center justify-center text-white shadow-lg shadow-[#6E1C36]/30 mb-3">
          <Sparkles className="w-6 h-6 text-[#E6CBA8]" />
        </div>
        <span className="text-[10px] font-bold text-[#6E1C36] uppercase tracking-widest bg-[#EFE5DA] px-2.5 py-0.5 rounded-full">
          Plataforma Belle AI
        </span>
        <h1 className="text-2xl font-extrabold text-[#241E1C] tracking-tight mt-1.5">
          Belle Barre Studio
        </h1>
        <p className="text-xs text-[#7A6E65] mt-0.5">
          Acceso por roles: Administrador vs. Alumna Matriculada
        </p>
      </div>

      {/* Selector Rápido de Roles (1 Click) */}
      <div className="space-y-2.5 my-3">
        <p className="text-[11px] font-bold text-[#4A3D36] uppercase tracking-wider px-1">
          Acceso Rápido por Rol
        </p>

        {/* Tarjeta Rol: Administrador */}
        <button
          type="button"
          onClick={() => handleSeleccionarRol('admin')}
          className="w-full text-left p-3.5 rounded-2xl bg-white border-2 border-[#D4C3B3] hover:border-[#6E1C36] shadow-sm hover:shadow-md transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#581427] to-[#7D223E] text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#E6CBA8]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#241E1C] group-hover:text-[#6E1C36] transition-colors truncate">
                  Luis Joaquin Huamani Hernandez
                </span>
                <span className="text-[9px] font-extrabold bg-[#F4ECE3] text-[#6E1C36] border border-[#E3D4C4] px-1.5 py-0.2 rounded-full uppercase shrink-0">
                  👑 Admin
                </span>
              </div>
              <p className="text-[10px] text-[#7A6E65] truncate">Studio Owner · Acceso Total (Ingresos, CRM & Citas)</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#9E8E82] group-hover:text-[#6E1C36] group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </button>

        {/* Tarjeta Rol: Cliente Matriculado */}
        <button
          type="button"
          onClick={() => handleSeleccionarRol('cliente')}
          className="w-full text-left p-3.5 rounded-2xl bg-white border-2 border-[#D4C3B3] hover:border-[#2D7A58] shadow-sm hover:shadow-md transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1E5C41] to-[#2D7A58] text-white flex items-center justify-center shrink-0 shadow-xs">
              <UserCheck className="w-5 h-5 text-emerald-200" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#241E1C] group-hover:text-[#2D7A58] transition-colors truncate">
                  Camila Rodriguez
                </span>
                <span className="text-[9px] font-extrabold bg-[#EBF5F0] text-[#2D7A58] border border-[#CDE5D8] px-1.5 py-0.2 rounded-full uppercase shrink-0">
                  🌸 Alumna
                </span>
              </div>
              <p className="text-[10px] text-[#7A6E65] truncate">Matriculada · Vista personal (Sin ingresos ni CRM ajeno)</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#9E8E82] group-hover:text-[#2D7A58] group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </button>
      </div>

      {/* Formulario Manual con validación en Azure SQL */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 border border-[#EDE5DA] shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#F0E8DC] pb-2">
          <span className="text-[11px] font-bold text-[#241E1C]">O ingresa tus credenciales</span>
          <span className="text-[9px] text-[#2D7A58] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2D7A58] animate-pulse"></span>
            Azure SQL Auth
          </span>
        </div>

        {errorLocal && (
          <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorLocal}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div>
            <label className="block text-[10px] font-bold text-[#5C5047] uppercase tracking-wider mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-[#9E8E82] absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="ejemplo@bellebarre.pe"
                className="w-full text-xs bg-[#FAF7F2] border border-[#EDE5DA] rounded-xl pl-8 pr-3 py-2 text-[#241E1C] focus:outline-none focus:border-[#6E1C36]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#5C5047] uppercase tracking-wider mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-[#9E8E82] absolute left-3 top-2.5" />
              <input
                type={mostrarPass ? 'text' : 'password'}
                required
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="Tu contraseña"
                className="w-full text-xs bg-[#FAF7F2] border border-[#EDE5DA] rounded-xl pl-8 pr-8 py-2 text-[#241E1C] focus:outline-none focus:border-[#6E1C36]"
              />
              <button
                type="button"
                onClick={() => setMostrarPass(!mostrarPass)}
                className="absolute right-2.5 top-2.5 text-[#9E8E82] hover:text-[#5C5047]"
              >
                {mostrarPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-2.5 rounded-xl bg-[#6E1C36] hover:bg-[#501225] text-white font-bold text-xs shadow-md shadow-[#6E1C36]/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-1"
          >
            {cargando ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Iniciar Sesión</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Pie de página con status de base de datos */}
      <div className="text-center pt-2">
        <p className="text-[10px] text-[#8C7E74]">
          developeryss.database.windows.net · BDBelle
        </p>
      </div>
    </div>
  )
}
