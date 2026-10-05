import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  Sparkles,
  Send,
  Zap,
  CalendarCheck,
  ChevronDown
} from 'lucide-react'
import { consultarAsistenteBelle } from '../../services/apiServices'

export const BelleChatWidget = ({ abiertoExterno = false, alCerrar = () => {} }) => {
  const { usuario } = useAuth()
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 'init',
      remitente: 'bot',
      texto: `¡Hola, ${usuario?.nombre || 'Luis Joaquin Huamani Hernandez'}! Soy Belle AI ✨ Tu copiloto conectado en vivo a Azure SQL. Puedo consultar horarios de clases Barré, agendar citas con Function Calling y ayudarte con métricas BES de clientes. ¿Qué deseas consultar hoy?`,
      hora: 'Ahora',
      toolEjecutada: null
    }
  ])

  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (abiertoExterno) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, abiertoExterno])

  const handleSend = async (textoAEnviar = inputMessage) => {
    if (!textoAEnviar.trim()) return

    const nuevoMensajeUsuario = {
      id: `u_${Date.now()}`,
      remitente: 'usuario',
      texto: textoAEnviar,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, nuevoMensajeUsuario])
    setInputMessage('')
    setLoading(true)

    try {
      const data = await consultarAsistenteBelle(textoAEnviar, usuario?.nombre)
      const nuevoMensajeBot = {
        id: `b_${Date.now()}`,
        remitente: 'bot',
        texto: data.respuesta,
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolEjecutada: data.toolEjecutada,
        accionSugerida: data.accionSugerida
      }
      setMessages(prev => [...prev, nuevoMensajeBot])
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          remitente: 'bot',
          texto: 'Lo siento, hubo un problema al procesar la solicitud.',
          hora: 'Ahora'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const chipsSugeridos = [
    '¿Citas para hoy?',
    'Reservar sesión a las 4pm',
    '¿Clientes en riesgo?',
    'Precios de servicios'
  ]

  if (!abiertoExterno) return null

  return (
    <div className="absolute inset-0 bg-[#1F1917]/65 backdrop-blur-xs z-50 flex flex-col justify-end animate-in fade-in duration-200">
      <div className="h-[92%] bg-[#FFFDFB] rounded-t-3xl flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 border-t border-[#EDE5DA]">
        
        {/* Header del Chat Móvil en tono Vino Studio */}
        <div className="bg-gradient-to-r from-[#450C1B] to-[#651A31] text-[#FAF7F2] p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-[#E6CBA8]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold flex items-center gap-1.5">
                Belle AI Copilot
                <span className="text-[9px] bg-[#FAF7F2]/20 text-[#EEDBC5] px-1.5 py-0.2 rounded border border-white/20">
                  .NET 10 Tools
                </span>
              </h3>
              <p className="text-[10px] text-[#D8CCC1]">Function Calling activo en la App</p>
            </div>
          </div>
          <button
            onClick={alCerrar}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF7F2] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Historial de Mensajes */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF7F2]">
          {messages.map((m) => {
            const esBot = m.remitente === 'bot'
            return (
              <div
                key={m.id}
                className={`flex flex-col ${esBot ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    esBot
                      ? 'bg-white text-[#241E1C] border border-[#EDE5DA] shadow-xs rounded-tl-xs'
                      : 'bg-gradient-to-r from-[#581427] to-[#7A1F3C] text-white rounded-tr-xs shadow-xs'
                  }`}
                >
                  {m.texto}

                  {/* Badge de Function Calling */}
                  {m.toolEjecutada && (
                    <div className="mt-2 pt-2 border-t border-[#EDE5DA] flex items-start gap-1.5 text-[10px] font-mono text-[#581427] bg-[#FAF3EE] p-2 rounded-xl border border-[#ECD9CC]">
                      <Zap className="w-3.5 h-3.5 text-[#6E1C36] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-[#581427]">Tool Ejecutada en Gateway:</p>
                        <p className="break-all">{m.toolEjecutada}</p>
                      </div>
                    </div>
                  )}

                  {/* Tarjeta de Acción rápida */}
                  {m.accionSugerida && m.accionSugerida.tipo === 'CREAR_RESERVA' && (
                    <div className="mt-2 p-2 bg-[#FBF2EC] rounded-xl border border-[#EEDCD3] flex items-center justify-between gap-2">
                      <div className="text-[11px] text-[#4E0E20]">
                        <p className="font-bold">{m.accionSugerida.servicio}</p>
                        <p className="text-[10px] text-[#8C3A4F]">{m.accionSugerida.profesional} · {m.accionSugerida.hora}</p>
                      </div>
                      <span className="text-[10px] font-bold bg-[#6E1C36] text-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-xs">
                        <CalendarCheck className="w-3 h-3 text-[#E6CBA8]" />
                        Agendado
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-[#96897E] mt-1 px-1">{m.hora}</span>
              </div>
            )
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#70645B] italic bg-white p-2.5 rounded-xl border border-[#EDE5DA] max-w-[75%]">
              <span className="w-2 h-2 rounded-full bg-[#6E1C36] animate-ping"></span>
              Belle AI procesando intención...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chips de Sugerencia */}
        <div className="px-3 py-2 bg-white border-t border-[#EDE5DA] flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {chipsSugeridos.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="text-[11px] text-[#5C5047] bg-[#FAF7F2] hover:bg-[#F3ECE1] hover:text-[#581427] border border-[#EDE5DA] px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0 font-medium"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="p-3 bg-white border-t border-[#EDE5DA] flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Pregúntale a Belle AI..."
            className="flex-1 text-xs bg-[#FAF7F2] border border-[#EDE5DA] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#6E1C36] text-[#241E1C]"
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="p-2.5 bg-[#6E1C36] hover:bg-[#501225] disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer shrink-0 shadow-xs"
          >
            <Send className="w-4 h-4 text-[#E6CBA8]" />
          </button>
        </form>
      </div>
    </div>
  )
}
