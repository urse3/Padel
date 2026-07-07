import React from 'react'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'

export default function AvisoLegalPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-5 py-24 w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-4xl font-extrabold text-slate-900 font-kanit tracking-tight mb-4">
            Aviso Legal
          </h1>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-widest">
            Última actualización: Julio 2026
          </p>
        </div>

        <div className="card p-8 bg-white space-y-6 text-sm text-slate-600 leading-relaxed shadow-sm">
          <section>
            <h2 className="text-lg font-bold font-kanit text-slate-800 mb-2">1. Identidad del Titular</h2>
            <p>En cumplimiento con la normativa vigente, se informa que Punto de Padel es una plataforma web desarrollada para la gestión deportiva amateur y comunidades de jugadores de pádel.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold font-kanit text-slate-800 mb-2">2. Propiedad Intelectual</h2>
            <p>El diseño del portal y sus códigos fuente, así como los logos, marcas y demás signos distintivos que aparecen en el mismo, pertenecen a Punto de Padel y están protegidos por los correspondientes derechos de propiedad intelectual e industrial.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold font-kanit text-slate-800 mb-2">3. Exención de Responsabilidad</h2>
            <p>Punto de Padel no se hace responsable de los daños y perjuicios de cualquier naturaleza que pudieran ocasionar los usuarios por el uso incorrecto de la plataforma, ni de las posibles lesiones físicas ocurridas durante la disputa de los partidos y torneos registrados en la aplicación. Los usuarios asumen su propia responsabilidad al participar en eventos deportivos organizados a través de esta plataforma.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
