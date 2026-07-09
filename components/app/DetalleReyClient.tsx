'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PlayerAvatar from '@/components/PlayerAvatar'
import { createClient } from '@/lib/supabase/client'
import { formatDateShort, formatTime } from '@/lib/utils'
import { calcularElo } from '@/lib/elo'
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Clock,
  Swords,
  UserPlus,
  Trophy
} from 'lucide-react'

export default function DetalleReyClient({
  rey: initialRey,
  inscripciones: initialInscripciones,
  currentUserId,
  currentUserLevel,
  amigos
}: any) {
  const [rey, setRey] = useState(initialRey)
  const [inscripciones, setInscripciones] = useState(initialInscripciones || [])
  const [loading, setLoading] = useState(false)
  
  // Estados para invitar
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [loadingAmigos, setLoadingAmigos] = useState(false)
  
  // Estados para Cerrar Rey de Pista
  const [showResultModal, setShowResultModal] = useState(false)
  // rankings = objeto de { jugador_id: puntos }
  const [rankings, setRankings] = useState<Record<string, string>>({})

  const router = useRouter()
  const sb = createClient()

  const isCreator = currentUserId === rey.creador_id
  const apuntadosCount = inscripciones.length
  const maxCount = rey.max_jugadores
  const esCompleto = apuntadosCount >= maxCount
  const isApuntado = inscripciones.some((i: any) => i.jugador.id === currentUserId)

  // Inscribirse
  const handleUnirse = async () => {
    if (!currentUserId) return router.push('/login')
    if (esCompleto) return alert('El Rey de Pista está completo.')
    if (currentUserLevel < rey.nivel_min || currentUserLevel > rey.nivel_max) {
      if (!confirm(`Tu nivel (${currentUserLevel}) está fuera del rango (${rey.nivel_min}-${rey.nivel_max}). ¿Quieres unirte de todos modos?`)) return
    }

    setLoading(true)
    try {
      const { error } = await sb
        .from('rey_inscripciones')
        .insert({
          rey_id: rey.id,
          jugador_id: currentUserId,
          posicion: apuntadosCount + 1
        })
      if (error) throw error
      alert('¡Te has unido al Rey de Pista!')
      router.refresh()
    } catch (err: any) {
      alert(`Error al unirse: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Salir
  const handleSalir = async () => {
    if (isCreator) return alert('El creador no puede salir, debes cancelar el evento.')
    setLoading(true)
    try {
      const { error } = await sb
        .from('rey_inscripciones')
        .delete()
        .eq('rey_id', rey.id)
        .eq('jugador_id', currentUserId)
      if (error) throw error
      alert('Has salido del Rey de Pista')
      router.refresh()
    } catch (err: any) {
      alert(`Error al salir: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Cancelar Evento
  const handleCancelarEvento = async () => {
    if (!confirm('¿Seguro que quieres cancelar este Rey de Pista? Esta acción no se puede deshacer.')) return
    setLoading(true)
    try {
      const { error } = await sb
        .from('rey_de_pista')
        .update({ estado: 'cancelado' })
        .eq('id', rey.id)
      if (error) throw error
      alert('Evento cancelado')
      router.push('/partidos')
    } catch (err: any) {
      alert(`Error: ${err.message}`)
      setLoading(false)
    }
  }

  // Invitar Amigo
  const handleSendInvite = async (amigoId: string) => {
    setLoadingAmigos(true)
    try {
      const { error } = await sb
        .from('notificaciones')
        .insert({
          usuario_id: amigoId,
          tipo: 'sistema',
          mensaje: `${rey.creador?.full_name || 'Alguien'} te ha invitado a un Rey de Pista en ${rey.club}.`,
          enlace: `/rey-de-pista/${rey.id}`
        })
      if (error) throw error
      alert('Invitación enviada')
    } catch (err: any) {
      alert(`Error al invitar: ${err.message}`)
    } finally {
      setLoadingAmigos(false)
    }
  }

  // Cerrar Resultado y Repartir Elo
  const handleCerrarRey = async () => {
    if (Object.keys(rankings).length !== inscripciones.length) {
      return alert('Debes introducir la puntuación final de todos los jugadores.')
    }
    
    setLoading(true)
    try {
      // 1. Convertir rankings a array y ordenar
      const players = inscripciones.map((ins: any) => ({
        id: ins.jugador.id,
        nivel: ins.jugador.nivel,
        puntos: parseInt(rankings[ins.jugador.id]) || 0
      }))

      players.sort((a: any, b: any) => b.puntos - a.puntos) // Mayor a menor

      // 2. Calcular Elo
      // Simulación básica: dividimos la tabla por la mitad (mitad de arriba gana, mitad de abajo pierde).
      // El primero suma más que el segundo. Mínimo 0.01 por estar en la mitad superior.
      const mitad = Math.floor(players.length / 2)
      
      const eloUpdates = players.map((p: any, index: number) => {
        let delta = 0
        
        if (index < mitad) {
          // Ganan
          // El ganador absoluto gana como si hubiera jugado vs el jugador del medio
          const { deltaGanador } = calcularElo(p.nivel, players[mitad]?.nivel || p.nivel, 1.5, 2, 0)
          delta = deltaGanador * (1 - (index * 0.2)) // El 1º suma el 100%, 2º el 80%...
          if (delta < 0.01) delta = 0.01
        } else {
          // Pierden
          const { deltaPerdedor } = calcularElo(p.nivel, players[0]?.nivel || p.nivel, 1.5, 0, 2)
          delta = deltaPerdedor * (1 - ((players.length - 1 - index) * 0.2))
        }

        return { id: p.id, delta: parseFloat(delta.toFixed(2)) }
      })

      // 3. Aplicar Elo a los perfiles
      for (let idx = 0; idx < eloUpdates.length; idx++) {
        const update = eloUpdates[idx]
        const jugador = players[idx]
        const nuevoNivel = Number(Math.min(10.0, Math.max(0.0, jugador.nivel + update.delta)).toFixed(2))
        const esVictoria = update.delta > 0

        const { error } = await sb.rpc('incrementar_stats_jugador', {
          user_id: update.id,
          es_victoria: esVictoria,
          nuevo_elo: nuevoNivel,
          delta_elo: update.delta
        })

        if (error) {
          // Fallback manual
          await sb.from('profiles').update({
            nivel: nuevoNivel,
            nivel_previo: jugador.nivel
          }).eq('id', update.id)
        }
      }

      // 4. Marcar como finalizado
      const { error: errFinalizar } = await sb
        .from('rey_de_pista')
        .update({ estado: 'finalizado' })
        .eq('id', rey.id)
      
      if (errFinalizar) throw errFinalizar

      alert('¡Rey de Pista finalizado y puntos repartidos!')
      setShowResultModal(false)
      router.refresh()
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link href="/partidos" className="p-2 -ml-2 rounded-xl hover:bg-slate-100 text-slate-500">
          <ChevronLeft size={22} className="stroke-[2.5]" />
        </Link>
        <div className="text-center flex-1">
          <h1 className="text-[13px] font-black text-purple-700 uppercase tracking-widest font-kanit">👑 Rey de Pista</h1>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="px-4 py-6 space-y-6 animate-fade-in">
        
        {/* INFO PRINCIPAL */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
              rey.estado === 'abierto' ? 'bg-green-100 text-green-700' :
              rey.estado === 'cancelado' ? 'bg-red-100 text-red-700' :
              rey.estado === 'finalizado' ? 'bg-slate-200 text-slate-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {rey.estado}
            </span>
            <span className="text-xs font-bold text-slate-400">{apuntadosCount}/{maxCount} jug</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><Calendar size={14} /></div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fecha</p>
                <p className="text-xs font-bold text-slate-800">{formatDateShort(rey.fecha)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><Clock size={14} /></div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hora</p>
                <p className="text-xs font-bold text-slate-800">{rey.hora.slice(0, 5)}h</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><MapPin size={14} /></div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Club</p>
                <p className="text-xs font-bold text-slate-800 truncate">{rey.club}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-500"><Swords size={14} /></div>
              <div>
                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Nivel</p>
                <p className="text-xs font-bold text-purple-700">{rey.nivel_min.toFixed(2)} - {rey.nivel_max.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* JUGADORES */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-extrabold text-slate-900 font-kanit uppercase tracking-wider">Jugadores ({apuntadosCount}/{maxCount})</h2>
            {isApuntado && rey.estado === 'abierto' && (
              <button onClick={() => setShowInviteModal(true)} className="text-[10px] font-bold text-brand-500 flex items-center gap-1 bg-brand-50 px-2 py-1 rounded-md">
                <UserPlus size={12} /> Invitar
              </button>
            )}
          </div>
          <div className="space-y-3">
            {inscripciones.map((ins: any) => (
              <div key={ins.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <PlayerAvatar name={ins.jugador.full_name || ins.jugador.email} avatarUrl={ins.jugador.avatar_url} size="md" />
                <div>
                  <p className="text-xs font-bold text-slate-800">{ins.jugador.full_name || ins.jugador.email}</p>
                  <p className="text-[10px] font-bold text-brand-600">Nivel {parseFloat(ins.jugador.nivel).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTONES */}
        {rey.estado === 'abierto' && (
          <div className="flex gap-3">
            {!isApuntado && !esCompleto && (
              <button onClick={handleUnirse} disabled={loading} className="btn-primary flex-1 justify-center py-3.5 shadow-brand">Unirse</button>
            )}
            {isApuntado && !isCreator && (
              <button onClick={handleSalir} disabled={loading} className="btn-secondary flex-1 justify-center py-3.5">Salir</button>
            )}
            {isCreator && (
              <button onClick={() => setShowResultModal(true)} className="btn-primary flex-1 justify-center py-3.5 shadow-brand">Finalizar y Puntuar</button>
            )}
            {isCreator && (
              <button onClick={handleCancelarEvento} disabled={loading} className="btn-secondary flex-1 justify-center py-3.5 border-red-200 text-red-600 hover:bg-red-50">Cancelar</button>
            )}
          </div>
        )}
      </div>

      {/* MODAL INVITAR */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-slide-up relative">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-kanit">Invitar Amigos</h3>
            </div>
            <div className="p-2 max-h-60 overflow-y-auto">
              {amigos.map((amigo: any) => (
                <div key={amigo.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <PlayerAvatar name={amigo.full_name} avatarUrl={amigo.avatar_url} size="sm" />
                    <span className="text-xs font-bold text-slate-800">{amigo.full_name}</span>
                  </div>
                  <button onClick={() => handleSendInvite(amigo.id)} disabled={loadingAmigos} className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-brand-50 text-brand-600">
                    Invitar
                  </button>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100">
              <button onClick={() => setShowInviteModal(false)} className="btn-secondary w-full justify-center">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RESULTADOS Y ELO */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in relative">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-6 text-white text-center">
              <Trophy size={40} className="mx-auto mb-3 text-amber-300 drop-shadow-md" />
              <h3 className="text-lg font-black font-kanit drop-shadow">Clasificación Final</h3>
              <p className="text-[10px] font-medium opacity-90 mt-1">Introduce los puntos finales de cada jugador para calcular el Elo de este evento.</p>
            </div>
            
            <div className="p-5 space-y-4 max-h-80 overflow-y-auto">
              {inscripciones.map((ins: any) => (
                <div key={ins.jugador.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <PlayerAvatar name={ins.jugador.full_name} avatarUrl={ins.jugador.avatar_url} size="sm" />
                    <span className="text-xs font-bold text-slate-800">{ins.jugador.full_name?.split(' ')[0]}</span>
                  </div>
                  <input
                    type="number"
                    placeholder="Puntos"
                    value={rankings[ins.jugador.id] || ''}
                    onChange={e => setRankings(r => ({ ...r, [ins.jugador.id]: e.target.value }))}
                    className="input-base w-24 text-center py-1.5"
                  />
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 flex gap-3">
              <button onClick={() => setShowResultModal(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
              <button onClick={handleCerrarRey} disabled={loading} className="btn-primary flex-1 justify-center">Finalizar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
