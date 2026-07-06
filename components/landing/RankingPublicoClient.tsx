'use client'

import React, { useState } from 'react'
import PlayerAvatar from '@/components/PlayerAvatar'
import LevelBadge from '@/components/LevelBadge'
import RankingMovements from '@/components/landing/RankingMovements'
import { Trophy, Search, Flame, TrendingUp, ChevronRight } from 'lucide-react'
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

export default function RankingPublicoClient({ players }: Props) {
  const [activeTab, setActiveTab] = useState<'ranking' | 'rachas'>('ranking')
  const [search, setSearch] = useState('')

  const filtered = players.filter(p => {
    const name = (p.full_name || p.email.split('@')[0]).toLowerCase()
    return name.includes(search.toLowerCase())
  })

  const top3 = players.slice(0, 3)
  const podioVisual = [top3[1], top3[0], top3[2]].filter(Boolean)
  const heights = ['h-28', 'h-36', 'h-24']
  const medals = ['🥈', '🥇', '🥉']
  const medalColors = ['border-slate-200', 'border-amber-200', 'border-amber-100']
  const podioBg = ['bg-slate-50', 'bg-amber-50/70', 'bg-amber-50/30']
  const podioText = ['text-slate-700', 'text-amber-700', 'text-amber-800']

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
        <div className="space-y-8">
          {players.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Trophy size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="font-semibold text-slate-500">Aún no se han registrado perfiles de jugadores.</p>
              <p className="text-sm text-slate-400 mt-1">¡Únete y sé el primero en el ranking!</p>
              <Link href="/registro" className="btn-primary mt-6 px-6 py-2.5 text-sm inline-flex">
                Únete gratis <ChevronRight size={16} />
              </Link>
            </div>
          ) : (
            <>
              {/* Podio TOP 3 */}
              <div className="flex items-end justify-center gap-4 sm:gap-6 max-w-sm mx-auto pt-6">
                {podioVisual.map((p, idx) => (
                  <div key={p.id} className="flex flex-col items-center flex-1">
                    <div className="text-2xl mb-2">{medals[idx]}</div>
                    <div className={`w-full ${heights[idx]} ${podioBg[idx]} border ${medalColors[idx]} rounded-2xl shadow-sm flex flex-col items-center justify-end pb-3 px-2 relative`}>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                        <PlayerAvatar name={p.full_name || p.email} avatarUrl={p.avatar_url} nivel={p.nivel} size="md" />
                      </div>
                      <p className="text-xs font-bold text-slate-700 truncate w-full text-center">{(p.full_name || p.email).split(' ')[0]}</p>
                      <p className={`text-base font-black font-kanit ${podioText[idx]}`}>{parseFloat(p.nivel as any).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Buscador */}
              <div className="relative max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar jugador..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="input-base pl-9 py-2.5 text-sm w-full"
                />
              </div>

              {/* Lista completa */}
              <div className="space-y-2">
                {filtered.map((p, idx) => {
                  const realPos = players.findIndex(pl => pl.id === p.id)
                  const posLabel = realPos === 0 ? '🥇' : realPos === 1 ? '🥈' : realPos === 2 ? '🥉' : `#${realPos + 1}`
                  return (
                    <div key={p.id} className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-all hover:shadow-sm ${realPos < 3 ? 'bg-amber-50/40 border-amber-100' : 'bg-white border-slate-100'}`}>
                      <span className="text-lg w-8 text-center flex-shrink-0 font-black text-slate-500">{posLabel}</span>
                      <PlayerAvatar name={p.full_name || p.email} avatarUrl={p.avatar_url} nivel={p.nivel} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">{p.full_name || p.email.split('@')[0]}</p>
                        <LevelBadge nivel={p.nivel} size="sm" />
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-black text-slate-800 font-kanit">{parseFloat(p.nivel as any).toFixed(2)}</p>
                        {p.racha > 0 && (
                          <p className="text-[10px] text-orange-500 font-bold flex items-center gap-0.5 justify-end">
                            <Flame size={11} /> {p.racha}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
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
