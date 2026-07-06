import React from 'react'
import Header from '@/components/landing/Header'
import HeroSection from '@/components/landing/HeroSection'
import MatchFeed from '@/components/landing/MatchFeed'
import RankingMovements from '@/components/landing/RankingMovements'
import EventsSection from '@/components/landing/EventsSection'
import Footer from '@/components/landing/Footer'
import PlayerAvatar from '@/components/PlayerAvatar'
import LevelBadge from '@/components/LevelBadge'
import { createClient } from '@/lib/supabase/server'
import { Trophy, Star, Activity, Plus } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 60 // Revalidar cada 60 segundos

export default async function Home() {
  const sb = await createClient()

  // Cargar Top 3 jugadores
  const { data: topPlayers } = await sb
    .from('profiles')
    .select('id, full_name, email, nivel, victorias, partidos')
    .order('nivel', { ascending: false })
    .limit(3)

  // Asignar podio en orden [2º, 1º, 3º] para pintarlo visualmente correcto
  let podio: any[] = []
  if (topPlayers && topPlayers.length > 0) {
    const list = [...topPlayers]
    const p1 = list[0]
    const p2 = list[1]
    const p3 = list[2]

    podio = [p2, p1, p3].filter(Boolean)
  }

  const medals = ['🥈', '🥇', '🥉']
  const medalColors = ['border-slate-200', 'border-amber-200', 'border-amber-100']
  const podioBg = ['bg-slate-50', 'bg-amber-50/70', 'bg-amber-50/30']
  const podioText = ['text-slate-700', 'text-amber-700', 'text-amber-800']
  const heights = ['h-32', 'h-40', 'h-28']

  return (
    <div className="min-h-screen flex flex-col bg-surface-50 animate-fade-in">
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Contenido Dinámico de la Comunidad */}
      <main className="max-w-6xl mx-auto px-5 w-full py-16 space-y-24">
        
        {/* Sección: Resultados y Actividad */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Col 1 & 2: Match Feed (Feed de partidos en directo) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-brand-50 border border-brand-100 text-brand-600">
                <Activity size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 font-kanit">Actividad en Vivo</h2>
                <p className="text-xs text-slate-500 font-medium">Resultados recientes actualizados al minuto</p>
              </div>
            </div>
            <MatchFeed />
          </div>

          {/* Col 3: Movimientos de Ranking */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-brand-50 border border-brand-100 text-brand-600">
                <Star size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 font-kanit">Rachas y Subidas</h2>
                <p className="text-xs text-slate-500 font-medium">Quién destaca en la comunidad</p>
              </div>
            </div>
            <RankingMovements />
          </div>
        </section>

        {/* Sección: Ranking / Podio TOP 3 */}
        <section id="ranking" className="scroll-mt-20 space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-2.5 bg-amber-50 border border-amber-100 rounded-2xl text-amber-600">
              <Trophy size={24} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 font-kanit">Ranking General</h2>
            <p className="text-sm text-slate-500 font-medium max-w-md mx-auto">
              Los jugadores con el nivel más alto de nuestra comunidad. ¡Registra tus victorias y sube de posición!
            </p>
          </div>

          {podio.length > 0 ? (
            <div className="flex flex-col items-center gap-6">
              {/* Podio visual */}
              <div className="flex items-end justify-center gap-4 sm:gap-6 w-full max-w-lg pt-10">
                {podio.map((p, idx) => {
                  const place = topPlayers?.findIndex(pl => pl.id === p.id) ?? 0
                  return (
                    <div key={p.id} className="flex flex-col items-center gap-3 flex-1 min-w-0">
                      <div className="text-2xl sm:text-3xl">{medals[place]}</div>
                      <div
                        className={`w-full ${heights[place]} ${podioBg[place]} border ${medalColors[place]} rounded-2xl shadow-card flex flex-col items-center justify-end pb-4 px-2 hover:scale-[1.03] transition-all duration-300 relative`}
                      >
                        <PlayerAvatar
                          name={p.full_name || p.email}
                          size="md"
                          className="absolute -top-6 left-1/2 -translate-x-1/2 shadow-md border-2 border-white"
                        />
                        <p className="text-slate-800 text-xs sm:text-sm font-extrabold truncate w-full text-center px-1">
                          {(p.full_name || p.email).split(' ')[0]}
                        </p>
                        <p className={`text-base sm:text-lg font-black font-kanit mt-1 ${podioText[place]}`}>
                          {parseFloat(p.nivel).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Botón ver ranking completo */}
              <Link href="/login" className="btn-secondary py-3 px-6 text-sm shadow-sm font-bold">
                Ver clasificación completa
              </Link>
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50 border border-slate-100 rounded-2xl">
              <p className="text-sm font-semibold text-slate-500">Aún no se han registrado perfiles de jugadores</p>
            </div>
          )}
        </section>

        {/* Sección: Torneos y Eventos */}
        <section id="torneos" className="scroll-mt-20 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-2xl font-black text-slate-900 font-kanit">Torneos y Competiciones</h2>
              <p className="text-xs text-slate-500 font-medium">Inscríbete y demuestra quién es el rey de la pista</p>
            </div>
            <Link href="/login" className="btn-secondary py-2 px-4 text-xs font-bold">
              Ver todos los torneos
            </Link>
          </div>
          <EventsSection />
        </section>

        {/* Sección: Sobre Nosotros (Static Content) */}
        <section id="sobre-nosotros" className="scroll-mt-20 card p-8 sm:p-12 relative overflow-hidden bg-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="max-w-2xl space-y-6">
            <h2 className="text-2xl font-black text-slate-900 font-kanit">¿Qué es Punto de Padel?</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              Punto de Padel nació para resolver un problema clásico de los grupos de amigos: ¿quién es el mejor realmente? Con nuestro algoritmo de nivelación de 0.0 a 10.0 (estilo Playtomic), cada partido oficial, Rey de Pista o torneo oficial cuenta. Si ganas a una pareja con mejor ranking, subirás más rápido. ¡Equilibra los partidos y disfruta del pádel al máximo!
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex-1 min-w-[150px]">
                <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wider mb-0.5">Matchmaking</h3>
                <p className="text-xs text-slate-500">Crea partidos abiertos o únete a los de otros miembros.</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex-1 min-w-[150px]">
                <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wider mb-0.5">Rey de Pista</h3>
                <p className="text-xs text-slate-500">Sube el nivel y quédate en la pista si mantienes la victoria.</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex-1 min-w-[150px]">
                <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wider mb-0.5">Brackets Oficiales</h3>
                <p className="text-xs text-slate-500">Gestión de llaves de eliminación y finales oficiales.</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
