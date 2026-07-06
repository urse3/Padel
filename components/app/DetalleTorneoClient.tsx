'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PlayerAvatar from '@/components/PlayerAvatar'
import { createClient } from '@/lib/supabase/client'
import { formatDateShort } from '@/lib/utils'
import {
  ChevronLeft,
  Calendar,
  Users,
  Trophy,
  Swords,
  Award,
  Lock,
  UserCheck,
  Plus
} from 'lucide-react'

interface Jugador {
  id: string
  full_name: string | null
  email: string
  avatar_url: string | null
  nivel: number
}

interface ParejaInscrita {
  id: string
  jugador1_id: string
  jugador2_id: string
  estado: string
  j1: Jugador
  j2: Jugador
}

interface PartidoBracket {
  id: string
  ronda: number
  posicion: number
  pareja1_id: string | null
  pareja2_id: string | null
  ganador_id: string | null
  sets_pareja1: string | null
  sets_pareja2: string | null
  fecha: string | null
  estado: string
  pareja1: { id: string; j1: { full_name: string }; j2: { full_name: string } } | null
  pareja2: { id: string; j1: { full_name: string }; j2: { full_name: string } } | null
  ganador: { id: string; j1: { full_name: string }; j2: { full_name: string } } | null
}

interface Torneo {
  id: string
  nombre: string
  descripcion: string | null
  fecha_inicio: string
  fecha_fin: string
  nivel_min: number
  nivel_max: number
  max_parejas: number
  estado: 'inscripciones' | 'en_curso' | 'finalizado' | 'cancelado'
  tipo: string
}

interface DetalleTorneoClientProps {
  torneo: Torneo
  inscripciones: ParejaInscrita[]
  partidos: PartidoBracket[]
  currentUserId: string
  todosJugadores: { id: string; full_name: string | null; email: string; nivel: number }[]
}

