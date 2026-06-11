import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, TrendingUp } from 'lucide-react'
import { PageTransition } from '../components/layout/PageTransition'
import { useActivityFeed } from '../store/hooks'
import { useStore } from '../store/useStore'
import { accent } from '../lib/theme'
import { today, prettyDate, fromNowDays } from '../lib/date'
import type { FeedEntry } from '../store/selectors'
import { cn } from '../lib/cn'

function dayLabel(date: string): string {
  if (date === today()) return 'Today'
  if (fromNowDays(date) === -1) return 'Yesterday'
  return prettyDate(date)
}

export function HistoryPage() {
  const feed = useActivityFeed()
  const goals = useStore((s) => s.goals)
  const navigate = useNavigate()
  const [filter, setFilter] = useState<string | null>(null)

  // Only show filter chips for goals that actually have entries.
  const goalsWithEntries = useMemo(() => {
    const ids = new Set(feed.map((e) => e.goalId))
    return goals.filter((g) => ids.has(g.id))
  }, [feed, goals])

  const visible = useMemo(
    () => (filter ? feed.filter((e) => e.goalId === filter) : feed),
    [feed, filter],
  )

  // Group consecutive entries by day (feed is already date-desc).
  const groups = useMemo(() => {
    const out: { date: string; entries: FeedEntry[] }[] = []
    for (const e of visible) {
      const last = out[out.length - 1]
      if (last && last.date === e.date) last.entries.push(e)
      else out.push({ date: e.date, entries: [e] })
    }
    return out
  }, [visible])

  return (
    <PageTransition>
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">Activity</h1>
        <p className="text-ink-soft text-sm mt-1">
          {feed.length} {feed.length === 1 ? 'entry' : 'entries'} logged
        </p>
      </header>

      {goalsWithEntries.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <FilterChip active={filter === null} onClick={() => setFilter(null)}>
            All
          </FilterChip>
          {goalsWithEntries.map((g) => {
            const a = accent(g.accent)
            return (
              <FilterChip
                key={g.id}
                active={filter === g.id}
                color={a.solid}
                onClick={() => setFilter(filter === g.id ? null : g.id)}
              >
                <span>{g.icon}</span>
                {g.title}
              </FilterChip>
            )
          })}
        </div>
      )}

      {groups.length === 0 ? (
        <div className="glass rounded-3xl p-10 text-center text-ink-soft">
          No activity yet — check off a goal to start your history.
        </div>
      ) : (
        <div className="space-y-7">
          {groups.map((group) => (
            <section key={group.date}>
              <h2 className="sticky top-0 z-10 -mx-1 px-1 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint backdrop-blur-sm">
                {dayLabel(group.date)}
              </h2>
              <div className="mt-2 space-y-2">
                {group.entries.map((e, i) => (
                  <Row key={e.id} entry={e} index={i} onClick={() => navigate(`/goal/${e.goalId}`)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </PageTransition>
  )
}

function Row({
  entry,
  index,
  onClick,
}: {
  entry: FeedEntry
  index: number
  onClick: () => void
}) {
  const a = accent(entry.accent)
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl text-left glass glass-hover"
    >
      <div
        className="grid place-items-center size-10 rounded-xl text-lg shrink-0"
        style={{ background: a.soft, border: `1px solid ${a.solid}33` }}
      >
        {entry.goalIcon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-ink truncate">{entry.label}</div>
        <div className="text-xs text-ink-faint truncate">{entry.goalTitle}</div>
      </div>
      <span
        className="grid place-items-center size-7 rounded-lg shrink-0"
        style={{ background: a.soft, color: a.solid }}
      >
        {entry.kind === 'completion' ? <Check size={15} /> : <TrendingUp size={15} />}
      </span>
    </motion.button>
  )
}

function FilterChip({
  children,
  active,
  color,
  onClick,
}: {
  children: React.ReactNode
  active: boolean
  color?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-sm font-medium transition-colors',
        active ? 'text-ink' : 'text-ink-soft bg-white/6 hover:bg-white/10',
      )}
      style={
        active
          ? color
            ? { background: `${color}26`, border: `1px solid ${color}55`, color }
            : { background: 'rgba(255,255,255,0.14)' }
          : undefined
      }
    >
      {children}
    </button>
  )
}
