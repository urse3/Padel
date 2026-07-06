import React from 'react'
import { createClient } from '@/lib/supabase/server'
import DetalleTorneoClient from '@/components/app/DetalleTorneoClient'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DetalleTorneoPage({ params }: PageProps) {
  const { id } = await params
  const sb = await createClient()

  // 1. Obtener sesión
  const {
    data: { user }
  } = await sb.auth.getUser()

  if (!user) return null

  // 2. Cargar torneo
  const { data: torneo, error: errorTorneo } = await sb
    .from('torneos')
    .select('*')
    .eq('id', id)
    .single()

  if (errorTorneo || !torneo) {
    notFound()
  }

  // 3. Cargar parejas inscritas
  const { data: inscripciones } = await sb
    .from('inscripciones_torneo')
    .select(`
      *,
      j1:jugador1_id(id, full_name, email, avatar_url, nivel),
      j2:jugador2_id(id, full_name, email, avatar_url, nivel)
    `)
    .eq('torneo_id', id)

  // 4. Cargar partidos del bracket del torneo
  const { data: partidos } = await sb
    .from('partidos_torneo')
    .select(`
      *,
      pareja1:pareja1_id(
        id,
        j1:jugador1_id(id, full_name, email),
        j2:jugador2_id(id, full_name, email)
      ),
      pareja2:pareja2_id(
        id,
        j1:jugador1_id(id, full_name, email),
        j2:jugador2_id(id, full_name, email)
      ),
      ganador:ganador_id(
        id,
        j1:jugador1_id(id, full_name, email),
        j2:jugador2_id(id, full_name, email)
      )
    `)
    .eq('torneo_id', id)
    .order('ronda', { ascending: true })
    .order('posicion', { ascending: true })

  // 5. Cargar todos los jugadores para el modal de inscripción (para elegir pareja)
  const { data: todosJugadores } = await sb
    .from('profiles')
    .select('id, full_name, email, nivel')
    .neq('id', user.id)
    .order('full_name', { ascending: true })

  return (
    <DetalleTorneoClient
      torneo={torneo as any}
      inscripciones={(inscripciones as any) || []}
      partidos={(partidos as any) || []}
      currentUserId={user.id}
      todosJugadores={todosJugadores || []}
    />
  )
}
