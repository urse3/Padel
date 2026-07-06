'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ text: string; type: 'error' | 'success' } | null>(null)

  const router = useRouter()
  const sb = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    if (password.length < 6) {
      setMsg({ text: 'La contraseña debe tener al menos 6 caracteres.', type: 'error' })
      setLoading(false)
      return
    }

    const { error } = await sb.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          full_name: name.trim()
        }
      }
    })

    if (error) {
      setMsg({ text: error.message, type: 'error' })
      setLoading(false)
    } else {
      setMsg({
        text: '✅ Cuenta creada con éxito. Revisa tu bandeja de entrada para verificar tu email.',
        type: 'success'
      })
      setName('')
      setEmail('')
      setPassword('')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-5 py-12 animate-fade-in">
      {/* Cabecera / Logo */}
      <div className="mb-8 text-center flex flex-col items-center select-none">
        <Link href="/" className="flex flex-col items-center gap-1 group">
          <Logo size={80} className="transition-transform group-hover:scale-105 duration-300" />
          <span className="font-extrabold text-2xl tracking-tight text-slate-900 font-kanit mt-2">
            PUNTO DE PADEL
          </span>
        </Link>
      </div>

      {/* Card de Autenticación */}
      <div className="card w-full max-w-sm p-6 sm:p-8 bg-white shadow-card animate-slide-up relative">
        <h2 className="text-xl font-extrabold text-slate-950 font-kanit tracking-tight mb-1">
          Únete a la comunidad
        </h2>
        <p className="text-xs text-slate-500 font-medium mb-6 whitespace-pre-line">
          {`Regístrate gratis para empezar a subir tu ranking`}
        </p>

        {msg && (
          <div
            className={`p-3 rounded-xl text-xs font-bold border mb-5 ${
              msg.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {msg.text}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Nombre completo */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
              Nombre Completo
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Juan Pérez"
                className="input-base !pl-10 py-2.5"
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          {/* Email */}
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

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-base !pl-10 !pr-10 py-2.5"
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 text-sm font-bold justify-center mt-2 shadow-green"
          >
            {loading ? 'Creando cuenta…' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500 font-semibold">
          <span>¿Ya tienes cuenta? </span>
          <Link href="/login" className="text-brand-600 hover:underline">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  )
}
