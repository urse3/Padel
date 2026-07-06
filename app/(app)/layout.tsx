import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/app/BottomNav'

export default async function AppLayout({
  children
}: {
  children: React.ReactNode
}) {
  const sb = await createClient()

  // Comprobar autenticación
  const {
    data: { user },
    error: authError
  } = await sb.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Comprobar si el usuario es administrador
  const { data: profile } = await sb
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const isAdmin = !!profile?.is_admin

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Contenido principal con ancho máximo para simular app móvil y padding para bottom nav */}
      <main className="flex-1 w-full max-w-md mx-auto bg-white min-h-screen shadow-md pb-24 relative overflow-x-hidden">
        {children}
      </main>

      {/* Nav de la aplicación */}
      <BottomNav isAdmin={isAdmin} />
    </div>
  )
}
