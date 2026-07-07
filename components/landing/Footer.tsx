import React from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white/90 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-5 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Marca */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Logo size={36} />
            <span className="font-extrabold text-lg tracking-tight text-white font-kanit">
              Punto de <span className="text-brand-400">Padel</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            La plataforma líder de gestión de comunidades de pádel. Registra partidos, desafía a amigos en el Rey de Pista y escala a la élite de Punto de Padel.
          </p>
        </div>

        {/* Enlaces de interés */}
        <div className="space-y-4">
          <h4 className="font-bold font-kanit text-sm text-brand-400 uppercase tracking-widest">Plataforma</h4>
          <ul className="space-y-2.5 text-xs text-slate-400 font-semibold">
            <li>
              <Link href="#inicio" className="hover:text-white transition-colors">Inicio</Link>
            </li>
            <li>
              <Link href="#ranking" className="hover:text-white transition-colors">Ranking General</Link>
            </li>
            <li>
              <Link href="#torneos" className="hover:text-white transition-colors">Torneos Activos</Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-white transition-colors">Área Privada</Link>
            </li>
          </ul>
        </div>

        {/* Punto de Padel (antes Comunidad) */}
        <div className="space-y-4">
          <h4 className="font-bold font-kanit text-sm text-brand-400 uppercase tracking-widest">Punto de Padel</h4>
          <ul className="space-y-2.5 text-xs text-slate-400 font-semibold">
            <li>
              <Link href="/sobre-nosotros" className="hover:text-white transition-colors">Sobre Nosotros</Link>
            </li>
            <li>
              <Link href="/preguntas-frecuentes" className="hover:text-white transition-colors">Preguntas Frecuentes</Link>
            </li>
            <li>
              <Link href="/soporte" className="hover:text-white transition-colors">Soporte técnico</Link>
            </li>
            <li>
              <Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div className="space-y-4">
          <h4 className="font-bold font-kanit text-sm text-brand-400 uppercase tracking-widest">Legal</h4>
          <ul className="space-y-2.5 text-xs text-slate-400 font-semibold">
            <li>
              <Link href="/legal/terminos" className="hover:text-white transition-colors">Términos de servicio</Link>
            </li>
            <li>
              <Link href="/legal/privacidad" className="hover:text-white transition-colors">Política de privacidad</Link>
            </li>
            <li>
              <Link href="/legal/aviso-legal" className="hover:text-white transition-colors">Aviso legal</Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Frase copyright */}
      <div className="max-w-6xl mx-auto px-5 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-xs font-semibold">
        <p>© 2026 Punto de Padel. Todos los derechos reservados.</p>
        <p className="flex items-center gap-1.5">
          Hecho para amantes del pádel 🎾
        </p>
      </div>
    </footer>
  )
}
