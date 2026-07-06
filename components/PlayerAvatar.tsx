import React from 'react'
import Image from 'next/image'
import { getInitials } from '@/lib/elo'

interface PlayerAvatarProps {
  name?: string | null
  avatarUrl?: string | null
  nivel?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export default function PlayerAvatar({
  name,
  avatarUrl,
  nivel,
  size = 'md',
  className = ''
}: PlayerAvatarProps) {
  const initials = getInitials(name)

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl font-black'
  }

  // Si tiene un nivel, podemos darle un borde dinámico basado en la categoría
  // Pero para mantener la consistencia y estética premium, usaremos un anillo sutil
  const ringColor = 'ring-2 ring-brand-500/10'

  return (
    <div
      className={`relative rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 select-none ${sizeClasses[size]} ${ringColor} ${className}`}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name || 'Usuario'}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority={size === 'xl'}
        />
      ) : (
        <div className="w-full h-full level-badge flex items-center justify-center font-bold text-white tracking-wider">
          {initials}
        </div>
      )}
    </div>
  )
}
