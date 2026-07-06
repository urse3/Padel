import React from 'react'
import { createClient } from '@/lib/supabase/server'
import NuevoPartidoClient from '@/components/app/NuevoPartidoClient'

export default async function NuevoPartidoPage() {
  const sb = await createClient()

  // Obtener sesión
  const {
    data: { user }
  } = await sb.auth.getUser()

  if (!user) return null

  // Cargar pistas
  const { data: pistas } = await sb
    .from('pistas')
    .select('*')
    .order('nombre', { ascending: true })

  return (
    <NuevoPartidoClient 
      userId={user.id} 
      pistas={pistas || []}
    />
  )
}
