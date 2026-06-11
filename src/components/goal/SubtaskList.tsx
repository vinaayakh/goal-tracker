import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { Goal } from '../../types'
import type { AccentTheme } from '../../lib/theme'
import { useStore } from '../../store/useStore'
import { today } from '../../lib/date'
import { celebrate } from '../../lib/confetti'
import { cn } from '../../lib/cn'

export function SubtaskList({ goal, accent }: { goal: Goal; accent: AccentTheme }) {
  const completions = useStore((s) => s.completions)
  const toggleCompletion = useStore((s) => s.toggleCompletion)
  const t = today()

  const isDone = (subtaskId: string) =>
    completions.some(
      (c) => c.goalId === goal.id && c.subtaskId === subtaskId && c.date === t,
    )

  return (
    <div className="space-y-2.5">
      {goal.subtasks.map((st) => {
        const done = isDone(st.id)
        return (
          <motion.button
            key={st.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const nowDone = toggleCompletion(goal.id, st.id, t)
              if (nowDone) celebrate(accent.solid)
            }}
            className={cn(
              'w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition-colors',
              done ? 'bg-white/10' : 'bg-white/5 hover:bg-white/8',
            )}
          >
            <span
              className={cn(
                'grid place-items-center size-7 rounded-lg shrink-0 transition-colors',
                !done && 'border-2 border-white/20',
              )}
              style={done ? { background: `linear-gradient(135deg, ${accent.solid}, ${accent.solid2})` } : undefined}
            >
              {done && <Check size={16} className="text-white" />}
            </span>
            <span className="flex-1 min-w-0">
              <span className={cn('font-medium', done ? 'text-ink-soft line-through' : 'text-ink')}>
                {st.title}
              </span>
              <span className="block text-xs text-ink-faint capitalize">{st.recurrence}</span>
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
