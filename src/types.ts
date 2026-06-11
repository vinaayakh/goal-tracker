export type GoalType = 'habit' | 'metric'
export type Recurrence = 'daily' | 'weekly' | 'once'
export type MetricDirection = 'decrease' | 'increase'

/** Accent theme keys — map to gradient stops in lib/theme.ts */
export type AccentKey =
  | 'violet'
  | 'indigo'
  | 'cyan'
  | 'emerald'
  | 'amber'
  | 'rose'

export interface Subtask {
  id: string
  title: string
  recurrence: Recurrence
  createdAt: string
}

export interface MetricConfig {
  unit: string
  startValue: number
  targetValue: number
  direction: MetricDirection
}

export interface Goal {
  id: string
  title: string
  description?: string
  type: GoalType
  accent: AccentKey
  icon: string // emoji
  startDate: string // YYYY-MM-DD
  endDate?: string // optional target date, YYYY-MM-DD
  subtasks: Subtask[] // empty => simple "Done today" habit
  metric?: MetricConfig // present only for type === 'metric'
  createdAt: string
  archived?: boolean
}

/** A completion of a subtask (or the goal itself, when subtaskId is undefined) on a given day */
export interface CompletionLog {
  id: string
  goalId: string
  subtaskId?: string
  date: string // YYYY-MM-DD
}

/** A logged numeric value for a metric goal on a given day */
export interface MetricLog {
  id: string
  goalId: string
  date: string // YYYY-MM-DD
  value: number
}

export interface AppData {
  goals: Goal[]
  completions: CompletionLog[]
  metricLogs: MetricLog[]
}
