'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function processPendingInvite(inviteId: string) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  
  if (user) {
    try {
      await sb
        .from('inscripciones')
        .insert({
          partido_id: inviteId,
          jugador_id: user.id
        })
    } catch (e) {
      console.error('Error auto-enrolling player:', e)
    }
  }

  const cookieStore = await cookies()
  cookieStore.set('pending_invite_partido_id', '', { maxAge: 0, path: '/' })
  
  redirect(`/comunidad/partidos/${inviteId}`)
}
