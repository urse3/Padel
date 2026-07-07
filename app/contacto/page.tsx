'use client'

import React, { useState } from 'react'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, CheckCircle2, Send, Mail } from 'lucide-react'

export default function ContactoPage() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [tipo, setTipo] = useState('consulta')
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const sb = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    try {
      const { error } = await sb.from('incidencias').insert({
        nombre,
        email,
        tipo,
        mensaje,
      })

      if (error) throw error

      setStatus({ type: 'success', text: 'Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.' })
      setNombre('')
      setEmail('')
      setMensaje('')
      setTipo('consulta')
    } catch (err: any) {
      setStatus({ type: 'error', text: 'Error al enviar el mensaje. Por favor, inténtalo de nuevo o escribe a Puntodepadel26@gmail.com' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto px-5 py-24 w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 font-kanit tracking-tight mb-4">
            Contacto
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            Rellena el formulario para enviarnos tu consulta o reportar una incidencia.
          </p>
        </div>

        <div className="card p-6 md:p-8 bg-white shadow-card animate-slide-up">
          <div className="mb-6 pb-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="font-kanit font-bold text-lg text-slate-800">Soporte Directo</h2>
              <p className="text-xs text-slate-500">También puedes escribirnos a nuestro correo oficial.</p>
            </div>
            <a href="mailto:Puntodepadel26@gmail.com" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors">
              <Mail size={16} /> Puntodepadel26@gmail.com
            </a>
          </div>

          {status && (
            <div className={`p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-3 ${
              status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              {status.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Nombre</label>
                <input required value={nombre} onChange={e => setNombre(e.target.value)} type="text" className="input-base" placeholder="Tu nombre" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Email</label>
                <input required value={email} onChange={e => setEmail(e.target.value)} type="email" className="input-base" placeholder="tu@email.com" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Tipo de Mensaje</label>
              <select required value={tipo} onChange={e => setTipo(e.target.value)} className="input-base cursor-pointer">
                <option value="consulta">Consulta General</option>
                <option value="soporte">Soporte y Ayuda</option>
                <option value="incidencia_tecnica">Incidencia Técnica (Error en la web)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Mensaje</label>
              <textarea required value={mensaje} onChange={e => setMensaje(e.target.value)} className="input-base h-32 py-3 resize-none" placeholder="¿En qué podemos ayudarte?"></textarea>
            </div>

            <div className="pt-2">
              <button disabled={loading} type="submit" className={`btn-primary w-full justify-center py-3 text-sm ${tipo === 'incidencia_tecnica' ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-red hover:from-red-600 hover:to-red-700' : ''}`}>
                <Send size={18} /> {loading ? 'Enviando...' : (tipo === 'incidencia_tecnica' ? 'Reportar Incidencia' : 'Enviar Mensaje')}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
