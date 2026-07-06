'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto h-full px-5 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 select-none group">
            <Logo size={36} className="transition-transform group-hover:scale-105" />
            <span className="font-extrabold text-lg tracking-tight text-slate-900 font-kanit">
              Punto de <span className="text-brand-600">Padel</span>
            </span>
          </Link>

          {/* Nav Links - Desktop */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link href="#inicio" className="hover:text-brand-600 transition-colors">
              Inicio
            </Link>
            <Link href="#ranking" className="hover:text-brand-600 transition-colors">
              Ranking
            </Link>
            <Link href="#torneos" className="hover:text-brand-600 transition-colors">
              Torneos
            </Link>
            <Link href="#sobre-nosotros" className="hover:text-brand-600 transition-colors">
              Sobre Nosotros
            </Link>
          </nav>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="btn-secondary py-2 px-4 text-xs">
              Iniciar Sesión
            </Link>
            <Link href="/registro" className="btn-primary py-2 px-4 text-xs">
              Únete gratis
            </Link>
          </div>

          {/* Menú Móvil Hamburger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Menú Móvil Desplegable */}
      <div
        className={`fixed inset-x-0 top-16 z-40 md:hidden bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-lg px-6 py-6 space-y-4 transition-all duration-300 ${
          isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col gap-4 text-base font-bold text-slate-700">
          <Link
            href="#inicio"
            onClick={() => setIsMenuOpen(false)}
            className="hover:text-brand-600 transition-colors"
          >
            Inicio
          </Link>
          <Link
            href="#ranking"
            onClick={() => setIsMenuOpen(false)}
            className="hover:text-brand-600 transition-colors"
          >
            Ranking
          </Link>
          <Link
            href="#torneos"
            onClick={() => setIsMenuOpen(false)}
            className="hover:text-brand-600 transition-colors"
          >
            Torneos
          </Link>
          <Link
            href="#sobre-nosotros"
            onClick={() => setIsMenuOpen(false)}
            className="hover:text-brand-600 transition-colors"
          >
            Sobre Nosotros
          </Link>
        </nav>
        <div className="h-px bg-slate-100 my-4" />
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            onClick={() => setIsMenuOpen(false)}
            className="btn-secondary w-full justify-center py-3 text-sm"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/registro"
            onClick={() => setIsMenuOpen(false)}
            className="btn-primary w-full justify-center py-3 text-sm"
          >
            Únete gratis
          </Link>
        </div>
      </div>
    </>
  )
}
