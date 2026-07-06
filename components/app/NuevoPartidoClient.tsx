'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Calendar, MapPin, Clock, DollarSign, Swords, Lock, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

interface NuevoPartidoClientProps {
  userId: string
  pistas: any[]
}

export default function NuevoPartidoClient({ userId, pistas }: NuevoPartidoClientProps) {
  const [pistaId, setPistaId] = useState('')
  const [club, setClub] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [hora, setHora] = useState('18:00')
  const [nivelMin, setNivelMin] = useState('0.00')
  const [nivelMax, setNivelMax] = useState('10.00')
  const [precio, setPrecio] = useState('0')
  const [esPrivado, setEsPrivado] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const router = useRouter()
  const sb = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    // Validaciones
    const min = parseFloat(nivelMin)
    const max = parseFloat(nivelMax)
    if (isNaN(min) || min < 0 || min > 10) {
      setErrorMsg('El nivel mínimo debe estar entre 0.00 y 10.00')
      setLoading(false)
      return
    }
    if (isNaN(max) || max < 0 || max > 10) {
      setErrorMsg('El nivel máximo debe estar entre 0.00 y 10.00')
      setLoading(false)
      return
    }
    if (min > max) {
      setErrorMsg('El nivel mínimo no puede ser superior al nivel máximo')
      setLoading(false)
      return
    }

      // Obtener nombre del club de la pista si se ha seleccionado una
      let finalClub = club.trim()
      if (pistaId) {
        const selectedPista = pistas.find(p => p.id === pistaId)
        if (selectedPista) {
          finalClub = selectedPista.nombre
        }
      }

      if (!finalClub) {
        setErrorMsg('Debes especificar un club o seleccionar una pista.')
        setLoading(false)
        return
      }

      // 1. Crear el partido en partidos_abiertos
      const { data: partido, error: errorPartido } = await sb
        .from('partidos_abiertos')
        .insert({
          creador_id: userId,
          club: finalClub,
          pista_id: pistaId || null,
          fecha,
          hora: `${hora}:00`,
          nivel_min: min,
          nivel_max: max,
          precio: parseFloat(precio || '0'),
          es_privado: esPrivado,
          max_jugadores: 4,
          estado: 'abierto'
        })
        .select('id')
        .single()

      if (errorPartido) throw errorPartido

      // 2. Inscribir automáticamente al creador en el partido
      const { error: errorInscripcion } = await sb
        .from('inscripciones')
        .insert({
          partido_id: partido.id,
          jugador_id: userId
        })

      if (errorInscripcion) throw errorInscripcion

      // 3. Redirigir al detalle del partido recién creado
      router.push(`/partidos/${partido.id}`)
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error al crear el partido')
      setLoading(false)
    }
  }

  return (
    <div className="px-5 pt-6 space-y-6 animate-fade-in">
      
      {/* Cabecera / Retorno */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
        <Link
          href="/partidos"
          className="p-1 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft size={22} className="stroke-[2.5]" />
        </Link>
        <div>
          <h1 className="text-lg font-black text-slate-900 font-kanit">Nuevo Partido</h1>
          <p className="text-xs text-slate-500 font-medium">Configura los detalles del encuentro</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl text-xs font-bold bg-red-50 border border-red-200 text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Club / Ubicación */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
            Pista Habitual
          </label>
          <div className="relative">
            <select
              value={pistaId}
              onChange={e => setPistaId(e.target.value)}
              className="form-input w-full rounded-xl pl-10 pr-4 py-3 text-xs bg-white border border-slate-200"
            >
              <option value="">Otra ubicación...</option>
              {pistas.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre} ({p.tipo_pared}, {p.tipo_techo})
                </option>
              ))}
            </select>
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>
        </div>

        {!pistaId && (
          <div className="space-y-1.5 animate-fade-in">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
              Club / Dirección Manual
            </label>
            <div className="relative">
              <input
                type="text"
                required={!pistaId}
                placeholder="Ej. Club de Padel Central"
                value={club}
                onChange={e => setClub(e.target.value)}
                className="input-base pl-10"
              />
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>
        )}

        {/* Fecha y Hora en Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
              Fecha
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                className="input-base pl-10 pr-3.5"
              />
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
              Hora
            </label>
            <div className="relative">
              <input
                type="time"
                required
                value={hora}
                onChange={e => setHora(e.target.value)}
                className="input-base pl-10"
              />
              <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>
        </div>

        {/* Rango de Nivel en Grid */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
            <Swords size={12} /> Rango de Nivel (0.00 - 10.00)
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Mínimo
            </label>
            <input
              type="number"
              step="0.05"
              min="0"
              max="10"
              required
              value={nivelMin}
              onChange={e => setNivelMin(e.target.value)}
              className="input-base"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Máximo
            </label>
            <input
              type="number"
              step="0.05"
              min="0"
              max="10"
              required
              value={nivelMax}
              onChange={e => setNivelMax(e.target.value)}
              className="input-base"
            />
          </div>
        </div>

        {/* Precio por persona */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
            Precio por persona (€)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.5"
              min="0"
              placeholder="0.00"
              value={precio}
              onChange={e => setPrecio(e.target.value)}
              className="input-base pl-10"
            />
            <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>
        </div>

        {/* Checkbox Privado */}
        <div className="card p-4 bg-white flex items-center justify-between border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-50 text-slate-500 border border-slate-100">
              <Lock size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Partido Privado</p>
              <p className="text-[9px] text-slate-400 font-medium">Solo accesible mediante link de invitación</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={esPrivado}
            onChange={e => setEsPrivado(e.target.checked)}
            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
          />
        </div>

        {/* Botón Guardar */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3.5 text-sm font-bold justify-center mt-4 shadow-green"
        >
          {loading ? 'Creando partido…' : 'Crear y Apuntarse'}
        </button>

      </form>
    </div>
  )
}
