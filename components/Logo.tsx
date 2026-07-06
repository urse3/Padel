import React from 'react'

interface LogoProps {
  size?: number
  className?: string
}

export default function Logo({ size = 40, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Estela de velocidad */}
      <path d="M125 57C118 78 106 102 81 123" stroke="#4ade80" stroke-width="5" stroke-linecap="round"/>
      <path d="M122 59C114 84 98 112 73 133" stroke="#4ade80" stroke-width="6.5" stroke-linecap="round"/>
      <path d="M125 57C117 80 102 108 76 130C88 116 108 92 125 57Z" fill="#4ade80"/>
      
      {/* Mango y marco de la pala */}
      <path d="M48 148L64 132" stroke="#4ade80" stroke-width="8.5" stroke-linecap="round"/>
      <path d="M44 152L49 147" stroke="#4ade80" stroke-width="11" stroke-linecap="round"/>
      <path d="M70 126C60 116 57 101 62 88C67 75 79 67 93 65C108 63 122 71 126 84C130 97 126 112 116 120C108 126 98 128 88 127L70 126Z" stroke="#4ade80" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M79 113L87 101L93 111Z" fill="#4ade80"/>
      
      {/* Pelota de pádel */}
      <circle cx="132" cy="52" r="16" fill="#4ade80"/>
      
      {/* Costuras azules de la pelota */}
      <path d="M121 44C125 49 130 49 133 44" stroke="#00a2ff" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M126 59C131 54 136 54 140 59" stroke="#00a2ff" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  )
}
