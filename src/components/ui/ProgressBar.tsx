import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'

interface Props {
  value: number // 0..100
  gradient?: string // tailwind from-/to- classes
  className?: string
  height?: string
}

export function ProgressBar({
  value,
  gradient = 'from-violet-500 to-fuchsia-500',
  className,
  height = 'h-2.5',
}: Props) {
  return (
    <div className={cn('w-full rounded-full bg-white/8 overflow-hidden', height, className)}>
      <motion.div
        className={cn('h-full rounded-full bg-gradient-to-r', gradient)}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}
