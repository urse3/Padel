'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import PlayerAvatar from '@/components/PlayerAvatar'
import LevelBadge from '@/components/LevelBadge'
import { createClient } from '@/lib/supabase/client'
import { Users, Search, UserPlus, UserCheck, UserX, Clock } from 'lucide-react'

interface Usuario {
  id: string
  full_name: string | null
  email: string
  avatar_url: string | null
  nivel: number
}

interface Relacion {
  id: string
  solicitante_id: string
  receptor_id: string
  estado: 'pendiente' | 'aceptado' | 'rechazado'
  solicitante: Usuario
  receptor: Usuario
}

interface AmigosClientProps {
  relaciones: Relacion[]
  todosUsuarios: Usuario[]
  currentUserId: string
}

export default function AmigosClient({ relaciones, todosUsuarios, currentUserId }: AmigosClientProps) {
  const [activeTab, setActiveTab] = useState<'mis-amigos' | 'solicitudes' | 'buscar'>('mis-amigos')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const sb = createClient()

  // 1. Obtener lista de amigos confirmados
  const amigos = relaciones
    .filter(r => r.estado === 'aceptado')
    .map(r => (r.solicitante_id === currentUserId ? r.receptor : r.solicitante))

  // 2. Obtener solicitudes de amistad recibidas pendientes
  const solicitudesRecibidas = relaciones.filter(
    r => r.receptor_id === currentUserId && r.estado === 'pendiente'
  )

  // 3. Obtener solicitudes de amistad enviadas pendientes
  const solicitudesEnviadasIds = new Set(
    relaciones
      .filter(r => r.solicitante_id === currentUserId && r.estado === 'pendiente')
      .map(r => r.receptor_id)
  )

  // 4. Obtener conjunto de IDs de amigos confirmados y solicitudes recibidas para filtrarlos en el buscador
  const amigosIds = new Set(amigos.map(a => a.id))
  const solicitudesRecibidasIds = new Set(solicitudesRecibidas.map(s => s.solicitante_id))

  // 5. Filtrar usuarios del buscador
  const usuariosBuscador = todosUsuarios.filter(u => {
    const isFriend = amigosIds.has(u.id)
    const isRequestReceived = solicitudesRecibidasIds.has(u.id)
    
    // Si ya somos amigos o hay una solicitud entrante de él, no lo listamos aquí (ya aparece en sus respectivas pestañas)
    if (isFriend || isRequestReceived) return false

    // Búsqueda por nombre
    const name = (u.full_name || u.email.split('@')[0]).toLowerCase()
    return name.includes(searchQuery.toLowerCase())
  })

  // 6. Enviar solicitud de amistad
  const handleSendRequest = async (receptorId: string) => {
    setLoading(true)
    const { error } = await sb
      .from('amigos')
      .insert({
        solicitante_id: currentUserId,
        receptor_id: receptorId,
        estado: 'pendiente'
      })

    if (error) {
      alert(`Error al enviar solicitud: ${error.message}`)
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  // 7. Aceptar solicitud
  const handleAcceptRequest = async (relId: string) => {
    setLoading(true)
    const { error } = await sb
      .from('amigos')
      .update({ estado: 'aceptado' })
      .eq('id', relId)

    if (error) {
      alert(`Error al aceptar amistad: ${error.message}`)
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  // 8. Rechazar solicitud
  const handleRejectRequest = async (relId: string) => {
    setLoading(true)
    const { error } = await sb
      .from('amigos')
      .delete()
      .eq('id', relId)

    if (error) {
      alert(`Error al rechazar solicitud: ${error.message}`)
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="px-5 pt-6 space-y-6 animate-fade-in">
      
      {/* Cabecera */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="p-2.5 rounded-xl bg-brand-50 border border-brand-100 text-brand-600">
          <Users size={20} />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-900 font-kanit">Comunidad y Amigos</h1>
          <p className="text-xs text-slate-500 font-medium">Gestiona tu red y encuentra compañeros</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('mis-amigos')}
          className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all ${
            activeTab === 'mis-amigos' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400'
          }`}
        >
          Mis Amigos ({amigos.length})
        </button>
        <button
          onClick={() => setActiveTab('solicitudes')}
          className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all ${
            activeTab === 'solicitudes' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400'
          }`}
        >
          Solicitudes ({solicitudesRecibidas.length})
        </button>
        <button
          onClick={() => setActiveTab('buscar')}
          className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all ${
            activeTab === 'buscar' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400'
          }`}
        >
          Buscar Miembros
        </button>
      </div>

      {/* Contenido Pestañas */}
      {activeTab === 'mis-amigos' && (
        <div className="space-y-3">
          {amigos.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 border border-slate-100 rounded-2xl">
              <Users size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-500">Aún no tienes amigos en la lista</p>
              <p className="text-[10px] text-slate-400 mt-1">
                Ve a la pestaña &quot;Buscar Miembros&quot; y agrégalos para ver su actividad.
              </p>
            </div>
          ) : (
            <div className="card divide-y divide-slate-100 bg-white overflow-hidden shadow-sm border border-slate-100">
              {amigos.map(a => (
                <div key={a.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <PlayerAvatar name={a.full_name || a.email} avatarUrl={a.avatar_url} size="sm" className="border border-slate-100" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{a.full_name || a.email.split('@')[0]}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{a.email}</p>
                    </div>
                  </div>
                  <LevelBadge nivel={parseFloat(a.nivel as any)} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'solicitudes' && (
        <div className="space-y-3">
          {solicitudesRecibidas.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 text-xs font-semibold">
              No tienes solicitudes de amistad entrantes.
            </div>
          ) : (
            <div className="space-y-2.5">
              {solicitudesRecibidas.map(s => (
                <div key={s.id} className="card p-4 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <PlayerAvatar name={s.solicitante.full_name || s.solicitante.email} avatarUrl={s.solicitante.avatar_url} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {s.solicitante.full_name || s.solicitante.email.split('@')[0]}
                      </p>
                      <p className="text-[9px] text-slate-400 truncate">Te envió una solicitud</p>
                    </div>
                  </div>

                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleAcceptRequest(s.id)}
                      disabled={loading}
                      className="p-2 rounded-xl bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-600 font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      Aceptar
                    </button>
                    <button
                      onClick={() => handleRejectRequest(s.id)}
                      disabled={loading}
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'buscar' && (
        <div className="space-y-4">
          {/* Buscador */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar miembros por nombre..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-base pl-10"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>

          {/* Resultados */}
          <div className="space-y-2">
            {usuariosBuscador.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 text-xs font-semibold">
                No se encontraron miembros.
              </div>
            ) : (
              usuariosBuscador.map(u => {
                const tieneEnvioPendiente = solicitudesEnviadasIds.has(u.id)
                return (
                  <div key={u.id} className="card p-4 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <PlayerAvatar name={u.full_name || u.email} avatarUrl={u.avatar_url} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {u.full_name || u.email.split('@')[0]}
                        </p>
                        <p className="text-[9px] text-slate-400 truncate">
                          Nivel: {parseFloat(u.nivel as any).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {tieneEnvioPendiente ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                          <Clock size={12} /> Pendiente
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSendRequest(u.id)}
                          disabled={loading}
                          className="btn-primary py-2 px-3 text-xs font-bold justify-center shadow-green cursor-pointer flex items-center gap-1"
                        >
                          <UserPlus size={12} /> Agregar
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

    </div>
  )
}
