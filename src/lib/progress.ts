import type { Goal, CompletionLog, MetricLog } from '../types'
import { today, expectedOccurrences, parseDay } from './date'

export interface GoalProgress {
  /** 0..100 overall progress percentage */
  percent: number
  /** human label for the denominator context */
  label: string
  /** done count (completions or unit toward target) */
  done: number
  /** total expected (occurrences or unit span) */
  total: number
  /** is today's action already completed? (habit goals) */
  doneToday: boolean
}

/**
 * Habit progress = completed occurrences / expected occurrences to-date,
 * aggregated across subtasks. For subtask-less goals, the goal itself counts
 * as one daily "occurrence".
 */
export function habitProgress(goal: Goal, completions: CompletionLog[]): GoalProgress {
  const end = today()
  const goalCompletions = completions.filter((c) => c.goalId === goal.id)

  let expected = 0
  let done = 0

  if (goal.subtasks.length === 0) {
    expected = expectedOccurrences('daily', goal.startDate, end)
    done = goalCompletions.filter((c) => c.subtaskId === undefined).length
  } else {
    for (const st of goal.subtasks) {
      expected += expectedOccurrences(st.recurrence, goal.startDate, end)
      done += goalCompletions.filter((c) => c.subtaskId === st.id).length
    }
  }

  const percent = expected === 0 ? 0 : Math.min(100, Math.round((done / expected) * 100))
  const doneToday =
    goal.subtasks.length === 0
      ? goalCompletions.some((c) => c.subtaskId === undefined && c.date === end)
      : goal.subtasks.every((st) =>
          goalCompletions.some((c) => c.subtaskId === st.id && c.date === end),
        )

  return {
    percent,
    label: `${done} of ${expected} completions`,
    done,
    total: expected,
    doneToday,
  }
}

/** Latest logged metric value, or the configured start value if none logged yet. */
export function latestMetricValue(goal: Goal, logs: MetricLog[]): number {
  const goalLogs = logs
    .filter((m) => m.goalId === goal.id)
    .sort((a, b) => parseDay(a.date).getTime() - parseDay(b.date).getTime())
  if (goalLogs.length === 0) return goal.metric?.startValue ?? 0
  return goalLogs[goalLogs.length - 1].value
}

export function metricProgress(goal: Goal, logs: MetricLog[]): GoalProgress {
  const m = goal.metric
  if (!m) return { percent: 0, label: '', done: 0, total: 0, doneToday: false }
  const latest = latestMetricValue(goal, logs)
  const span = m.startValue - m.targetValue // signed
  const moved = m.startValue - latest
  let percent = span === 0 ? 100 : (moved / span) * 100
  percent = Math.max(0, Math.min(100, Math.round(percent)))

  const loggedToday = logs.some((l) => l.goalId === goal.id && l.date === today())

  return {
    percent,
    label: `${latest}${m.unit} → ${m.targetValue}${m.unit}`,
    done: latest,
    total: m.targetValue,
    doneToday: loggedToday,
  }
}

export function goalProgress(
  goal: Goal,
  completions: CompletionLog[],
  metricLogs: MetricLog[],
): GoalProgress {
  return goal.type === 'metric'
    ? metricProgress(goal, metricLogs)
    : habitProgress(goal, completions)
}
