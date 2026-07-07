'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, ChevronLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import PlayerAvatar from '@/components/PlayerAvatar'

interface Mensaje {
  id: string
  emisor_id: string
  receptor_id: string
  contenido: string
  leido: boolean
  created_at: string
}

interface ChatClientProps {
  currentUserId: string
  amigo: {
    id: string
    full_name: string | null
    email: string
    avatar_url: string | null
    nivel: number
  }
  initialMessages: Mensaje[]
}

export default function ChatClient({ currentUserId, amigo, initialMessages }: ChatClientProps) {
  const [mensajes, setMensajes] = useState<Mensaje[]>(initialMessages)
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [sending, setSending] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const sb = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [mensajes])

  // Suscripción Realtime a mensajes entrantes
  useEffect(() => {
    const channel = sb
      .channel(`direct_chat_${[currentUserId, amigo.id].sort().join('_')}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes_directos',
          filter: `receptor_id=eq.${currentUserId}`
        },
        (payload) => {
          const newMsg = payload.new as Mensaje
          if (newMsg.emisor_id === amigo.id) {
            setMensajes(prev => [...prev, newMsg])
            sb.from('mensajes_directos').update({ leido: true }).eq('id', newMsg.id).then()
          }
        }
      )
      .subscribe()

    return () => { sb.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, amigo.id])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = nuevoMensaje.trim()
    if (!text || sending) return

    setSending(true)
    setErrorMsg(null)
    setNuevoMensaje('')

    // UI optimista
    const tempId = 'temp-' + Date.now()
    const tempMsg: Mensaje = {
      id: tempId,
      emisor_id: currentUserId,
      receptor_id: amigo.id,
      contenido: text,
      leido: false,
      created_at: new Date().toISOString()
    }
    setMensajes(prev => [...prev, tempMsg])

    const { data, error } = await sb
      .from('mensajes_directos')
      .insert({ emisor_id: currentUserId, receptor_id: amigo.id, contenido: text })
      .select()
      .single()

    if (error) {
      console.error('Error enviando:', error)
      setErrorMsg('No se pudo enviar el mensaje. Comprueba tu conexión.')
      setMensajes(prev => prev.filter(m => m.id !== tempId))
    } else {
      setMensajes(prev => prev.map(m => m.id === tempId ? data : m))
    }

    setSending(false)
  }

  const amigoNombre = amigo.full_name || amigo.email.split('@')[0]

  return (
    <div className="flex flex-col -mb-24" style={{ height: 'calc(100dvh - 72px)' }}>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <Link href="/amigos" className="p-1.5 -ml-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition-colors">
          <ChevronLeft size={22} />
        </Link>
        <PlayerAvatar name={amigoNombre} avatarUrl={amigo.avatar_url} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-slate-800 font-kanit truncate">{amigoNombre}</p>
          <p className="text-[10px] text-slate-400 font-medium">Nivel {Number(amigo.nivel).toFixed(2)}</p>
        </div>
      </div>

      {/* Área de mensajes — crece y es scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50/50">
        {mensajes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 gap-2 pt-16">
            <p className="text-sm font-semibold">Empieza a hablar con {amigoNombre}</p>
            <p className="text-xs">Usa este chat para organizar partidos o charlar.</p>
          </div>
        ) : (
          mensajes.map((m) => {
            const isMine = m.emisor_id === currentUserId
            return (
              <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[78%]">
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                      isMine
                        ? 'bg-brand-600 text-white rounded-br-sm'
                        : 'bg-white border border-slate-100 text-slate-700 shadow-sm rounded-bl-sm'
                    }`}
                  >
                    {m.contenido.startsWith('http') || m.contenido.includes(' http') ? (
                      <span dangerouslySetInnerHTML={{
                        __html: m.contenido.replace(
                          /(https?:\/\/[^\s]+)/g,
                          '<a href="$1" target="_blank" rel="noopener" class="underline font-bold">Ver partido ↗</a>'
                        )
                      }} />
                    ) : m.contenido}
                  </div>
                  <p className={`text-[9px] text-slate-400 mt-0.5 font-semibold ${isMine ? 'text-right' : 'text-left'}`}>
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isMine && m.leido && ' · Visto'}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-100 flex items-center gap-2 text-xs text-red-600 font-semibold flex-shrink-0">
          <AlertCircle size={14} /> {errorMsg}
        </div>
      )}

      {/* Input de escritura — pegado al fondo */}
      <div className="flex-shrink-0 bg-white border-t border-slate-100 px-3 py-3">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={nuevoMensaje}
            onChange={e => setNuevoMensaje(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
          />
          <button
            type="submit"
            disabled={!nuevoMensaje.trim() || sending}
            className="w-10 h-10 flex-shrink-0 bg-brand-600 text-white rounded-full flex items-center justify-center disabled:opacity-40 disabled:bg-slate-300 transition-all active:scale-95"
          >
            <Send size={16} className="translate-x-[1px]" />
          </button>
        </form>
      </div>

    </div>
  )
}
