import React from 'react'
import { getLevelInfo } from '@/lib/elo'

interface LevelBadgeProps {
  nivel: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function LevelBadge({ nivel, size = 'md', className = '' }: LevelBadgeProps) {
  const info = getLevelInfo(nivel)
  
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 rounded-md gap-0.5',
    md: 'text-xs px-2.5 py-1 rounded-full gap-1 font-bold',
    lg: 'text-sm px-3.5 py-1.5 rounded-full gap-1.5 font-extrabold'
  }

  return (
    <span
      className={`inline-flex items-center justify-center border font-semibold select-none shadow-sm transition-all duration-300 ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: info.bgColor,
        borderColor: `${info.color}20`, // Añade transparencia al borde
        color: info.color
      }}
    >
      <span>{info.emoji}</span>
      <span>{nivel.toFixed(2)}</span>
      {size !== 'sm' && <span className="opacity-75">· {info.categoria}</span>}
    </span>
  )
}
