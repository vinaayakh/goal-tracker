import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface Props {
  children: ReactNode
  color?: string // hex for text/border tint
  className?: string
}

export function Chip({ children, color, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        className,
      )}
      style={
        color
          ? {
              color,
              background: `${color}1f`,
              border: `1px solid ${color}33`,
            }
          : undefined
      }
    >
      {children}
    </span>
  )
}
