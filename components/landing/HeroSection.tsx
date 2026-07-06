import React from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { ChevronRight } from 'lucide-react'

export default function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative min-h-[90vh] md:min-h-screen pt-24 pb-16 flex items-center bg-gradient-to-br from-green-50/70 via-white to-green-50/40 overflow-hidden"
    >
      {/* Círculos decorativos en el fondo */}
      <div className="absolute top-1/4 -right-24 w-96 h-96 bg-brand-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -left-24 w-80 h-80 bg-cyan-200/20 rounded-full blur-3xl" />

      {/* Patrón de cuadrícula deportiva SVG inline */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none bg-[radial-gradient(#16a34a_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

      <div className="max-w-6xl mx-auto px-5 w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Texto Hero */}
        <div className="space-y-6 md:space-y-8 text-center md:text-left animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100/60 border border-brand-200 text-brand-800 text-xs font-bold uppercase tracking-wider">
            Nueva Temporada 2026 ⚡
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 font-kanit leading-tight">
            Tu Pádel,<br />
            Tu Ranking,<br />
            <span className="text-brand-600">Tu Comunidad</span>
          </h1>

          <p className="text-base md:text-lg text-slate-600 max-w-lg mx-auto md:mx-0 leading-relaxed font-medium">
            Registra tus partidos con amigos, sube de nivel con el algoritmo Elo dinámico (0-10) y compite en torneos oficiales organizados por tu club.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link href="/registro" className="btn-primary py-4 px-6 justify-center text-sm font-bold shadow-green">
              Únete gratis <ChevronRight size={18} />
            </Link>
            <Link href="#ranking" className="btn-secondary py-4 px-6 justify-center text-sm font-bold">
              Ver ranking
            </Link>
          </div>

          {/* Estadísticas rápidas */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-6 justify-center md:justify-start text-xs font-bold text-slate-500 uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <span className="text-brand-600 text-base">🎾</span> Partidos
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-500 text-base">👑</span> Reyes de pista
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-cyan-accent text-base">🏆</span> Torneos completos
            </div>
          </div>
        </div>

        {/* Imagen animada / Ilustración */}
        <div className="hidden md:flex justify-center items-center relative">
          {/* Anillos de fondo */}
          <div className="absolute w-[360px] h-[360px] rounded-full border border-brand-200/40 animate-pulse-slow" />
          <div className="absolute w-[440px] h-[440px] rounded-full border border-dashed border-slate-200" />
          
          {/* Logo oficial grande con sombra verde */}
          <div className="w-72 h-72 rounded-[40px] bg-white border border-slate-100 shadow-[0_20px_50px_rgba(34,197,94,0.12)] flex items-center justify-center relative z-10 transition-transform duration-500 hover:scale-105 group cursor-pointer animate-fade-in">
            <Logo size={200} className="transition-transform duration-700 group-hover:rotate-6" />
          </div>
        </div>
      </div>
    </section>
  )
}
