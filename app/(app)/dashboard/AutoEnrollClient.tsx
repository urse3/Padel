'use client'

import { useEffect, useRef } from 'react'
import { processPendingInvite } from './AutoEnrollAction'
import Logo from '@/components/Logo'

export default function AutoEnrollClient({ inviteId }: { inviteId: string }) {
  const processed = useRef(false)

  useEffect(() => {
    if (!processed.current) {
      processed.current = true
      processPendingInvite(inviteId)
    }
  }, [inviteId])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
      <div className="relative">
        <Logo size={60} className="animate-pulse" />
        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center animate-bounce">
          <span className="text-white text-xs font-bold">✓</span>
        </div>
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-kanit font-black text-slate-900">Procesando invitación...</h2>
        <p className="text-sm font-medium text-slate-500">Uniendo al partido, espera un momento</p>
      </div>
    </div>
  )
}
