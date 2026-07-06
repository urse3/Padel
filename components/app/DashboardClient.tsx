'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import PlayerAvatar from '@/components/PlayerAvatar'
import LevelBadge from '@/components/LevelBadge'
import { getLevelProgress, getLevelInfo } from '@/lib/elo'
import { formatDateShort } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Camera, Trophy, Swords, Calendar, Award, Star, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DashboardClientProps {
  user: any
  profile: any
  partidos: any[]
}

export default function DashboardClient({ user, profile: initialProfile, partidos }: DashboardClientProps) {
  const [profile, setProfile] = useState(initialProfile)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const router = useRouter()
  const sb = createClient()

  const handleLogout = async () => {
    await sb.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // 1. Subir al bucket 'avatares' de Supabase
      const { error: uploadError } = await sb.storage
        .from('avatares')
        .upload(filePath, file, { cacheControl: '3600', upsert: true })

      if (uploadError) throw uploadError

      // 2. Obtener URL pública
      const { data } = sb.storage.from('avatares').getPublicUrl(filePath)
      const publicUrl = data.publicUrl

      // 3. Actualizar la tabla profiles del usuario
      const { error: updateError } = await sb
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id)

      if (updateError) throw updateError

      // 4. Actualizar estado local
      setProfile({ ...profile, avatar_url: publicUrl })
    } catch (error: any) {
      alert(`Error al subir la foto de perfil: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const nivelNum = parseFloat(profile.nivel || 1.0)
  const progress = getLevelProgress(nivelNum)
  const info = getLevelInfo(nivelNum)

  return (
    <div className="px-5 pt-6 space-y-6 animate-fade-in">
      
      {/* Cabecera del Dashboard / Perfil */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div className="flex items-center gap-4 min-w-0">
          {/* Avatar editable con overlay de cámara */}
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <PlayerAvatar
              name={profile.full_name || profile.email}
              avatarUrl={profile.avatar_url}
              size="lg"
              className="shadow-md border border-slate-200/50"
            />
            <div className="absolute inset-0 bg-black/45 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Camera size={18} className="text-white" />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              disabled={uploading}
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-lg font-black text-slate-900 font-kanit truncate pr-2">
              {profile.full_name || profile.email.split('@')[0]}
            </h1>
            <p className="text-[10px] text-slate-400 font-bold truncate">
              {profile.email}
            </p>
            <div className="mt-1">
              <LevelBadge nivel={nivelNum} size="sm" />
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
          title="Salir"
        >
          <LogOut size={16} />
        </button>
      </div>

      {/* Tarjeta de Nivel Elo y Progreso */}
      <div className="card p-5 bg-gradient-to-br from-white to-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex justify-between items-end mb-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Nivel de Juego
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-slate-950 font-kanit">
                {nivelNum.toFixed(2)}
              </span>
              <span className="text-slate-400 text-xs font-bold">/ 10.0</span>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
              Racha
            </p>
            {profile.racha > 0 ? (
              <p className="text-lg font-black text-green-600 font-kanit">🔥 +{profile.racha}</p>
            ) : profile.racha < 0 ? (
              <p className="text-lg font-black text-red-500 font-kanit">❄️ {profile.racha}</p>
            ) : (
              <p className="text-lg font-bold text-slate-400 font-kanit">— 0</p>
            )}
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Partidos</p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold text-slate-400">
            <span>Progreso Categoría</span>
            <span className="text-brand-600">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full level-badge rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider pt-0.5">
            <span>{(info.nextLevel - 1.0).toFixed(2)}</span>
            <span>Próximo: {info.nextLevel.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center bg-white">
          <p className="text-xl font-black text-slate-950 font-kanit">{profile.partidos || 0}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Jugados</p>
        </div>
        <div className="card p-4 text-center bg-white border-l-green-500 border-l-[3px]">
          <p className="text-xl font-black text-green-600 font-kanit">{profile.victorias || 0}</p>
          <p className="text-[10px] text-green-600/70 font-bold uppercase tracking-widest mt-1">Victorias</p>
        </div>
        <div className="card p-4 text-center bg-white border-l-red-400 border-l-[3px]">
          <p className="text-xl font-black text-red-500 font-kanit">{profile.derrotas || 0}</p>
          <p className="text-[10px] text-red-500/70 font-bold uppercase tracking-widest mt-1">Derrotas</p>
        </div>
      </div>

      {/* Historial de partidos */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold text-slate-950 font-kanit uppercase tracking-wider">
          Últimos 5 partidos
        </h2>

        {partidos.length === 0 ? (
          <div className="card p-6 text-center bg-white text-slate-400">
            <Trophy size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-500">¿Aún sin partidos disputados?</p>
            <p className="text-[10px] text-slate-400 mt-1">Únete a un partido o regístralo para subir tu nivel.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {partidos.map((p: any) => {
              const esGanador = p.ganador_1_id === user.id || p.ganador_2_id === user.id
              const delta = parseFloat(p.delta_nivel || 0.10)
              const sign = esGanador ? `+${delta.toFixed(2)}` : `-${delta.toFixed(2)}`
              const clr = esGanador ? 'text-green-600' : 'text-red-500'
              const bg = esGanador ? 'bg-green-50/20' : 'bg-red-50/10'
              const badge = esGanador 
                ? 'bg-green-100 border-green-200 text-green-700' 
                : 'bg-red-100 border-red-200 text-red-700'
              
              const pG1 = p.ganador_1?.full_name || p.ganador_1?.email?.split('@')[0] || 'Jugador'
              const pG2 = p.ganador_2?.full_name || p.ganador_2?.email?.split('@')[0] || 'Jugador'
              const pP1 = p.perdedor_1?.full_name || p.perdedor_1?.email?.split('@')[0] || 'Jugador'
              const pP2 = p.perdedor_2?.full_name || p.perdedor_2?.email?.split('@')[0] || 'Jugador'

              return (
                <div
                  key={p.id}
                  className={`card p-4 flex items-center justify-between border border-slate-100 shadow-sm ${bg}`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-2 border ${badge}`}>
                      {esGanador ? '🏆 Victoria' : '💔 Derrota'}
                    </span>
                    <p className="text-xs font-bold text-slate-800 truncate">
                      🟢 {pG1} / {pG2}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      🔴 {pP1} / {pP2}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">
                      {formatDateShort(p.created_at)} · Sets: {esGanador ? p.sets_ganadores : p.sets_perdedores}
                    </p>
                  </div>
                  <span className={`text-sm font-extrabold flex-shrink-0 ${clr}`}>
                    {sign}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
