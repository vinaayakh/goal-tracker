import type { Goal, CompletionLog, MetricLog } from '../types'
import {
  today,
  daysBetween,
  dayKey,
  parseDay,
  expectedOccurrences,
} from './date'
import { habitProgress } from './progress'
import { addDays } from 'date-fns'

export type Verdict = 'ahead' | 'on-track' | 'behind' | 'no-data'

export interface ProjPoint {
  dayIndex: number
  date: string
  actual?: number
  projected?: number
  required?: number
}

export interface Projection {
  type: 'metric' | 'habit'
  points: ProjPoint[]
  hasData: boolean
  verdict: Verdict
  unit: string
  /** target value of the y-axis goal line, if any */
  targetValue?: number
  targetDate?: string
  /** projected value at the target date (if an end date exists) */
  projectedValue?: number
  /** date the target is projected to be reached if the trend continues */
  projectedDate?: string
  startDayIndex: number
  endDayIndex: number
}

interface LinReg {
  slope: number
  intercept: number
}

function linreg(pts: Array<{ x: number; y: number }>): LinReg {
  const n = pts.length
  if (n < 2) {
    return { slope: 0, intercept: n === 1 ? pts[0].y : 0 }
  }
  let sx = 0,
    sy = 0,
    sxy = 0,
    sxx = 0
  for (const p of pts) {
    sx += p.x
    sy += p.y
    sxy += p.x * p.y
    sxx += p.x * p.x
  }
  const denom = n * sxx - sx * sx
  if (denom === 0) return { slope: 0, intercept: sy / n }
  const slope = (n * sxy - sx * sy) / denom
  const intercept = (sy - slope * sx) / denom === 0 ? sy / n : (sy - slope * sx) / n
  return { slope, intercept }
}

const EPS = 1e-6

function dateFromIndex(start: string, index: number): string {
  return dayKey(addDays(parseDay(start), Math.round(index)))
}

export function metricProjection(goal: Goal, logs: MetricLog[]): Projection {
  const m = goal.metric!
  const start = goal.startDate
  const sorted = logs
    .filter((l) => l.goalId === goal.id)
    .sort((a, b) => parseDay(a.date).getTime() - parseDay(b.date).getTime())

  const actualPts = sorted.map((l) => ({
    x: daysBetween(start, l.date),
    y: l.value,
  }))

  const todayIdx = Math.max(0, daysBetween(start, today()))
  const endIdx = goal.endDate ? daysBetween(start, goal.endDate) : undefined

  const base: Projection = {
    type: 'metric',
    points: [],
    hasData: actualPts.length >= 1,
    verdict: 'no-data',
    unit: m.unit,
    targetValue: m.targetValue,
    targetDate: goal.endDate,
    startDayIndex: 0,
    endDayIndex: endIdx ?? todayIdx,
  }

  if (actualPts.length === 0) return base

  const { slope, intercept } = linreg(actualPts)
  const lastActual = actualPts[actualPts.length - 1]
  const firstActual = actualPts[0]

  // crossing of target if trend continues
  let projectedDate: string | undefined
  if (Math.abs(slope) > EPS) {
    const crossX = (m.targetValue - intercept) / slope
    if (crossX >= lastActual.x) projectedDate = dateFromIndex(start, crossX)
  }

  // horizon for drawing projected/required lines
  const horizonCandidates = [lastActual.x, todayIdx]
  if (endIdx !== undefined) horizonCandidates.push(endIdx)
  if (projectedDate) horizonCandidates.push(daysBetween(start, projectedDate))
  const horizon = Math.max(...horizonCandidates)

  const projectedValue =
    endIdx !== undefined ? intercept + slope * endIdx : undefined

  // required pace from last actual to (endDate, target)
  let requiredSlope: number | undefined
  if (endIdx !== undefined && endIdx > lastActual.x) {
    requiredSlope = (m.targetValue - lastActual.y) / (endIdx - lastActual.x)
  }

  // assemble combined point set
  const xs = new Set<number>()
  for (const p of actualPts) xs.add(p.x)
  xs.add(firstActual.x)
  xs.add(horizon)
  if (endIdx !== undefined) xs.add(endIdx)
  const ordered = [...xs].sort((a, b) => a - b)

  const points: ProjPoint[] = ordered.map((x) => {
    const pt: ProjPoint = { dayIndex: x, date: dateFromIndex(start, x) }
    const a = actualPts.find((p) => p.x === x)
    if (a) pt.actual = round1(a.y)
    if (x >= firstActual.x && x <= horizon) pt.projected = round1(intercept + slope * x)
    if (requiredSlope !== undefined && x >= lastActual.x && x <= endIdx!) {
      pt.required = round1(lastActual.y + requiredSlope * (x - lastActual.x))
    }
    return pt
  })

  base.points = points
  base.projectedValue = projectedValue !== undefined ? round1(projectedValue) : undefined
  base.projectedDate = projectedDate
  base.endDayIndex = horizon
  base.verdict = metricVerdict(m.direction, projectedValue, m.targetValue, slope, projectedDate, goal.endDate)
  return base
}

