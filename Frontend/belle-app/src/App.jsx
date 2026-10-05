import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './pages/Dashboard/DashboardPage'
import { ReservasPage } from './pages/Reservas/ReservasPage'
import { CrmPage } from './pages/CRM/CrmPage'
import { WhatsAppPage } from './pages/WhatsApp/WhatsAppPage'
import { VisionPage } from './pages/Vision/VisionPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          {/* Módulo 10: Dashboard Ejecutivo */}
          <Route index element={<DashboardPage />} />

          {/* Módulo 5: Gestión de Reservas */}
          <Route path="reservas" element={<ReservasPage />} />

          {/* Módulo 7: CRM Predictivo & BES */}
          <Route path="crm" element={<CrmPage />} />

          {/* Módulo 8: WhatsApp & Bot */}
          <Route path="whatsapp" element={<WhatsAppPage />} />

          {/* Módulo 9: Belle Vision (MediaPipe Pose) */}
          <Route path="vision" element={<VisionPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
