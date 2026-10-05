import React, { useState } from 'react'
import {
  ScanFace,
  Layers,
  Camera,
  RefreshCw,
  Sparkles,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { analizarPosturaVision } from '../../services/apiServices'

export const VisionPage = () => {
  const [tipoMuestra, setTipoMuestra] = useState('adecuada')
  const [analisis, setAnalisis] = useState(null)
  const [procesando, setProcesando] = useState(false)

  const ejecutarAnalisis = async (tipo) => {
    setProcesando(true)
    setTipoMuestra(tipo)
    const resultado = await analizarPosturaVision(tipo)
    setAnalisis(resultado)
    setProcesando(false)
  }

  React.useEffect(() => {
    ejecutarAnalisis('adecuada')
  }, [])

  return (
    <div className="space-y-4">
      {/* Header Móvil */}
      <div>
        <span className="text-[10px] font-bold text-[#6E1C36] uppercase tracking-wider">
          Módulo 9 · Visión Artificial
        </span>
        <h2 className="text-lg font-bold text-[#241E1C] tracking-tight">
          Belle Vision · Escáner Postural
        </h2>
        <p className="text-[11px] text-[#70645B]">
          MediaPipe Pose integrado para diagnóstico postural en estudio.
        </p>
      </div>

      {/* Selector de Muestras Móvil */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => ejecutarAnalisis('adecuada')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            tipoMuestra === 'adecuada'
              ? 'bg-[#6E1C36] text-white shadow-sm'
              : 'bg-white text-[#5C5047] border border-[#EDE5DA]'
          }`}
        >
          Postura Simétrica
        </button>
        <button
          onClick={() => ejecutarAnalisis('inclinada')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            tipoMuestra === 'inclinada'
              ? 'bg-[#6E1C36] text-white shadow-sm'
              : 'bg-white text-[#5C5047] border border-[#EDE5DA]'
          }`}
        >
          Desbalance Hombros
        </button>
      </div>

      {/* Visor de Cámara Móvil con Landmarks SVG */}
      <div className="relative rounded-3xl overflow-hidden bg-[#1A1412] aspect-[3/4] flex items-center justify-center border border-[#3D322C] shadow-md">
        {analisis && (
          <>
            <img
              src={analisis.imagenUrl}
              alt="Postura"
              className="w-full h-full object-cover opacity-85"
            />

            {/* SVG Overlay con Landmarks de MediaPipe Pose */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
              {tipoMuestra === 'adecuada' ? (
                <>
                  {/* Línea y puntos de Hombros */}
                  <line x1="38" y1="36" x2="62" y2="36" stroke="#2D7A58" strokeWidth="1.5" strokeDasharray="2,2" />
                  <circle cx="38" cy="36" r="2.2" fill="#2D7A58" />
                  <circle cx="62" cy="36" r="2.2" fill="#2D7A58" />

                  {/* Columna y Cabeza */}
                  <circle cx="50" cy="22" r="2.5" fill="#E6CBA8" />
                  <line x1="50" y1="24" x2="50" y2="60" stroke="#2D7A58" strokeWidth="1.5" />

                  {/* Cadera */}
                  <line x1="42" y1="60" x2="58" y2="60" stroke="#2D7A58" strokeWidth="1.2" />
                  <circle cx="42" cy="60" r="2" fill="#2D7A58" />
                  <circle cx="58" cy="60" r="2" fill="#2D7A58" />

                  <text x="30" y="32" fill="#2D7A58" fontSize="3.5" fontWeight="bold">Hombros: 2.1° (Alineado)</text>
                </>
              ) : (
                <>
                  {/* Hombros Inclinados */}
                  <line x1="37" y1="40" x2="63" y2="32" stroke="#8A2035" strokeWidth="1.8" strokeDasharray="2,2" />
                  <circle cx="37" cy="40" r="2.5" fill="#8A2035" />
                  <circle cx="63" cy="32" r="2.5" fill="#8A2035" />

                  {/* Columna asimétrica */}
                  <circle cx="51" cy="21" r="2.5" fill="#8A2035" />
                  <line x1="51" y1="23" x2="48" y2="62" stroke="#8A2035" strokeWidth="1.8" />

                  {/* Cadera */}
                  <line x1="40" y1="62" x2="56" y2="60" stroke="#A66E38" strokeWidth="1.2" />
                  <circle cx="40" cy="62" r="2" fill="#A66E38" />
                  <circle cx="56" cy="60" r="2" fill="#A66E38" />

                  <text x="28" y="27" fill="#8A2035" fontSize="3.5" fontWeight="bold">Asimetría: 8.6°</text>
                </>
              )}
            </svg>
          </>
        )}

        {/* Badge en vivo en la pantalla de la cámara */}
        <div className="absolute top-3 left-3 bg-[#241E1C]/85 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-[#FAF7F2] font-mono flex items-center gap-1.5 border border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2D7A58] animate-pulse"></span>
          Landmarks: 33 pts
        </div>

        {procesando && (
          <div className="absolute inset-0 bg-[#1A1412]/85 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
            <RefreshCw className="w-8 h-8 text-[#E6CBA8] animate-spin" />
            <p className="text-xs font-semibold">MediaPipe analizando postura...</p>
          </div>
        )}
      </div>

      {/* Resultados Métricos en Tarjetas Móviles */}
      {analisis && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-[#EDE5DA] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#241E1C]">Resultado</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  analisis.postura === 'Adecuada'
                    ? 'bg-[#EBF5F0] text-[#2D7A58] border border-[#CDE5D8]'
                    : 'bg-[#FDF0F2] text-[#8A2035] border border-[#F5CDD3]'
                }`}
              >
                {analisis.postura}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EDE5DA]">
                <p className="text-[10px] text-[#70645B] font-medium">Ángulo Hombros</p>
                <p className="text-lg font-bold text-[#241E1C]">{analisis.angulo_hombros}°</p>
              </div>
              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EDE5DA]">
                <p className="text-[10px] text-[#70645B] font-medium">Inclinación</p>
                <p className="text-lg font-bold text-[#241E1C]">{analisis.inclinacion}°</p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#70645B]">Confianza MediaPipe:</span>
                <span className="text-[#6E1C36] font-bold">{(analisis.confianza * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-[#EFE9DF] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#6E1C36] h-full rounded-full"
                  style={{ width: `${analisis.confianza * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Recomendación de Studio */}
          <div className="bg-[#241E1C] text-[#FAF7F2] rounded-2xl p-4 shadow-lg space-y-2 border border-[#3D322C]">
            <div className="flex items-center gap-1.5 text-[#E6CBA8] text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Sugerencia Belle Barre Studio</span>
            </div>
            <p className="text-xs text-[#D8CCC1] leading-relaxed">
              {analisis.recomendacion}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
