import React from 'react'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-5 py-24 w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-4xl font-extrabold text-slate-900 font-kanit tracking-tight mb-4">
            Términos de Servicio
          </h1>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-widest">
            Última actualización: Julio 2026
          </p>
        </div>

        <div className="card p-8 bg-white space-y-6 text-sm text-slate-600 leading-relaxed shadow-sm">
          <section>
            <h2 className="text-lg font-bold font-kanit text-slate-800 mb-2">1. Aceptación de los Términos</h2>
            <p>Al acceder y utilizar la plataforma Punto de Padel, aceptas estar sujeto a estos Términos de Servicio. Si no estás de acuerdo con alguna parte de los términos, no podrás acceder al servicio.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold font-kanit text-slate-800 mb-2">2. Uso de la Plataforma</h2>
            <p>Punto de Padel proporciona una plataforma para registrar partidos, calcular el nivel Elo y gestionar torneos. Te comprometes a usar la plataforma solo para fines lícitos y de forma que no infrinja los derechos de, restrinja o inhiba el uso y disfrute de la plataforma por parte de cualquier tercero.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold font-kanit text-slate-800 mb-2">3. Cuentas de Usuario</h2>
            <p>Para utilizar ciertas funciones de la plataforma, debes registrarte para obtener una cuenta. Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. Nos reservamos el derecho de rechazar el servicio, cancelar cuentas, eliminar o editar contenido a nuestra entera discreción.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold font-kanit text-slate-800 mb-2">4. Sistema Elo y Competición</h2>
            <p>El sistema Elo es gestionado automáticamente por nuestros algoritmos. Queda terminantemente prohibido manipular resultados, crear cuentas falsas o registrar partidos fraudulentos para alterar el ranking. Los administradores se reservan el derecho de penalizar o expulsar a usuarios que realicen prácticas antideportivas.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold font-kanit text-slate-800 mb-2">5. Modificaciones</h2>
            <p>Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos en cualquier momento. Los cambios materiales serán notificados a los usuarios con antelación.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
