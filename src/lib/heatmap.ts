import type { CompletionLog } from '../types'
import { dayKey, parseDay } from './date'
import { subDays, startOfWeek, addDays } from 'date-fns'

export interface HeatCell {
  date: string
  count: number
  /** intensity bucket 0..4 */
  level: number
  /** false for padding cells before the range starts */
  inRange: boolean
}

export interface HeatmapData {
  weeks: HeatCell[][] // columns of 7 days (Sun..Sat)
  monthLabels: { index: number; label: string }[]
  total: number
  maxCount: number
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/**
 * Build a GitHub-style grid for the trailing `days` window (default ~year).
 * `counts` maps day key -> number of completions that day.
 */
export function buildHeatmap(counts: Map<string, number>, days = 364): HeatmapData {
  const end = new Date()
  const start = startOfWeek(subDays(end, days), { weekStartsOn: 0 })

  const weeks: HeatCell[][] = []
  const monthLabels: { index: number; label: string }[] = []
  let maxCount = 0
  let total = 0

  // first pass to find max for bucketing
  for (const v of counts.values()) maxCount = Math.max(maxCount, v)

  let cursor = start
  let weekIndex = 0
  let lastMonth = -1

  while (cursor <= end) {
    const week: HeatCell[] = []
    for (let d = 0; d < 7; d++) {
      const day = addDays(cursor, d)
      const key = dayKey(day)
      const inRange = day >= subDays(end, days) && day <= end
      const count = inRange ? counts.get(key) ?? 0 : 0
      if (inRange) total += count
      week.push({
        date: key,
        count,
        level: bucket(count, maxCount),
        inRange,
      })
    }
    // month label when the first in-range day of a week starts a new month
    const firstDay = cursor
    if (firstDay.getMonth() !== lastMonth) {
      monthLabels.push({ index: weekIndex, label: MONTHS[firstDay.getMonth()] })
      lastMonth = firstDay.getMonth()
    }
    weeks.push(week)
    cursor = addDays(cursor, 7)
    weekIndex++
  }

  return { weeks, monthLabels, total, maxCount }
}

function bucket(count: number, max: number): number {
  if (count <= 0) return 0
  if (max <= 1) return count > 0 ? 4 : 0
  const r = count / max
  if (r > 0.75) return 4
  if (r > 0.5) return 3
  if (r > 0.25) return 2
  return 1
}

/** Convenience: aggregate completions into a day-key count map. */
export function countsByDay(completions: CompletionLog[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const c of completions) {
    map.set(c.date, (map.get(c.date) ?? 0) + 1)
  }
  return map
}

export { parseDay }
