import React from 'react'
import { createClient } from '@/lib/supabase/server'
import TorneosClient from '@/components/app/TorneosClient'

export const revalidate = 0 // Listado siempre real

export default async function TorneosPage() {
  const sb = await createClient()

  // Obtener sesión
  const {
    data: { user }
  } = await sb.auth.getUser()

  if (!user) return null

  // Cargar torneos
  const { data: torneos } = await sb
    .from('torneos')
    .select('*')
    .order('fecha_inicio', { ascending: true })

  return (
    <TorneosClient 
      torneos={torneos || []} 
      currentUserId={user.id}
    />
  )
}
