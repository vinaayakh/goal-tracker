import type { AccentKey } from '../types'

export interface AccentTheme {
  key: AccentKey
  label: string
  /** primary solid color (hex) */
  solid: string
  /** secondary gradient stop (hex) */
  solid2: string
  /** tailwind gradient classes */
  gradient: string
  /** soft translucent background */
  soft: string
  /** ring / glow color */
  glow: string
}

export const ACCENTS: Record<AccentKey, AccentTheme> = {
  violet: {
    key: 'violet',
    label: 'Violet',
    solid: '#8b5cf6',
    solid2: '#d946ef',
    gradient: 'from-violet-500 to-fuchsia-500',
    soft: 'rgba(139,92,246,0.14)',
    glow: 'rgba(139,92,246,0.45)',
  },
  indigo: {
    key: 'indigo',
    label: 'Indigo',
    solid: '#6366f1',
    solid2: '#3b82f6',
    gradient: 'from-indigo-500 to-blue-500',
    soft: 'rgba(99,102,241,0.14)',
    glow: 'rgba(99,102,241,0.45)',
  },
  cyan: {
    key: 'cyan',
    label: 'Cyan',
    solid: '#22d3ee',
    solid2: '#2dd4bf',
    gradient: 'from-cyan-400 to-teal-400',
    soft: 'rgba(34,211,238,0.14)',
    glow: 'rgba(34,211,238,0.45)',
  },
  emerald: {
    key: 'emerald',
    label: 'Emerald',
    solid: '#34d399',
    solid2: '#a3e635',
    gradient: 'from-emerald-400 to-lime-400',
    soft: 'rgba(52,211,153,0.14)',
    glow: 'rgba(52,211,153,0.45)',
  },
  amber: {
    key: 'amber',
    label: 'Amber',
    solid: '#fbbf24',
    solid2: '#fb923c',
    gradient: 'from-amber-400 to-orange-400',
    soft: 'rgba(251,191,36,0.14)',
    glow: 'rgba(251,191,36,0.45)',
  },
  rose: {
    key: 'rose',
    label: 'Rose',
    solid: '#fb7185',
    solid2: '#f472b6',
    gradient: 'from-rose-400 to-pink-400',
    soft: 'rgba(251,113,133,0.14)',
    glow: 'rgba(251,113,133,0.45)',
  },
}

export const ACCENT_KEYS = Object.keys(ACCENTS) as AccentKey[]

export function accent(key: AccentKey): AccentTheme {
  return ACCENTS[key] ?? ACCENTS.violet
}
