import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatClient from '@/components/app/ChatClient'

export default async function ChatPage({ params }: { params: { id: string } }) {
  const sb = await createClient()

  const {
    data: { user }
  } = await sb.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Verificar que el amigo exista
  const { data: amigo } = await sb
    .from('profiles')
    .select('id, full_name, email, avatar_url, nivel')
    .eq('id', params.id)
    .single()

  if (!amigo) {
    redirect('/amigos')
  }

  // 2. Verificar que sean amigos confirmados
  const { data: amistad } = await sb
    .from('amigos')
    .select('id, estado')
    .or(`and(solicitante_id.eq.${user.id},receptor_id.eq.${params.id}),and(solicitante_id.eq.${params.id},receptor_id.eq.${user.id})`)
    .eq('estado', 'aceptada')
    .single()

  if (!amistad) {
    redirect('/amigos') // No son amigos confirmados
  }

  // 3. Cargar mensajes iniciales (últimos 50)
  const { data: mensajes } = await sb
    .from('mensajes_directos')
    .select('*')
    .or(`and(emisor_id.eq.${user.id},receptor_id.eq.${params.id}),and(emisor_id.eq.${params.id},receptor_id.eq.${user.id})`)
    .order('created_at', { ascending: true })
    .limit(50)

  // 4. Marcar como leídos los mensajes que ha recibido el usuario actual
  if (mensajes) {
    const noLeidos = mensajes.filter(m => m.receptor_id === user.id && !m.leido)
    if (noLeidos.length > 0) {
      await sb
        .from('mensajes_directos')
        .update({ leido: true })
        .eq('receptor_id', user.id)
        .eq('emisor_id', params.id)
        .eq('leido', false)
    }
  }

  return (
    <ChatClient
      currentUserId={user.id}
      amigo={amigo}
      initialMessages={mensajes || []}
    />
  )
}
