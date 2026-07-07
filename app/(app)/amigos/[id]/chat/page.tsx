import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatClient from '@/components/app/ChatClient'

export const revalidate = 0

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const sb = await createClient()

  const {
    data: { user }
  } = await sb.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const resolvedParams = await params
  const amigoId = resolvedParams.id

  // 1. Verificar que el amigo exista
  const { data: amigo } = await sb
    .from('profiles')
    .select('id, full_name, email, avatar_url, nivel')
    .eq('id', amigoId)
    .maybeSingle()

  if (!amigo) {
    redirect('/amigos')
  }

  // 2. Cargar mensajes (si la tabla ya existe; si no, se devuelve array vacío)
  let mensajes: any[] = []
  try {
    const { data, error } = await sb
      .from('mensajes_directos')
      .select('*')
      .or(`and(emisor_id.eq.${user.id},receptor_id.eq.${amigoId}),and(emisor_id.eq.${amigoId},receptor_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
      .limit(100)

    if (!error && data) {
      mensajes = data

      // Marcar como leídos los recibidos
      const noLeidos = data.filter((m: any) => m.receptor_id === user.id && !m.leido)
      if (noLeidos.length > 0) {
        await sb
          .from('mensajes_directos')
          .update({ leido: true })
          .eq('receptor_id', user.id)
          .eq('emisor_id', amigoId)
          .eq('leido', false)
      }
    }
  } catch {
    // La tabla aún no existe, se muestra chat vacío
  }

  return (
    <ChatClient
      currentUserId={user.id}
      amigo={amigo}
      initialMessages={mensajes}
    />
  )
}

