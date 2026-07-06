'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import PlayerAvatar from '@/components/PlayerAvatar'
import { Calendar, MapPin, Clock, DollarSign, Plus, Swords, Filter } from 'lucide-react'
import { formatDateShort, formatTime } from '@/lib/utils'

interface Jugador {
  id: string
  full_name: string | null
  email: string
  avatar_url: string | null
  nivel: number
}

interface Inscripcion {
  id: string
  jugador: Jugador
}

interface Partido {
  id: string
  club: string
  fecha: string
  hora: string
  nivel_min: number
  nivel_max: number
  precio: number
  es_privado: boolean
  max_jugadores: number
  estado: 'abierto' | 'completo' | 'cancelado' | 'finalizado'
  creador: { id: string; full_name: string | null; email: string; avatar_url: string | null }
  inscripciones: Inscripcion[]
}

interface PartidosClientProps {
  partidos: Partido[]
  currentUserId: string
}

export default function PartidosClient({ partidos, currentUserId }: PartidosClientProps) {
  const [filterLevel, setFilterLevel] = useState<string>('todos')
  const [filterStatus, setFilterStatus] = useState<string>('todos')

  // Filtramos la lista
  const filteredPartidos = partidos.filter(p => {
    // 1. Filtro de nivel
    if (filterLevel !== 'todos') {
      const level = parseFloat(filterLevel)
      if (p.nivel_min > level || p.nivel_max < level) return false
    }

    // 2. Filtro de estado
    if (filterStatus === 'abiertos') {
      return p.estado === 'abierto'
    } else if (filterStatus === 'mixtos') {
      // Si el usuario está apuntado
      return p.inscripciones.some(ins => ins.jugador.id === currentUserId)
    }

    return p.estado !== 'cancelado' && p.estado !== 'finalizado'
  })

  return (
    <div className="px-5 pt-6 space-y-6 animate-fade-in">
      
      {/* Cabecera */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-50 border border-brand-100 text-brand-600">
            <Swords size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 font-kanit">Muro de Partidos</h1>
            <p className="text-xs text-slate-500 font-medium">Busca partidos o crea el tuyo propio</p>
          </div>
        </div>

        <Link
          href="/partidos/nuevo"
          className="btn-primary py-2 px-3.5 text-xs font-bold shadow-green flex items-center gap-1"
        >
          <Plus size={14} className="stroke-[3]" /> Crear
        </Link>
      </div>

      {/* Módulo de Filtros */}
      <div className="card p-4 bg-white flex flex-col gap-3">
        <div className="flex items-center gap-2 text-slate-700 font-extrabold text-xs uppercase tracking-wider mb-1">
          <Filter size={14} /> Filtros de búsqueda
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Por Nivel */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Tu Nivel
            </label>
            <select
              value={filterLevel}
              onChange={e => setFilterLevel(e.target.value)}
              className="form-input w-full rounded-xl px-3 py-2.5 text-xs bg-slate-50 border border-slate-200"
            >
              <option value="todos">Todos los niveles</option>
              <option value="1.0">Iniciación (1.00+)</option>
              <option value="3.0">Intermedio (3.00+)</option>
              <option value="5.0">Avanzado (5.00+)</option>
              <option value="7.0">Competición (7.00+)</option>
            </select>
          </div>

          {/* Por Estado */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Ver
            </label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="form-input w-full rounded-xl px-3 py-2.5 text-xs bg-slate-50 border border-slate-200"
            >
              <option value="todos">Todos los partidos</option>
              <option value="abiertos">Solo con plazas libres</option>
              <option value="mixtos">Mis partidos registrados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listado de partidos */}
      <div className="space-y-3">
        {filteredPartidos.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 border border-slate-100 rounded-2xl">
            <Swords size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-500">No hay partidos disponibles</p>
            <p className="text-[10px] text-slate-400 mt-1">
              Prueba a cambiar los filtros o crea un partido tú mismo.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPartidos.map(p => {
              const apuntadosCount = p.inscripciones.length
              const maxCount = p.max_jugadores
              const esCompleto = apuntadosCount >= maxCount
              
              const dateStr = formatDateShort(p.fecha)
              const timeStr = formatTime(p.hora)

              const levelRangeStr = `${p.nivel_min.toFixed(2)} - ${p.nivel_max.toFixed(2)}`
              
              return (
                <div
                  key={p.id}
                  className="card p-4 hover:shadow-card-hover transition-all duration-300 relative bg-white flex flex-col justify-between"
                >
                  <div>
                    {/* Fila superior: Creador y Badge de Estado */}
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <PlayerAvatar
                          name={p.creador?.full_name || p.creador?.email}
                          avatarUrl={p.creador?.avatar_url}
                          size="sm"
                          className="border border-slate-100"
                        />
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Organiza</p>
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {p.creador?.full_name || p.creador?.email.split('@')[0]}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          esCompleto
                            ? 'bg-purple-50 border-purple-200 text-purple-700'
                            : 'bg-green-50 border-green-200 text-green-700'
                        }`}
                      >
                        {esCompleto ? 'Completo 🔒' : 'Libre 🔓'}
                      </span>
                    </div>

                    {/* Fila media: Detalles de fecha, hora, club y nivel */}
                    <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-600 mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin size={14} className="text-brand-500 flex-shrink-0" />
                        <span className="truncate text-slate-800">{p.club}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-brand-500" />
                        <span>{dateStr} · {timeStr}h</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Swords size={14} className="text-brand-500" />
                        <span>Nivel: {levelRangeStr}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign size={14} className="text-brand-500" />
                        <span>{p.precio > 0 ? `${p.precio.toFixed(2)}€ / pers` : 'Gratis'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Fila inferior: Jugadores inscritos y Botón de acceso */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2">
                      {/* Avatares agrupados */}
                      <div className="flex -space-x-2">
                        {p.inscripciones.map(ins => (
                          <PlayerAvatar
                            key={ins.id}
                            name={ins.jugador.full_name || ins.jugador.email}
                            avatarUrl={ins.jugador.avatar_url}
                            size="sm"
                            className="border-2 border-white ring-1 ring-slate-100"
                          />
                        ))}
                        {/* Huecos vacíos en gris */}
                        {Array.from({ length: Math.max(0, maxCount - apuntadosCount) }).map((_, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-2xl bg-slate-100 border-2 border-white ring-1 ring-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 select-none"
                          >
                            +
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold ml-1">
                        {apuntadosCount}/{maxCount}
                      </span>
                    </div>

                    <Link
                      href={`/partidos/${p.id}`}
                      className="btn-secondary py-1.5 px-3 text-xs font-bold"
                    >
                      Ver detalles
                    </Link>
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
