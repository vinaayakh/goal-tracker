import { motion } from 'framer-motion'
import { Flame, Target, CalendarCheck, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AnimatedCounter } from '../ui/AnimatedCounter'
import { useDashboard } from '../../store/hooks'

interface StatDef {
  label: string
  value: number
  suffix?: string
  icon: LucideIcon
  from: string
  to: string
}

export function AnalyticsHeader() {
  const { stats } = useDashboard()

  const cards: StatDef[] = [
    { label: 'Active goals', value: stats.totalGoals, icon: Target, from: '#8b5cf6', to: '#d946ef' },
    { label: 'Best streak', value: stats.activeStreak, suffix: 'd', icon: Flame, from: '#fb7185', to: '#fb923c' },
    { label: 'This week', value: stats.weekCompletionPct, suffix: '%', icon: CalendarCheck, from: '#22d3ee', to: '#2dd4bf' },
    { label: 'On track', value: stats.onTrack, icon: TrendingUp, from: '#34d399', to: '#a3e635' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass glass-hover rounded-3xl p-4 sm:p-5 relative overflow-hidden"
        >
          <div
            className="absolute -right-6 -top-6 size-20 rounded-full blur-2xl opacity-40"
            style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
          />
          <div
            className="grid place-items-center size-9 rounded-xl mb-3"
            style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
          >
            <c.icon size={18} className="text-white" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            <AnimatedCounter value={c.value} suffix={c.suffix} />
          </div>
          <div className="text-xs sm:text-sm text-ink-soft mt-0.5">{c.label}</div>
        </motion.div>
      ))}
    </div>
  )
}
