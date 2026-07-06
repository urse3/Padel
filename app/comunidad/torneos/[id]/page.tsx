import React from 'react'
import { createClient } from '@/lib/supabase/server'
import DetalleTorneoClient from '@/components/app/DetalleTorneoClient'
import { notFound } from 'next/navigation'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DetalleTorneoPage({ params }: PageProps) {
  const { id } = await params
  const sb = await createClient()

  // 1. Obtener sesión si existe
  const {
    data: { user }
  } = await sb.auth.getUser()

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
  let todosJugadores: any[] = []
  let profile = null
  if (user) {
    const { data: jugadores } = await sb
      .from('profiles')
      .select('id, full_name, email, nivel, is_admin')
      .neq('id', user.id)
      .order('full_name', { ascending: true })
    
    if (jugadores) todosJugadores = jugadores

    const { data: p } = await sb.from('profiles').select('*').eq('id', user.id).single()
    if (p) profile = p
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 max-w-md w-full mx-auto pb-24 pt-20 px-4 animate-fade-in">
        <DetalleTorneoClient
          torneo={torneo as any}
          inscripciones={(inscripciones as any) || []}
          partidos={(partidos as any) || []}
          currentUserId={user?.id || null}
          userProfile={profile}
          todosJugadores={todosJugadores || []}
        />
      </main>
      <Footer />
    </div>
  )
}
