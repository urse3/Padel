'use client'

import React, { useState } from 'react'
import { Calendar, Users, ArrowRight, Trophy, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

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
  precio_pareja: number
  estado: string
}

interface Props {
  torneos: Torneo[]
}

const TABS = [
  { id: 'activos', label: 'Inscripción Abierta', icon: Clock },
  { id: 'completados', label: 'Torneos Completados', icon: CheckCircle },
]

const ITEMS_PER_PAGE = 6

export default function TorneosPublicoClient({ torneos }: Props) {
  const [activeTab, setActiveTab] = useState<'activos' | 'completados'>('activos')
  const [page, setPage] = useState(1)

  const activos = torneos.filter(t => t.estado === 'inscripciones' || t.estado === 'en_curso')
  const completados = torneos.filter(t => t.estado === 'finalizado')
  const lista = activeTab === 'activos' ? activos : completados
  const totalPages = Math.ceil(lista.length / ITEMS_PER_PAGE)
  const visible = lista.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleTabChange = (tab: 'activos' | 'completados') => {
    setActiveTab(tab)
    setPage(1)
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="space-y-6">
      {/* Subpestañas */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon
          const count = tab.id === 'activos' ? activos.length : completados.length
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={16} />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-black ${activeTab === tab.id ? 'bg-brand-100 text-brand-700' : 'bg-slate-200 text-slate-600'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* LISTA */}
      {visible.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Trophy size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="font-semibold text-slate-500">
            {activeTab === 'activos' ? 'No hay torneos abiertos en este momento.' : 'Aún no se han completado torneos.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map(t => (
            <div key={t.id} className={`card overflow-hidden flex flex-col group transition-all duration-300 ${activeTab === 'activos' ? 'hover:scale-[1.02]' : 'opacity-80 hover:opacity-100'}`}>
              {/* Banner de color */}
              <div className={`relative h-40 flex items-center justify-center p-6 text-center ${activeTab === 'activos' ? 'bg-gradient-to-br from-green-500 to-brand-700' : 'bg-gradient-to-br from-slate-700 to-slate-900'}`}>
                <div className="absolute inset-0 bg-black/10" />
                <Trophy size={56} className="opacity-10 absolute -right-4 -bottom-4" />
                <div className="relative z-10">
                  <h3 className="font-kanit font-black text-xl text-white leading-tight">{t.nombre}</h3>
                  {activeTab === 'activos' && (
                    <span className="mt-2 inline-block bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                      {t.estado === 'en_curso' ? '🎾 En curso' : '📋 Inscripciones abiertas'}
                    </span>
                  )}
                  {activeTab === 'completados' && (
                    <span className="mt-2 inline-block bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                      ✅ Finalizado
                    </span>
                  )}
                </div>
              </div>

              {/* Contenido */}
              <div className="p-5 flex flex-col flex-grow space-y-4">
                {t.descripcion && (
                  <p className="text-xs text-slate-500 font-medium line-clamp-2">{t.descripcion}</p>
                )}
                <div className="flex flex-col gap-2 text-xs font-bold text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className={activeTab === 'activos' ? 'text-brand-500' : 'text-slate-400'} />
                    <span>{formatDate(t.fecha_inicio)} → {formatDate(t.fecha_fin)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} className={activeTab === 'activos' ? 'text-brand-500' : 'text-slate-400'} />
                    <span>Niveles: {t.nivel_min} – {t.nivel_max} · Máx. {t.max_parejas} parejas</span>
                  </div>
                  {t.precio_pareja > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">💶</span>
                      <span>{t.precio_pareja}€ / pareja</span>
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-2">
                  {activeTab === 'activos' ? (
                    <Link
                      href={`/torneos/${t.id}`}
                      className="btn-primary py-2.5 w-full text-xs font-bold justify-center"
                    >
                      Ver detalles e inscribirse <ArrowRight size={14} />
                    </Link>
                  ) : (
                    <Link
                      href={`/torneos/${t.id}`}
                      className="btn-secondary py-2.5 w-full text-xs font-bold justify-center"
                    >
                      Ver resultados <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}
