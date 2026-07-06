'use client'

import React, { useState } from 'react'
import { Calendar, Clock, MapPin, Swords, ArrowRight, CheckCircle, Activity } from 'lucide-react'
import Link from 'next/link'
import { formatDateShort } from '@/lib/utils'

interface PartidoAbierto {
  id: string
  club: string
  fecha: string
  hora: string
  nivel_min: number
  nivel_max: number
  estado: string
}

interface ReyDePista {
  id: string
  club: string
  fecha: string
  hora: string
  nivel_min: number
  nivel_max: number
  estado: string
}

interface PartidoCompletado {
  id: string
  created_at: string
  sets_ganadores: string
  sets_perdedores: string
  tipo_actividad: string
  ganador_1: { full_name: string; email: string } | null
  ganador_2: { full_name: string; email: string } | null
  perdedor_1: { full_name: string; email: string } | null
  perdedor_2: { full_name: string; email: string } | null
}

interface Props {
  partidos_abiertos: PartidoAbierto[]
  rey_de_pista: ReyDePista[]
  partidos_completados: PartidoCompletado[]
}

const TABS = [
  { id: 'agenda', label: 'Agenda / Próximos', icon: Calendar },
  { id: 'resultados', label: 'Resultados', icon: CheckCircle },
]

const ITEMS_PER_PAGE = 8

export default function PartidosPublicoClient({ partidos_abiertos, rey_de_pista, partidos_completados }: Props) {
  const [activeTab, setActiveTab] = useState<'agenda' | 'resultados'>('agenda')
  const [page, setPage] = useState(1)

  const agendaItems = [
    ...partidos_abiertos.map(p => ({ ...p, tipo: 'partido' as const })),
    ...rey_de_pista.map(r => ({ ...r, tipo: 'rey' as const })),
  ].sort((a, b) => new Date(a.fecha + 'T' + (a.hora || '00:00')).getTime() - new Date(b.fecha + 'T' + (b.hora || '00:00')).getTime())

  const totalResultPages = Math.ceil(partidos_completados.length / ITEMS_PER_PAGE)
  const visibleResultados = partidos_completados.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleTab = (tab: 'agenda' | 'resultados') => {
    setActiveTab(tab)
    setPage(1)
  }

  const parseSets = (gStr: string, pStr: string) => {
    const g = gStr ? gStr.split(/[,\s]+/).filter(Boolean) : []
    const p = pStr ? pStr.split(/[,\s]+/).filter(Boolean) : []
    return { g, p }
  }

  const getName = (player: { full_name: string; email: string } | null) =>
    player?.full_name || player?.email?.split('@')[0] || '?'

  return (
    <div className="space-y-6">
      {/* Subpestañas */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => handleTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* TAB: AGENDA */}
      {activeTab === 'agenda' && (
        <div className="space-y-4">
          {agendaItems.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="font-semibold text-slate-500">No hay partidos ni reyes de pista próximos.</p>
              <p className="text-sm text-slate-400 mt-1">¡Inicia sesión para crear uno o apuntarte!</p>
              <Link href="/login" className="btn-primary mt-6 px-6 py-2.5 text-sm inline-flex">
                Iniciar sesión <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agendaItems.map(act => (
                <div key={`${act.tipo}-${act.id}`} className="card p-5 border border-slate-200 bg-white hover:shadow-md transition-shadow relative overflow-hidden group">
                  {/* Badge tipo */}
                  <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-widest ${act.tipo === 'partido' ? 'bg-cyan-100 text-cyan-700' : 'bg-purple-100 text-purple-700'}`}>
                    {act.tipo === 'partido' ? 'Partido Abierto' : 'Rey de Pista'}
                  </div>

                  <div className="space-y-3 mt-2">
                    <h3 className="font-kanit font-black text-lg text-slate-900">
                      {act.tipo === 'partido'
                        ? `Partido Nivel ${act.nivel_min}–${act.nivel_max}`
                        : `Rey de Pista`}
                    </h3>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <Calendar size={13} className="text-brand-500" />
                        <span>{formatDateShort(act.fecha)}</span>
                        {act.hora && (
                          <>
                            <span className="text-slate-300">·</span>
                            <Clock size={13} className="text-brand-500" />
                            <span>{act.hora.slice(0, 5)}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <MapPin size={13} className="text-amber-500" />
                        <span>{act.club}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <Swords size={13} className="text-slate-400" />
                        <span>Nivel {act.nivel_min}–{act.nivel_max}</span>
                      </div>
                    </div>

                    <Link
                      href={act.tipo === 'partido' ? `/partidos/${act.id}` : `/rey-de-pista/${act.id}`}
                      className="btn-secondary py-2 w-full text-xs font-bold justify-center flex items-center gap-2"
                    >
                      Ver detalles <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: RESULTADOS */}
      {activeTab === 'resultados' && (
        <div className="space-y-4">
          {visibleResultados.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Activity size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="font-semibold text-slate-500">Todavía no hay partidos registrados.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {visibleResultados.map(p => {
                  const { g, pG: sets_p } = (() => {
                    const r = parseSets(p.sets_ganadores, p.sets_perdedores)
                    return { g: r.g, pG: r.p }
                  })()
                  const tipoLabel = p.tipo_actividad === 'rey_de_pista' ? '👑 Rey de Pista' : p.tipo_actividad === 'torneo' ? '🏆 Torneo' : '🎾 Partido'

                  return (
                    <div key={p.id} className="card p-4 bg-white border border-slate-100 hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{tipoLabel}</span>
                        <span className="text-[10px] font-bold text-slate-400">{formatDateShort(p.created_at)}</span>
                      </div>

                      <div className="flex items-stretch gap-2">
                        {/* Ganadores */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-widest text-brand-600 mb-1">Victoria</p>
                          <p className="text-xs font-bold text-slate-800 truncate">{getName(p.ganador_1)}</p>
                          <p className="text-xs font-bold text-slate-800 truncate">{getName(p.ganador_2)}</p>
                        </div>

                        {/* Sets */}
                        <div className="flex flex-col items-center justify-center gap-1 px-2">
                          {g.map((s, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <span className="w-6 h-6 flex items-center justify-center bg-brand-100 text-brand-700 text-xs font-black rounded">{s}</span>
                              <span className="text-slate-300 text-xs">–</span>
                              <span className="w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-600 text-xs font-black rounded">{sets_p[i] || '0'}</span>
                            </div>
                          ))}
                        </div>

                        {/* Perdedores */}
                        <div className="flex-1 min-w-0 text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Derrota</p>
                          <p className="text-xs font-medium text-slate-500 truncate">{getName(p.perdedor_1)}</p>
                          <p className="text-xs font-medium text-slate-500 truncate">{getName(p.perdedor_2)}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {totalResultPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-4">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Anterior</button>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Página {page} de {totalResultPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalResultPages, p + 1))} disabled={page === totalResultPages} className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Siguiente</button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
