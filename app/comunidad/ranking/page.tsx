import React from 'react'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import RankingPublicoClient from '@/components/landing/RankingPublicoClient'
import { createClient } from '@/lib/supabase/server'
import { Trophy } from 'lucide-react'

export const revalidate = 120

export default async function RankingPublicoPage() {
  const sb = await createClient()

  const { data: players } = await sb
    .from('profiles')
    .select('id, full_name, email, nivel, victorias, partidos, racha, avatar_url')
    .order('nivel', { ascending: false })

  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <Header />

      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 pt-24 pb-8">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
              <Trophy size={22} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 font-kanit">Ranking</h1>
          </div>
          <p className="text-sm text-slate-500 font-medium ml-14">
            Los jugadores con el nivel mas alto de Punto de Padel. ¡Registra tus victorias y sube de posición!
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-5 w-full py-10 flex-1">
        <RankingPublicoClient players={players || []} />
      </main>

      <Footer />
    </div>
  )
}
