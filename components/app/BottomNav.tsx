'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, BarChart3, Plus, Activity, Users, Settings, X, Calendar, Trophy, Swords } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface BottomNavProps {
  isAdmin?: boolean
}

export default function BottomNav({ isAdmin = false }: BottomNavProps) {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0)
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)

  const sb = createClient()

  useEffect(() => {
    let channel: any = null
    const initNotifications = async () => {
      const { data: { user } } = await sb.auth.getUser()
      if (!user) return

      // Fetch inicial mensajes
      const { count: msgCount } = await sb
        .from('mensajes_directos')
        .select('*', { count: 'exact', head: true })
        .eq('receptor_id', user.id)
        .eq('leido', false)
      setUnreadMessagesCount(msgCount || 0)

      // Fetch inicial notificaciones
      const { count: notifCount } = await sb
        .from('notificaciones')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', user.id)
        .eq('leido', false)
      setUnreadNotificationsCount(notifCount || 0)

      // Suscribirse a cambios en tiempo real
      channel = sb.channel('bottom_nav_notifications')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'mensajes_directos', filter: `receptor_id=eq.${user.id}` }, async () => {
          const { count } = await sb.from('mensajes_directos').select('*', { count: 'exact', head: true }).eq('receptor_id', user.id).eq('leido', false)
          setUnreadMessagesCount(count || 0)
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notificaciones', filter: `usuario_id=eq.${user.id}` }, async () => {
          const { count } = await sb.from('notificaciones').select('*', { count: 'exact', head: true }).eq('usuario_id', user.id).eq('leido', false)
          setUnreadNotificationsCount(count || 0)
        })
        .subscribe()
    }

    initNotifications()

    return () => {
      if (channel) sb.removeChannel(channel)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const links = [
    { name: 'Perfil', path: '/dashboard', icon: User },
    { name: 'Ranking', path: '/ranking', icon: BarChart3 },
    { name: 'Partido', path: '/partidos', icon: Activity, badge: unreadNotificationsCount },
    { name: 'Amigos', path: '/amigos', icon: Users, badge: unreadMessagesCount }
  ]

  return (
    <>
      {/* Barra de Navegación Inferior Fija */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/50 px-4 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        <div className="flex justify-between items-center relative">
          
          {/* Primeros 2 links (Perfil y Ranking) */}
          <div className="flex justify-around flex-1">
            {links.slice(0, 2).map(l => {
              const Icon = l.icon
              const isActive = pathname === l.path
              return (
                <Link
                  key={l.path}
                  href={l.path}
                  className={`flex flex-col items-center gap-1.5 px-3 py-1.5 transition-all relative ${
                    isActive ? 'text-brand-600 font-bold scale-105' : 'text-slate-400 font-medium'
                  }`}
                >
                  <div className="relative">
                    <Icon size={20} className={isActive ? 'text-brand-600' : 'text-slate-400'} />
                    {l.badge && l.badge > 0 ? (
                      <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-fade-in">
                        {l.badge > 9 ? '9+' : l.badge}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[10px] tracking-tight">{l.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Botón Central de Creación Rápida (+) */}
          <div className="flex justify-center z-50">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative -mt-8 w-14 h-14 level-badge rounded-2xl flex items-center justify-center shadow-hero transition-all hover:scale-105 active:scale-95 text-white outline-none cursor-pointer"
            >
              <Plus
                size={26}
                className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-45' : ''}`}
              />
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-400 whitespace-nowrap uppercase tracking-wider select-none">
                Nuevo
              </span>
            </button>
          </div>

          {/* Últimos 2 links (Partido/Actividad y Amigos/Admin) */}
          <div className="flex justify-around flex-1">
            {links.slice(2, 4).map(l => {
              const Icon = l.icon
              const isActive = pathname.startsWith(l.path)
              return (
                <Link
                  key={l.path}
                  href={l.path}
                  className={`flex flex-col items-center gap-1.5 px-3 py-1.5 transition-all relative ${
                    isActive ? 'text-brand-600 font-bold scale-105' : 'text-slate-400 font-medium'
                  }`}
                >
                  <div className="relative">
                    <Icon size={20} className={isActive ? 'text-brand-600' : 'text-slate-400'} />
                    {l.badge && l.badge > 0 ? (
                      <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-fade-in">
                        {l.badge > 9 ? '9+' : l.badge}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[10px] tracking-tight">{l.name}</span>
                </Link>
              )
            })}
            
            {/* Botón Opcional de Admin si el perfil lo es */}
            {isAdmin && (
              <Link
                href="/admin"
                className={`flex flex-col items-center gap-1.5 px-3 py-1.5 transition-all ${
                  pathname.startsWith('/admin') ? 'text-brand-600 font-bold scale-105' : 'text-slate-400 font-medium'
                }`}
              >
                <Settings size={20} className={pathname.startsWith('/admin') ? 'text-brand-600' : 'text-slate-400'} />
                <span className="text-[10px] tracking-tight">Admin</span>
              </Link>
            )}
          </div>

        </div>
      </nav>

      {/* Modal / Sheet flotante para crear cosas nuevas */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-30 flex items-end justify-center px-4 pb-24 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsMenuOpen(false)}>
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl space-y-4 animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-extrabold text-slate-950 font-kanit text-base tracking-tight">
                ¿Qué quieres jugar hoy?
              </h3>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Accesos rápidos */}
            <div className="grid grid-cols-1 gap-3">
              <Link
                href="/partidos/nuevo"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 p-3 rounded-2xl bg-green-50/60 hover:bg-green-50 border border-green-100/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center flex-shrink-0 font-bold">
                  🎾
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    Crear Partido Abierto
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium leading-normal">
                    Organiza un partido de 4 jugadores en tu club y encuentra contrincantes de tu nivel.
                  </p>
                </div>
              </Link>

              <Link
                href="/rey-de-pista/nuevo"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 p-3 rounded-2xl bg-amber-50/60 hover:bg-amber-50 border border-amber-100/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 font-bold">
                  👑
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                    Crear Rey de Pista
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium leading-normal">
                    Formato de 6 a 12 jugadores con rotaciones automáticas. ¡La pareja ganadora se queda en pista!
                  </p>
                </div>
              </Link>

              <Link
                href="/torneos"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 p-3 rounded-2xl bg-cyan-50/60 hover:bg-cyan-50 border border-cyan-100/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center flex-shrink-0 font-bold">
                  🏆
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
                    Ver Torneos Oficiales
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium leading-normal">
                    Consulta el cuadro de brackets, torneos activos y regístrate con tu pareja favorita.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
