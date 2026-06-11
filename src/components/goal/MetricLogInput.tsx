import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import type { Goal } from '../../types'
import type { AccentTheme } from '../../lib/theme'
import { useStore } from '../../store/useStore'
import { today, prettyDate } from '../../lib/date'
import { latestMetricValue } from '../../lib/progress'
import { celebrate } from '../../lib/confetti'

export function MetricLogInput({ goal, accent }: { goal: Goal; accent: AccentTheme }) {
  const metricLogs = useStore((s) => s.metricLogs)
  const logMetric = useStore((s) => s.logMetric)
  const latest = latestMetricValue(goal, metricLogs)
  const [value, setValue] = useState<string>(String(latest))
  const m = goal.metric!

  const loggedToday = metricLogs.find((l) => l.goalId === goal.id && l.date === today())

  const submit = () => {
    const n = parseFloat(value)
    if (Number.isNaN(n)) return
    logMetric(goal.id, n, today())
    celebrate(accent.solid)
  }

  return (
    <div>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="text-xs text-ink-soft">Today's value</label>
          <div className="flex items-center mt-1.5 rounded-2xl bg-white/6 border border-white/10 overflow-hidden focus-within:border-white/25 transition-colors">
            <input
              type="number"
              inputMode="decimal"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              className="flex-1 bg-transparent px-4 h-12 text-lg font-semibold text-ink outline-none w-full"
            />
            <span className="px-4 text-ink-soft">{m.unit}</span>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={submit}
          className="grid place-items-center size-12 rounded-2xl text-white shrink-0"
          style={{ background: `linear-gradient(135deg, ${accent.solid}, ${accent.solid2})` }}
        >
          <Plus size={22} />
        </motion.button>
      </div>
      <p className="text-xs text-ink-faint mt-2">
        {loggedToday
          ? `Logged ${loggedToday.value}${m.unit} today — submit again to update.`
          : `Last entry: ${latest}${m.unit}. Goal: ${m.targetValue}${m.unit} by ${
              goal.endDate ? prettyDate(goal.endDate) : 'no deadline'
            }.`}
      </p>
    </div>
  )
}
