'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Swords } from 'lucide-react'
import { formatDateShort } from '@/lib/utils'

interface Match {
  id: string
  created_at: string
  sets_ganadores: string
  sets_perdedores: string
  tipo_actividad: 'partido' | 'rey_de_pista' | 'torneo'
  ganador_1: { full_name: string; email: string }
  ganador_2: { full_name: string; email: string }
  perdedor_1: { full_name: string; email: string }
  perdedor_2: { full_name: string; email: string }
}

export default function MatchFeed() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const sb = createClient()

  const fetchRecentMatches = async () => {
    // Para simplificar y optimizar, hacemos un select con joins
    const { data, error } = await sb
      .from('partidos')
      .select(`
        id,
        created_at,
        sets_ganadores,
        sets_perdedores,
        tipo_actividad,
        ganador_1:ganador_1_id(full_name, email),
        ganador_2:ganador_2_id(full_name, email),
        perdedor_1:perdedor_1_id(full_name, email),
        perdedor_2:perdedor_2_id(full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(3)

    if (error) {
      console.error('Error fetching matches:', error)
    } else {
      // Casteo seguro de datos
      setMatches((data as any) || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRecentMatches()

    // Suscribir a Supabase Realtime para recibir partidos nuevos en tiempo real
    const channel = sb
      .channel('public:partidos')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'partidos' },
        () => {
          fetchRecentMatches()
        }
      )
      .subscribe()

    return () => {
      sb.removeChannel(channel)
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-28 w-full" />
        <div className="skeleton h-28 w-full" />
        <div className="skeleton h-28 w-full" />
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-10 bg-slate-50 border border-slate-100 rounded-2xl">
        <p className="text-sm font-semibold text-slate-500">No hay partidos registrados recientemente</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {matches.map(m => {
        const dateStr = formatDateShort(m.created_at)
        const nameG1 = m.ganador_1?.full_name || m.ganador_1?.email?.split('@')[0] || 'Jugador'
        const nameG2 = m.ganador_2?.full_name || m.ganador_2?.email?.split('@')[0] || 'Jugador'
        const nameP1 = m.perdedor_1?.full_name || m.perdedor_1?.email?.split('@')[0] || 'Jugador'
        const nameP2 = m.perdedor_2?.full_name || m.perdedor_2?.email?.split('@')[0] || 'Jugador'

        const badges = {
          partido: 'badge-partido',
          rey_de_pista: 'badge-rey',
          torneo: 'badge-torneo'
        }

        const labels = {
          partido: '🎾 Partido',
          rey_de_pista: '👑 Rey de Pista',
          torneo: '🏆 Torneo'
        }

        return (
          <div
            key={m.id}
            className="card p-4 hover:shadow-card-hover transition-all duration-300 relative overflow-hidden"
          >
            {/* Cabecera de la tarjeta */}
            <div className="flex items-center justify-between mb-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badges[m.tipo_actividad] || badges.partido}`}>
                {labels[m.tipo_actividad] || labels.partido}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dateStr}</span>
            </div>

            {/* Marcador y jugadores */}
            <div className="grid grid-cols-5 gap-2 items-center">
              {/* Pareja ganadora */}
              <div className="col-span-2 text-left min-w-0 pr-1">
                <p className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">🟢 {nameG1}</p>
                <p className="font-extrabold text-slate-900 text-xs sm:text-sm truncate mt-0.5">🟢 {nameG2}</p>
              </div>

              {/* Resultado central */}
              <div className="col-span-1 flex flex-col items-center justify-center bg-slate-50/80 border border-slate-100 rounded-xl py-1.5 px-1 font-kanit">
                <p className="text-[10px] font-bold text-brand-600 uppercase tracking-wider mb-0.5">Ganadores</p>
                <p className="text-xs font-black text-slate-800 text-center tracking-tight leading-none">
                  {m.sets_ganadores}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">vs</p>
                <p className="text-[10px] text-slate-400 tracking-tight font-medium mt-0.5 leading-none">
                  {m.sets_perdedores}
                </p>
              </div>

              {/* Pareja perdedora */}
              <div className="col-span-2 text-right min-w-0 pl-1">
                <p className="font-semibold text-slate-500 text-xs sm:text-sm truncate">🔴 {nameP1}</p>
                <p className="font-semibold text-slate-500 text-xs sm:text-sm truncate mt-0.5">🔴 {nameP2}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
