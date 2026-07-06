'use client'

import React from 'react'
import Link from 'next/link'
import { Trophy, Calendar, Users, Swords, ArrowRight } from 'lucide-react'
import { formatDateShort } from '@/lib/utils'

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
  tipo: 'eliminacion' | 'grupos' | 'liga'
}

interface TorneosClientProps {
  torneos: Torneo[]
  currentUserId: string
}

export default function TorneosClient({ torneos }: TorneosClientProps) {
  
  const statusLabels = {
    inscripciones: { text: 'Inscripciones Abiertas 🔓', class: 'bg-green-50 border-green-200 text-green-700' },
    en_curso: { text: 'En Curso ⚡', class: 'bg-amber-50 border-amber-200 text-amber-700' },
    finalizado: { text: 'Finalizado 🏁', class: 'bg-slate-50 border-slate-200 text-slate-600' },
    cancelado: { text: 'Cancelado ❌', class: 'bg-red-50 border-red-200 text-red-600' }
  }

  const formatTipo = (tipo: string) => {
    if (tipo === 'eliminacion') return 'Eliminación Directa'
    if (tipo === 'grupos') return 'Fase de Grupos'
    return 'Liga Regular'
  }

  return (
    <div className="px-5 pt-6 space-y-6 animate-fade-in">
      
      {/* Cabecera */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-accent">
          <Trophy size={20} />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-900 font-kanit">Torneos Oficiales</h1>
          <p className="text-xs text-slate-500 font-medium">Inscríbete en pareja y compite por el ranking oficial</p>
        </div>
      </div>

      {/* Listado */}
      <div className="space-y-4">
        {torneos.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 border border-slate-100 rounded-2xl">
            <Trophy size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-500">No hay torneos activos</p>
            <p className="text-[10px] text-slate-400 mt-1">
              Los administradores publicarán nuevos torneos próximamente.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {torneos.map(t => {
              const status = statusLabels[t.estado] || statusLabels.inscripciones
              const dateStart = formatDateShort(t.fecha_inicio)
              const dateEnd = formatDateShort(t.fecha_fin)

              return (
                <div
                  key={t.id}
                  className="card p-5 hover:shadow-card-hover transition-all duration-300 bg-white relative flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Fila superior: Estado */}
                    <div className="flex justify-between items-start">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${status.class}`}>
                        {status.text}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Oficial ×2.5 Elo
                      </span>
                    </div>

                    {/* Fila media: Título y descripción */}
                    <div className="space-y-1">
                      <h2 className="text-base font-extrabold text-slate-950 font-kanit tracking-tight leading-tight">
                        {t.nombre}
                      </h2>
                      <p className="text-xs text-slate-500 font-medium line-clamp-2">
                        {t.descripcion || 'Sin descripción disponible.'}
                      </p>
                    </div>

                    {/* Fila media: Detalles */}
                    <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-brand-500" />
                        <span>{dateStart} - {dateEnd}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-brand-500" />
                        <span>Parejas máx: {t.max_parejas}</span>
                      </div>
                      <div className="flex items-center gap-2 col-span-2">
                        <Swords size={14} className="text-brand-500" />
                        <span>Rango: {t.nivel_min.toFixed(2)} - {t.nivel_max.toFixed(2)} Elo</span>
                      </div>
                    </div>
                  </div>

                  {/* Fila inferior: Acción */}
                  <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Formato: {formatTipo(t.tipo)}
                    </span>
                    <Link
                      href={`/torneos/${t.id}`}
                      className="btn-primary py-2 px-4 text-xs font-bold"
                    >
                      Ver torneo <ArrowRight size={14} />
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
