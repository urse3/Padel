import React from 'react'
import { createClient } from '@/lib/supabase/server'
import NuevoReyClient from '@/components/app/NuevoReyClient'

export default async function NuevoReyPage() {
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
    <NuevoReyClient 
      userId={user.id} 
      pistas={pistas || []}
    />
  )
}
