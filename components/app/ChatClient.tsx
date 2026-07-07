'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, ChevronLeft } from 'lucide-react'
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
  
  const sb = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll al final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [mensajes])

  useEffect(() => {
    // Suscripción a nuevos mensajes en tiempo real
    const channel = sb.channel(`chat_${currentUserId}_${amigo.id}`)
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
            
            // Marcar como leído
            sb.from('mensajes_directos')
              .update({ leido: true })
              .eq('id', newMsg.id)
              .then()
          }
        }
      )
      .subscribe()

    return () => {
      sb.removeChannel(channel)
    }
  }, [sb, currentUserId, amigo.id])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoMensaje.trim() || sending) return

    setSending(true)
    const text = nuevoMensaje.trim()
    setNuevoMensaje('')

    // Optimistic UI update
    const tempMsg: Mensaje = {
      id: 'temp-' + Date.now(),
      emisor_id: currentUserId,
      receptor_id: amigo.id,
      contenido: text,
      leido: false,
      created_at: new Date().toISOString()
    }
    setMensajes(prev => [...prev, tempMsg])

    try {
      const { data, error } = await sb
        .from('mensajes_directos')
        .insert({
          emisor_id: currentUserId,
          receptor_id: amigo.id,
          contenido: text
        })
        .select()
        .single()

      if (error) throw error

      // Update con el ID real
      setMensajes(prev => prev.map(m => m.id === tempMsg.id ? data : m))
    } catch (err) {
      console.error('Error enviando mensaje:', err)
      // Eliminar el mensaje optimista
      setMensajes(prev => prev.filter(m => m.id !== tempMsg.id))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 relative">

      {/* Header fijo superior */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/amigos" className="p-2 -ml-2 rounded-full text-slate-400 hover:bg-slate-100 transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <div className="flex items-center gap-2">
            <PlayerAvatar name={amigo.full_name || amigo.email} avatarUrl={amigo.avatar_url} size="sm" />
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 font-kanit">
                {amigo.full_name || amigo.email.split('@')[0]}
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">Nivel {amigo.nivel}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Área de Mensajes — padding inferior para el input + bottom nav */}
      <main className="flex-1 overflow-y-auto p-4 pb-36 space-y-4">
        {mensajes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
            <p className="text-sm font-semibold mb-2">Comienza una conversación con {amigo.full_name || amigo.email.split('@')[0]}</p>
            <p className="text-xs">Usa este chat para organizar partidos o charlar.</p>
          </div>
        ) : (
          mensajes.map((m) => {
            const isMine = m.emisor_id === currentUserId
            return (
              <div key={m.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                    isMine 
                      ? 'bg-brand-600 text-white rounded-br-sm' 
                      : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm shadow-sm'
                  }`}
                >
                  {/* El renderizado de enlaces podría hacerse aquí si se detecta 'http' */}
                  {m.contenido.includes('http') ? (
                    <span dangerouslySetInnerHTML={{
                      __html: m.contenido.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="underline font-bold">Enlace del partido</a>')
                    }} />
                  ) : (
                    m.contenido
                  )}
                </div>
                <span className="text-[9px] text-slate-400 font-semibold mt-1 px-1">
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isMine && m.leido && ' · Visto'}
                </span>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input fijo abajo (flotando sobre el bottom nav) */}
      <div className="fixed bottom-[72px] left-0 right-0 bg-white border-t border-slate-100 p-3 z-20">
        <form onSubmit={handleSend} className="flex gap-2 max-w-md mx-auto">
          <input
            type="text"
            value={nuevoMensaje}
            onChange={e => setNuevoMensaje(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-brand-500 transition-colors"
          />
          <button 
            type="submit" 
            disabled={!nuevoMensaje.trim() || sending}
            className="p-3 bg-brand-600 text-white rounded-full flex-shrink-0 disabled:opacity-50 disabled:bg-slate-300 transition-colors shadow-sm"
          >
            <Send size={18} className="translate-x-[1px]" />
          </button>
        </form>
      </div>

    </div>
  )
}
