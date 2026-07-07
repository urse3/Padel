import React from 'react'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import { MessageCircle, FileText, Mail } from 'lucide-react'

export default function SoportePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-5 py-24 w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 font-kanit tracking-tight mb-4">
            Soporte Técnico
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            ¿Tienes algún problema o duda? Estamos aquí para ayudarte.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/preguntas-frecuentes" className="card p-6 text-center hover:scale-[1.02] transition-transform">
            <FileText className="mx-auto text-brand-500 mb-4" size={32} />
            <h3 className="font-kanit font-bold text-lg text-slate-800 mb-2">Preguntas Frecuentes</h3>
            <p className="text-xs text-slate-500">Revisa nuestra base de conocimientos para respuestas rápidas.</p>
          </Link>

          <Link href="/contacto" className="card p-6 text-center hover:scale-[1.02] transition-transform">
            <MessageCircle className="mx-auto text-brand-500 mb-4" size={32} />
            <h3 className="font-kanit font-bold text-lg text-slate-800 mb-2">Formulario de Contacto</h3>
            <p className="text-xs text-slate-500">Escríbenos detallando tu consulta o incidencia.</p>
          </Link>

          <div className="card p-6 text-center border border-slate-100 bg-white">
            <Mail className="mx-auto text-brand-500 mb-4" size={32} />
            <h3 className="font-kanit font-bold text-lg text-slate-800 mb-2">Correo Directo</h3>
            <p className="text-xs text-slate-500 mb-2">Si lo prefieres, mándanos un email a:</p>
            <a href="mailto:Puntodepadel26@gmail.com" className="font-bold text-brand-600 text-sm hover:underline">
              Puntodepadel26@gmail.com
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
