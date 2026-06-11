import { useEffect } from 'react'
import { animate, useMotionValue, useTransform, motion } from 'framer-motion'

interface Props {
  value: number
  decimals?: number
  suffix?: string
  className?: string
  duration?: number
}

export function AnimatedCounter({
  value,
  decimals = 0,
  suffix = '',
  className,
  duration = 1.1,
}: Props) {
  const mv = useMotionValue(0)
  const text = useTransform(mv, (v) => `${v.toFixed(decimals)}${suffix}`)

  useEffect(() => {
    const controls = animate(mv, value, { duration, ease: [0.16, 1, 0.3, 1] })
    return controls.stop
  }, [value, duration, mv])

  return <motion.span className={className}>{text}</motion.span>
}
