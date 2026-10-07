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
  instructor: {
    id: 261,
    nombre: 'Valeria Mendoza',
    correo: 'instructor@bellebarre.pe',
    rol: 'Instructor',
    iniciales: 'VM',
    cargo: 'Instructora de Belle Barre',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    matricula: 'Acceso Profesional'
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

  const obtenerUsuarioDemo = (correo, contrasena, rolSeleccionado) => {
    const email = String(correo || '').trim().toLowerCase()
    const password = String(contrasena || '')
    const rol = String(rolSeleccionado || 'Cliente')

    const opciones = [
      { key: 'admin', usuario: USUARIOS_DEMO.admin, email: 'luis.huamani@bellebarre.pe', password: '123456', rol: 'Admin' },
      { key: 'instructor', usuario: USUARIOS_DEMO.instructor, email: 'instructor@bellebarre.pe', password: '123456', rol: 'Instructor' },
      { key: 'cliente', usuario: USUARIOS_DEMO.cliente, email: 'camila.rodriguez@email.com', password: '123456', rol: 'Cliente' }
    ]

    const coincidencia = opciones.find((item) => item.email === email && item.password === password && item.rol === rol)
    if (!coincidencia) return null

    return {
      ...coincidencia.usuario,
      token: 'demo-token-local',
      rol: coincidencia.rol,
      cargo: ROLES[coincidencia.rol].cargo,
      matricula: coincidencia.rol === 'Admin' ? 'Acceso Total Administrador' : coincidencia.rol === 'Instructor' ? 'Acceso Profesional' : 'Membresía Barré Unlimited'
    }
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
        avatar: data.rol === 'Admin' ? USUARIOS_DEMO.admin.avatar : data.rol === 'Instructor' ? USUARIOS_DEMO.instructor.avatar : USUARIOS_DEMO.cliente.avatar,
        matricula: data.rol === 'Admin' ? 'Acceso Total Administrador' : data.rol === 'Instructor' ? 'Acceso Profesional' : 'Membresía Barré Unlimited'
      }

      guardarSesion(userConectado)
      return { success: true, user: userConectado }
    } catch (err) {
      const usuarioDemo = obtenerUsuarioDemo(correo, contrasena, rolSeleccionado)
      if (usuarioDemo) {
        guardarSesion(usuarioDemo)
        return { success: true, user: usuarioDemo }
      }

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
      const email = String(correo || '').trim().toLowerCase()
      const password = String(contrasena || '')

      if (email && password.length >= 6) {
        const userConectado = {
          id: Date.now(),
          nombre: nombreCompleto || 'Usuario Belle',
          correo: email,
          rol: 'Cliente',
          token: 'demo-token-local',
          iniciales: (nombreCompleto || 'Usuario Belle').split(' ').map((parte) => parte[0]).slice(0, 2).join('').toUpperCase(),
          cargo: ROLES.Cliente.cargo,
          avatar: USUARIOS_DEMO.cliente.avatar,
          matricula: 'Membresía Barré Unlimited'
        }

        guardarSesion(userConectado)
        return { success: true, user: userConectado }
      }

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
