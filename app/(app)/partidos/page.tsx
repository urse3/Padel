import React from 'react'
import { createClient } from '@/lib/supabase/server'
import PartidosClient from '@/components/app/PartidosClient'

export const revalidate = 0 // Muro siempre en tiempo real / sin caché

export default async function PartidosPage() {
  const sb = await createClient()

  // 1. Obtener sesión
  const {
    data: { user }
  } = await sb.auth.getUser()

  if (!user) return null

  // 2. Cargar partidos abiertos y sus detalles
  // Para hacer joins correctos, seleccionamos creador e inscripciones
  const { data: partidos } = await sb
    .from('partidos_abiertos')
    .select(`
      *,
      creador:creador_id(id, full_name, email, avatar_url),
      inscripciones(
        id,
        jugador:jugador_id(id, full_name, email, avatar_url, nivel)
      )
    `)

  // 3. Cargar rey de pista
  const { data: reyes } = await sb
    .from('rey_de_pista')
    .select(`
      *,
      creador:creador_id(id, full_name, email, avatar_url),
      inscripciones:rey_inscripciones(
        id,
        jugador:jugador_id(id, full_name, email, avatar_url, nivel)
      )
    `)

  const combinados = [
    ...(partidos || []).map(p => ({ ...p, tipo: 'partido' })),
    ...(reyes || []).map(r => ({ ...r, tipo: 'rey_pista' }))
  ].sort((a, b) => {
    const timeA = new Date(`${a.fecha}T${a.hora}`).getTime()
    const timeB = new Date(`${b.fecha}T${b.hora}`).getTime()
    return timeA - timeB
  })

  // 3. Cargar notificaciones
  const { data: notificaciones } = await sb
    .from('notificaciones')
    .select('*')
    .eq('usuario_id', user.id)
    .eq('leido', false)
    .order('created_at', { ascending: false })

  return (
    <PartidosClient 
      partidos={combinados} 
      currentUserId={user.id} 
      notificaciones={notificaciones || []}
    />
  )
}
