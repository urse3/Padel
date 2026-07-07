'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import PlayerAvatar from '@/components/PlayerAvatar'
import { createClient } from '@/lib/supabase/client'
import { getLevelInfo } from '@/lib/elo'
import {
  Settings,
  Users,
  Trophy,
  Megaphone,
  Save,
  Plus,
  Play,
  Check,
  Calendar,
  Lock,
  Swords
} from 'lucide-react'

interface Jugador {
  id: string
  full_name: string | null
  email: string
  avatar_url: string | null
  nivel: number
  partidos: number
  victorias: number
  derrotas: number
  racha: number
  racha_max: number
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

interface InscripcionTorneo {
  id: string
  torneo_id: string
  jugador1_id: string
  jugador2_id: string
  estado: string
  j1: { full_name: string | null; email: string }
  j2: { full_name: string | null; email: string }
}

interface PartidoTorneo {
  id: string
  torneo_id: string
  ronda: number
  posicion: number
  pareja1_id: string | null
  pareja2_id: string | null
  ganador_id: string | null
  sets_pareja1: string | null
  sets_pareja2: string | null
  estado: string
  pareja1: { id: string; j1: { full_name: string }; j2: { full_name: string } } | null
  pareja2: { id: string; j1: { full_name: string }; j2: { full_name: string } } | null
}

interface Pista {
  id: string
  nombre: string
  tipo_pared: 'cristal' | 'muro'
  tipo_techo: 'cubierta' | 'descubierta'
  created_at?: string
}

interface Incidencia {
  id: string
  nombre: string
  email: string
  tipo: string
  mensaje: string
  estado: string
  created_at: string
}

interface AdminClientProps {
  jugadores: Jugador[]
  torneos: Torneo[]
  partidosTorneo: PartidoTorneo[]
  inscripcionesTorneos: InscripcionTorneo[]
  pistas: Pista[]
  incidencias: Incidencia[]
  currentUserId: string
}

export default function AdminClient({
  jugadores,
  torneos,
  partidosTorneo,
  inscripcionesTorneos,
  pistas,
  incidencias
}: AdminClientProps) {
  const [activeTab, setActiveTab] = useState<'jugadores' | 'torneos' | 'anuncios' | 'pistas' | 'incidencias'>('jugadores')
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const sb = createClient()

  // ==========================================
  // ESTADO JUGADORES
  // ==========================================
  const [selectedJugadorId, setSelectedJugadorId] = useState('')
  const [jName, setJName] = useState('')
  const [jNivel, setJNivel] = useState('1.00')
  const [jPartidos, setJPartidos] = useState('0')
  const [jVictorias, setJVictorias] = useState('0')
  const [jDerrotas, setJDerrotas] = useState('0')
  const [jRacha, setJRacha] = useState('0')
  const [jRachaMax, setJRachaMax] = useState('0')

  const handleJugadorSelectChange = (id: string) => {
    setSelectedJugadorId(id)
    if (!id) {
      setJName('')
      setJNivel('1.00')
      setJPartidos('0')
      setJVictorias('0')
      setJDerrotas('0')
      setJRacha('0')
      setJRachaMax('0')
      return
    }
    const j = jugadores.find(jg => jg.id === id)
    if (j) {
      setJName(j.full_name || '')
      setJNivel(j.nivel.toFixed(2))
      setJPartidos(j.partidos.toString())
      setJVictorias(j.victorias.toString())
      setJDerrotas(j.derrotas.toString())
      setJRacha(j.racha.toString())
      setJRachaMax(j.racha_max.toString())
    }
  }

  const handleUpdateJugador = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedJugadorId) return

    setLoading(true)
    const level = parseFloat(jNivel)
    
    const { error } = await sb
      .from('profiles')
      .update({
        full_name: jName.trim(),
        nivel: level,
        partidos: parseInt(jPartidos),
        victorias: parseInt(jVictorias),
        derrotas: parseInt(jDerrotas),
        racha: parseInt(jRacha),
        racha_max: parseInt(jRachaMax)
      })
      .eq('id', selectedJugadorId)