export default function DetalleTorneoClient({
  torneo,
  inscripciones,
  partidos,
  currentUserId,
  todosJugadores
}: DetalleTorneoClientProps) {
  const [activeTab, setActiveTab] = useState<'brackets' | 'parejas'>('brackets')
  
  // Estados para inscripción
  const [showInscribirModal, setShowInscribirModal] = useState(false)
  const [compañeroId, setCompañeroId] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const sb = createClient()

  // Comprobar si el usuario actual ya está inscrito en este torneo
  const miInscripcion = inscripciones.find(
    ins => ins.jugador1_id === currentUserId || ins.jugador2_id === currentUserId
  )
  const isMiembroInscrito = !!miInscripcion

  // Rondas del bracket (Ronda 1 = Cuartos, Ronda 2 = Semis, Ronda 3 = Final)
  const partidosCuartos = partidos.filter(p => p.ronda === 1)
  const partidosSemis = partidos.filter(p => p.ronda === 2)
  const partidosFinal = partidos.filter(p => p.ronda === 3)

  const handleInscribirse = async () => {
    if (!compañeroId) {
      alert('Por favor, selecciona a tu compañero de juego.')
      return
    }

    setLoading(true)
    const { error } = await sb
      .from('inscripciones_torneo')
      .insert({
        torneo_id: torneo.id,
        jugador1_id: currentUserId,
        jugador2_id: compañeroId,
        estado: 'confirmado'
      })

    if (error) {
      alert(`Error al inscribirse: ${error.message}`)
    } else {
      alert('¡Inscripción confirmada con éxito!')
      setShowInscribirModal(false)
      router.refresh()
    }
    setLoading(false)
  }

  // Helper para renderizar una tarjeta de partido en el bracket
  const renderMatchCard = (m: PartidoBracket) => {
    const nameP1 = m.pareja1 
      ? `${m.pareja1.j1.full_name.split(' ')[0]} / ${m.pareja1.j2.full_name.split(' ')[0]}`
      : 'Por determinar'
    const nameP2 = m.pareja2
      ? `${m.pareja2.j1.full_name.split(' ')[0]} / ${m.pareja2.j2.full_name.split(' ')[0]}`
      : 'Por determinar'

    const setsP1 = m.sets_pareja1 || ''
    const setsP2 = m.sets_pareja2 || ''

    const isWinnerP1 = m.ganador_id && m.ganador_id === m.pareja1_id
    const isWinnerP2 = m.ganador_id && m.ganador_id === m.pareja2_id
    
    return (
      <div key={m.id} className="p-3 bg-white border border-slate-200/60 rounded-2xl shadow-sm text-xs space-y-2 hover:border-cyan-200 transition-colors">
        {/* Pareja 1 */}
        <div className={`flex justify-between items-center p-1.5 rounded-lg ${isWinnerP1 ? 'bg-green-50/70 font-extrabold text-green-700' : ''}`}>
          <span className="truncate pr-2">{nameP1}</span>
          <span className="font-kanit font-black">{setsP1}</span>
        </div>
        {/* Pareja 2 */}
        <div className={`flex justify-between items-center p-1.5 rounded-lg ${isWinnerP2 ? 'bg-green-50/70 font-extrabold text-green-700' : ''}`}>
          <span className="truncate pr-2">{nameP2}</span>
          <span className="font-kanit font-black">{setsP2}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="px-5 pt-6 space-y-6 animate-fade-in pb-12">
      
      {/* Cabecera / Retorno */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
        <Link
          href="/torneos"
          className="p-1 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft size={22} className="stroke-[2.5]" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-lg font-black text-slate-900 font-kanit truncate">{torneo.nombre}</h1>
          <p className="text-xs text-slate-500 font-medium">Cuadro de brackets y parejas oficiales</p>
        </div>
      </div>

      {/* Ficha técnica */}
      <div className="card p-5 bg-white space-y-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
          Ficha del torneo
        </p>

        <p className="text-xs text-slate-600 leading-normal font-medium">
          {torneo.descripcion || 'Torneo oficial para subir nivel de ranking general.'}
        </p>

        <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-brand-500" />
            <span>{formatDateShort(torneo.fecha_inicio)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={14} className="text-brand-500" />
            <span>Parejas: {inscripciones.length}/{torneo.max_parejas}</span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <Swords size={14} className="text-brand-500" />
            <span>Niveles admitidos: {torneo.nivel_min.toFixed(2)} - {torneo.nivel_max.toFixed(2)}</span>
          </div>
        </div>

        {/* Inscripción de Pareja */}
        {torneo.estado === 'inscripciones' && (
          <div className="pt-2">
            {isMiembroInscrito ? (
              <div className="p-3.5 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center gap-2 text-xs font-bold shadow-sm">
                <UserCheck size={16} /> Ya estás inscrito con {miInscripcion.j1.id === currentUserId ? miInscripcion.j2.full_name?.split(' ')[0] : miInscripcion.j1.full_name?.split(' ')[0]}
              </div>
            ) : inscripciones.length >= torneo.max_parejas ? (
              <button
                disabled
                className="btn-secondary w-full py-3 text-xs font-bold justify-center opacity-50 cursor-not-allowed"
              >
                <Lock size={14} /> Inscripciones llenas
              </button>
            ) : (
              <button
                onClick={() => setShowInscribirModal(true)}
                className="btn-primary w-full py-3.5 text-xs font-bold justify-center shadow-green"
              >
                <Plus size={14} className="stroke-[3]" /> Registrar Mi Pareja
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('brackets')}
          className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all ${
            activeTab === 'brackets' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400'
          }`}
        >
          Cuadro de Brackets
        </button>
        <button
          onClick={() => setActiveTab('parejas')}
          className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all ${
            activeTab === 'parejas' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400'
          }`}
        >
          Parejas Inscritas ({inscripciones.length})
        </button>
      </div>

      {/* Contenido de pestañas */}
      {activeTab === 'parejas' ? (
        <div className="space-y-2.5">
          {inscripciones.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 text-xs font-semibold">
              Ninguna pareja inscrita todavía. ¡Sé el primero!
            </div>
          ) : (
            <div className="space-y-2">
              {inscripciones.map(ins => (
                <div key={ins.id} className="card p-4 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <PlayerAvatar name={ins.j1.full_name || ins.j1.email} avatarUrl={ins.j1.avatar_url} size="sm" className="border-2 border-white" />
                      <PlayerAvatar name={ins.j2.full_name || ins.j2.email} avatarUrl={ins.j2.avatar_url} size="sm" className="border-2 border-white" />
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      <p>{ins.j1.full_name || ins.j1.email.split('@')[0]}</p>
                      <p className="mt-0.5 text-slate-400 font-medium">con {ins.j2.full_name || ins.j2.email.split('@')[0]}</p>
                    </div>
                  </div>
                  <div className="text-right text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Confirmado
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {torneo.estado === 'inscripciones' ? (
            <div className="text-center py-12 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 text-xs font-semibold p-4">
              <Swords size={32} className="mx-auto text-slate-300 mb-2" />
              <p>El cuadro de brackets oficiales se generará automáticamente cuando el administrador cierre las inscripciones e inicie el torneo.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Ronda 1: Cuartos de Final (si existen) */}
              {partidosCuartos.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-cyan-accent uppercase tracking-widest pl-1">
                    ⚔️ Cuartos de Final
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {partidosCuartos.map(renderMatchCard)}
                  </div>
                </div>
              )}

              {/* Ronda 2: Semifinal */}
              {partidosSemis.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest pl-1">
                    🔥 Semifinal
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {partidosSemis.map(renderMatchCard)}
                  </div>
                </div>
              )}

              {/* Ronda 3: Gran Final */}
              {partidosFinal.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-brand-600 uppercase tracking-widest pl-1">
                    👑 Gran Final
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {partidosFinal.map(renderMatchCard)}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* Modal de Inscripción de Pareja */}
      {showInscribirModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="card w-full max-w-sm p-6 bg-white shadow-xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 font-kanit tracking-tight border-b border-slate-100 pb-3">
              📝 Registrar Pareja
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Selecciona a tu compañero de juego
                </label>
                <select
                  value={compañeroId}
                  onChange={e => setCompañeroId(e.target.value)}
                  className="form-input w-full rounded-xl px-4 py-3 text-xs bg-white border border-slate-200"
                >
                  <option value="">Seleccionar jugador…</option>
                  {todosJugadores.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.full_name || j.email.split('@')[0]} ({parseFloat(j.nivel as any).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInscribirModal(false)}
                  className="btn-secondary flex-1 py-3 text-xs justify-center"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleInscribirse}
                  disabled={loading}
                  className="btn-primary flex-1 py-3 text-xs justify-center shadow-green"
                >
                  {loading ? 'Guardando…' : 'Inscribirse'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
