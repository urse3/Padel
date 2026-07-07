import React from 'react'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-5 py-24 w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-4xl font-extrabold text-slate-900 font-kanit tracking-tight mb-4">
            Política de Privacidad
          </h1>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-widest">
            Última actualización: Julio 2026
          </p>
        </div>

        <div className="card p-8 bg-white space-y-6 text-sm text-slate-600 leading-relaxed shadow-sm">
          <section>
            <h2 className="text-lg font-bold font-kanit text-slate-800 mb-2">1. Información que Recopilamos</h2>
            <p>Recopilamos información personal que nos proporcionas al registrarte, como tu nombre, dirección de correo electrónico y estadísticas de juego. También recogemos datos de uso cuando interactúas con la plataforma.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold font-kanit text-slate-800 mb-2">2. Uso de la Información</h2>
            <p>Utilizamos tu información para proporcionar y mantener nuestro servicio, notificarte sobre cambios, permitirte participar en funciones interactivas, proporcionar soporte al cliente, y realizar análisis para mejorar la plataforma.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold font-kanit text-slate-800 mb-2">3. Visibilidad Pública</h2>
            <p>Ten en cuenta que cierta información asociada a tu perfil, como tu nombre, nivel Elo, avatar y el historial de partidos jugados, es pública y visible para otros usuarios de la comunidad con el fin de mantener la transparencia del ranking.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold font-kanit text-slate-800 mb-2">4. Seguridad de los Datos</h2>
            <p>La seguridad de tus datos es importante para nosotros. Utilizamos servicios seguros y bases de datos protegidas (Supabase) para almacenar tu información, aunque ningún método de transmisión por Internet o método de almacenamiento electrónico es 100% seguro.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
