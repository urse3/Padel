import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import DetalleReyClient from '@/components/app/DetalleReyClient'

export const revalidate = 0 // Sin caché

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DetalleReyPage({ params }: PageProps) {
  const { id } = await params
  const sb = await createClient()

  // 1. Obtener usuario de la sesión
  const {
    data: { user }
  } = await sb.auth.getUser()

  if (!user) {
    return null
  }

  // 2. Obtener rey de pista (con manejo de error explícito)
  const { data: rey, error: reyError } = await sb
    .from('rey_de_pista')
    .select(`
      *,
      creador:creador_id(id, full_name, email, avatar_url, nivel)
    `)
    .eq('id', id)
    .single()

  if (reyError || !rey) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error cargando el Rey de Pista</h1>
        <p className="text-slate-700">{reyError ? JSON.stringify(reyError) : 'No se encontró el registro'}</p>
        <p className="text-slate-500 mt-4 text-sm">ID buscado: {id}</p>
      </div>
    )
  }

  // 3. Obtener inscripciones
  const { data: inscripciones } = await sb
    .from('rey_inscripciones')
    .select(`
      *,
      jugador:jugador_id(id, full_name, email, avatar_url, nivel)
    `)
    .eq('rey_id', id)
    .order('posicion', { ascending: true })

  // 4. Obtener amigos (para invitar)
  const { data: rels } = await sb
    .from('amigos')
    .select(`
      estado,
      user1:usuario1_id(id, full_name, email, avatar_url, nivel),
      user2:usuario2_id(id, full_name, email, avatar_url, nivel)
    `)
    .eq('estado', 'aceptado')
    .or(`usuario1_id.eq.${user.id},usuario2_id.eq.${user.id}`)

  let amigos: any[] = []
  if (rels) {
    amigos = rels
      .filter((r: any) => r.user1 && r.user2)
      .map((r: any) => {
        if (r.user1.id === user.id) return r.user2
        return r.user1
      })
  }

  // 5. Cargar perfil del current user (para Elo)
  const { data: currentUserProfile } = await sb
    .from('profiles')
    .select('nivel')
    .eq('id', user.id)
    .single()

  return (
    <DetalleReyClient
      rey={rey}
      inscripciones={inscripciones || []}
      currentUserId={user.id}
      currentUserLevel={currentUserProfile?.nivel || 1.0}
      amigos={amigos}
    />
  )
}
