'use client'

import React, { useState } from 'react'
import PlayerAvatar from '@/components/PlayerAvatar'
import LevelBadge from '@/components/LevelBadge'
import { Trophy, Search, Flame, Award } from 'lucide-react'

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

interface RankingClientProps {
  players: Player[]
  currentUserId: string
}

export default function RankingClient({ players, currentUserId }: RankingClientProps) {
  const [search, setSearch] = useState('')

  // 1. Filtrar jugadores según búsqueda
  const filteredPlayers = players.filter(p => {
    const name = (p.full_name || p.email.split('@')[0]).toLowerCase()
    return name.includes(search.toLowerCase())
  })

  return (
    <div className="px-5 pt-6 space-y-6 animate-fade-in">
      
      {/* Cabecera del Ranking */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
          <Trophy size={20} />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-900 font-kanit">Clasificación</h1>
          <p className="text-xs text-slate-500 font-medium">Clasificación general de la comunidad</p>
        </div>
      </div>



      {/* Buscador */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar jugador..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-base !pl-10"
        />
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
      </div>

      {/* Tabla / Lista de posiciones */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
          Tabla de posiciones
        </h2>

        {filteredPlayers.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 border border-slate-100 rounded-2xl">
            <p className="text-xs font-bold text-slate-400">No se encontraron jugadores</p>
          </div>
        ) : (
          <div className="card divide-y divide-slate-100 overflow-hidden bg-white shadow-sm border border-slate-100">
            {filteredPlayers.map((p, idx) => {
              const realIndex = players.findIndex(pl => pl.id === p.id) + 1
              const isMe = p.id === currentUserId
              const level = p.nivel || 1.0
              const winRate = p.partidos > 0 ? Math.round((p.victorias / p.partidos) * 100) : 0

              // Posiciones Top 3 de la lista general
              const rankClasses = realIndex === 1 
                ? 'rank-1' 
                : realIndex === 2 
                ? 'rank-2' 
                : realIndex === 3 
                ? 'rank-3' 
                : ''

              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 px-4 py-3.5 ${rankClasses} ${
                    isMe ? 'bg-brand-50/50 border-l-[3.5px] border-l-brand-600' : ''
                  }`}
                >
                  {/* Posición */}
                  <div className="w-6 text-center font-black text-xs sm:text-sm text-slate-400 flex-shrink-0">
                    {realIndex === 1 ? '🥇' : realIndex === 2 ? '🥈' : realIndex === 3 ? '🥉' : `#${realIndex}`}
                  </div>

                  {/* Avatar */}
                  <PlayerAvatar
                    name={p.full_name || p.email}
                    avatarUrl={p.avatar_url}
                    size="sm"
                    className="shadow-sm border border-slate-100"
                  />

                  {/* Datos e info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs sm:text-sm truncate text-slate-800 ${isMe ? 'font-extrabold text-brand-700' : 'font-bold'}`}>
                      {p.full_name || p.email.split('@')[0]} {isMe && '(tú)'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold tracking-tight mt-0.5">
                      {winRate}% victorias · {p.partidos} partidos
                    </p>
                  </div>

                  {/* Nivel y racha */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-black text-slate-900 font-kanit">
                      {level.toFixed(2)}
                    </p>
                    {p.racha > 0 ? (
                      <span className="inline-flex items-center text-[8px] font-black text-amber-600 bg-amber-50 border border-amber-100 rounded-md px-1 py-0.5 mt-0.5">
                        <Flame size={8} className="fill-amber-600 stroke-none" /> +{p.racha}
                      </span>
                    ) : p.racha < 0 ? (
                      <span className="inline-flex items-center text-[8px] font-bold text-red-500 bg-red-50 border border-red-100 rounded-md px-1 py-0.5 mt-0.5">
                        ❄️ {p.racha}
                      </span>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
