import type { AppData, Goal, CompletionLog, MetricLog, Subtask } from '../types'
import { uid } from './id'
import { dayKey } from './date'
import { subDays, addDays } from 'date-fns'

function sub(title: string, recurrence: Subtask['recurrence'] = 'daily'): Subtask {
  return { id: uid('s_'), title, recurrence, createdAt: new Date().toISOString() }
}

/** deterministic-ish pseudo random in [0,1) from an integer seed */
function rnd(seed: number): number {
  const x = Math.sin(seed * 999.71) * 10000
  return x - Math.floor(x)
}

export function seedGoals(): AppData {
  const now = new Date()
  const goals: Goal[] = []
  const completions: CompletionLog[] = []
  const metricLogs: MetricLog[] = []

  // ---- Goal 1: Commit Daily to GitHub (simple habit, no subtasks) ----
  const g1Start = dayKey(subDays(now, 110))
  const g1: Goal = {
    id: uid('g_'),
    title: 'Commit Daily to GitHub',
    description: 'Keep the streak alive — at least one meaningful commit every day.',
    type: 'habit',
    accent: 'indigo',
    icon: '💻',
    startDate: g1Start,
    subtasks: [],
    createdAt: new Date().toISOString(),
  }
  goals.push(g1)
  for (let i = 110; i >= 0; i--) {
    // ~85% completion, denser recently
    const p = i < 30 ? 0.92 : 0.8
    if (rnd(i + 1) < p) {
      completions.push({ id: uid('c_'), goalId: g1.id, date: dayKey(subDays(now, i)) })
    }
  }

  // ---- Goal 2: Lose 5 kilograms (metric + supporting pushups subtask) ----
  const g2Start = dayKey(subDays(now, 60))
  const pushups = sub('Do 20 pushups')
  const g2: Goal = {
    id: uid('g_'),
    title: 'Lose 5 kilograms',
    description: 'Drop from 80kg to 75kg through daily movement and clean eating.',
    type: 'metric',
    accent: 'emerald',
    icon: '🏃',
    startDate: g2Start,
    endDate: '2026-08-05',
    subtasks: [pushups],
    metric: { unit: 'kg', startValue: 80, targetValue: 75, direction: 'decrease' },
    createdAt: new Date().toISOString(),
  }
  goals.push(g2)
  // weekly-ish weigh-ins trending down with noise: 80 -> ~78 over 60 days
  for (let i = 60; i >= 0; i -= 4) {
    const t = (60 - i) / 60
    const value = 80 - t * 2.2 + (rnd(i + 7) - 0.5) * 0.6
    metricLogs.push({
      id: uid('m_'),
      goalId: g2.id,
      date: dayKey(subDays(now, i)),
      value: Math.round(value * 10) / 10,
    })
  }
  // pushups done most days
  for (let i = 60; i >= 0; i--) {
    if (rnd(i + 100) < 0.78) {
      completions.push({
        id: uid('c_'),
        goalId: g2.id,
        subtaskId: pushups.id,
        date: dayKey(subDays(now, i)),
      })
    }
  }

  // ---- Goal 3: Prepare for exams before August 5 (habit w/ subtasks) ----
  const g3Start = dayKey(subDays(now, 24))
  const s1 = sub('Study 1 hour')
  const s2 = sub('Revise notes')
  const s3 = sub('Practice problems')
  const g3: Goal = {
    id: uid('g_'),
    title: 'Prepare for exams before August 5',
    description: 'Consistent daily prep across reading, revision and practice.',
    type: 'habit',
    accent: 'amber',
    icon: '📚',
    startDate: g3Start,
    endDate: '2026-08-05',
    subtasks: [s1, s2, s3],
    createdAt: new Date().toISOString(),
  }
  goals.push(g3)
  const subs = [s1, s2, s3]
  for (let i = 24; i >= 0; i--) {
    subs.forEach((st, j) => {
      if (rnd(i * 3 + j + 200) < 0.7) {
        completions.push({
          id: uid('c_'),
          goalId: g3.id,
          subtaskId: st.id,
          date: dayKey(subDays(now, i)),
        })
      }
    })
  }

  return { goals, completions, metricLogs }
}

export { addDays }
