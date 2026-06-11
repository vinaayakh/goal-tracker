import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Pencil,
  Archive,
  Trash2,
  Flame,
  Trophy,
  CalendarClock,
} from 'lucide-react'
import { PageTransition } from '../components/layout/PageTransition'
import { useGoal, useGoalDerived } from '../store/hooks'
import { useStore } from '../store/useStore'
import { useUI } from '../store/useUI'
import { accent } from '../lib/theme'
import { ProgressRing } from '../components/ui/ProgressRing'
import { Chip } from '../components/ui/Chip'
import { Button } from '../components/ui/Button'
import { ContributionHeatmap } from '../components/goal/ContributionHeatmap'
import { ProjectionChart } from '../components/goal/ProjectionChart'
import { ConsistencyPanel } from '../components/goal/ConsistencyPanel'
import { SubtaskList } from '../components/goal/SubtaskList'
import { DoneTodayButton } from '../components/goal/DoneTodayButton'
import { MetricLogInput } from '../components/goal/MetricLogInput'
import { VERDICT_META } from '../lib/projection'
import { fromNowDays, prettyDate } from '../lib/date'

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="glass rounded-3xl p-5 sm:p-6"
    >
      <div className="mb-4">
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        {subtitle && <p className="text-sm text-ink-soft mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  )
}

export function GoalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const goal = useGoal(id)
  const derived = useGoalDerived(id)
  const archiveGoal = useStore((s) => s.archiveGoal)
  const deleteGoal = useStore((s) => s.deleteGoal)
  const openEdit = useUI((s) => s.openEdit)

  if (!goal || !derived) {
    return (
      <PageTransition>
        <div className="glass rounded-3xl p-10 text-center">
          <p className="text-ink-soft">Goal not found.</p>
          <Link to="/" className="text-violet-400 text-sm mt-2 inline-block">
            ← Back to dashboard
          </Link>
        </div>
      </PageTransition>
    )
  }

  const a = accent(goal.accent)
  const { progress, streak, heatmap, projection } = derived
  const verdict = VERDICT_META[projection.verdict]
  const daysLeft = goal.endDate ? fromNowDays(goal.endDate) : undefined

  // Adaptive charts: a projection only makes sense with a target (metric goals
  // always have one; habits only when an end date is set). Consistency is the
  // headline for habits. The heatmap belongs wherever completions are the point.
  const showProjection = goal.type === 'metric' || !!goal.endDate
  const showConsistency = goal.type === 'habit'
  const showHeatmap = goal.type === 'habit' || goal.subtasks.length > 0

  return (
    <PageTransition>
      {/* Back + actions */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => openEdit(goal.id)} title="Edit">
            <Pencil size={15} /> Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => archiveGoal(goal.id)} title="Archive">
            <Archive size={15} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="Delete"
            onClick={() => {
              if (confirm(`Delete "${goal.title}"? This cannot be undone.`)) {
                deleteGoal(goal.id)
                navigate('/')
              }
            }}
          >
            <Trash2 size={15} className="text-rose-300" />
          </Button>
        </div>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-6 relative overflow-hidden mb-5"
      >
        <div
          className="absolute -right-16 -top-16 size-56 rounded-full blur-3xl opacity-25"
          style={{ background: `linear-gradient(135deg, ${a.solid}, ${a.solid2})` }}
        />
        <div className="flex items-start gap-4 relative">
          <div
            className="grid place-items-center size-16 rounded-2xl text-3xl shrink-0"
            style={{ background: a.soft, border: `1px solid ${a.solid}33` }}
          >
            {goal.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-ink">{goal.title}</h1>
            {goal.description && (
              <p className="text-sm text-ink-soft mt-1">{goal.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Chip color={verdict.accent}>{verdict.label}</Chip>
              <Chip color="#fb923c">
                <Flame size={12} /> {streak.current}d streak
              </Chip>
              <Chip color="#fbbf24">
                <Trophy size={12} /> best {streak.longest}d
              </Chip>
              {daysLeft !== undefined && (
                <Chip color={daysLeft < 0 ? '#fb7185' : '#22d3ee'}>
                  <CalendarClock size={12} />
                  {daysLeft < 0
                    ? `ended ${prettyDate(goal.endDate!)}`
                    : `${daysLeft} days left · ${prettyDate(goal.endDate!)}`}
                </Chip>
              )}
            </div>
          </div>
          <div className="hidden sm:block">
            <ProgressRing value={progress.percent} from={a.solid} to={a.solid2} size={96} stroke={9}>
              <div className="text-center">
                <div className="text-xl font-bold text-ink">{progress.percent}%</div>
                <div className="text-[10px] text-ink-faint">progress</div>
              </div>
            </ProgressRing>
          </div>
        </div>
        <p className="text-sm text-ink-soft mt-4 relative">{progress.label}</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Check-in */}
        <SectionCard
          title="Today's check-in"
          subtitle={
            goal.type === 'metric'
              ? 'Log your latest measurement'
              : goal.subtasks.length === 0
                ? 'One tap to log today'
                : 'Mark off your daily actions'
          }
        >
          {goal.type === 'metric' && <MetricLogInput goal={goal} accent={a} />}
          {goal.subtasks.length > 0 && (
            <div className={goal.type === 'metric' ? 'mt-5' : ''}>
              {goal.type === 'metric' && (
                <p className="text-xs font-medium text-ink-soft mb-2.5">Supporting habits</p>
              )}
              <SubtaskList goal={goal} accent={a} />
            </div>
          )}
          {goal.type === 'habit' && goal.subtasks.length === 0 && (
            <DoneTodayButton goal={goal} accent={a} />
          )}
        </SectionCard>

        {/* Primary chart: projection when there's a target, else consistency */}
        {showProjection ? (
          <SectionCard
            title="Projection"
            subtitle="Your trend vs. the pace needed to hit the target"
          >
            <ProjectionChart projection={projection} startDate={goal.startDate} accent={a} />
          </SectionCard>
        ) : (
          <SectionCard
            title="Consistency"
            subtitle="How reliably you're keeping this habit"
          >
            <ConsistencyPanel goal={goal} accent={a} streak={streak} />
          </SectionCard>
        )}
      </div>

      {/* Consistency as a secondary panel when projection took the primary slot */}
      {showConsistency && showProjection && (
        <div className="mt-5">
          <SectionCard title="Consistency" subtitle="Weekly completion rate over time">
            <ConsistencyPanel goal={goal} accent={a} streak={streak} />
          </SectionCard>
        </div>
      )}

      {/* Heatmap — only where completions are the point (habits, or metric goals
          with supporting daily habits) */}
      {showHeatmap && (
        <div className="mt-5">
          <SectionCard
            title="Activity"
            subtitle={`${heatmap.total} completions in the last year`}
          >
            <ContributionHeatmap data={heatmap} accent={a} />
          </SectionCard>
        </div>
      )}
    </PageTransition>
  )
}
