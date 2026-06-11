import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass rounded-3xl',
        hover && 'glass-hover transition-colors cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  )
}
