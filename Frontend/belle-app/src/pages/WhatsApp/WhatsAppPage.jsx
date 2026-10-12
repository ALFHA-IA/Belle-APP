import React, { useState, useEffect } from 'react'
import {
  MessageSquare,
  Search,
  Bot,
  Send,
  Sparkles,
  Zap,
  Phone,
  CheckCheck,
  ChevronLeft
} from 'lucide-react'
import { getWhatsAppChats, enviarMensajeWhatsApp } from '../../services/apiServices'

export const WhatsAppPage = () => {
  const [chats, setChats] = useState([])
  const [chatActivoId, setChatActivoId] = useState(null)
  const [mensajeTexto, setMensajeTexto] = useState('')
  const [cargando, setCargando] = useState(true)

  const cargarChats = async () => {
    const data = await getWhatsAppChats()
    setChats(data)
    setCargando(false)
  }

  useEffect(() => {
    cargarChats()
  }, [])

  const chatActivo = chats.find(c => c.id === chatActivoId)

  const handleEnviar = async (e) => {
    e.preventDefault()
    if (!mensajeTexto.trim() || !chatActivoId) return

    await enviarMensajeWhatsApp(chatActivoId, mensajeTexto)
    setMensajeTexto('')
    cargarChats()
  }

  // Vista de Chat individual (Pantalla completa móvil)
  if (chatActivo) {
    return (
      <div className="h-full flex flex-col -m-4 bg-[#F5EFEB]">
        {/* Header del Chat */}
        <div className="h-14 bg-white border-b border-[#EDE5DA] px-3 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setChatActivoId(null)}
              className="p-1 rounded-full hover:bg-[#FAF7F2] text-[#5C5047]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <img
              src={chatActivo.avatar}
              alt={chatActivo.clienteNombre}
              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-[#EDE5DA]"
            />
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-[#241E1C] truncate">{chatActivo.clienteNombre}</h4>
              <p className="text-[10px] text-[#2D7A58] font-medium">Belle AI en línea</p>
            </div>
          </div>
          <span className="text-[9px] font-bold bg-[#EBF5F0] text-[#2D7A58] px-2 py-0.5 rounded-full border border-[#CDE5D8] shrink-0">
            WhatsApp
          </span>
        </div>

        {/* Mensajes */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
          {chatActivo.mensajes.map((m) => {
            const esBot = m.remitente === 'bot'
            return (
              <div
                key={m.id}
                className={`flex flex-col ${esBot ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                    esBot
                      ? 'bg-white text-[#241E1C] rounded-tl-xs border border-[#EDE5DA]'
                      : 'bg-[#2D7A58] text-white rounded-tr-xs'
                  }`}
                >
                  {m.texto}

                  {m.toolEjecutada && (
                    <div className="mt-2 pt-2 border-t border-[#EDE5DA] flex items-start gap-1 text-[9px] font-mono text-[#581427] bg-[#FAF3EE] p-1.5 rounded-lg border border-[#ECD9CC]">
                      <Zap className="w-3 h-3 text-[#6E1C36] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-[#581427]">.NET 10 Tool:</p>
                        <p className="break-all">{m.toolEjecutada}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-[9px] text-[#96897E] px-1">
                  <span>{m.hora}</span>
                  {!esBot && <CheckCheck className="w-3 h-3 text-[#2D7A58]" />}
                </div>
              </div>
            )
          })}
        </div>

        {/* Input */}
        <form
          onSubmit={handleEnviar}
          className="p-2.5 bg-white border-t border-[#EDE5DA] flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={mensajeTexto}
            onChange={(e) => setMensajeTexto(e.target.value)}
            placeholder="Escribir mensaje..."
            className="flex-1 text-xs bg-[#FAF7F2] border border-[#EDE5DA] rounded-xl px-3 py-2 text-[#241E1C] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!mensajeTexto.trim()}
            className="p-2 bg-[#2D7A58] text-white rounded-xl disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5 text-[#E6CBA8]" />
          </button>
        </form>
      </div>
    )
  }

  // Vista de Lista de Chats Móvil
  return (
    <div className="space-y-3">
      <div>
        <span className="text-[10px] font-bold text-[#2D7A58] uppercase tracking-wider">
          Módulo 8 · WhatsApp
        </span>
        <h2 className="text-lg font-bold text-[#241E1C] tracking-tight">Chats con Clientes</h2>
        <p className="text-[11px] text-[#70645B]">
          Supervisa en vivo las respuestas y reservas creadas por el bot.
        </p>
      </div>

      <div className="space-y-2">
        {cargando ? (
          <div className="py-8 text-center text-[#96897E] text-xs">Cargando chats...</div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setChatActivoId(chat.id)}
              className="p-3 bg-white rounded-2xl border border-[#EDE5DA] shadow-xs flex items-center justify-between gap-3 active:scale-98 transition-transform cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={chat.avatar}
                  alt={chat.clienteNombre}
                  className="w-11 h-11 rounded-full object-cover shrink-0 ring-2 ring-[#EDE5DA]"
                />
                <div className="min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#241E1C] truncate">{chat.clienteNombre}</h4>
                    <span className="text-[10px] text-[#96897E]">{chat.hora}</span>
                  </div>
                  <p className="text-[11px] text-[#70645B] truncate mt-0.5">{chat.ultimoMensaje}</p>
                  <span className="inline-block mt-1 text-[9px] font-semibold text-[#2D7A58] bg-[#EBF5F0] px-1.5 py-0.2 rounded border border-[#CDE5D8]">
                    {chat.estadoBot}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
