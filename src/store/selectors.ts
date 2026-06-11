import type { Goal, CompletionLog, MetricLog, AccentKey } from '../types'
import { goalProgress, type GoalProgress } from '../lib/progress'
import { computeStreaks } from '../lib/streak'
import { buildHeatmap, countsByDay, type HeatmapData } from '../lib/heatmap'
import { buildProjection, type Projection } from '../lib/projection'
import { today } from '../lib/date'

export interface GoalDerived {
  progress: GoalProgress
  streak: { current: number; longest: number }
  heatmap: HeatmapData
  projection: Projection
  doneToday: boolean
}

export function deriveGoal(
  goal: Goal,
  completions: CompletionLog[],
  metricLogs: MetricLog[],
): GoalDerived {
  const goalCompletions = completions.filter((c) => c.goalId === goal.id)
  const progress = goalProgress(goal, completions, metricLogs)
  const dayCounts = countsByDay(goalCompletions)
  const completedDays = new Set(goalCompletions.map((c) => c.date))
  return {
    progress,
    streak: computeStreaks(completedDays),
    heatmap: buildHeatmap(dayCounts),
    projection: buildProjection(goal, completions, metricLogs),
    doneToday: progress.doneToday,
  }
}

export interface DashboardStats {
  totalGoals: number
  activeStreak: number
  weekCompletionPct: number
  onTrack: number
}

/** Aggregate stats across all active goals for the dashboard header. */
export function dashboardStats(
  goals: Goal[],
  completions: CompletionLog[],
  metricLogs: MetricLog[],
): DashboardStats {
  const active = goals.filter((g) => !g.archived)
  let bestStreak = 0
  let onTrack = 0

  for (const g of active) {
    const d = deriveGoal(g, completions, metricLogs)
    bestStreak = Math.max(bestStreak, d.streak.current)
    if (d.projection.verdict === 'on-track' || d.projection.verdict === 'ahead') {
      onTrack += 1
    }
  }

  // week completion: completions in last 7 days vs expected daily actions
  const last7 = new Set<string>()
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    last7.add(d.toISOString().slice(0, 10))
  }
  let expected = 0
  let done = 0
  for (const g of active) {
    const dailyActions = g.subtasks.length === 0 ? 1 : g.subtasks.length
    expected += dailyActions * 7
    done += completions.filter((c) => c.goalId === g.id && last7.has(c.date)).length
  }
  const weekCompletionPct = expected === 0 ? 0 : Math.round((done / expected) * 100)

  return {
    totalGoals: active.length,
    activeStreak: bestStreak,
    weekCompletionPct: Math.min(100, weekCompletionPct),
    onTrack,
  }
}

export interface FeedEntry {
  id: string
  date: string
  goalId: string
  goalTitle: string
  goalIcon: string
  accent: AccentKey
  kind: 'completion' | 'metric'
  label: string
}

/**
 * A flat, reverse-chronological log of every entry across all goals — each
 * check-off and each logged metric value. Includes archived goals so their
 * history stays reachable.
 */
export function activityFeed(
  goals: Goal[],
  completions: CompletionLog[],
  metricLogs: MetricLog[],
): FeedEntry[] {
  const byId = new Map(goals.map((g) => [g.id, g]))
  // `seq` is insertion order — the within-day tiebreaker (logs carry no time).
  // Sorting by it descending puts the most recently added entry of a day first.
  const rows: Array<{ entry: FeedEntry; seq: number }> = []

  completions.forEach((c, i) => {
    const g = byId.get(c.goalId)
    if (!g) return
    const subtask = c.subtaskId ? g.subtasks.find((s) => s.id === c.subtaskId) : undefined
    rows.push({
      seq: i,
      entry: {
        id: c.id,
        date: c.date,
        goalId: g.id,
        goalTitle: g.title,
        goalIcon: g.icon,
        accent: g.accent,
        kind: 'completion',
        label: subtask ? `Completed “${subtask.title}”` : 'Marked complete',
      },
    })
  })
  metricLogs.forEach((m, i) => {
    const g = byId.get(m.goalId)
    if (!g) return
    rows.push({
      seq: completions.length + i,
      entry: {
        id: m.id,
        date: m.date,
        goalId: g.id,
        goalTitle: g.title,
        goalIcon: g.icon,
        accent: g.accent,
        kind: 'metric',
        label: `Logged ${m.value}${g.metric?.unit ?? ''}`,
      },
    })
  })

  rows.sort((a, b) =>
    a.entry.date !== b.entry.date ? (a.entry.date < b.entry.date ? 1 : -1) : b.seq - a.seq,
  )
  return rows.map((r) => r.entry)
}

/** Aggregate per-day completion counts across all goals (for the overview chart). */
export function aggregateActivity(completions: CompletionLog[], days = 30) {
  const map = new Map<string, number>()
  for (const c of completions) map.set(c.date, (map.get(c.date) ?? 0) + 1)
  const out: { date: string; count: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    out.push({ date: key, count: map.get(key) ?? 0 })
  }
  return out
}

export { today }
