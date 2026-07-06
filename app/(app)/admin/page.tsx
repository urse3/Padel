import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminClient from '@/components/app/AdminClient'

export const revalidate = 0 // Admin siempre real

export default async function AdminPage() {
  const sb = await createClient()

  // 1. Obtener sesión
  const {
    data: { user }
  } = await sb.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Verificar que sea admin
  const { data: profile } = await sb
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/dashboard')
  }

  // 3. Cargar todos los jugadores para gestionar perfiles
  const { data: jugadores } = await sb
    .from('profiles')
    .select('*')
    .order('nivel', { ascending: false })

  // 4. Cargar torneos
  const { data: torneos } = await sb
    .from('torneos')
    .select('*')
    .order('created_at', { ascending: false })

  // 5. Cargar todos los partidos de brackets de torneos para actualizarlos
  const { data: partidosTorneo } = await sb
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
      )
    `)
    .order('ronda', { ascending: true })
    .order('posicion', { ascending: true })

  // 6. Cargar inscripciones de todos los torneos
  const { data: inscripcionesTorneos } = await sb
    .from('inscripciones_torneo')
    .select(`
      *,
      j1:jugador1_id(id, full_name, email),
      j2:jugador2_id(id, full_name, email)
    `)
    .order('created_at', { ascending: true })

  // 7. Cargar pistas
  const { data: pistas } = await sb
    .from('pistas')
    .select('*')
    .order('nombre', { ascending: true })

  return (
    <AdminClient
      jugadores={jugadores || []}
      torneos={torneos || []}
      partidosTorneo={partidosTorneo || []}
      inscripcionesTorneos={inscripcionesTorneos || []}
      pistas={pistas || []}
      currentUserId={user.id}
    />
  )
}
