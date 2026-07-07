import React from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'
import Footer from '@/components/landing/Footer'
import Header from '@/components/landing/Header'

export default function SobreNosotrosPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter">
      <Header />
      
      <main className="flex-1 max-w-4xl mx-auto px-5 py-24 w-full">
        <div className="text-center mb-12">
          <Logo size={80} className="mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 font-kanit tracking-tight mb-4">
            Sobre Nosotros
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            Conoce la historia y la misión detrás de Punto de Padel.
          </p>
        </div>

        <div className="card p-8 md:p-12 space-y-8 text-slate-600 leading-relaxed bg-white shadow-card animate-slide-up">
          <section>
            <h2 className="text-2xl font-bold font-kanit text-slate-800 mb-4">Nuestra Misión</h2>
            <p>
              Punto de Padel nació con una idea clara: digitalizar y mejorar la experiencia de las comunidades locales de pádel. 
              Nuestra misión es conectar a jugadores, facilitar la organización de partidos y crear un sistema competitivo 
              justo y motivador a través de nuestro algoritmo Elo exclusivo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-kanit text-slate-800 mb-4">Lo que ofrecemos</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Sistema Elo Dinámico:</strong> Un ranking justo donde todos empiezan en nivel 1 y pueden llegar hasta la élite.</li>
              <li><strong>Partidos y Rey de Pista:</strong> Organización rápida de eventos con tus amigos.</li>
              <li><strong>Torneos Oficiales:</strong> Competiciones administradas con clasificaciones transparentes.</li>
              <li><strong>Comunidad:</strong> Conecta con otros apasionados de este deporte.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-kanit text-slate-800 mb-4">El Equipo</h2>
            <p>
              Somos un grupo de desarrolladores apasionados por el pádel. Cansados de organizar partidos por WhatsApp y 
              llevar el nivel "a ojo", decidimos crear la herramienta que siempre quisimos usar. Punto de Padel está hecho 
              por y para jugadores.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
