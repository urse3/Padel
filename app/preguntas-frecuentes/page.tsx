import React from 'react'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'

export default function FAQPage() {
  const faqs = [
    {
      q: '¿Cómo funciona el sistema de niveles Elo?',
      a: 'Todos los jugadores empiezan en el nivel 1.0. Cuando ganas un partido, ganas puntos dependiendo de la diferencia de nivel con tus oponentes. Si vences a alguien de mayor nivel, ganas más puntos. Las derrotas te restan puntos de forma proporcional.'
    },
    {
      q: '¿Cómo me inscribo a un torneo?',
      a: 'Ve a la sección de Torneos desde el menú principal. Allí verás los torneos activos. Haz clic en el que te interese y dale a "Inscribirse". Un administrador deberá aprobar tu solicitud.'
    },
    {
      q: '¿Qué es el "Rey de Pista"?',
      a: 'Es una modalidad donde varias parejas compiten rotando de pista. Quien gana sube de pista y quien pierde baja. Al final del evento, los resultados de los partidos se registran y afectan tu nivel Elo con un multiplicador especial (x1.5).'
    },
    {
      q: '¿Es gratis registrarse?',
      a: 'Sí, registrarse y usar las funciones básicas de Punto de Padel (registro de partidos, estadísticas, ranking) es completamente gratuito.'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-5 py-24 w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 font-kanit tracking-tight mb-4">
            Preguntas Frecuentes
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            Encuentra las respuestas a las dudas más comunes sobre la plataforma.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="card p-6 bg-white animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <h3 className="font-kanit font-bold text-lg text-slate-800 mb-2">{faq.q}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
