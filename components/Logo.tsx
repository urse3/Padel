import React from 'react'
import Image from 'next/image'

interface LogoProps {
  size?: number
  className?: string
}

export default function Logo({ size = 40, className = '' }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Punto de Padel Logo"
      width={size}
      height={size}
      className={className}
      priority
    />
  )
}
