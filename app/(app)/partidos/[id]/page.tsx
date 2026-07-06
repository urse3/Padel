import React from 'react'
import { createClient } from '@/lib/supabase/server'
import DetallePartidoClient from '@/components/app/DetallePartidoClient'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DetallePartidoPage({ params }: PageProps) {
  const { id } = await params
  const sb = await createClient()

  // 1. Obtener sesión
  const {
    data: { user }
  } = await sb.auth.getUser()

  if (!user) return null

  // 2. Cargar datos del partido con creador e inscripciones
  const { data: partido, error } = await sb
    .from('partidos_abiertos')
    .select(`
      *,
      creador:creador_id(id, full_name, email, avatar_url, nivel),
      inscripciones(
        id,
        jugador:jugador_id(id, full_name, email, avatar_url, nivel)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !partido) {
    notFound()
  }

  // 3. Obtener el perfil completo del usuario actual para validar permisos (como el botón de confirmar resultado)
  const { data: profile } = await sb
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <DetallePartidoClient
      partido={partido as any}
      currentUserId={user.id}
      userProfile={profile}
    />
  )
}
