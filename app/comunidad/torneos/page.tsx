import React from 'react'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import TorneosPublicoClient from '@/components/landing/TorneosPublicoClient'
import { createClient } from '@/lib/supabase/server'
import { Trophy } from 'lucide-react'

export const revalidate = 60

export default async function TorneosPublicoPage() {
  const sb = await createClient()

  const { data: torneos } = await sb
    .from('torneos')
    .select('*')
    .order('fecha_inicio', { ascending: false })

  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <Header />

      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 pt-24 pb-8">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-green-50 border border-green-100 text-green-600">
              <Trophy size={22} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 font-kanit">Torneos</h1>
          </div>
          <p className="text-sm text-slate-500 font-medium ml-14">
            Inscríbete en los próximos torneos y demuestra quién es el rey de la pista.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-5 w-full py-10 flex-1">
        <TorneosPublicoClient torneos={torneos || []} />
      </main>

      <Footer />
    </div>
  )
}
