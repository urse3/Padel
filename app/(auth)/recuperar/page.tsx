'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { createClient } from '@/lib/supabase/client'
import { Mail, ArrowLeft } from 'lucide-react'

export default function RecuperarPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ text: string; type: 'error' | 'success' } | null>(null)
  
  const sb = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    const { error } = await sb.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/actualizar-password`,
    })

    if (error) {
      setMsg({ text: error.message, type: 'error' })
    } else {
      setMsg({
        text: '✅ Si el email existe, te hemos enviado un enlace para restablecer tu contraseña.',
        type: 'success'
      })
      setEmail('')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-5 py-12 animate-fade-in">
      <div className="mb-8 text-center flex flex-col items-center select-none">
        <Link href="/" className="flex flex-col items-center gap-1 group">
          <Logo size={80} className="transition-transform group-hover:scale-105 duration-300" />
          <span className="font-extrabold text-2xl tracking-tight text-slate-900 font-kanit mt-2">
            PUNTO DE PADEL
          </span>
        </Link>
      </div>

      <div className="card w-full max-w-sm p-6 sm:p-8 bg-white shadow-card animate-slide-up relative">
        <h2 className="text-xl font-extrabold text-slate-950 font-kanit tracking-tight mb-1">
          Recuperar Contraseña
        </h2>
        <p className="text-xs text-slate-500 font-medium mb-6">
          Introduce tu email y te enviaremos un enlace para crear una nueva contraseña.
        </p>

        {msg && (
          <div className={`p-3 rounded-xl text-xs font-bold border mb-5 ${msg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="input-base !pl-10 py-2.5"
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 text-sm font-bold justify-center mt-2 shadow-green"
          >
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <Link href="/login" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft size={14} /> Volver al login
          </Link>
        </div>
      </div>
    </div>
  )
}
