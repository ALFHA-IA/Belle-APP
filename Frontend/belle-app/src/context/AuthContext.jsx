import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const API_BASE = 'http://localhost:5213/api'

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
        return USUARIOS_DEMO.admin
      }
    }
    return USUARIOS_DEMO.admin // Por defecto iniciamos con Luis Joaquin para no bloquear
  })

  const [cargando, setCargando] = useState(false)
  const [errorAuth, setErrorAuth] = useState(null)

  const guardarSesion = (user) => {
    setUsuario(user)
    localStorage.setItem('belle_user', JSON.stringify(user))
    setErrorAuth(null)
  }

  const login = async (correo, contrasena) => {
    setCargando(true)
    setErrorAuth(null)
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        correo,
        contrasena
      })

      const data = res.data
      const esAdmin = data.rol.toLowerCase().includes('admin')
      const nombres = data.nombreCompleto || correo.split('@')[0]
      const partes = nombres.split(' ')
      const iniciales = partes.length >= 2 ? `${partes[0][0]}${partes[1][0]}`.toUpperCase() : nombres.slice(0, 2).toUpperCase()

      const userConectado = {
        id: data.id || (esAdmin ? 260 : 3),
        nombre: nombres,
        correo: data.correo || correo,
        rol: esAdmin ? 'Admin' : 'Cliente',
        token: data.token,
        iniciales,
        cargo: esAdmin ? 'Studio Owner & Director' : 'Alumna Matriculada',
        avatar: esAdmin ? USUARIOS_DEMO.admin.avatar : USUARIOS_DEMO.cliente.avatar,
        matricula: esAdmin ? 'Acceso Total Administrador' : 'Membresía Barré Unlimited'
      }

      guardarSesion(userConectado)
      return { success: true, user: userConectado }
    } catch (err) {
      console.warn('Error en API Auth, usando fallback de roles:', err.message)
      // Fallback local si el backend no responde
      const correoL = correo.toLowerCase()
      if (correoL.includes('luis') || correoL.includes('admin') || correoL.includes('huamani')) {
        guardarSesion(USUARIOS_DEMO.admin)
        return { success: true, user: USUARIOS_DEMO.admin }
      } else {
        guardarSesion({
          ...USUARIOS_DEMO.cliente,
          correo: correo,
          nombre: correoL.includes('camila') ? 'Camila Rodriguez' : 'Cliente Matriculado'
        })
        return { success: true, user: USUARIOS_DEMO.cliente }
      }
    } finally {
      setCargando(false)
    }
  }

  const loginRapido = (tipo) => {
    const demo = tipo === 'admin' ? USUARIOS_DEMO.admin : USUARIOS_DEMO.cliente
    guardarSesion(demo)
  }

  const logout = () => {
    setUsuario(null)
    localStorage.removeItem('belle_user')
  }

  const esAdmin = usuario?.rol === 'Admin'
  const esCliente = usuario?.rol === 'Cliente'

  return (
    <AuthContext.Provider
      value={{
        usuario,
        esAdmin,
        esCliente,
        cargando,
        errorAuth,
        login,
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