function metricVerdict(
  direction: 'decrease' | 'increase',
  projectedValue: number | undefined,
  target: number,
  slope: number,
  projectedDate: string | undefined,
  endDate: string | undefined,
): Verdict {
  const movingToward = direction === 'decrease' ? slope < -EPS : slope > EPS
  if (endDate && projectedValue !== undefined) {
    const margin = Math.abs(target) * 0.02 + 0.1
    const meets =
      direction === 'decrease'
        ? projectedValue <= target + margin
        : projectedValue >= target - margin
    const beats =
      direction === 'decrease'
        ? projectedValue < target - margin
        : projectedValue > target + margin
    if (beats) return 'ahead'
    if (meets) return 'on-track'
    return 'behind'
  }
  // no end date: judged on whether we reach the target eventually
  if (!movingToward) return 'behind'
  return projectedDate ? 'on-track' : 'behind'
}

export function habitProjection(goal: Goal, completions: CompletionLog[]): Projection {
  const start = goal.startDate
  const todayIdx = Math.max(0, daysBetween(start, today()))
  const endIdx = goal.endDate ? daysBetween(start, goal.endDate) : undefined

  // expected total occurrences across full plan (the "target")
  let targetCount = 0
  if (goal.endDate) {
    if (goal.subtasks.length === 0) {
      targetCount = expectedOccurrences('daily', start, goal.endDate)
    } else {
      for (const st of goal.subtasks) {
        targetCount += expectedOccurrences(st.recurrence, start, goal.endDate)
      }
    }
  }

  // cumulative actual completions per day
  const byDay = new Map<number, number>()
  for (const c of completions.filter((c) => c.goalId === goal.id)) {
    const x = daysBetween(start, c.date)
    if (x < 0) continue
    byDay.set(x, (byDay.get(x) ?? 0) + 1)
  }
  const sortedDays = [...byDay.keys()].sort((a, b) => a - b)

  const base: Projection = {
    type: 'habit',
    points: [],
    hasData: sortedDays.length >= 1,
    verdict: 'no-data',
    unit: '',
    targetValue: goal.endDate ? targetCount : undefined,
    targetDate: goal.endDate,
    startDayIndex: 0,
    endDayIndex: endIdx ?? todayIdx,
  }

  if (sortedDays.length === 0) return base

  // build cumulative actual points
  let cum = 0
  const actualPts: Array<{ x: number; y: number }> = []
  for (const x of sortedDays) {
    cum += byDay.get(x)!
    actualPts.push({ x, y: cum })
  }
  // anchor at start
  if (actualPts[0].x !== 0) actualPts.unshift({ x: 0, y: 0 })

  const { slope, intercept } = linreg(actualPts)
  const lastActual = actualPts[actualPts.length - 1]

  const horizon = Math.max(lastActual.x, todayIdx, endIdx ?? 0)

  // projected total at end
  const projectedValue =
    endIdx !== undefined ? Math.max(0, intercept + slope * endIdx) : undefined

  // required pace from latest to (endDate, targetCount)
  let requiredSlope: number | undefined
  if (endIdx !== undefined && endIdx > lastActual.x) {
    requiredSlope = (targetCount - lastActual.y) / (endIdx - lastActual.x)
  }

  const xs = new Set<number>(actualPts.map((p) => p.x))
  xs.add(horizon)
  if (endIdx !== undefined) xs.add(endIdx)
  const ordered = [...xs].sort((a, b) => a - b)

  const points: ProjPoint[] = ordered.map((x) => {
    const pt: ProjPoint = { dayIndex: x, date: dateFromIndex(start, x) }
    const a = actualPts.find((p) => p.x === x)
    if (a) pt.actual = a.y
    if (x >= 0 && x <= horizon) pt.projected = round1(Math.max(0, intercept + slope * x))
    if (requiredSlope !== undefined && x >= lastActual.x && x <= endIdx!) {
      pt.required = round1(lastActual.y + requiredSlope * (x - lastActual.x))
    }
    return pt
  })

  base.points = points
  base.projectedValue = projectedValue !== undefined ? Math.round(projectedValue) : undefined
  base.endDayIndex = horizon

  // Verdict for habits reflects completion *consistency* (rate vs. expected-to-date),
  // not whether you've hit a theoretical perfect-attendance count.
  const rate = habitProgress(goal, completions).percent
  if (rate >= 90) base.verdict = 'ahead'
  else if (rate >= 65) base.verdict = 'on-track'
  else base.verdict = 'behind'
  return base
}

export function buildProjection(
  goal: Goal,
  completions: CompletionLog[],
  metricLogs: MetricLog[],
): Projection {
  return goal.type === 'metric'
    ? metricProjection(goal, metricLogs)
    : habitProjection(goal, completions)
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

export const VERDICT_META: Record<
  Verdict,
  { label: string; accent: string; tone: string }
> = {
  ahead: { label: 'Ahead of pace', accent: '#34d399', tone: 'emerald' },
  'on-track': { label: 'On track', accent: '#22d3ee', tone: 'cyan' },
  behind: { label: 'Behind pace', accent: '#fb7185', tone: 'rose' },
  'no-data': { label: 'Need more data', accent: '#6b7088', tone: 'slate' },
}