    if (error) {
      alert(`Error al actualizar perfil: ${error.message}`)
    } else {
      alert('✅ Datos del jugador actualizados')
      router.refresh()
    }
    setLoading(false)
  }

  // ==========================================
  // ESTADO TORNEOS CREACIÓN
  // ==========================================
  const [tNombre, setTNombre] = useState('')
  const [tDescripcion, setTDescripcion] = useState('')
  const [tFechaInicio, setTFechaInicio] = useState('')
  const [tFechaFin, setTFechaFin] = useState('')
  const [tNivelMin, setTNivelMin] = useState('0.00')
  const [tNivelMax, setTNivelMax] = useState('10.00')
  const [tMaxParejas, setTMaxParejas] = useState('8')
  const [tPistaId, setTPistaId] = useState('')

  const handleCreateTorneo = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await sb
      .from('torneos')
      .insert({
        nombre: tNombre.trim(),
        descripcion: tDescripcion.trim(),
        fecha_inicio: tFechaInicio,
        fecha_fin: tFechaFin,
        nivel_min: parseFloat(tNivelMin),
        nivel_max: parseFloat(tNivelMax),
        max_parejas: parseInt(tMaxParejas),
        estado: 'inscripciones',
        tipo: 'eliminacion',
        pista_id: tPistaId || null
      })

    if (error) {
      alert(`Error al crear torneo: ${error.message}`)
    } else {
      alert('🏆 Torneo oficial creado con éxito')
      setTNombre('')
      setTDescripcion('')
      setTFechaInicio('')
      setTFechaFin('')
      router.refresh()
    }
    setLoading(false)
  }

  // ==========================================
  // ESTADO TORNEOS GESTIÓN
  // ==========================================
  const [activeTorneoId, setActiveTorneoId] = useState('')
  const activeTorneo = torneos.find(t => t.id === activeTorneoId)
  
  const parejasDelTorneo = inscripcionesTorneos.filter(ins => ins.torneo_id === activeTorneoId)
  const partidosDelTorneo = partidosTorneo.filter(p => p.torneo_id === activeTorneoId)

  // Iniciar Torneo y generar Brackets
  const handleIniciarTorneo = async () => {
    if (!activeTorneoId) return
    
    // Necesitamos tener exactamente 8 parejas para iniciar (cuartos de final)
    if (parejasDelTorneo.length !== 8) {
      alert(`Se necesitan exactamente 8 parejas confirmadas para generar la ronda de cuartos de final. Actualmente hay ${parejasDelTorneo.length} inscritas.`)
      return
    }

    setLoading(true)
    try {
      // 1. Cambiar estado del torneo a 'en_curso'
      const { error: errTorneo } = await sb
        .from('torneos')
        .update({ estado: 'en_curso' })
        .eq('id', activeTorneoId)

      if (errTorneo) throw errTorneo

      // 2. Generar partidos de cuartos (Ronda 1, 4 partidos)
      // Emparejamos pareja 1 contra pareja 2, 3 contra 4, etc.
      const partidosInsert = [
        { torneo_id: activeTorneoId, ronda: 1, posicion: 1, pareja1_id: parejasDelTorneo[0].id, pareja2_id: parejasDelTorneo[1].id, estado: 'pendiente' },
        { torneo_id: activeTorneoId, ronda: 1, posicion: 2, pareja1_id: parejasDelTorneo[2].id, pareja2_id: parejasDelTorneo[3].id, estado: 'pendiente' },
        { torneo_id: activeTorneoId, ronda: 1, posicion: 3, pareja1_id: parejasDelTorneo[4].id, pareja2_id: parejasDelTorneo[5].id, estado: 'pendiente' },
        { torneo_id: activeTorneoId, ronda: 1, posicion: 4, pareja1_id: parejasDelTorneo[6].id, pareja2_id: parejasDelTorneo[7].id, estado: 'pendiente' }
      ]

      const { error: errPartidos1 } = await sb
        .from('partidos_torneo')
        .insert(partidosInsert)

      if (errPartidos1) throw errPartidos1

      // 3. Generar semifinales vacías (Ronda 2, 2 partidos)
      const semisInsert = [
        { torneo_id: activeTorneoId, ronda: 2, posicion: 1, pareja1_id: null, pareja2_id: null, estado: 'pendiente' },
        { torneo_id: activeTorneoId, ronda: 2, posicion: 2, pareja1_id: null, pareja2_id: null, estado: 'pendiente' }
      ]

      const { error: errPartidos2 } = await sb
        .from('partidos_torneo')
        .insert(semisInsert)

      if (errPartidos2) throw errPartidos2

      // 4. Generar final vacía (Ronda 3, 1 partido)
      const finalInsert = [
        { torneo_id: activeTorneoId, ronda: 3, posicion: 1, pareja1_id: null, pareja2_id: null, estado: 'pendiente' }
      ]

      const { error: errPartidos3 } = await sb
        .from('partidos_torneo')
        .insert(finalInsert)

      if (errPartidos3) throw errPartidos3

      alert('⚡ ¡Torneo Iniciado y Brackets de Cuartos de Final generados!')
      router.refresh()
    } catch (err: any) {
      alert(`Error al iniciar torneo: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Cargar marcador del bracket
  const [selectedPartidoId, setSelectedPartidoId] = useState('')
  const [setsP1, setSetsP1] = useState('')
  const [setsP2, setSetsP2] = useState('')
  const [ganadorPareja, setGanadorPareja] = useState<'p1' | 'p2'>('p1')
  const [showScoreModal, setShowScoreModal] = useState(false)

  const handleOpenScoreModal = (partidoId: string) => {
    setSelectedPartidoId(partidoId)
    setSetsP1('')
    setSetsP2('')
    setGanadorPareja('p1')
    setShowScoreModal(true)
  }

  const handleSaveMatchScore = async () => {
    if (!setsP1 || !setsP2) {
      alert('Introduce el marcador.')
      return
    }

    const p = partidosDelTorneo.find(part => part.id === selectedPartidoId)
    if (!p) return

    setLoading(true)
    try {
      const ganadorId = ganadorPareja === 'p1' ? p.pareja1_id : p.pareja2_id
      
      // 1. Actualizar partido del torneo en curso
      const { error: errPartido } = await sb
        .from('partidos_torneo')
        .update({
          sets_pareja1: setsP1,
          sets_pareja2: setsP2,
          ganador_id: ganadorId,
          estado: 'jugado'
        })
        .eq('id', selectedPartidoId)

      if (errPartido) throw errPartido

      // 2. Avanzar al ganador en la siguiente ronda
      if (p.ronda < 3) {
        const siguienteRonda = p.ronda + 1
        const siguientePosicion = Math.ceil(p.posicion / 2)
        const esPrimerSlot = p.posicion % 2 !== 0 // Posición impar va a pareja1, par a pareja2

        // Buscar partido de siguiente ronda
        const siguientePartido = partidosDelTorneo.find(
          part => part.ronda === siguienteRonda && part.posicion === siguientePosicion
        )

        if (siguientePartido) {
          const updateObj: any = {}
          if (esPrimerSlot) {
            updateObj.pareja1_id = ganadorId
          } else {
            updateObj.pareja2_id = ganadorId
          }

          const { error: errAvance } = await sb
            .from('partidos_torneo')
            .update(updateObj)
            .eq('id', siguientePartido.id)

          if (errAvance) throw errAvance
        }
      } else {
        // Es la final (ronda 3). Cerrar torneo como finalizado
        const { error: errCierre } = await sb
          .from('torneos')
          .update({ estado: 'finalizado' })
          .eq('id', activeTorneoId)

        if (errCierre) throw errCierre
        alert('🏆 ¡La gran final ha concluido! El torneo ha finalizado.')
      }

      alert('Marcador guardado y cuadro de brackets actualizado.')
      setShowScoreModal(false)
      router.refresh()
    } catch (err: any) {
      alert(`Error al guardar marcador: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // ESTADO ANUNCIOS/NOTICIAS
  // ==========================================
  const [nTitulo, setNTitulo] = useState('')
  const [nDescripcion, setNDescripcion] = useState('')
  const [nTipo, setNTipo] = useState<'noticia' | 'evento' | 'torneo_destacado'>('noticia')

  const handleCreateAnuncio = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await sb
      .from('eventos')
      .insert({
        titulo: nTitulo.trim(),
        descripcion: nDescripcion.trim(),
        tipo: nTipo,
        published: true,
        fecha: new Date().toISOString().split('T')[0]
      })

    if (error) {
      alert(`Error al crear anuncio: ${error.message}`)
    } else {
      alert('📢 Anuncio/noticia publicado en la landing')
      setNTitulo('')
      setNDescripcion('')
      router.refresh()
    }
    setLoading(false)
  }

  // ==========================================
  // ESTADO PISTAS CREACIÓN
  // ==========================================
  const [pNombre, setPNombre] = useState('')
  const [pPared, setPPared] = useState<'cristal'|'muro'>('cristal')
  const [pTecho, setPTecho] = useState<'cubierta'|'descubierta'>('cubierta')

  const handleCreatePista = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await sb
      .from('pistas')
      .insert({
        nombre: pNombre.trim(),
        tipo_pared: pPared,
        tipo_techo: pTecho
      })

    if (error) {
      alert(`Error al crear pista: ${error.message}`)
    } else {
      alert('🎾 Pista creada con éxito')
      setPNombre('')
      setPPared('cristal')
      setPTecho('cubierta')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="px-5 pt-6 space-y-6 animate-fade-in pb-12">
      
      {/* Cabecera */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800">
          <Settings size={20} />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-900 font-kanit">Panel de Administración</h1>
          <p className="text-xs text-slate-500 font-medium">Gestión global de Punto de Padel</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('jugadores')}
          className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all ${
            activeTab === 'jugadores' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400'
          }`}
        >
          Jugadores
        </button>
        <button
          onClick={() => setActiveTab('torneos')}
          className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all ${
            activeTab === 'torneos' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400'
          }`}
        >
          Torneos
        </button>
        <button
          onClick={() => setActiveTab('anuncios')}
          className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all ${
            activeTab === 'anuncios' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400'
          }`}
        >
          Anuncios
        </button>
        <button
          onClick={() => setActiveTab('pistas')}
          className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all ${
            activeTab === 'pistas' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400'
          }`}
        >
          Pistas
        </button>
        <button
          onClick={() => setActiveTab('incidencias')}
          className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all ${
            activeTab === 'incidencias' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400'
          }`}
        >
          Incidencias
        </button>
      </div>

      {/* TAB JUGADORES */}
      {activeTab === 'jugadores' && (
        <form onSubmit={handleUpdateJugador} className="space-y-4">
          <h2 className="text-sm font-extrabold text-slate-950 font-kanit uppercase tracking-wider pl-1">
            ✏️ Editar Perfil de Jugador
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Selecciona al Jugador
              </label>
              <select
                value={selectedJugadorId}
                onChange={e => handleJugadorSelectChange(e.target.value)}
                className="form-input w-full rounded-xl px-4 py-3 text-xs bg-white border border-slate-200"
              >
                <option value="">Seleccionar jugador…</option>
                {jugadores.map(jg => (
                  <option key={jg.id} value={jg.id}>
                    {jg.full_name || jg.email.split('@')[0]} ({jg.nivel.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {selectedJugadorId && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={jName}
                    onChange={e => setJName(e.target.value)}
                    className="input-base"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Nivel Elo (0.0 - 10.0)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      required
                      value={jNivel}
                      onChange={e => setJNivel(e.target.value)}
                      className="input-base"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Partidos Jugados
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={jPartidos}
                      onChange={e => setJPartidos(e.target.value)}
                      className="input-base"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Victorias
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={jVictorias}
                      onChange={e => setJVictorias(e.target.value)}
                      className="input-base"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Derrotas
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={jDerrotas}
                      onChange={e => setJDerrotas(e.target.value)}
                      className="input-base"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Racha (+ Vic / - Der)
                    </label>
                    <input
                      type="number"
                      required
                      value={jRacha}
                      onChange={e => setJRacha(e.target.value)}
                      className="input-base"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Racha Máxima
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={jRachaMax}
                      onChange={e => setJRachaMax(e.target.value)}
                      className="input-base"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 text-xs font-bold justify-center shadow-green flex items-center gap-1.5"
                >
                  <Save size={14} /> Guardar Perfil del Jugador
                </button>
              </div>
            )}

          </div>
        </form>
      )}

      {/* TAB TORNEOS */}
      {activeTab === 'torneos' && (
        <div className="space-y-6">
          
          {/* Formulario Crear Torneo */}
          <form onSubmit={handleCreateTorneo} className="card p-5 bg-white space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <Plus size={14} /> Crear Nuevo Torneo Oficial
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Nombre del Torneo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Copa de Verano 2026"
                  value={tNombre}
                  onChange={e => setTNombre(e.target.value)}
                  className="input-base"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Descripción
                </label>
                <textarea
                  placeholder="Detalles sobre el torneo..."
                  value={tDescripcion}
                  onChange={e => setTDescripcion(e.target.value)}
                  className="input-base h-20 py-2 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Pista / Club (Opcional)
                </label>
                <select
                  value={tPistaId}
                  onChange={e => setTPistaId(e.target.value)}
                  className="form-input w-full rounded-xl px-4 py-3 text-xs bg-white border border-slate-200"
                >
                  <option value="">Seleccionar pista...</option>
                  {pistas.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({p.tipo_pared}, {p.tipo_techo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    required
                    value={tFechaInicio}
                    onChange={e => setTFechaInicio(e.target.value)}
                    className="input-base px-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    required
                    value={tFechaFin}
                    onChange={e => setTFechaFin(e.target.value)}
                    className="input-base px-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="col-span-2 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                  <Swords size={12} /> Ajustes de Juego
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Nivel Mín
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={tNivelMin}
                    onChange={e => setTNivelMin(e.target.value)}
                    className="input-base py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Nivel Máx
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={tNivelMax}
                    onChange={e => setTNivelMax(e.target.value)}
                    className="input-base py-2 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-xs font-bold justify-center shadow-green"
              >
                Crear y Abrir Inscripciones
              </button>
            </div>
          </form>

          {/* Gestión de Torneos Existentes */}
          <div className="space-y-3">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
              🎮 Gestionar Torneos Activos
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Selecciona Torneo
                </label>
                <select
                  value={activeTorneoId}
                  onChange={e => setActiveTorneoId(e.target.value)}
                  className="form-input w-full rounded-xl px-4 py-3 text-xs bg-white border border-slate-200"
                >
                  <option value="">Seleccionar torneo…</option>
                  {torneos.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nombre} ({t.estado})
                    </option>
                  ))}
                </select>
              </div>

              {activeTorneo && (
                <div className="card p-5 bg-white border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-extrabold text-slate-900 font-kanit">
                      {activeTorneo.nombre}
                    </span>
                    <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full uppercase border border-brand-200">
                      {activeTorneo.estado}
                    </span>
                  </div>

                  {/* Estado: Inscripciones ABIERTAS */}
                  {activeTorneo.estado === 'inscripciones' && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-500 font-medium">
                        Parejas Inscritas: <span className="font-extrabold text-slate-800">{parejasDelTorneo.length} / 8</span>
                      </p>
                      
                      {/* Lista de Parejas */}
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {parejasDelTorneo.map(ins => (
                          <div key={ins.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-700 flex justify-between items-center">
                            <span>👥 {ins.j1.full_name?.split(' ')[0]} y {ins.j2.full_name?.split(' ')[0]}</span>
                            <span className="text-[8px] uppercase text-green-600 font-black">Aprobada</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={handleIniciarTorneo}
                        disabled={loading || parejasDelTorneo.length !== 8}
                        className="btn-primary w-full py-3 text-xs font-bold justify-center shadow-green flex items-center gap-1.5"
                      >
                        <Play size={14} /> Iniciar Torneo y Generar Brackets
                      </button>
                    </div>
                  )}

                  {/* Estado: EN CURSO */}
                  {activeTorneo.estado === 'en_curso' && (
                    <div className="space-y-3">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Cuadro de Brackets
                      </p>

                      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        {partidosDelTorneo.map(p => {
                          const nameP1 = p.pareja1 
                            ? `${p.pareja1.j1.full_name.split(' ')[0]} / ${p.pareja1.j2.full_name.split(' ')[0]}`
                            : 'Por determinar'
                          const nameP2 = p.pareja2
                            ? `${p.pareja2.j1.full_name.split(' ')[0]} / ${p.pareja2.j2.full_name.split(' ')[0]}`
                            : 'Por determinar'
                          
                          const rounds = ['Cuartos', 'Semifinal', 'Final']
                          const isWinnerP1 = p.ganador_id && p.ganador_id === p.pareja1_id
                          const isWinnerP2 = p.ganador_id && p.ganador_id === p.pareja2_id

                          return (
                            <div key={p.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between gap-3 text-[10px] font-bold text-slate-600">
                              <div className="flex justify-between items-center text-[8px] font-black text-slate-400 uppercase tracking-wider">
                                <span>{rounds[p.ronda - 1]} - Pos: {p.posicion}</span>
                                <span className={p.estado === 'jugado' ? 'text-slate-500' : 'text-amber-500'}>
                                  {p.estado === 'jugado' ? 'Jugado' : 'Pendiente'}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <div className={`flex justify-between items-center p-1 rounded ${isWinnerP1 ? 'bg-green-100 text-green-700 font-black' : ''}`}>
                                  <span>{nameP1}</span>
                                  <span>{p.sets_pareja1 || ''}</span>
                                </div>
                                <div className={`flex justify-between items-center p-1 rounded ${isWinnerP2 ? 'bg-green-100 text-green-700 font-black' : ''}`}>
                                  <span>{nameP2}</span>
                                  <span>{p.sets_pareja2 || ''}</span>
                                </div>
                              </div>
                              {p.estado === 'pendiente' && p.pareja1_id && p.pareja2_id && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenScoreModal(p.id)}
                                  className="btn-primary py-1.5 text-[9px] font-black justify-center w-full shadow-sm"
                                >
                                  Cargar Marcador
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Estado: FINALIZADO */}
                  {activeTorneo.estado === 'finalizado' && (
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-center text-xs font-semibold text-slate-500">
                      🏆 Este torneo oficial ha finalizado. Todos los brackets se han disputado correctamente.
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB ANUNCIOS */}
      {activeTab === 'anuncios' && (
        <form onSubmit={handleCreateAnuncio} className="space-y-4">
          <h2 className="text-sm font-extrabold text-slate-950 font-kanit uppercase tracking-wider pl-1">
            📢 Publicar Anuncio o Noticia
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Título del Anuncio
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Pistas cerradas por lluvia"
                value={nTitulo}
                onChange={e => setNTitulo(e.target.value)}
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Cuerpo del Mensaje
              </label>
              <textarea
                required
                placeholder="Escribe el mensaje del anuncio..."
                value={nDescripcion}
                onChange={e => setNDescripcion(e.target.value)}
                className="input-base h-28 py-2 resize-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Categoría del Anuncio
              </label>
              <select
                value={nTipo}
                onChange={e => setNTipo(e.target.value as any)}
                className="form-input w-full rounded-xl px-4 py-3 text-xs bg-white border border-slate-200"
              >
                <option value="noticia">Noticia general</option>
                <option value="evento">Evento del club</option>
                <option value="torneo_destacado">Anuncio de Torneo</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-xs font-bold justify-center shadow-green"
            >
              Publicar en Landing Pública
            </button>
          </div>
        </form>
      )}

      {/* TAB PISTAS */}
      {activeTab === 'pistas' && (
        <div className="space-y-6">
          <form onSubmit={handleCreatePista} className="card p-5 bg-white space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <Plus size={14} /> Crear Nueva Pista
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Nombre de la Pista
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Pista Padel Estepa Central"
                  value={pNombre}
                  onChange={e => setPNombre(e.target.value)}
                  className="input-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Tipo de Pared
                  </label>
                  <select
                    value={pPared}
                    onChange={e => setPPared(e.target.value as 'cristal'|'muro')}
                    className="form-input w-full rounded-xl px-4 py-3 text-xs bg-white border border-slate-200"
                  >
                    <option value="cristal">Cristal</option>
                    <option value="muro">Muro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Tipo de Techo
                  </label>
                  <select
                    value={pTecho}
                    onChange={e => setPTecho(e.target.value as 'cubierta'|'descubierta')}
                    className="form-input w-full rounded-xl px-4 py-3 text-xs bg-white border border-slate-200"
                  >
                    <option value="cubierta">Cubierta</option>
                    <option value="descubierta">Descubierta</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-xs font-bold justify-center shadow-green flex items-center gap-1.5"
              >
                <Save size={14} /> Guardar Pista
              </button>
            </div>
          </form>

          {/* Listado de Pistas */}
          <div className="space-y-3">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
              🎾 Pistas Registradas
            </h2>
            {pistas.length === 0 ? (
              <p className="text-xs text-slate-500">No hay pistas registradas todavía.</p>
            ) : (
              <div className="grid gap-3">
                {pistas.map(p => (
                  <div key={p.id} className="card p-3.5 bg-white flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800">{p.nombre}</h4>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold capitalize">
                          {p.tipo_pared}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold capitalize">
                          {p.tipo_techo}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB INCIDENCIAS */}
      {activeTab === 'incidencias' && (
        <div className="space-y-6 animate-fade-in">
          <div className="card p-5 bg-white shadow-sm border border-slate-100">
            <h2 className="text-sm font-extrabold text-slate-800 font-kanit mb-4 flex items-center gap-2">
              <Megaphone className="text-brand-600" size={18} /> Buzón de Contacto
            </h2>
            {incidencias.length === 0 ? (
              <div className="text-center p-8 text-slate-400">
                <Check size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">No hay mensajes pendientes.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {incidencias.map(inc => (
                  <div key={inc.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800">{inc.nombre}</h4>
                        <a href={`mailto:${inc.email}`} className="text-[11px] text-brand-600 font-medium hover:underline">{inc.email}</a>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-widest ${
                        inc.tipo === 'incidencia_tecnica' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {inc.tipo.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-100">
                      {inc.mensaje}
                    </p>
                    <div className="flex justify-between items-center pt-2 text-[10px] text-slate-400 font-semibold">
                      <span>{new Date(inc.created_at).toLocaleDateString()}</span>
                      <span className="uppercase tracking-widest">{inc.estado}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal para someter marcadores del bracket */}
      {showScoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="card w-full max-w-sm p-6 bg-white shadow-xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 font-kanit tracking-tight border-b border-slate-100 pb-3">
              ⚔️ Registrar Marcador Bracket
            </h3>

            <div className="space-y-4">
              
              {/* Selección del ganador */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Pareja Ganadora
                </label>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-700">
                  <button
                    type="button"
                    onClick={() => setGanadorPareja('p1')}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 ${
                      ganadorPareja === 'p1'
                        ? 'border-brand-500 bg-brand-50/50 text-brand-700 font-black'
                        : 'border-slate-200 bg-white text-slate-500'
                    }`}
                  >
                    <span>1️⃣ Pareja 1</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGanadorPareja('p2')}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 ${
                      ganadorPareja === 'p2'
                        ? 'border-brand-500 bg-brand-50/50 text-brand-700 font-black'
                        : 'border-slate-200 bg-white text-slate-500'
                    }`}
                  >
                    <span>2️⃣ Pareja 2</span>
                  </button>
                </div>
              </div>

              {/* sets de ambos */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Sets Pareja 1 (ej: 6-3, 7-5)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="6-3, 6-4"
                    value={setsP1}
                    onChange={e => setSetsP1(e.target.value)}
                    className="input-base py-2.5 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Sets Pareja 2 (ej: 3-6, 5-7)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="3-6, 4-6"
                    value={setsP2}
                    onChange={e => setSetsP2(e.target.value)}
                    className="input-base py-2.5 text-xs"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScoreModal(false)}
                  className="btn-secondary flex-1 py-3 text-xs justify-center"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveMatchScore}
                  disabled={loading}
                  className="btn-primary flex-1 py-3 text-xs justify-center shadow-green"
                >
                  {loading ? 'Guardando…' : 'Guardar Marcador'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}
