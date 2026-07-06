import React from 'react'

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 animate-pulse">
      <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
      <p className="text-sm font-bold text-slate-400 font-kanit uppercase tracking-widest">Cargando...</p>
    </div>
  )
}
