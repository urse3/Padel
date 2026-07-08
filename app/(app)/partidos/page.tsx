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
    .order('fecha', { ascending: true })
    .order('hora', { ascending: true })

  // 3. Cargar notificaciones
  const { data: notificaciones } = await sb
    .from('notificaciones')
    .select('*')
    .eq('usuario_id', user.id)
    .eq('leido', false)
    .order('created_at', { ascending: false })

  return (
    <PartidosClient 
      partidos={partidos || []} 
      currentUserId={user.id} 
      notificaciones={notificaciones || []}
    />
  )
}
