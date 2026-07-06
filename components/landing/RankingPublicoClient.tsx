'use client'

import React, { useState } from 'react'
import PlayerAvatar from '@/components/PlayerAvatar'
import LevelBadge from '@/components/LevelBadge'
import RankingMovements from '@/components/landing/RankingMovements'
import { Trophy, Search, Flame, TrendingUp, ChevronRight, ChevronLeft, Medal } from 'lucide-react'
import Link from 'next/link'

interface Player {
  id: string
  full_name: string | null
  email: string
  nivel: number
  racha: number
  victorias: number
  partidos: number
  avatar_url: string | null
}

interface Props {
  players: Player[]
}

const TABS = [
  { id: 'ranking', label: 'Ranking General', icon: Trophy },
  { id: 'rachas', label: 'Rachas y Subidas', icon: TrendingUp },
]

const TOP_COUNT = 10
const PAGE_SIZE = 10

// Colores especiales para top 3
const topStyle: Record<number, { row: string; num: string; label: React.ReactNode }> = {
  1: { row: 'bg-amber-50  border-amber-200',  num: 'text-amber-500',  label: <Medal size={24} className="text-amber-500 drop-shadow-sm mx-auto" /> },
  2: { row: 'bg-slate-50  border-slate-200',  num: 'text-slate-400',  label: <Medal size={24} className="text-slate-400 drop-shadow-sm mx-auto" /> },
  3: { row: 'bg-orange-50 border-orange-200', num: 'text-orange-400', label: <Medal size={24} className="text-orange-400 drop-shadow-sm mx-auto" /> },
}

export default function RankingPublicoClient({ players }: Props) {
  const [activeTab, setActiveTab] = useState<'ranking' | 'rachas'>('ranking')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // Filtrado por búsqueda (siempre sobre la lista completa)
  const filtered = players.filter(p => {
    const name = (p.full_name || p.email.split('@')[0]).toLowerCase()
    return name.includes(search.toLowerCase())
  })

  // Top 10 (siempre visible, sin paginar)
  const top10 = filtered.slice(0, TOP_COUNT)

  // El resto — paginado
  const rest = filtered.slice(TOP_COUNT)
  const totalPages = Math.ceil(rest.length / PAGE_SIZE)
  const visibleRest = rest.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSearch = (v: string) => {
    setSearch(v)
    setPage(1)
  }

  const getPos = (player: Player) => players.findIndex(p => p.id === player.id) + 1

  const renderRow = (p: Player) => {
    const pos = getPos(p)
    const style = topStyle[pos] ?? { row: 'bg-white border-slate-100', num: 'text-slate-500', label: '' }
    const isTop3 = pos <= 3

    return (
      <div
        key={p.id}
        className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-all hover:shadow-sm ${style.row} ${isTop3 ? 'shadow-sm' : ''}`}
      >
        {/* Posición */}
        <div className="w-10 flex-shrink-0 text-center">
          {isTop3 ? (
            style.label
          ) : (
            <span className={`text-sm font-black ${style.num}`}>#{pos}</span>
          )}
        </div>

        {/* Avatar */}
        <PlayerAvatar name={p.full_name || p.email} avatarUrl={p.avatar_url} nivel={p.nivel} size="sm" />

        {/* Nombre + badge */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm truncate">{p.full_name || p.email.split('@')[0]}</p>
          <LevelBadge nivel={p.nivel} size="sm" />
        </div>

        {/* Stats */}
        <div className="text-right flex-shrink-0 space-y-0.5">
          <p className="text-lg font-black text-slate-800 font-kanit">{parseFloat(p.nivel as any).toFixed(2)}</p>
          <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-slate-400">
            {p.racha > 0 && (
              <span className="flex items-center gap-0.5 text-orange-500">
                <Flame size={10} /> {p.racha}
              </span>
            )}
            <span>{p.victorias ?? 0}V · {p.partidos ?? 0}P</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Subpestañas */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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

      {/* TAB: RANKING GENERAL */}
      {activeTab === 'ranking' && (
        <div className="space-y-6">
          {players.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Trophy size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="font-semibold text-slate-500">Aún no se han registrado perfiles de jugadores.</p>
              <p className="text-sm text-slate-400 mt-1">¡Únete y sé el primero en el ranking!</p>
              <Link href="/registro" className="btn-primary mt-6 px-6 py-2.5 text-sm inline-flex items-center gap-2">
                Únete gratis <ChevronRight size={16} />
              </Link>
            </div>
          ) : (
            <>
              {/* Buscador */}
              <div className="relative max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar jugador..."
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                  className="input-base pl-10 py-2.5 text-sm w-full"
                />
              </div>

              {/* Cabecera columnas */}
              <div className="flex items-center gap-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span className="w-10 text-center">#</span>
                <span className="w-8" />
                <span className="flex-1">Jugador</span>
                <span className="text-right">Nivel · Rachas</span>
              </div>

              {/* TOP 10 */}
              {top10.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 px-2">Top 10</p>
                  {top10.map(renderRow)}
                </div>
              )}

              {/* RESTO PAGINADO */}
              {rest.length > 0 && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 px-2">
                    Posiciones {TOP_COUNT + 1} – {players.length}
                  </p>
                  <div className="space-y-2">
                    {visibleRest.map(renderRow)}
                  </div>

                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 pt-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                      >
                        <ChevronLeft size={14} /> Anterior
                      </button>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {page} / {totalPages}
                      </span>
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                      >
                        Siguiente <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {filtered.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-sm font-medium">
                  No se encontraron jugadores con ese nombre.
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB: RACHAS Y SUBIDAS */}
      {activeTab === 'rachas' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Los jugadores con mayor progresión y rachas activas esta semana.</p>
          <RankingMovements />
        </div>
      )}
    </div>
  )
}
