'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Trophy, Users, ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDateShort } from '@/lib/utils'

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

interface Evento {
  id: string
  titulo: string
  descripcion: string
  fecha: string | null
  tipo: string
  created_at: string
}

const ITEMS_PER_PAGE = 3

export default function EventsSection() {
  const [torneosActivos, setTorneosActivos] = useState<Torneo[]>([])
  const [torneosCompletados, setTorneosCompletados] = useState<Torneo[]>([])
  const [noticias, setNoticias] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  
  // Paginación
  const [activosPage, setActivosPage] = useState(1)
  const [completadosPage, setCompletadosPage] = useState(1)

  const sb = createClient()

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch Torneos
      const { data: dataTorneos, error: errorTorneos } = await sb
        .from('torneos')
        .select('*')
        .order('fecha_inicio', { ascending: false })

      if (!errorTorneos && dataTorneos) {
        setTorneosActivos(dataTorneos.filter(t => t.estado === 'inscripciones' || t.estado === 'en_curso'))
        setTorneosCompletados(dataTorneos.filter(t => t.estado === 'finalizado'))
      }

      // 2. Fetch Noticias
      const { data: dataNoticias, error: errorNoticias } = await sb
        .from('eventos')
        .select('*')
        .eq('tipo', 'noticia')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(3)

      if (!errorNoticias && dataNoticias) {
        setNoticias(dataNoticias)
      }

      setLoading(false)
    }
    fetchData()
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

  return (
    <div className="space-y-16">
      
      {/* SECCIÓN NOTICIAS */}
      {noticias.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-1 bg-brand-500 rounded-full"></span>
            <h2 className="font-kanit font-black text-2xl text-slate-900 tracking-tight">Últimas Noticias</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {noticias.map(noticia => (
              <div key={noticia.id} className="card p-6 border border-slate-100 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center px-2 py-1 bg-brand-50 text-brand-600 rounded text-[10px] font-bold uppercase tracking-widest">
                    Novedad
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Clock size={12} />
                    {formatDateShort(noticia.created_at)}
                  </div>
                </div>
                <h3 className="font-kanit font-black text-lg text-slate-900 leading-tight mb-2 group-hover:text-brand-600 transition-colors">
                  {noticia.titulo}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-3">
                  {noticia.descripcion}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECCIÓN TORNEOS ACTIVOS */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-1 bg-cyan-500 rounded-full"></span>
            <h2 className="font-kanit font-black text-2xl text-slate-900 tracking-tight">Torneos Activos</h2>
          </div>
        </div>
        
        {torneosActivos.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
            <Trophy className="mx-auto text-slate-300 mb-3" size={32} />
            <p className="text-sm font-semibold text-slate-500">Próximamente anunciaremos nuevos torneos.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {torneosActivos.slice((activosPage - 1) * ITEMS_PER_PAGE, activosPage * ITEMS_PER_PAGE).map(t => (
                <div key={t.id} className="card overflow-hidden group hover:scale-[1.02] duration-300 flex flex-col">
                  <div className="relative h-44 bg-gradient-to-br from-green-500 to-brand-700 flex items-center justify-center p-6 text-center text-white">
                    <div className="absolute inset-0 bg-black/10 opacity-30" />
                    <Trophy size={64} className="opacity-20 absolute -right-6 -bottom-6" />
                    <h3 className="relative z-10 font-kanit font-black text-2xl tracking-tight leading-tight">
                      {t.nombre}
                    </h3>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-4 flex-grow">
                      {t.descripcion || 'Torneo oficial de Punto de Padel. Plazas limitadas.'}
                    </p>
                    <div className="flex flex-col gap-2.5 text-xs font-bold text-slate-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={15} className="text-brand-500" />
                        <span>Del {t.fecha_inicio} al {t.fecha_fin}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={15} className="text-brand-500" />
                        <span>Niveles: {t.nivel_min} a {t.nivel_max}</span>
                      </div>
                    </div>
                    <Link
                      href={`/torneos/${t.id}`}
                      className="btn-primary py-2.5 w-full text-xs font-bold justify-center mt-auto"
                    >
                      Ver detalles e inscribirse <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            {Math.ceil(torneosActivos.length / ITEMS_PER_PAGE) > 1 && (
              <div className="flex justify-center gap-4 pt-2">
                <button
                  onClick={() => setActivosPage(p => Math.max(1, p - 1))}
                  disabled={activosPage === 1}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setActivosPage(p => Math.min(Math.ceil(torneosActivos.length / ITEMS_PER_PAGE), p + 1))}
                  disabled={activosPage === Math.ceil(torneosActivos.length / ITEMS_PER_PAGE)}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECCIÓN TORNEOS COMPLETADOS */}
      {torneosCompletados.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-1 bg-slate-300 rounded-full"></span>
            <h2 className="font-kanit font-black text-2xl text-slate-600 tracking-tight">Torneos Completados</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {torneosCompletados.slice((completadosPage - 1) * ITEMS_PER_PAGE, completadosPage * ITEMS_PER_PAGE).map(t => (
                <div key={t.id} className="card overflow-hidden opacity-75 hover:opacity-100 transition-opacity">
                  <div className="relative h-24 bg-slate-800 flex items-center justify-center p-4 text-center text-white">
                    <Trophy size={32} className="opacity-10 absolute -right-2 -bottom-2" />
                    <h3 className="relative z-10 font-kanit font-black text-lg tracking-tight">
                      {t.nombre}
                    </h3>
                  </div>
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Calendar size={12} />
                      <span>Finalizado el {t.fecha_fin}</span>
                    </div>
                    <Link href={`/torneos/${t.id}`} className="text-xs font-bold text-slate-500 hover:text-brand-600 flex items-center gap-1">
                      Ver resultados finales <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            {Math.ceil(torneosCompletados.length / ITEMS_PER_PAGE) > 1 && (
              <div className="flex justify-center gap-4 pt-2">
                <button
                  onClick={() => setCompletadosPage(p => Math.max(1, p - 1))}
                  disabled={completadosPage === 1}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCompletadosPage(p => Math.min(Math.ceil(torneosCompletados.length / ITEMS_PER_PAGE), p + 1))}
                  disabled={completadosPage === Math.ceil(torneosCompletados.length / ITEMS_PER_PAGE)}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
