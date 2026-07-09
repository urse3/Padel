// Sistema de niveles 0.0 → 10.0 estilo Playtomic
// Paso de 0.25 en 0.25

export interface NivelInfo {
  label: string
  categoria: string
  emoji: string
  color: string
  bgColor: string
  nextLevel: number
}

export function getLevelInfo(nivel: number): NivelInfo {
  if (nivel < 1.5)  return { label: 'Iniciación',    categoria: 'Iniciación',   emoji: '🌱', color: '#6b7280', bgColor: '#f3f4f6', nextLevel: 2.0  }
  if (nivel < 2.5)  return { label: 'Categoría 9',   categoria: 'Cat. 9',       emoji: '⚪', color: '#64748b', bgColor: '#f1f5f9', nextLevel: 3.0  }
  if (nivel < 3.5)  return { label: 'Categoría 8',   categoria: 'Cat. 8',       emoji: '🔵', color: '#3b82f6', bgColor: '#eff6ff', nextLevel: 4.0  }
  if (nivel < 4.5)  return { label: 'Categoría 7',   categoria: 'Cat. 7',       emoji: '🟡', color: '#eab308', bgColor: '#fefce8', nextLevel: 5.0  }
  if (nivel < 5.5)  return { label: 'Categoría 6',   categoria: 'Cat. 6',       emoji: '🟠', color: '#f97316', bgColor: '#fff7ed', nextLevel: 6.0  }
  if (nivel < 6.5)  return { label: 'Categoría 5',   categoria: 'Cat. 5',       emoji: '🔴', color: '#ef4444', bgColor: '#fef2f2', nextLevel: 7.0  }
  if (nivel < 7.5)  return { label: 'Categoría 4',   categoria: 'Cat. 4',       emoji: '🟣', color: '#a855f7', bgColor: '#faf5ff', nextLevel: 8.0  }
  if (nivel < 8.5)  return { label: 'Primera',       categoria: 'Primera',      emoji: '⚫', color: '#1f2937', bgColor: '#f9fafb', nextLevel: 9.0  }
  if (nivel < 9.5)  return { label: 'Profesional',   categoria: 'Profesional',  emoji: '🥇', color: '#d97706', bgColor: '#fffbeb', nextLevel: 10.0 }
  return               { label: 'Élite Mundial',  categoria: 'Élite',        emoji: '👑', color: '#16a34a', bgColor: '#f0fdf4', nextLevel: 10.0 }
}

// K-factor: varía por nivel (cada vez es más complicado subir)
function getKFactor(nivel: number): number {
  if (nivel < 3.0) return 0.50
  if (nivel < 5.0) return 0.35
  if (nivel < 6.0) return 0.20
  if (nivel < 7.0) return 0.10
  if (nivel < 8.0) return 0.05
  if (nivel < 9.0) return 0.02
  return 0.01 // Nivel > 9 (casi imposible subir)
}

export function calcularElo(
  nivelGanador: number,
  nivelPerdedor: number,
  multiplicador: number = 1.0,
  setsGanador: number = 2,
  setsPerdedor: number = 0
): { deltaGanador: number; deltaPerdedor: number } {
  const nivelGanPromedio = nivelGanador
  const nivelPerPromedio = nivelPerdedor

  const K = getKFactor(nivelGanPromedio)
  const expected = 1.0 / (1.0 + Math.pow(10, (nivelPerPromedio - nivelGanPromedio) / 4))
  
  // Factor de contundencia por diferencia de sets
  const diferenciaSets = Math.abs(setsGanador - setsPerdedor)
  let factorContundencia = 1.0
  if (diferenciaSets >= 2) factorContundencia = 1.2
  else if (diferenciaSets === 1) factorContundencia = 0.8
  
  let delta = K * (1 - expected) * multiplicador * factorContundencia
  delta = Math.round(delta * 100) / 100

  // Garantizar un mínimo de 0.01 al ganador
  if (delta < 0.01) delta = 0.01

  return {
    deltaGanador: delta,
    deltaPerdedor: -delta,
  }
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export function getLevelProgress(nivel: number): number {
  // Progreso dentro de la categoría actual (0-100%)
  const info = getLevelInfo(nivel)
  const minLevel = info.nextLevel - 1.0
  const maxLevel = info.nextLevel
  return Math.min(100, Math.max(0, ((nivel - minLevel) / (maxLevel - minLevel)) * 100))
}

// Multiplicadores por tipo de actividad
export const MULTIPLICADORES = {
  partido: 1.0,
  rey_de_pista: 1.5,
  torneo: 2.5,
} as const

export type TipoActividad = keyof typeof MULTIPLICADORES
