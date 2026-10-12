# 🩰 Belle-APP — Belle Barre Studio Management System

> **Full-Stack Mobile PWA** para la gestión integral de un estudio de Barre, Pilates & Wellness.

---

## 🏗️ Arquitectura

```
Belle-APP/
├── Backend/belle-api/          → API REST (.NET 10, Azure SQL, JWT, Serilog)
│   ├── Belle.Api/              → Proyecto principal (8 Controllers, 4 Services)
│   └── PruebasNotificaciones/  → Suite de tests de Push Notifications
├── Frontend/belle-app/         → SPA React 19 + Vite 8 + Tailwind v4
│   ├── src/pages/              → 6 módulos: Dashboard, Reservas, CRM, WhatsApp, Vision, Auth
│   └── public/models/          → Modelo MediaPipe Pose Landmarker (WASM)
└── belle-vision/               → Utilidades dev HTTPS para cámara móvil
```

## 🚀 Inicio Rápido

### Requisitos
- [.NET 10 SDK](https://dotnet.microsoft.com/download) (v10.0.401+)
- [Node.js](https://nodejs.org/) (v20+)
- Acceso a Azure SQL (credenciales en variables de entorno)

### 1. Backend

```powershell
cd Backend/belle-api/Belle.Api
dotnet restore
dotnet build
dotnet run --launch-profile http
# API disponible en http://localhost:5213
# Swagger en http://localhost:5213/swagger
```

### 2. Frontend

```powershell
cd Frontend/belle-app
npm install
npm run dev
# App disponible en http://localhost:5173
```

### 3. Tests

```powershell
# Tests de Vision (Frontend)
cd Frontend/belle-app
node --test src/services/visionUtils.test.js

# Tests de Push Notifications (Frontend)
node --test src/services/notificacionesPush.test.js

# Tests de Push Notifications (Backend)
cd Backend/belle-api/PruebasNotificaciones
dotnet run
```

## 📱 Módulos

| # | Módulo | Descripción |
|---|--------|-------------|
| 5 | **Reservas** | Gestión de citas con calendario semanal, filtros y CRUD completo |
| 7 | **CRM Predictivo** | Belle Engagement Score (BES), segmentación y retención |
| 8 | **WhatsApp Bot** | Chat inteligente con Function Calling y bot automatizado |
| 9 | **Belle Vision** | Análisis postural con MediaPipe Pose (100% on-device, WASM) |
| 10 | **Dashboard** | Panel ejecutivo con KPIs, gráficos y alertas en tiempo real |

## 🎨 Diseño

Paleta Mobile-First inspirada en elegancia y wellness:
- 🍷 Vino/Burgundy: `#6E1C36`
- 🧈 Crema: `#FAF7F2`
- 🏖️ Arena: `#EDE5DA`
- 🥂 Champagne Gold: `#E6CBA8`
- 🌿 Verde Salvia: `#2D7A58`

## 🔐 Roles

| Rol | Acceso |
|-----|--------|
| **Admin** | Acceso total: Dashboard, CRM, Reservas, WhatsApp, Vision |
| **Instructor** | Clases del día, asistencia, Vision |
| **Cliente** | Mis citas, mi plan BES, Vision personal |

## 👨‍💻 Autor

**Luis Joaquin Huamani Hernandez** — Studio Owner & Developer

---

*Belle Barre Studio © 2026*
