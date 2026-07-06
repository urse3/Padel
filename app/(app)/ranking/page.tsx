import React from 'react'
import { createClient } from '@/lib/supabase/server'
import RankingClient from '@/components/app/RankingClient'

export const revalidate = 30 // Revalidar ranking cada 30 segundos

export default async function RankingPage() {
  const sb = await createClient()

  // 1. Obtener sesión
  const {
    data: { user }
  } = await sb.auth.getUser()

  if (!user) return null

  // 2. Obtener lista completa de jugadores para el ranking
  const { data: players } = await sb
    .from('profiles')
    .select('id, full_name, email, nivel, racha, victorias, partidos, avatar_url')
    .order('nivel', { ascending: false })

  return (
    <RankingClient 
      players={players || []} 
      currentUserId={user.id} 
    />
  )
}
