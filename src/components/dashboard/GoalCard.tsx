import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Flame, CalendarClock } from 'lucide-react'
import type { Goal } from '../../types'
import { useStore } from '../../store/useStore'
import { useGoalDerived } from '../../store/hooks'
import { accent } from '../../lib/theme'
import { ProgressRing } from '../ui/ProgressRing'
import { Chip } from '../ui/Chip'
import { VERDICT_META } from '../../lib/projection'
import { fromNowDays, today } from '../../lib/date'
import { celebrate } from '../../lib/confetti'
import { cn } from '../../lib/cn'

export function GoalCard({ goal, index }: { goal: Goal; index: number }) {
  const navigate = useNavigate()
  const derived = useGoalDerived(goal.id)
  const toggleCompletion = useStore((s) => s.toggleCompletion)
  // Distinct subtasks checked off today (primitive return → stable snapshot).
  const subtasksDoneToday = useStore((s) =>
    goal.subtasks.length === 0
      ? 0
      : new Set(
          s.completions
            .filter((c) => c.goalId === goal.id && c.subtaskId && c.date === today())
            .map((c) => c.subtaskId),
        ).size,
  )
  const a = accent(goal.accent)
  if (!derived) return null

  const { progress, streak, projection, doneToday } = derived
  const verdict = VERDICT_META[projection.verdict]

  const daysLeft = goal.endDate ? fromNowDays(goal.endDate) : undefined

  const hasSubtasks = goal.subtasks.length > 0
  const metricNoSubtasks = goal.type === 'metric' && !hasSubtasks
  const allSubtasksDone = hasSubtasks && subtasksDoneToday === goal.subtasks.length
  // Goals with subtasks track progress per-subtask — the card shouldn't bulk-complete
  // them. Highlight only when every subtask is checked off today.
  const highlight = hasSubtasks ? allSubtasksDone : doneToday

  const onQuickAction = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Subtask goals & metric goals are checked off / logged on the detail page.
    if (hasSubtasks || metricNoSubtasks) {
      navigate(`/goal/${goal.id}`)
      return
    }
    // Subtask-less habit: one-tap toggle.
    const nowDone = toggleCompletion(goal.id, undefined, today())
    if (nowDone) celebrate(a.solid)
  }

  const buttonLabel = metricNoSubtasks
    ? doneToday
      ? 'Logged today'
      : 'Log value'
    : hasSubtasks
      ? `${subtasksDoneToday}/${goal.subtasks.length} today`
      : doneToday
        ? 'Done today'
        : 'Mark today'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.4), duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/goal/${goal.id}`)}
      className="glass glass-hover rounded-3xl p-5 cursor-pointer relative overflow-hidden group"
    >
      {/* accent glow */}
      <div
        className="absolute -left-10 -top-10 size-32 rounded-full blur-3xl opacity-20 group-hover:opacity-35 transition-opacity"
        style={{ background: `linear-gradient(135deg, ${a.solid}, ${a.solid2})` }}
      />
      <div className="flex items-start gap-4 relative">
        <div
          className="grid place-items-center size-12 rounded-2xl text-2xl shrink-0"
          style={{ background: a.soft, border: `1px solid ${a.solid}33` }}
        >
          {goal.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-ink truncate">{goal.title}</h3>
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Chip color={verdict.accent}>{verdict.label}</Chip>
            {streak.current > 0 && (
              <Chip color="#fb923c">
                <Flame size={12} /> {streak.current}d
              </Chip>
            )}
            {daysLeft !== undefined && (
              <Chip color={daysLeft < 0 ? '#fb7185' : '#6b7088'}>
                <CalendarClock size={12} />
                {daysLeft < 0 ? 'ended' : `${daysLeft}d left`}
              </Chip>
            )}
          </div>
        </div>

        <ProgressRing value={progress.percent} from={a.solid} to={a.solid2} size={60} stroke={6}>
          <span className="text-sm font-bold text-ink">{progress.percent}%</span>
        </ProgressRing>
      </div>

      <div className="flex items-center justify-between mt-4 relative">
        <span className="text-xs text-ink-soft truncate">{progress.label}</span>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onQuickAction}
          className={cn(
            'inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-sm font-medium transition-colors shrink-0',
            highlight
              ? 'text-white'
              : 'bg-white/8 text-ink-soft hover:text-ink hover:bg-white/12',
          )}
          style={highlight ? { background: `linear-gradient(135deg, ${a.solid}, ${a.solid2})` } : undefined}
        >
          <Check size={15} />
          {buttonLabel}
        </motion.button>
      </div>
    </motion.div>
  )
}
