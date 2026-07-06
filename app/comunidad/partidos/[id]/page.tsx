import React from 'react'
import { createClient } from '@/lib/supabase/server'
import DetallePartidoClient from '@/components/app/DetallePartidoClient'
import { notFound } from 'next/navigation'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DetallePartidoPage({ params }: PageProps) {
  const { id } = await params
  const sb = await createClient()

  // 1. Obtener sesión si existe
  const {
    data: { user }
  } = await sb.auth.getUser()

  // 2. Cargar datos del partido con creador e inscripciones
  const { data: partido, error } = await sb
    .from('partidos_abiertos')
    .select(`
      *,
      creador:creador_id(id, full_name, email, avatar_url, nivel),
      inscripciones(
        id,
        estado,
        jugador:jugador_id(id, full_name, email, avatar_url, nivel)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !partido) {
    notFound()
  }

  // 3. Obtener el perfil completo del usuario actual (solo si está logueado)
  let profile = null
  if (user) {
    const { data } = await sb
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  // Como la ruta ya no está en (app) y no tiene el layout de bottomnav, 
  // le ponemos un header y footer para cuando la vea alguien público
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 max-w-md w-full mx-auto pb-24 pt-20 px-4 animate-fade-in">
        <DetallePartidoClient
          partido={partido as any}
          currentUserId={user?.id || null}
          userProfile={profile}
        />
      </main>
      <Footer />
    </div>
  )
}
