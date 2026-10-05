// Mock Data representativo del backend .NET 10 y microservicios de Belle AI
// Esto permite al FrontEnd funcionar al 100% de manera visual e interactiva sin bloqueos.

export const PROFESIONALES = [
  { id: 'p1', nombre: 'Valeria Mendoza', especialidad: 'Estética Facial y Corporal', avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=150&auto=format&fit=crop&q=80', color: 'bg-rose-500' },
  { id: 'p2', nombre: 'Carlos Quispe', especialidad: 'Estilismo y Colorimetría', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', color: 'bg-indigo-500' },
  { id: 'p3', nombre: 'Andrea Torres', especialidad: 'Manicure y Pedicure Spa', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', color: 'bg-emerald-500' },
  { id: 'p4', nombre: 'Lucía Benavides', especialidad: 'Masoterapia y Relajación', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', color: 'bg-amber-500' }
]

export const SERVICIOS = [
  { id: 's1', nombre: 'Limpieza Facial Profunda', categoria: 'Facial', duracion: 60, precio: 95.0, descripcion: 'Exfoliación, vapor de ozono, extracción y mascarilla calmante.' },
  { id: 's2', nombre: 'Manicure Rusa Spa', categoria: 'Uñas', duracion: 45, precio: 55.0, descripcion: 'Técnica con torno, nivelación en rubber y esmaltado semipermanente.' },
  { id: 's3', nombre: 'Corte y Peinado Premium', categoria: 'Cabello', duracion: 45, precio: 70.0, descripcion: 'Diagnóstico capilar, lavado relajante, corte de tendencia y peinado.' },
  { id: 's4', nombre: 'Masaje Descontracturante', categoria: 'Spa', duracion: 60, precio: 120.0, descripcion: 'Técnicas profundas con aromaterapia y piedras calientes.' },
  { id: 's5', nombre: 'Diseño y Laminado de Cejas', categoria: 'Mirada', duracion: 40, precio: 65.0, descripcion: 'Diseño visagista, tinte orgánico y nutrición con keratina.' },
  { id: 's6', nombre: 'Pedicure Spa Detox', categoria: 'Uñas', duracion: 50, precio: 60.0, descripcion: 'Baño de sales marinas, exfoliación profunda y mascarilla hidratante.' }
]

export const CLIENTES = [
  {
    id: 'c1',
    nombre: 'Camila Rodriguez',
    telefono: '+51 987 654 321',
    email: 'camila.rodriguez@email.com',
    ultimaVisitaDias: 68,
    totalReservas: 8,
    gastoTotal: 720.0,
    bes: 34, // Score de 0 a 100
    clasificacion: 'EN RIESGO', // EN RIESGO, ACTIVO, COMPROMETIDO, OCASIONAL, INACTIVO
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    ultimoServicio: 'Limpieza Facial Profunda',
    preferencia: 'Prefiere atención con Valeria Mendoza los sábados por la tarde.'
  },
  {
    id: 'c2',
    nombre: 'Mariana Flores',
    telefono: '+51 991 223 344',
    email: 'mariana.flores@email.com',
    ultimaVisitaDias: 8,
    totalReservas: 14,
    gastoTotal: 1250.0,
    bes: 88,
    clasificacion: 'COMPROMETIDO',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    ultimoServicio: 'Manicure Rusa Spa',
    preferencia: 'Frecuenta cada 2 semanas para mantenimiento de uñas.'
  },
  {
    id: 'c3',
    nombre: 'Gonzalo Morales',
    telefono: '+51 977 445 566',
    email: 'gonzalo.morales@email.com',
    ultimaVisitaDias: 21,
    totalReservas: 5,
    gastoTotal: 410.0,
    bes: 65,
    clasificacion: 'ACTIVO',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    ultimoServicio: 'Corte y Peinado Premium',
    preferencia: 'Corte mensual con Carlos Quispe.'
  },
  {
    id: 'c4',
    nombre: 'Sofia Paredes',
    telefono: '+51 966 889 900',
    email: 'sofia.paredes@email.com',
    ultimaVisitaDias: 75,
    totalReservas: 3,
    gastoTotal: 290.0,
    bes: 28,
    clasificacion: 'EN RIESGO',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    ultimoServicio: 'Masaje Descontracturante',
    preferencia: 'Servicios de relajación.'
  },
  {
    id: 'c5',
    nombre: 'Luciana Herrera',
    telefono: '+51 955 112 233',
    email: 'luciana.herrera@email.com',
    ultimaVisitaDias: 42,
    totalReservas: 4,
    gastoTotal: 340.0,
    bes: 51,
    clasificacion: 'OCASIONAL',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    ultimoServicio: 'Diseño y Laminado de Cejas',
    preferencia: 'Atención previa a eventos sociales.'
  },
  {
    id: 'c6',
    nombre: 'Patricia Vargas',
    telefono: '+51 944 332 211',
    email: 'patricia.vargas@email.com',
    ultimaVisitaDias: 110,
    totalReservas: 2,
    gastoTotal: 180.0,
    bes: 15,
    clasificacion: 'INACTIVO',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    ultimoServicio: 'Pedicure Spa Detox',
    preferencia: 'Sin actividad reciente.'
  }
]

// Obtener fecha de hoy en formato ISO (YYYY-MM-DD)
const hoy = new Date().toISOString().split('T')[0]

export const RESERVAS_INICIALES = [
  {
    id: 'r1',
    clienteId: 'c2',
    clienteNombre: 'Mariana Flores',
    servicioId: 's2',
    servicioNombre: 'Manicure Rusa Spa',
    profesionalId: 'p3',
    profesionalNombre: 'Andrea Torres',
    fecha: hoy,
    hora: '10:00',
    duracion: 45,
    precio: 55.0,
    estado: 'CONFIRMADA', // CONFIRMADA, ATENDIDA, PENDIENTE, CANCELADA
    observaciones: 'Diseño francés con efecto glaseado.'
  },
  {
    id: 'r2',
    clienteId: 'c3',
    clienteNombre: 'Gonzalo Morales',
    servicioId: 's3',
    servicioNombre: 'Corte y Peinado Premium',
    profesionalId: 'p2',
    profesionalNombre: 'Carlos Quispe',
    fecha: hoy,
    hora: '11:30',
    duracion: 45,
    precio: 70.0,
    estado: 'ATENDIDA',
    observaciones: 'Corte texturizado estándar.'
  },
  {
    id: 'r3',
    clienteId: 'c1',
    clienteNombre: 'Camila Rodriguez',
    servicioId: 's1',
    servicioNombre: 'Limpieza Facial Profunda',
    profesionalId: 'p1',
    profesionalNombre: 'Valeria Mendoza',
    fecha: hoy,
    hora: '16:00',
    duracion: 60,
    precio: 95.0,
    estado: 'CONFIRMADA',
    observaciones: 'Agendada por el Asistente Belle AI tras campaña de retención.'
  },
  {
    id: 'r4',
    clienteId: 'c5',
    clienteNombre: 'Luciana Herrera',
    servicioId: 's5',
    servicioNombre: 'Diseño y Laminado de Cejas',
    profesionalId: 'p1',
    profesionalNombre: 'Valeria Mendoza',
    fecha: hoy,
    hora: '17:30',
    duracion: 40,
    precio: 65.0,
    estado: 'PENDIENTE',
    observaciones: 'Pendiente de confirmación telefónica.'
  }
]

export const DASHBOARD_STATS = {
  citasHoy: { total: 12, atendidas: 5, confirmadas: 5, pendientes: 2 },
  ingresosMes: { total: 5340.0, comparativaPorcentaje: '+18.5%' },
  clientesActivos: { total: 184, nuevosMes: 26 },
  clientesEnRiesgo: { total: 8, recuperablesInmediatos: 5 },
  
  // Datos para Recharts (Evolución semanal)
  reservasSemanales: [
    { semana: 'Sem 1', realizadas: 38, ingresos: 3200 },
    { semana: 'Sem 2', realizadas: 44, ingresos: 3950 },
    { semana: 'Sem 3', realizadas: 52, ingresos: 4600 },
    { semana: 'Sem 4 (Actual)', realizadas: 61, ingresos: 5340 }
  ],

  // Top Servicios
  serviciosTop: [
    { nombre: 'Manicure Rusa Spa', cantidad: 45, porcentaje: 35, color: '#f43f5e' },
    { nombre: 'Limpieza Facial', cantidad: 32, porcentaje: 25, color: '#6366f1' },
    { nombre: 'Corte y Peinado', cantidad: 28, porcentaje: 22, color: '#10b981' },
    { nombre: 'Masajes Spa', cantidad: 14, porcentaje: 11, color: '#f59e0b' },
    { nombre: 'Cejas y Pestañas', cantidad: 9, porcentaje: 7, color: '#8b5cf6' }
  ]
}

export const WHATSAPP_CHATS = [
  {
    id: 'w1',
    clienteId: 'c1',
    clienteNombre: 'Camila Rodriguez',
    telefono: '+51 987 654 321',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    ultimoMensaje: '¡Perfecto, nos vemos hoy a las 4:00 PM!',
    hora: '10:45 AM',
    noLeidos: 0,
    estadoBot: 'Activo (Function Calling)',
    mensajes: [
      { id: 'm1', remitente: 'bot', texto: 'Hola Camila ✨ Te extrañamos en Belle Salón. Notamos que hace un tiempo no disfrutas de una Limpieza Facial. Tenemos un 20% de descuento exclusivo para ti esta semana si agendas hoy.', hora: '10:15 AM' },
      { id: 'm2', remitente: 'cliente', texto: '¡Hola! Qué lindo detalle. Justo estaba pensando en hacerme una limpieza facial. ¿Tienen disponible para hoy en la tarde?', hora: '10:20 AM' },
      { id: 'm3', remitente: 'bot', texto: '¡Claro que sí! Consulté la agenda de Valeria Mendoza y tenemos disponible a las 4:00 PM o a las 6:00 PM. ¿Cuál te acomoda mejor?', hora: '10:21 AM', toolEjecutada: 'ConsultarDisponibilidad(servicio="s1", fecha="hoy")' },
      { id: 'm4', remitente: 'cliente', texto: 'A las 4:00 PM me queda genial.', hora: '10:22 AM' },
      { id: 'm5', remitente: 'bot', texto: '¡Listo, Camila! Tu cita para Limpieza Facial Profunda quedó confirmada para hoy a las 4:00 PM con Valeria Mendoza con tu 20% de descuento aplicado. Te esperamos en el salón ✨', hora: '10:23 AM', toolEjecutada: 'CrearReserva(clienteId="c1", servicio="s1", hora="16:00")' },
      { id: 'm6', remitente: 'cliente', texto: '¡Perfecto, nos vemos hoy a las 4:00 PM!', hora: '10:45 AM' }
    ]
  },
  {
    id: 'w2',
    clienteId: 'c4',
    clienteNombre: 'Sofia Paredes',
    telefono: '+51 966 889 900',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    ultimoMensaje: 'Campaña de retención enviada automáticamente',
    hora: 'Ayer',
    noLeidos: 1,
    estadoBot: 'Esperando respuesta',
    mensajes: [
      { id: 'sm1', remitente: 'bot', texto: 'Hola Sofia 🌸 En Belle Salón queremos consentirte. Tienes disponible una sesión de Masaje Relajante con cortesía de aromaterapia especial. ¿Deseas ver los horarios disponibles de esta semana?', hora: 'Ayer 5:00 PM' }
    ]
  }
]

export const POSTURA_SAMPLES = {
  adecuada: {
    imagenUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80',
    estado: 'analizado',
    postura: 'Adecuada',
    angulo_hombros: 2.1,
    inclinacion: 1.4,
    confianza: 0.94,
    diagnostico: 'Alineación simétrica excelente entre hombros y pelvis. Buena postura ergonómica.',
    recomendacion: 'Mantener hábitos actuales y ejercicios de estiramiento ligero.'
  },
  inclinada: {
    imagenUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
    estado: 'analizado',
    postura: 'Desbalance Moderado',
    angulo_hombros: 8.6,
    inclinacion: 5.3,
    confianza: 0.89,
    diagnostico: 'Ligera asimetría por elevación del hombro derecho y compensación en la zona cervical.',
    recomendacion: 'Sugerido tratamiento de Masaje Descontracturante enfocado en trapecio y cuello.'
  }
}
