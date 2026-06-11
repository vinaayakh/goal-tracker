import { motion } from 'framer-motion'
import { Check, Circle } from 'lucide-react'
import type { Goal } from '../../types'
import type { AccentTheme } from '../../lib/theme'
import { useStore } from '../../store/useStore'
import { today } from '../../lib/date'
import { celebrate } from '../../lib/confetti'

export function DoneTodayButton({ goal, accent }: { goal: Goal; accent: AccentTheme }) {
  const completions = useStore((s) => s.completions)
  const toggleCompletion = useStore((s) => s.toggleCompletion)
  const t = today()
  const done = completions.some(
    (c) => c.goalId === goal.id && c.subtaskId === undefined && c.date === t,
  )

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      onClick={() => {
        const nowDone = toggleCompletion(goal.id, undefined, t)
        if (nowDone) celebrate(accent.solid)
      }}
      className="w-full flex items-center justify-center gap-3 h-16 rounded-2xl font-semibold text-base transition-colors"
      style={
        done
          ? { background: `linear-gradient(135deg, ${accent.solid}, ${accent.solid2})`, color: '#fff' }
          : { background: 'rgba(255,255,255,0.06)', color: '#aab0c6', border: '1px solid rgba(255,255,255,0.1)' }
      }
    >
      {done ? <Check size={22} /> : <Circle size={22} />}
      {done ? "Completed for today 🎉" : 'Mark complete for today'}
    </motion.button>
  )
}
