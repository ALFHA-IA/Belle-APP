import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { desactivarPush } from '../services/notificacionesPush'

const AuthContext = createContext(null)

// En desarrollo Vite reenvía /api al backend. VITE_API_BASE_URL permite
// reemplazarlo en un despliegue con una URL pública explícita.
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

export const ROLES = {
  Cliente: { value: 0, label: 'Cliente', icon: '👤', cargo: 'Alumna Matriculada' },
  Admin: { value: 1, label: 'Administrador', icon: '⚙️', cargo: 'Studio Owner & Director' },
  Instructor: { value: 2, label: 'Instructor(a)', icon: '🧘‍♀️', cargo: 'Instructora de Belle Barre' }
}

export const dashboardPorRol = (rol) => `/${String(rol || 'Cliente').toLowerCase()}`

// Usuarios de demostración rápidos
export const USUARIOS_DEMO = {
  admin: {
    id: 260,
    nombre: 'Luis Joaquin Huamani Hernandez',
    correo: 'luis.huamani@bellebarre.pe',
    rol: 'Admin',
    iniciales: 'LH',
    cargo: 'Studio Owner & Director',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    matricula: 'Acceso Total Administrador'
  },
  cliente: {
    id: 3,
    nombre: 'Camila Rodriguez',
    correo: 'camila.rodriguez@email.com',
    rol: 'Cliente',
    iniciales: 'CR',
    cargo: 'Alumna Matriculada',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    matricula: 'Membresía Barré Unlimited',
    clasesTomadas: 14,
    rachaSemanas: 6,
    bes: 94
  }
}

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('belle_user')
    if (guardado) {
      try {
        return JSON.parse(guardado)
      } catch (e) {
        localStorage.removeItem('belle_user')
        return null
      }
    }
    return null
  })

  const [cargando, setCargando] = useState(false)
  const [errorAuth, setErrorAuth] = useState(null)

  const guardarSesion = (user) => {
    if (usuario && (usuario.id !== user.id || usuario.rol !== user.rol)) desactivarPush(usuario).catch(() => {})
    setUsuario(user)
    localStorage.setItem('belle_user', JSON.stringify(user))
    setErrorAuth(null)
  }

  const login = async (correo, contrasena, rolSeleccionado) => {
    setCargando(true)
    setErrorAuth(null)
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        correo,
        contrasena,
        rol: ROLES[rolSeleccionado].value
      })

      const data = res.data
      if (data.rol !== rolSeleccionado) {
        throw new Error('La cuenta no corresponde al perfil seleccionado.')
      }

      const perfil = ROLES[data.rol]
      const nombres = data.nombreCompleto || correo.split('@')[0]
      const partes = nombres.split(' ')
      const iniciales = partes.length >= 2 ? `${partes[0][0]}${partes[1][0]}`.toUpperCase() : nombres.slice(0, 2).toUpperCase()

      const userConectado = {
        id: data.id,
        nombre: nombres,
        correo: data.correo || correo,
        rol: data.rol,
        token: data.token,
        iniciales,
        cargo: perfil.cargo,
        avatar: data.rol === 'Admin' ? USUARIOS_DEMO.admin.avatar : USUARIOS_DEMO.cliente.avatar,
        matricula: data.rol === 'Admin' ? 'Acceso Total Administrador' : 'Membresía Barré Unlimited'
      }

      guardarSesion(userConectado)
      return { success: true, user: userConectado }
    } catch (err) {
      const mensaje = err.response?.data?.mensaje || err.message || 'No fue posible iniciar sesión.'
      setErrorAuth(mensaje)
      return { success: false, message: mensaje }
    } finally {
      setCargando(false)
    }
  }

  const registrar = async ({ nombreCompleto, correo, contrasena, telefono }) => {
    setCargando(true)
    setErrorAuth(null)
    try {
      const res = await axios.post(`${API_BASE}/auth/registro`, { nombreCompleto, correo, contrasena, telefono })
      const data = res.data
      const nombres = data.nombreCompleto || nombreCompleto
      const partes = nombres.split(' ')
      const userConectado = {
        id: data.id,
        nombre: nombres,
        correo,
        rol: 'Cliente',
        token: data.token,
        iniciales: partes.map((parte) => parte[0]).slice(0, 2).join('').toUpperCase(),
        cargo: ROLES.Cliente.cargo,
        avatar: USUARIOS_DEMO.cliente.avatar,
        matricula: 'Membresía Barré Unlimited'
      }
      guardarSesion(userConectado)
      return { success: true, user: userConectado }
    } catch (err) {
      const mensaje = err.response?.data?.mensaje || 'No fue posible crear la cuenta.'
      setErrorAuth(mensaje)
      return { success: false, message: mensaje }
    } finally {
      setCargando(false)
    }
  }

  const loginRapido = (tipo) => {
    const demo = tipo === 'admin' ? USUARIOS_DEMO.admin : USUARIOS_DEMO.cliente
    guardarSesion(demo)
  }

  const logout = () => {
    desactivarPush(usuario).catch(() => {})
    setUsuario(null)
    localStorage.removeItem('belle_user')
  }

  const esAdmin = usuario?.rol === 'Admin'
  const esCliente = usuario?.rol === 'Cliente'
  const esInstructor = usuario?.rol === 'Instructor'

  return (
    <AuthContext.Provider
      value={{
        usuario,
        esAdmin,
        esCliente,
        esInstructor,
        cargando,
        errorAuth,
        login,
        registrar,
        loginRapido,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}
