'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PlayerAvatar from '@/components/PlayerAvatar'
import LevelBadge from '@/components/LevelBadge'
import { createClient } from '@/lib/supabase/client'
import { calcularElo } from '@/lib/elo'
import { formatDateShort, formatTime } from '@/lib/utils'
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Swords,
  Share2,
  Send,
  UserPlus,
  UserMinus,
  MessageSquare,
  Lock,
  Trophy,
  Check
} from 'lucide-react'

interface Jugador {
  id: string
  full_name: string | null
  email: string
  avatar_url: string | null
  nivel: number
}

interface Inscripcion {
  id: string
  estado: string
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
  creador_id: string
  creador: { id: string; full_name: string | null; email: string; avatar_url: string | null; nivel: number }
  inscripciones: Inscripcion[]
}

interface DetallePartidoClientProps {
  partido: Partido
  currentUserId: string | null
  userProfile?: any
}

interface Mensaje {
  id: string
  texto: string
  created_at: string
  autor_id: string
  autor: { full_name: string | null; email: string; avatar_url: string | null }
}

export default function DetallePartidoClient({
  partido: initialPartido,
  currentUserId,
  userProfile
}: DetallePartidoClientProps) {
  const [partido, setPartido] = useState<Partido>(initialPartido)
  const [loading, setLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  
  // Estados para el Chat
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Estados para el registro de resultados (Modal)
  const [showResultModal, setShowResultModal] = useState(false)
  const [setsGanadores, setSetsGanadores] = useState('')
  const [setsPerdedores, setSetsPerdedores] = useState('')
  const [parejaGanadora, setParejaGanadora] = useState<'ganadores' | 'perdedores'>('ganadores')

  const router = useRouter()
  const sb = createClient()

  const creador = partido.creador
  const isCreator = currentUserId === partido.creador_id
  const inscripciones = partido.inscripciones || []
  const apuntadosCount = inscripciones.filter(i => i.estado === 'confirmado').length
  const maxCount = partido.max_jugadores
  const esCompleto = apuntadosCount >= maxCount
  const userInscripcion = inscripciones.find(ins => ins.jugador.id === currentUserId)
  const isApuntado = userInscripcion?.estado === 'confirmado'
  const isPendiente = userInscripcion?.estado === 'pendiente'

  // 1. Cargar mensajes del chat
  const fetchMensajes = async () => {
    const { data, error } = await sb
      .from('mensajes_partido')
      .select(`
        id,
        texto,
        created_at,
        autor_id,
        autor:autor_id(full_name, email, avatar_url)
      `)
      .eq('partido_id', partido.id)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setMensajes(data as any)
    }
  }

  // 2. Escuchar Realtime de mensajes y actualizaciones del partido
  useEffect(() => {
    fetchMensajes()

    // Suscribir al chat en tiempo real
    const chatChannel = sb
      .channel(`chat:${partido.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensajes_partido', filter: `partido_id=eq.${partido.id}` },
        () => {
          fetchMensajes()
        }
      )
      .subscribe()

    // Suscribir a inscripciones en tiempo real
    const inscripcionesChannel = sb
      .channel(`inscripciones:${partido.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inscripciones', filter: `partido_id=eq.${partido.id}` },
        async () => {
          // Recargar datos completos del partido
          const { data } = await sb
            .from('partidos_abiertos')
            .select(`
              *,
              creador:creador_id(id, full_name, email, avatar_url, nivel),
              inscripciones(
                id,
                jugador:jugador_id(id, full_name, email, avatar_url, nivel)
              )
            `)
            .eq('id', partido.id)
            .single()
          
          if (data) {
            setPartido(data as any)
          }
        }
      )
      .subscribe()

    return () => {
      sb.removeChannel(chatChannel)
      sb.removeChannel(inscripcionesChannel)
    }
  }, [partido.id])

  // Deslizar el chat al final cuando se cargan mensajes nuevos
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  // 3. Sistema para unirse
  const handleJoin = async () => {
    if (!currentUserId) {
      router.push('/login')
      return
    }

    setActionError(null)
    setLoading(true)

    // Validar nivel
    if (userProfile) {
      const nivelUser = parseFloat(userProfile.nivel || 1.0)
      if (nivelUser < partido.nivel_min || nivelUser > partido.nivel_max) {
        setActionError(`Tu nivel (${nivelUser.toFixed(2)}) no se encuentra dentro del rango requerido.`)
        setLoading(false)
        return
      }
    }

    const { error } = await sb
      .from('inscripciones')
      .insert({
        partido_id: partido.id,
        jugador_id: currentUserId,
        estado: 'pendiente'
      })

    if (error) {
      setActionError(error.message)
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  // 4. Sistema para salirse
  const handleLeave = async () => {
    if (!currentUserId) return
    setActionError(null)
    setLoading(true)

    const userInsc = inscripciones.find(ins => ins.jugador.id === currentUserId)
    if (!userInsc) return

    const { error } = await sb
      .from('inscripciones')
      .delete()
      .eq('id', userInsc.id)

    if (error) {
      setActionError(error.message)
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  // 4.5 Creador acepta o rechaza
  const handleAprobar = async (inscripcionId: string, nuevoEstado: 'confirmado' | 'rechazado') => {
    setLoading(true)
    const { error } = await sb
      .from('inscripciones')
      .update({ estado: nuevoEstado })
      .eq('id', inscripcionId)

    if (error) {
      setActionError(error.message)
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  // 5. Enviar mensaje de chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoMensaje.trim()) return

    const txt = nuevoMensaje.trim()
    setNuevoMensaje('')

    await sb
      .from('mensajes_partido')
      .insert({
        partido_id: partido.id,
        autor_id: currentUserId,
        texto: txt
      })
  }

  // 6. Invitación inteligente
  const handleShare = () => {
    const inviteLink = `${window.location.origin}/partidos/${partido.id}`
    const text = `¡Únete a mi partido en Punto de Padel! 🎾\n📍 En: ${partido.club}\n📅 Fecha: ${formatDateShort(partido.fecha)} a las ${formatTime(partido.hora)}h\n👉 Únete aquí: ${inviteLink}`
    
    if (navigator.share) {
      navigator.share({
        title: 'Invitación a Partido · Punto de Padel',
        text: text,
        url: inviteLink
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(inviteLink)
      alert('¡Enlace de invitación copiado al portapapeles!')
    }
  }

  // 7. Registro de resultados y cálculo Elo Playtomic
  const handleSaveResult = async () => {
    if (!setsGanadores || !setsPerdedores) {
      alert('Por favor, introduce los sets de ambos equipos.')
      return
    }

    setLoading(true)
    try {
      // Necesitamos tener exactamente 4 jugadores para realizar el cálculo de Elo dinámico
      if (inscripciones.length < 4) {
        alert('Para registrar resultados oficiales y puntuar en el ranking, el partido debe estar completo (4 jugadores).')
        setLoading(false)
        return
      }

      // Identificar pareja 1 (Ganadores o creador + acompañante en orden de llegada)
      // Para simplificar, dividimos a los 4 jugadores en 2 parejas fijas:
      // Pareja A: Jugador 1 y Jugador 2 (Índices 0 y 1)
      // Pareja B: Jugador 3 y Jugador 4 (Índices 2 y 3)
      const p1 = inscripciones[0].jugador
      const p2 = inscripciones[1].jugador
      const p3 = inscripciones[2].jugador
      const p4 = inscripciones[3].jugador

      let ganadores = [p1, p2]
      let perdedores = [p3, p4]

      if (parejaGanadora === 'perdedores') {
        ganadores = [p3, p4]
        perdedores = [p1, p2]
      }

      // Calcular el nivel promedio de ambas parejas
      const nivelGanPromedio = (ganadores[0].nivel + ganadores[1].nivel) / 2
      const nivelPerPromedio = (perdedores[0].nivel + perdedores[1].nivel) / 2

      // Aplicar cálculo de Elo Playtomic
      const { deltaGanador } = calcularElo(nivelGanPromedio, nivelPerPromedio, 1.0) // Multiplicador 1.0 para partidos normales

      // Guardar el partido en la tabla 'partidos' (historial oficial)
      const { error: errPartidoHistorial } = await sb
        .from('partidos')
        .insert({
          ganador_1_id: ganadores[0].id,
          ganador_2_id: ganadores[1].id,
          perdedor_1_id: perdedores[0].id,
          perdedor_2_id: perdedores[1].id,
          sets_ganadores: setsGanadores,
          sets_perdedores: setsPerdedores,
          delta_nivel: deltaGanador,
          tipo_actividad: 'partido',
          multiplicador: 1.0,
          creado_por: currentUserId
        })

      if (errPartidoHistorial) throw errPartidoHistorial

      // Actualizar el perfil y nivel Elo de los ganadores en Supabase
      for (const g of ganadores) {
        const nuevoNivel = Number(Math.min(10.0, g.nivel + deltaGanador).toFixed(2))
        const { error } = await sb.rpc('incrementar_stats_jugador', {
          user_id: g.id,
          es_victoria: true,
          nuevo_elo: nuevoNivel,
          delta_elo: deltaGanador
        })
        if (error) {
          // Fallback manual si no existe la RPC en Supabase
          const { data: prof } = await sb.from('profiles').select('partidos, victorias, racha, racha_max').eq('id', g.id).single()
          if (prof) {
            const pCount = (prof.partidos || 0) + 1
            const wCount = (prof.victorias || 0) + 1
            const currentRacha = Math.max(1, (prof.racha || 0) + 1)
            const maxRacha = Math.max(currentRacha, prof.racha_max || 0)
            await sb.from('profiles').update({
              nivel: nuevoNivel,
              nivel_previo: g.nivel,
              partidos: pCount,
              victorias: wCount,
              racha: currentRacha,
              racha_max: maxRacha
            }).eq('id', g.id)
          }
        }
      }

      // Actualizar el perfil y nivel Elo de los perdedores en Supabase
      for (const p of perdedores) {
        const nuevoNivel = Number(Math.max(0.0, p.nivel - deltaGanador).toFixed(2))
        const { error } = await sb.rpc('incrementar_stats_jugador', {
          user_id: p.id,
          es_victoria: false,
          nuevo_elo: nuevoNivel,
          delta_elo: -deltaGanador
        })
        if (error) {
          // Fallback manual
          const { data: prof } = await sb.from('profiles').select('partidos, derrotas, racha').eq('id', p.id).single()
          if (prof) {
            const pCount = (prof.partidos || 0) + 1
            const lCount = (prof.derrotas || 0) + 1
            const currentRacha = Math.min(-1, (prof.racha || 0) - 1)
            await sb.from('profiles').update({
              nivel: nuevoNivel,
              nivel_previo: p.nivel,
              partidos: pCount,
              derrotas: lCount,
              racha: currentRacha
            }).eq('id', p.id)
          }
        }
      }

      // Actualizar el estado del partido abierto a finalizado
      await sb
        .from('partidos_abiertos')
        .update({ estado: 'finalizado' })
        .eq('id', partido.id)

      setShowResultModal(false)
      alert('¡Partido registrado con éxito y niveles actualizados!')
      
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      alert(`Error al registrar el resultado: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const dateStr = formatDateShort(partido.fecha)
  const timeStr = formatTime(partido.hora)
  const isFinalizado = partido.estado === 'finalizado'

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Scrollable Container */}
      <div className="flex-1 px-5 pt-6 space-y-6 pb-20">
        
        {/* Cabecera / Retorno */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Link
              href="/partidos"
              className="p-1 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ChevronLeft size={22} className="stroke-[2.5]" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-slate-900 font-kanit">Detalle del Partido</h1>
              <p className="text-xs text-slate-500 font-medium">Gestión del partido y chat grupal</p>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
            title="Compartir link de invitación"
          >
            <Share2 size={16} />
          </button>
        </div>

        {actionError && (
          <div className="p-3.5 rounded-xl text-xs font-bold bg-red-50 border border-red-200 text-red-700">
            {actionError}
          </div>
        )}

        {/* Ficha técnica del Partido */}
        <div className="card p-5 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Ficha del encuentro
            </span>
            <span
              className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                isFinalizado
                  ? 'bg-slate-100 border-slate-200 text-slate-600'
                  : esCompleto
                  ? 'bg-purple-50 border-purple-200 text-purple-700'
                  : 'bg-green-50 border-green-200 text-green-700'
              }`}
            >
              {isFinalizado ? 'Finalizado 🏁' : esCompleto ? 'Completo 🔒' : 'Abierto 🔓'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin size={14} className="text-brand-500 flex-shrink-0" />
              <span className="truncate text-slate-800">{partido.club}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-brand-500" />
              <span>{dateStr}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-brand-500" />
              <span>{timeStr}h</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign size={14} className="text-brand-500" />
              <span>{partido.precio > 0 ? `${partido.precio.toFixed(2)}€ / pers` : 'Gratis'}</span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <Swords size={14} className="text-brand-500" />
              <span>Nivel Requerido: {partido.nivel_min.toFixed(2)} - {partido.nivel_max.toFixed(2)}</span>
            </div>
          </div>

          {/* Botones principales de Inscripción */}
          {!isFinalizado && (
            <div className="pt-2">
              {isApuntado ? (
                <button
                  onClick={handleLeave}
                  disabled={loading}
                  className="btn-secondary w-full py-3 text-xs font-bold justify-center border-red-200 hover:bg-red-50/50 hover:text-red-600 transition-colors"
                >
                  <UserMinus size={14} /> Salirse del partido
                </button>
              ) : isPendiente ? (
                <div className="flex flex-col gap-2">
                  <button disabled className="btn-secondary w-full py-3 text-xs font-bold justify-center opacity-70 bg-amber-50 text-amber-700 border-amber-200">
                    <Clock size={14} /> Solicitud pendiente de confirmación
                  </button>
                  <button
                    onClick={handleLeave}
                    disabled={loading}
                    className="btn-secondary w-full py-2.5 text-[10px] font-bold justify-center border-red-200 hover:bg-red-50/50 hover:text-red-600 transition-colors"
                  >
                    Cancelar solicitud
                  </button>
                </div>
              ) : esCompleto ? (
                <button
                  disabled
                  className="btn-secondary w-full py-3 text-xs font-bold justify-center opacity-50 cursor-not-allowed"
                >
                  <Lock size={14} /> Partido completo
                </button>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={loading}
                  className="btn-primary w-full py-3 text-xs font-bold justify-center shadow-green"
                >
                  <UserPlus size={14} /> Unirme al partido
                </button>
              )}
            </div>
          )}
        </div>

        {/* Jugadores Inscritos */}
        <div className="space-y-3">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
            Jugadores apuntados ({apuntadosCount}/{maxCount})
          </h2>

          <div className="card p-4 bg-white divide-y divide-slate-100 shadow-sm border border-slate-100">
            {inscripciones.filter(i => i.estado === 'confirmado').map(ins => {
              const p = ins.jugador
              const isMatchCreator = p.id === partido.creador_id
              return (
                <div key={ins.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <PlayerAvatar
                      name={p.full_name || p.email}
                      avatarUrl={p.avatar_url}
                      size="sm"
                      className="border border-slate-100"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {p.full_name || p.email.split('@')[0]}
                      </p>
                      {isMatchCreator && (
                        <span className="text-[8px] font-black uppercase text-brand-600 bg-brand-50 border border-brand-100 rounded-md px-1 py-0.5 mt-0.5 inline-block">
                          Organizador
                        </span>
                      )}
                    </div>
                  </div>
                  <LevelBadge nivel={parseFloat(p.nivel as any)} size="sm" />
                </div>
              )
            })}
          </div>

          {/* Solicitudes pendientes (Solo para el creador) */}
          {isCreator && inscripciones.some(i => i.estado === 'pendiente') && (
            <div className="mt-4">
              <h2 className="text-xs font-black text-amber-500 uppercase tracking-widest pl-1 mb-2 flex items-center gap-1">
                <Clock size={14} /> Solicitudes Pendientes
              </h2>
              <div className="card p-4 bg-amber-50/30 divide-y divide-amber-100 border border-amber-200">
                {inscripciones.filter(i => i.estado === 'pendiente').map(ins => {
                  const p = ins.jugador
                  return (
                    <div key={ins.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <PlayerAvatar
                          name={p.full_name || p.email}
                          avatarUrl={p.avatar_url}
                          size="sm"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {p.full_name || p.email.split('@')[0]}
                          </p>
                          <LevelBadge nivel={parseFloat(p.nivel as any)} size="sm" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAprobar(ins.id, 'confirmado')}
                          disabled={loading || esCompleto}
                          className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-[10px] font-bold shadow-sm transition-colors disabled:opacity-50"
                        >
                          Aceptar
                        </button>
                        <button
                          onClick={() => handleAprobar(ins.id, 'rechazado')}
                          disabled={loading}
                          className="px-3 py-1.5 bg-white hover:bg-red-50 border border-slate-200 text-red-600 rounded-lg text-[10px] font-bold shadow-sm transition-colors"
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Registro del resultado de partido oficial */}
        {isApuntado && !isFinalizado && (
          <div className="card p-4 bg-green-50/20 border border-green-200/50 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏆</span>
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 font-kanit">Finalizar y Registrar Resultado</h3>
                <p className="text-[9px] text-slate-500 font-medium">Introduce el marcador de sets oficial</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (inscripciones.length < 4) {
                  alert('El partido debe estar completo (4 jugadores) para poder registrar un resultado oficial en el ranking.')
                  return
                }
                setShowResultModal(true)
              }}
              className="btn-primary py-2.5 text-xs font-bold justify-center"
            >
              Registrar Marcador Oficial
            </button>
          </div>
        )}

        {/* Chat en tiempo real */}
        {isApuntado && (
          <div className="card bg-white border border-slate-100 shadow-sm flex flex-col h-80 overflow-hidden relative">
            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
              <MessageSquare size={14} className="text-brand-600" />
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                Chat del partido
              </span>
            </div>

            {/* Listado de mensajes */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {mensajes.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-[10px] font-semibold">
                  No hay mensajes. ¡Di hola al grupo! 👋
                </div>
              ) : (
                mensajes.map(m => {
                  const esMio = m.autor_id === currentUserId
                  const autorName = m.autor?.full_name || m.autor?.email?.split('@')[0] || 'Jugador'
                  
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col max-w-[80%] ${esMio ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      <span className="text-[8px] font-bold text-slate-400 mb-0.5">
                        {autorName}
                      </span>
                      <div
                        className={`px-3 py-2 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                          esMio
                            ? 'bg-brand-600 text-white rounded-tr-none'
                            : 'bg-slate-100 text-slate-800 rounded-tl-none'
                        }`}
                      >
                        {m.texto}
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Entrada del chat */}
            <form onSubmit={handleSendMessage} className="p-2.5 border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                value={nuevoMensaje}
                onChange={e => setNuevoMensaje(e.target.value)}
                className="input-base py-2 text-xs rounded-xl flex-1 border border-slate-200"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors cursor-pointer"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        )}

      </div>

      {/* Modal para Registro de Resultados */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="card w-full max-w-sm p-6 bg-white shadow-xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 font-kanit tracking-tight border-b border-slate-100 pb-3">
              🏆 Marcador del Partido
            </h3>

            <div className="space-y-4">
              
              {/* Selección de pareja ganadora */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  ¿Quién ganó el encuentro?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setParejaGanadora('ganadores')}
                    className={`p-3 rounded-xl border text-xs font-bold text-center flex flex-col items-center gap-1.5 ${
                      parejaGanadora === 'ganadores'
                        ? 'border-brand-500 bg-brand-50/50 text-brand-700'
                        : 'border-slate-200 bg-white text-slate-500'
                    }`}
                  >
                    <span className="text-base">1️⃣</span>
                    <span className="truncate w-full">Pareja A ({inscripciones[0]?.jugador.full_name?.split(' ')[0]} y {inscripciones[1]?.jugador.full_name?.split(' ')[0]})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setParejaGanadora('perdedores')}
                    className={`p-3 rounded-xl border text-xs font-bold text-center flex flex-col items-center gap-1.5 ${
                      parejaGanadora === 'perdedores'
                        ? 'border-brand-500 bg-brand-50/50 text-brand-700'
                        : 'border-slate-200 bg-white text-slate-500'
                    }`}
                  >
                    <span className="text-base">2️⃣</span>
                    <span className="truncate w-full">Pareja B ({inscripciones[2]?.jugador.full_name?.split(' ')[0]} y {inscripciones[3]?.jugador.full_name?.split(' ')[0]})</span>
                  </button>
                </div>
              </div>

              {/* Sets ganadores y perdedores */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-500 mb-1">Sets Ganador (ej: 6-3, 6-7, 10-8)</label>
                  <input
                    type="text"
                    id="resPGan"
                    placeholder="6-3, 6-7, 10-8"
                    value={setsGanadores}
                    onChange={e => setSetsGanadores(e.target.value)}
                    className="input-base"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-500 mb-1">Sets Perdedor (ej: 3-6, 7-6, 8-10)</label>
                  <input
                    type="text"
                    id="resPPer"
                    required
                    placeholder="3-6, 7-6, 8-10"
                    value={setsPerdedores}
                    onChange={e => setSetsPerdedores(e.target.value)}
                    className="input-base"
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowResultModal(false)}
                  className="btn-secondary flex-1 py-3 text-xs justify-center"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveResult}
                  disabled={loading}
                  className="btn-primary flex-1 py-3 text-xs justify-center shadow-green"
                >
                  {loading ? 'Guardando…' : 'Confirmar'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}
