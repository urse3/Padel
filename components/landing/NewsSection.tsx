'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Clock, Info, Trophy, Swords } from 'lucide-react'
import { formatDateShort } from '@/lib/utils'

interface Evento {
  id: string
  titulo: string
  descripcion: string
  fecha: string | null
  tipo: string
  created_at: string
}

export default function NewsSection() {
  const [noticias, setNoticias] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const sb = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await sb
        .from('eventos')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error && data) {
        setNoticias(data)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="skeleton h-48 w-full" />
        <div className="skeleton h-48 w-full" />
        <div className="skeleton h-48 w-full" />
      </div>
    )
  }

  if (noticias.length === 0) return null

  // Categorizar noticias simulado por el título o tipo si el usuario los clasifica en admin
  // Si en la base de datos el tipo es genérico ("noticia"), intentamos clasificarlo por el texto.
  const getCategory = (noticia: Evento) => {
    const text = (noticia.titulo + ' ' + noticia.descripcion).toLowerCase()
    if (text.includes('torneo') || text.includes('competicion') || text.includes('liga')) return 'torneos'
    if (text.includes('partido') || text.includes('pista') || text.includes('rey')) return 'partidos'
    return 'generales'
  }

  const generales = noticias.filter(n => getCategory(n) === 'generales')
  const torneos = noticias.filter(n => getCategory(n) === 'torneos')
  const partidos = noticias.filter(n => getCategory(n) === 'partidos')

  const renderColumn = (title: string, icon: React.ReactNode, items: Evento[], colorClass: string, badgeClass: string) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          {icon}
        </div>
        <h3 className="font-kanit font-black text-xl text-slate-800">{title}</h3>
      </div>
      
      {items.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-sm font-medium">
          No hay noticias recientes.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(noticia => (
            <div key={noticia.id} className="card p-5 border border-slate-100 hover:shadow-lg transition-all duration-300 group bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${badgeClass}`}>
                  Novedad
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Clock size={12} />
                  {formatDateShort(noticia.created_at)}
                </div>
              </div>
              <h4 className="font-kanit font-black text-lg text-slate-900 leading-tight mb-2 group-hover:text-brand-600 transition-colors">
                {noticia.titulo}
              </h4>
              <p className="text-sm text-slate-500 line-clamp-3">
                {noticia.descripcion}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <section className="space-y-8">
      <div className="text-center space-y-2 mb-10">
        <h2 className="text-3xl font-black text-slate-900 font-kanit">Actualidad Punto de Padel</h2>
        <p className="text-sm text-slate-500 font-medium max-w-md mx-auto">
          Mantente al día con las últimas novedades, torneos y partidos destacados de nuestra comunidad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {renderColumn('Generales', <Info size={20} />, generales, 'bg-blue-100 text-blue-600', 'bg-blue-50 text-blue-600')}
        {renderColumn('Torneos', <Trophy size={20} />, torneos, 'bg-amber-100 text-amber-600', 'bg-amber-50 text-amber-600')}
        {renderColumn('Partidos', <Swords size={20} />, partidos, 'bg-green-100 text-green-600', 'bg-green-50 text-green-600')}
      </div>
    </section>
  )
}
