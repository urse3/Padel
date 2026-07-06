'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Trophy, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Torneo {
  id: string
  nombre: string
  descripcion: string
  fecha_inicio: string
  fecha_fin: string
  imagen_url: string | null
  nivel_min: number
  nivel_max: number
  max_parejas: number
  estado: string
}

export default function EventsSection() {
  const [torneos, setTorneos] = useState<Torneo[]>([])
  const [loading, setLoading] = useState(true)
  const sb = createClient()

  useEffect(() => {
    const fetchTorneos = async () => {
      const { data, error } = await sb
        .from('torneos')
        .select('*')
        .order('fecha_inicio', { ascending: true })
        .limit(3)

      if (error) {
        console.error('Error fetching torneos:', error)
      } else {
        setTorneos(data || [])
      }
      setLoading(false)
    }
    fetchTorneos()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="skeleton h-80 w-full" />
        <div className="skeleton h-80 w-full" />
        <div className="skeleton h-80 w-full" />
      </div>
    )
  }

  // Si no hay torneos guardados en la BD, mostramos una maqueta premium del próximo torneo
  if (torneos.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mock Torneo 1 */}
        <div className="card overflow-hidden group hover:scale-[1.02] duration-300">
          <div className="relative h-44 bg-gradient-to-br from-green-500 to-brand-700 flex items-center justify-center p-6 text-center text-white">
            {/* Patrón de fondo */}
            <div className="absolute inset-0 bg-black/10 opacity-30" />
            <Trophy size={64} className="opacity-20 absolute -right-6 -bottom-6" />
            <h3 className="relative z-10 font-kanit font-black text-2xl tracking-tight leading-tight">
              Torneo Apertura 2026 🎾
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-xs text-slate-500 font-medium line-clamp-2">
              Inaugura la temporada en el gran torneo de Punto de Padel. Brackets oficiales, premios y ranking Elo garantizado.
            </p>
            <div className="flex flex-col gap-2.5 text-xs font-bold text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-brand-500" />
                <span>15 - 18 Octubre, 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={15} className="text-brand-500" />
                <span>Niveles: 2.00 a 6.00</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy size={15} className="text-brand-500" />
                <span>Categorías: Dobles Masculino / Femenino</span>
              </div>
            </div>
            <Link
              href="/login"
              className="btn-primary py-2.5 w-full text-xs font-bold justify-center"
            >
              Inscribirse <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Mock Torneo 2 */}
        <div className="card overflow-hidden group hover:scale-[1.02] duration-300">
          <div className="relative h-44 bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center p-6 text-center text-white">
            <div className="absolute inset-0 bg-black/10 opacity-30" />
            <Trophy size={64} className="opacity-20 absolute -right-6 -bottom-6" />
            <h3 className="relative z-10 font-kanit font-black text-2xl tracking-tight leading-tight">
              Liga Nocturna de Otoño 🌙
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-xs text-slate-500 font-medium line-clamp-2">
              Partidos bajo el foco. La liga nocturna para los amantes del pádel de alto nivel después de la jornada laboral.
            </p>
            <div className="flex flex-col gap-2.5 text-xs font-bold text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-cyan-500" />
                <span>01 Nov - 20 Dic, 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={15} className="text-cyan-500" />
                <span>Niveles: Libre (todas las categorías)</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy size={15} className="text-cyan-500" />
                <span>Formato: Fase de grupos + Playoff</span>
              </div>
            </div>
            <Link
              href="/login"
              className="btn-primary py-2.5 w-full text-xs font-bold justify-center"
            >
              Inscribirse <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Mock Torneo 3 */}
        <div className="card overflow-hidden group hover:scale-[1.02] duration-300">
          <div className="relative h-44 bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center p-6 text-center text-white">
            <div className="absolute inset-0 bg-black/10 opacity-30" />
            <Trophy size={64} className="opacity-20 absolute -right-6 -bottom-6" />
            <h3 className="relative z-10 font-kanit font-black text-2xl tracking-tight leading-tight">
              Torneo Relámpago Mix ⚡
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-xs text-slate-500 font-medium line-clamp-2">
              Un fin de semana completo de pádel mixto y asado de confraternización para toda la comunidad.
            </p>
            <div className="flex flex-col gap-2.5 text-xs font-bold text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-purple-500" />
                <span>08 Nov - 09 Nov, 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={15} className="text-purple-500" />
                <span>Niveles: 1.50 a 5.00</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy size={15} className="text-purple-500" />
                <span>Categorías: Mixto Único</span>
              </div>
            </div>
            <Link
              href="/login"
              className="btn-primary py-2.5 w-full text-xs font-bold justify-center"
            >
              Inscribirse <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {torneos.map(t => {
        const hasImagen = !!t.imagen_url
        return (
          <div
            key={t.id}
            className="card overflow-hidden group hover:scale-[1.02] duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 bg-gradient-to-br from-green-500 to-brand-700 flex items-center justify-center p-6 text-center text-white">
                {hasImagen ? (
                  <Image
                    src={t.imagen_url!}
                    alt={t.nombre}
                    fill
                    className="object-cover group-hover:scale-105 duration-500 opacity-90"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-black/10 opacity-30" />
                    <Trophy size={64} className="opacity-20 absolute -right-6 -bottom-6" />
                  </>
                )}
                <h3 className="relative z-10 font-kanit font-black text-2xl tracking-tight leading-tight">
                  {t.nombre}
                </h3>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-xs text-slate-500 font-medium line-clamp-2">
                  {t.descripcion || 'Sin descripción disponible.'}
                </p>
                <div className="flex flex-col gap-2.5 text-xs font-bold text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={15} className="text-brand-500" />
                    <span>
                      {new Date(t.fecha_inicio).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short'
                      })}{' '}
                      -{' '}
                      {new Date(t.fecha_fin).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={15} className="text-brand-500" />
                    <span>
                      Nivel: {t.nivel_min.toFixed(2)} - {t.nivel_max.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <Link
                href={`/torneos/${t.id}`}
                className="btn-primary py-2.5 w-full text-xs font-bold justify-center"
              >
                Inscribirse <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
