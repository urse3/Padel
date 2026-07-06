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
  const parseSets = (ganadoresStr: string, perdedoresStr: string) => {
    const gParts = ganadoresStr ? ganadoresStr.split(/[,\s]+/).filter(Boolean) : []
    const pParts = perdedoresStr ? perdedoresStr.split(/[,\s]+/).filter(Boolean) : []
    
    const finalGanadores: string[] = []
    const finalPerdedores: string[] = []
    
    for (let i = 0; i < Math.max(gParts.length, pParts.length); i++) {
      const g = gParts[i] || ''
      const p = pParts[i] || ''
      
      if (g.includes('-') && !p.includes('-')) {
        // Formato donde meten todo en ganadores e.g. "6-4, 6-2"
        const spl = g.split('-')
        finalGanadores.push(spl[0])
        finalPerdedores.push(spl[1] || '0')
      } else {
        // Formato separado: ganadores "6, 6", perdedores "4, 2"
        if (g.includes('-')) finalGanadores.push(g.split('-')[0])
        else finalGanadores.push(g || '0')
        
        if (p.includes('-')) finalPerdedores.push(p.split('-')[0])
        else finalPerdedores.push(p || '0')
      }
    }

    // Fallback if empty
    if (finalGanadores.length === 0) return { g: ['?'], p: ['?'] }
    return { g: finalGanadores, p: finalPerdedores }
  }

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
            className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-800 shadow-lg shadow-black/20 p-4 hover:scale-[1.02] transition-all duration-200 relative overflow-hidden"
          >
            {/* Cabecera de la tarjeta */}
            <div className="flex items-center justify-between mb-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badges[m.tipo_actividad] || badges.partido}`}>
                {labels[m.tipo_actividad] || labels.partido}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dateStr}</span>
            </div>

              {/* Marcador estructurado por sets */}
              <div className="col-span-5 mt-2 flex flex-col gap-2">
                
                {/* Fila Ganadores */}
                <div className="flex items-center justify-between bg-green-50/5 rounded-lg p-2">
                  <div className="min-w-0 pr-2 flex flex-col justify-center">
                    <p className="font-bold text-white text-xs sm:text-sm truncate leading-tight flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-brand-500 shadow-glow"></span>
                      {nameG1}
                    </p>
                    <p className="font-bold text-white text-xs sm:text-sm truncate leading-tight flex items-center gap-1.5 mt-1">
                      <span className="w-2 h-2 rounded-full bg-brand-500 shadow-glow"></span>
                      {nameG2}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    {parseSets(m.sets_ganadores, m.sets_perdedores).g.map((setNum, idx) => (
                      <div key={idx} className="w-8 h-8 rounded bg-brand-500/20 border border-brand-500/50 flex items-center justify-center">
                        <span className="text-sm font-black text-brand-400">{setNum}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fila Perdedores */}
                <div className="flex items-center justify-between bg-slate-800/30 rounded-lg p-2">
                  <div className="min-w-0 pr-2 flex flex-col justify-center">
                    <p className="font-semibold text-slate-400 text-xs sm:text-sm truncate leading-tight flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                      {nameP1}
                    </p>
                    <p className="font-semibold text-slate-400 text-xs sm:text-sm truncate leading-tight flex items-center gap-1.5 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                      {nameP2}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    {parseSets(m.sets_ganadores, m.sets_perdedores).p.map((setNum, idx) => (
                      <div key={idx} className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center">
                        <span className="text-sm font-bold text-slate-300">{setNum}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
          </div>
        )
      })}
    </div>
  )
}
