import React from 'react'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import PartidosPublicoClient from '@/components/landing/PartidosPublicoClient'
import { createClient } from '@/lib/supabase/server'
import { Swords } from 'lucide-react'

export const revalidate = 30

export default async function PartidosPublicoPage() {
  const sb = await createClient()

  // Partidos abiertos
  const { data: partidos_abiertos } = await sb
    .from('partidos_abiertos')
    .select('*')
    .order('fecha', { ascending: true })

  // Rey de pista
  const { data: rey_de_pista } = await sb
    .from('rey_de_pista')
    .select('*')
    .order('fecha', { ascending: true })

  // Últimos partidos completados (feed)
  const { data: partidos_completados } = await sb
    .from('partidos')
    .select(`
      id, created_at, sets_ganadores, sets_perdedores, tipo_actividad,
      ganador_1:ganador_1_id(full_name, email),
      ganador_2:ganador_2_id(full_name, email),
      perdedor_1:perdedor_1_id(full_name, email),
      perdedor_2:perdedor_2_id(full_name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <Header />

      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 pt-24 pb-8">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600">
              <Swords size={22} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 font-kanit">Partidos y Rey de Pista</h1>
          </div>
          <p className="text-sm text-slate-500 font-medium ml-14">
            Apúntate a partidos abiertos, reta en el Rey de Pista y consulta los resultados más recientes.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-5 w-full py-10 flex-1">
        <PartidosPublicoClient
          partidos_abiertos={(partidos_abiertos || []) as any}
          rey_de_pista={(rey_de_pista || []) as any}
          partidos_completados={(partidos_completados || []) as any}
        />
      </main>

      <Footer />
    </div>
  )
}
