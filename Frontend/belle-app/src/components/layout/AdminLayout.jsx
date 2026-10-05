import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { BelleChatWidget } from '../chat/BelleChatWidget'

export const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Barra Lateral Fija */}
      <Sidebar />

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>

      {/* Asistente Flotante Belle AI (Módulo 6) */}
      <BelleChatWidget />
    </div>
  )
}
