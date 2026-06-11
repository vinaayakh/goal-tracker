import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'ghost' | 'soft' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps {
  children: ReactNode
  onClick?: (e: React.MouseEvent) => void
  variant?: Variant
  size?: Size
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  title?: string
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-2xl gap-2',
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  disabled,
  title,
}: ButtonProps) {
  const variants: Record<Variant, string> = {
    primary:
      'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40',
    soft: 'bg-white/8 text-ink hover:bg-white/12 border border-white/10',
    ghost: 'text-ink-soft hover:text-ink hover:bg-white/8',
    danger: 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/20',
  }
  return (
    <motion.button
      type={type}
      title={title}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center font-medium select-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
        sizes[size],
        variants[variant],
        className,
      )}
    >
      {children}
    </motion.button>
  )
}
