'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getLevelInfo } from '@/lib/elo'
import { ArrowUpRight } from 'lucide-react'

interface Movement {
  id: string
  full_name: string
  email: string
  nivel: number
  nivel_previo: number
  racha: number
}

export default function RankingMovements() {
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const sb = createClient()

  const fetchMovements = async () => {
    // Buscamos jugadores cuyos niveles hayan subido (nivel > nivel_previo)
    const { data, error } = await sb
      .from('profiles')
      .select('id, full_name, email, nivel, nivel_previo, racha')
      .order('nivel', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching movements:', error)
    } else {
      // Filtramos y procesamos jugadores con subidas de nivel o rachas calientes
      const sortedMovements = (data || [])
        .map((p: any) => ({
          ...p,
          nivel: parseFloat(p.nivel),
          nivel_previo: parseFloat(p.nivel_previo || p.nivel)
        }))
        .filter((p: any) => p.nivel > p.nivel_previo || p.racha > 0)
        .slice(0, 5)

      setMovements(sortedMovements)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMovements()

    // Suscribirse a cambios en profiles para actualizar el ranking en vivo
    const channel = sb
      .channel('public:profiles_ranking')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        () => {
          fetchMovements()
        }
      )
      .subscribe()

    return () => {
      sb.removeChannel(channel)
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="skeleton h-14 w-full" />
        <div className="skeleton h-14 w-full" />
        <div className="skeleton h-14 w-full" />
      </div>
    )
  }

  if (movements.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-50 border border-slate-100 rounded-2xl">
        <p className="text-xs font-semibold text-slate-500">Mantente al tanto, los movimientos del ranking aparecerán aquí en vivo.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {movements.map(m => {
        const diff = m.nivel - m.nivel_previo
        const hasSubido = diff > 0
        const info = getLevelInfo(m.nivel)
        const name = m.full_name || m.email.split('@')[0]

        return (
          <div
            key={m.id}
            className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 hover:border-brand-200 shadow-sm transition-all duration-200 hover:scale-[1.01]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-1.5 h-8 rounded-full"
                style={{ backgroundColor: info.color }}
              />
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">{name}</p>
                <p className="text-[10px] text-slate-400 font-semibold">{info.emoji} {info.label}</p>
              </div>
            </div>

            <div className="text-right flex items-center gap-2 flex-shrink-0">
              {m.racha > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/50">
                  🔥 {m.racha} Vic
                </span>
              )}
              {hasSubido ? (
                <span className="flex items-center gap-0.5 text-xs font-extrabold text-green-600 bg-green-50 px-2 py-1 rounded-lg border border-green-200/40">
                  <ArrowUpRight size={14} className="stroke-[3]" />
                  +{diff.toFixed(2)}
                </span>
              ) : (
                <span className="text-xs font-black text-slate-800">
                  {m.nivel.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
