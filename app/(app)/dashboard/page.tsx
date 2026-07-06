import React from 'react'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/app/DashboardClient'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const sb = await createClient()

  // 1. Obtener usuario de la sesión
  const {
    data: { user }
  } = await sb.auth.getUser()

  if (!user) {
    return null
  }

  // 2. Comprobar si hay una invitación a partido pendiente en las cookies
  const cookieStore = await cookies()
  const pendingInviteId = cookieStore.get('pending_invite_partido_id')?.value

  if (pendingInviteId) {
    try {
      await sb
        .from('inscripciones')
        .insert({
          partido_id: pendingInviteId,
          jugador_id: user.id
        })
    } catch (e) {
      console.error('Error auto-enrolling player:', e)
    } finally {
      cookieStore.set('pending_invite_partido_id', '', { maxAge: 0, path: '/' })
      redirect(`/comunidad/partidos/${pendingInviteId}`)
    }
  }

  // 3. Fetch en paralelo: perfil + historial + agenda (todo en servidor, una sola round-trip)
  const [profileResult, partidosResult, agendaPartidosResult, agendaReyesResult] = await Promise.all([
    // Perfil del usuario
    sb.from('profiles').select('*').eq('id', user.id).single(),

    // Historial de partidos (todos, paginamos en cliente)
    sb
      .from('partidos')
      .select(`
        id,
        created_at,
        sets_ganadores,
        sets_perdedores,
        tipo_actividad,
        delta_nivel,
        ganador_1_id,
        ganador_2_id,
        perdedor_1_id,
        perdedor_2_id,
        ganador_1:ganador_1_id(full_name, email),
        ganador_2:ganador_2_id(full_name, email),
        perdedor_1:perdedor_1_id(full_name, email),
        perdedor_2:perdedor_2_id(full_name, email)
      `)
      .or(`ganador_1_id.eq.${user.id},ganador_2_id.eq.${user.id},perdedor_1_id.eq.${user.id},perdedor_2_id.eq.${user.id}`)
      .order('created_at', { ascending: false }),

    // Agenda: partidos abiertos en los que está inscrito
    sb
      .from('inscripciones')
      .select('partido_id, partidos_abiertos(*)')
      .eq('jugador_id', user.id),

    // Agenda: reys de pista en los que está inscrito
    sb
      .from('rey_inscripciones')
      .select('rey_id, rey_de_pista(*)')
      .eq('jugador_id', user.id),
  ])

  const profile = profileResult.data
  const partidos = (partidosResult.data as any) || []

  // Construir la agenda de actividades
  const agendaPartidos = (agendaPartidosResult.data || [])
    .map((i: any) => i.partidos_abiertos ? { ...i.partidos_abiertos, tipo: 'partido' } : null)
    .filter(Boolean)
  const agendaReyes = (agendaReyesResult.data || [])
    .map((i: any) => i.rey_de_pista ? { ...i.rey_de_pista, tipo: 'rey_pista' } : null)
    .filter(Boolean)

  const agenda = [...agendaPartidos, ...agendaReyes].sort((a: any, b: any) => {
    const dateA = new Date(`${a.fecha}T${a.hora}`)
    const dateB = new Date(`${b.fecha}T${b.hora}`)
    return dateA.getTime() - dateB.getTime()
  })

  return (
    <DashboardClient
      user={user}
      profile={profile}
      partidos={partidos}
      agenda={agenda}
    />
  )
}
