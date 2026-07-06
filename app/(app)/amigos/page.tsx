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

  return (
    <AmigosClient
      relaciones={relaciones || []}
      todosUsuarios={todosUsuarios || []}
      currentUserId={user.id}
    />
  )
}
