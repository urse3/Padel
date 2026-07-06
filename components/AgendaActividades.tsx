'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Users, ArrowRight, Clock, MapPin, Swords } from 'lucide-react'
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
  tipo: 'partido'
}

interface ReyDePista {
  id: string
  club: string
  fecha: string
  hora: string
  nivel_min: number
  nivel_max: number
  estado: string
  tipo: 'rey_pista'
}

type Actividad = PartidoAbierto | ReyDePista

export default function AgendaActividades({ userId, title = "Agenda del Club" }: { userId?: string, title?: string }) {
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [loading, setLoading] = useState(true)
  const sb = createClient()

  useEffect(() => {
    const fetchActividades = async () => {
      let partidos: PartidoAbierto[] = []
      let reyes: ReyDePista[] = []

      if (userId) {
        // 1. Obtener partidos abiertos en los que el usuario está inscrito
        const { data: inscripcionesPartidos } = await sb
          .from('inscripciones')
          .select('partido_id, partidos_abiertos(*)')
          .eq('jugador_id', userId)

        if (inscripcionesPartidos) {
          partidos = inscripcionesPartidos.map(i => ({ ...i.partidos_abiertos, tipo: 'partido' })) as unknown as PartidoAbierto[]
        }

        // 2. Obtener rey de pista en los que el usuario está inscrito
        const { data: inscripcionesReyes } = await sb
          .from('rey_inscripciones')
          .select('rey_id, rey_de_pista(*)')
          .eq('jugador_id', userId)

        if (inscripcionesReyes) {
          reyes = inscripcionesReyes.map(i => ({ ...i.rey_de_pista, tipo: 'rey_pista' })) as unknown as ReyDePista[]
        }
      } else {
        // 1. Obtener TODOS los partidos abiertos
        const { data: dataPartidos } = await sb
          .from('partidos_abiertos')
          .select('*')
          .in('estado', ['abierto', 'completo'])

        if (dataPartidos) {
          partidos = dataPartidos.map(p => ({ ...p, tipo: 'partido' })) as PartidoAbierto[]
        }

        // 2. Obtener TODOS los rey de pista
        const { data: dataReyes } = await sb
          .from('rey_de_pista')
          .select('*')
          .in('estado', ['abierto', 'en_curso'])

        if (dataReyes) {
          reyes = dataReyes.map(r => ({ ...r, tipo: 'rey_pista' })) as ReyDePista[]
        }
      }

      // Combinar, ordenar por fecha y filtrar los que ya pasaron
      const combined = [...partidos, ...reyes]
        .filter(a => a && a.id) // Filter out nulls if any joined table row was deleted
        .sort((a, b) => {
          const dateA = new Date(`${a.fecha}T${a.hora}`)
          const dateB = new Date(`${b.fecha}T${b.hora}`)
          return dateA.getTime() - dateB.getTime()
        })

      setActividades(combined)
      setLoading(false)
    }

    fetchActividades()
  }, [userId])

  if (loading) return null

  if (actividades.length === 0) {
    if (userId) return null; // No mostrar nada en dashboard si no hay agenda
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-1 bg-amber-500 rounded-full"></span>
          <h2 className="font-kanit font-black text-2xl text-slate-900 tracking-tight">{title}</h2>
        </div>
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
          <Calendar className="mx-auto text-slate-300 mb-3" size={32} />
          <p className="text-sm font-semibold text-slate-500">No hay eventos programados próximamente.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-8 h-1 bg-amber-500 rounded-full"></span>
        <h2 className={userId ? "text-sm font-extrabold text-slate-950 font-kanit uppercase tracking-wider" : "font-kanit font-black text-2xl text-slate-900 tracking-tight"}>
          {title}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actividades.map(act => (
          <div key={`${act.tipo}-${act.id}`} className={`card p-5 border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${userId ? 'bg-slate-900/80 backdrop-blur-md border-slate-800' : 'bg-white border-slate-200'}`}>
            
            {/* Etiqueta Tipo */}
            <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-widest ${act.tipo === 'partido' ? 'bg-cyan-100 text-cyan-700' : 'bg-purple-100 text-purple-700'}`}>
              {act.tipo === 'partido' ? 'Partido Abierto' : 'Rey de Pista'}
            </div>

            <div className="flex flex-col h-full justify-between space-y-4">
              <div>
                <h3 className={`font-kanit font-black text-lg mb-1 mt-2 ${userId ? 'text-white' : 'text-slate-900'}`}>
                  {act.tipo === 'partido' ? 'Partido Nivel ' + act.nivel_min + '-' + act.nivel_max : 'Rey de Pista'}
                </h3>
                <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${userId ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Calendar size={14} />
                  <span>{formatDateShort(act.fecha)}</span>
                  <span className="mx-1">•</span>
                  <Clock size={14} />
                  <span>{act.hora.slice(0, 5)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className={`flex items-center gap-2 text-xs font-semibold ${userId ? 'text-slate-300' : 'text-slate-600'}`}>
                  <MapPin size={14} className="text-amber-500" />
                  <span>{act.club}</span>
                </div>
                <div className={`flex items-center gap-2 text-xs font-semibold ${userId ? 'text-slate-300' : 'text-slate-600'}`}>
                  <Swords size={14} className="text-amber-500" />
                  <span>Nivel requerido: {act.nivel_min} a {act.nivel_max}</span>
                </div>
              </div>

              <Link
                href={act.tipo === 'partido' ? `/partidos/${act.id}` : `/rey-de-pista/${act.id}`}
                className={`py-2 w-full text-xs font-bold justify-center rounded-lg flex items-center gap-2 transition-colors ${userId ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                Ver detalles <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
