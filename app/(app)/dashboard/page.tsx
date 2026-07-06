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
      // Inscribir automáticamente al jugador en el partido
      await sb
        .from('inscripciones')
        .insert({
          partido_id: pendingInviteId,
          jugador_id: user.id
        })
    } catch (e) {
      console.error('Error auto-enrolling player:', e)
    } finally {
      // Borrar la cookie (escribiendo una con maxAge=0)
      cookieStore.set('pending_invite_partido_id', '', { maxAge: 0, path: '/' })
      
      // Redirigir al partido
      redirect(`/partidos/${pendingInviteId}`)
    }
  }

  // 3. Obtener el perfil completo del usuario
  const { data: profile } = await sb
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 4. Obtener los últimos 5 partidos jugados por este usuario
  const { data: partidos } = await sb
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
    .order('created_at', { ascending: false })

  return (
    <DashboardClient 
      user={user} 
      profile={profile} 
      partidos={(partidos as any) || []} 
    />
  )
}
