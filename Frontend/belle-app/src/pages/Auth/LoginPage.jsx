import React, { useState } from 'react'
import { Sparkles, Lock, Mail, ArrowRight, Eye, EyeOff, UserRound, AlertCircle } from 'lucide-react'
import { useAuth, ROLES } from '../../context/AuthContext'

const roleOptions = ['Cliente', 'Instructor', 'Admin']

export const LoginPage = ({ onLoginExitoso }) => {
  const { login, registrar, cargando, errorAuth } = useAuth()
  const [modoRegistro, setModoRegistro] = useState(false)
  const [rol, setRol] = useState('Cliente')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [telefono, setTelefono] = useState('')
  const [mostrarPass, setMostrarPass] = useState(false)
  const [errorLocal, setErrorLocal] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorLocal('')
    const resultado = modoRegistro
      ? await registrar({ nombreCompleto, correo, contrasena, telefono })
      : await login(correo, contrasena, rol)
    if (resultado.success) onLoginExitoso?.(resultado.user)
    else setErrorLocal(resultado.message || 'No se pudo completar la operación.')
  }

  const inputClass = 'w-full text-sm bg-[#FAF7F2] border border-[#EDE5DA] rounded-xl pl-9 pr-3 py-2.5 text-[#241E1C] focus:outline-none focus:border-[#6E1C36]'

  return (
    <div className="w-full h-full flex flex-col justify-center p-6 bg-gradient-to-b from-[#FAF7F2] via-[#F6EFE8] to-[#EFE7DE] text-[#241E1C] overflow-y-auto">
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-[#450C1B] via-[#6E1C36] to-[#8C2344] flex items-center justify-center shadow-lg mb-3"><Sparkles className="w-6 h-6 text-[#E6CBA8]" /></div>
        <p className="text-[10px] font-bold text-[#6E1C36] uppercase tracking-widest">Plataforma Belle AI</p>
        <h1 className="text-2xl font-extrabold tracking-tight mt-1">Belle Barre Studio</h1>
        <p className="text-xs text-[#7A6E65] mt-1">{modoRegistro ? 'Crea tu cuenta de Cliente' : 'Accede a tu panel personalizado'}</p>
      </div>

      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-[#EDE5DA] shadow-lg space-y-4">
        <div><h2 className="text-base font-bold">{modoRegistro ? 'Regístrate' : 'Iniciar sesión'}</h2>{!modoRegistro && <p className="text-xs text-[#7A6E65] mt-1">Selecciona el perfil con el que deseas ingresar.</p>}</div>
        {(errorLocal || errorAuth) && <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{errorLocal || errorAuth}</span></div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          {!modoRegistro ? <fieldset><legend className="block text-[10px] font-bold text-[#5C5047] uppercase tracking-wider mb-2">Iniciar sesión como:</legend><div className="grid grid-cols-3 gap-2">{roleOptions.map((opcion) => { const perfil = ROLES[opcion]; return <button key={opcion} type="button" onClick={() => setRol(opcion)} className={`rounded-xl border px-1 py-2 text-center text-xs transition-all ${rol === opcion ? 'border-[#6E1C36] bg-[#F9F0F3] text-[#6E1C36] font-bold shadow-sm' : 'border-[#E5D9CD] bg-[#FFFCF9] text-[#5C5047]'}`}><span className="block text-base">{perfil.icon}</span>{perfil.label}</button> })}</div></fieldset> : <p className="rounded-xl bg-[#EBF5F0] px-3 py-2 text-xs text-[#2D7A58]">👤 Tu cuenta se creará como <strong>Cliente</strong>.</p>}
          {modoRegistro && <label className="block"><span className="block text-[10px] font-bold text-[#5C5047] uppercase tracking-wider mb-1">Nombre completo</span><div className="relative"><UserRound className="w-4 h-4 text-[#9E8E82] absolute left-3 top-3" /><input className={inputClass} required value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} /></div></label>}
          <label className="block"><span className="block text-[10px] font-bold text-[#5C5047] uppercase tracking-wider mb-1">Correo electrónico</span><div className="relative"><Mail className="w-4 h-4 text-[#9E8E82] absolute left-3 top-3" /><input type="email" className={inputClass} required value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="ejemplo@bellebarre.pe" /></div></label>
          {modoRegistro && <label className="block"><span className="block text-[10px] font-bold text-[#5C5047] uppercase tracking-wider mb-1">Teléfono (opcional)</span><input className="w-full text-sm bg-[#FAF7F2] border border-[#EDE5DA] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#6E1C36]" value={telefono} onChange={(e) => setTelefono(e.target.value)} /></label>}
          <label className="block"><span className="block text-[10px] font-bold text-[#5C5047] uppercase tracking-wider mb-1">Contraseña</span><div className="relative"><Lock className="w-4 h-4 text-[#9E8E82] absolute left-3 top-3" /><input type={mostrarPass ? 'text' : 'password'} minLength="6" className={inputClass} required value={contrasena} onChange={(e) => setContrasena(e.target.value)} /><button type="button" onClick={() => setMostrarPass(!mostrarPass)} className="absolute right-3 top-2.5 text-[#9E8E82]">{mostrarPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></label>
          <button type="submit" disabled={cargando} className="w-full py-3 rounded-xl bg-[#6E1C36] hover:bg-[#501225] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50">{cargando ? 'Procesando...' : modoRegistro ? 'Crear cuenta' : 'Iniciar sesión'} {!cargando && <ArrowRight className="w-4 h-4" />}</button>
        </form>
        <button type="button" onClick={() => { setModoRegistro(!modoRegistro); setErrorLocal('') }} className="w-full text-center text-sm font-semibold text-[#6E1C36] hover:text-[#501225]">{modoRegistro ? '¿Ya tienes una cuenta? Inicia sesión' : '¿Eres nuevo? Regístrate aquí'}</button>
      </div>
      <p className="text-center text-[10px] text-[#8C7E74] mt-5">Acceso seguro a Belle Barre Studio</p>
    </div>
  )
}
