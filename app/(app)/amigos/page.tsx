import React from 'react'
import { createClient } from '@/lib/supabase/server'
import AmigosClient from '@/components/app/AmigosClient'

export const revalidate = 0 // En tiempo real

export default async function AmigosPage() {
  const sb = await createClient()

  // 1. Obtener sesión
  const {
    data: { user }
  } = await sb.auth.getUser()

  if (!user) return null

  // 2. Cargar todas las relaciones de amigos donde participa el usuario
  const { data: relaciones } = await sb
    .from('amigos')
    .select(`
      *,
      solicitante:solicitante_id(id, full_name, email, avatar_url, nivel),
      receptor:receptor_id(id, full_name, email, avatar_url, nivel)
    `)
    .or(`solicitante_id.eq.${user.id},receptor_id.eq.${user.id}`)

  // 3. Cargar todos los usuarios registrados (excluyendo al usuario actual) para poder buscarlos
  const { data: todosUsuarios } = await sb
    .from('profiles')
    .select('id, full_name, email, avatar_url, nivel')
    .neq('id', user.id)
    .order('full_name', { ascending: true })

  // 4. Obtener mensajes no leídos agrupados por emisor
  let unreadCounts: Record<string, number> = {}
  try {
    const { data: unreadData } = await sb
      .from('mensajes_directos')
      .select('emisor_id')
      .eq('receptor_id', user.id)
      .eq('leido', false)
    
    if (unreadData) {
      unreadData.forEach(msg => {
        unreadCounts[msg.emisor_id] = (unreadCounts[msg.emisor_id] || 0) + 1
      })
    }
  } catch (e) {
    // Si la tabla no existe o error, ignorar
  }

  return (
    <AmigosClient
      relaciones={relaciones || []}
      todosUsuarios={todosUsuarios || []}
      currentUserId={user.id}
      unreadCounts={unreadCounts}
    />
  )
}
