import { addDays, startOfWeek } from 'date-fns'
import type { Goal, CompletionLog } from '../types'
import { parseDay, dayKey, today, expectedOccurrences, prettyDateShort } from './date'

export interface WeekConsistency {
  /** YYYY-MM-DD of the week's Monday */
  weekStart: string
  /** short label e.g. "Jun 3" */
  label: string
  /** completion rate 0..100 for the week */
  rate: number
  done: number
  expected: number
}

/** Expected daily/weekly actions for a goal over an inclusive [from, to] range. */
function expectedFor(goal: Goal, from: string, to: string): number {
  if (parseDay(to) < parseDay(from)) return 0
  if (goal.subtasks.length === 0) {
    return expectedOccurrences('daily', from, to)
  }
  let total = 0
  for (const st of goal.subtasks) total += expectedOccurrences(st.recurrence, from, to)
  return total
}

function doneIn(goal: Goal, completions: CompletionLog[], from: string, to: string): number {
  return completions.filter(
    (c) => c.goalId === goal.id && c.date >= from && c.date <= to,
  ).length
}

/**
 * Weekly completion rate (done ÷ expected) for the last `weeks` calendar weeks
 * (Mon-start). The current week only counts up to today so mid-week rates aren't
 * understated; weeks before the goal's start contribute 0 expected.
 */
export function weeklyConsistency(
  goal: Goal,
  completions: CompletionLog[],
  weeks = 12,
): WeekConsistency[] {
  const todayKey = today()
  const todayD = parseDay(todayKey)
  const startD = parseDay(goal.startDate)
  const thisWeekStart = startOfWeek(todayD, { weekStartsOn: 1 })

  const out: WeekConsistency[] = []
  for (let k = weeks - 1; k >= 0; k--) {
    const wStartD = addDays(thisWeekStart, -7 * k)
    const wEndFullD = addDays(wStartD, 6)
    const wEndD = wEndFullD > todayD ? todayD : wEndFullD
    const wStartKey = dayKey(wStartD)
    const wEndKey = dayKey(wEndD)

    const from = wStartD < startD ? goal.startDate : wStartKey
    const expected = parseDay(wEndKey) >= startD ? expectedFor(goal, from, wEndKey) : 0
    const done = doneIn(goal, completions, wStartKey, wEndKey)
    const rate = expected === 0 ? 0 : Math.min(100, Math.round((done / expected) * 100))

    out.push({ weekStart: wStartKey, label: prettyDateShort(wStartKey), rate, done, expected })
  }
  return out
}

/** Completion rate over the trailing `days` window (0..100). */
export function rollingRate(goal: Goal, completions: CompletionLog[], days = 7): number {
  const todayKey = today()
  const fromD = addDays(parseDay(todayKey), -(days - 1))
  const startD = parseDay(goal.startDate)
  const from = fromD < startD ? goal.startDate : dayKey(fromD)
  const expected = expectedFor(goal, from, todayKey)
  if (expected === 0) return 0
  const done = doneIn(goal, completions, from, todayKey)
  return Math.min(100, Math.round((done / expected) * 100))
}
