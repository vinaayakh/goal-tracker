import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval'
import type {
  Goal,
  CompletionLog,
  MetricLog,
  Subtask,
} from '../types'
import { uid } from '../lib/id'
import { today } from '../lib/date'
import { seedGoals } from '../lib/seed'

const idbStorage: StateStorage = {
  getItem: async (name) => (await idbGet(name)) ?? null,
  setItem: async (name, value) => {
    await idbSet(name, value)
  },
  removeItem: async (name) => {
    await idbDel(name)
  },
}

export interface NewGoalInput {
  title: string
  description?: string
  type: Goal['type']
  accent: Goal['accent']
  icon: string
  startDate: string
  endDate?: string
  subtasks: Array<Pick<Subtask, 'title' | 'recurrence'>>
  metric?: Goal['metric']
}

export interface StoreState {
  goals: Goal[]
  completions: CompletionLog[]
  metricLogs: MetricLog[]
  hydrated: boolean

  addGoal: (input: NewGoalInput) => string
  updateGoal: (id: string, patch: Partial<NewGoalInput>) => void
  archiveGoal: (id: string) => void
  deleteGoal: (id: string) => void

  /** Toggle a completion for a goal (or a subtask within it) on a date. Returns true if now completed. */
  toggleCompletion: (goalId: string, subtaskId: string | undefined, date?: string) => boolean
  logMetric: (goalId: string, value: number, date?: string) => void
}

function buildGoal(input: NewGoalInput): Goal {
  return {
    id: uid('g_'),
    title: input.title,
    description: input.description,
    type: input.type,
    accent: input.accent,
    icon: input.icon,
    startDate: input.startDate,
    endDate: input.endDate,
    metric: input.type === 'metric' ? input.metric : undefined,
    // Subtasks are allowed on any goal — e.g. a "lose 5kg" metric goal can still
    // have a daily "do 20 pushups" action that feeds the streak & heatmap.
    subtasks: input.subtasks.map((s) => ({
      id: uid('s_'),
      title: s.title,
      recurrence: s.recurrence,
      createdAt: new Date().toISOString(),
    })),
    createdAt: new Date().toISOString(),
    archived: false,
  }
}

export const useStore = create<StoreState>()(
  persist(
    (set, getState) => ({
      goals: [],
      completions: [],
      metricLogs: [],
      hydrated: false,

      addGoal: (input) => {
        const goal = buildGoal(input)
        set((s) => ({ goals: [goal, ...s.goals] }))
        return goal.id
      },

      updateGoal: (id, patch) => {
        set((s) => ({
          goals: s.goals.map((g) => {
            if (g.id !== id) return g
            const next: Goal = { ...g }
            if (patch.title !== undefined) next.title = patch.title
            if (patch.description !== undefined) next.description = patch.description
            if (patch.accent !== undefined) next.accent = patch.accent
            if (patch.icon !== undefined) next.icon = patch.icon
            if (patch.startDate !== undefined) next.startDate = patch.startDate
            if ('endDate' in patch) next.endDate = patch.endDate
            if (patch.metric !== undefined) next.metric = patch.metric
            if (patch.subtasks !== undefined) {
              // preserve ids of unchanged subtasks by title match where possible
              next.subtasks = patch.subtasks.map((s) => {
                const existing = g.subtasks.find((e) => e.title === s.title)
                return (
                  existing ?? {
                    id: uid('s_'),
                    title: s.title,
                    recurrence: s.recurrence,
                    createdAt: new Date().toISOString(),
                  }
                )
              })
            }
            return next
          }),
        }))
      },

      archiveGoal: (id) => {
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, archived: !g.archived } : g)),
        }))
      },

      deleteGoal: (id) => {
        set((s) => ({
          goals: s.goals.filter((g) => g.id !== id),
          completions: s.completions.filter((c) => c.goalId !== id),
          metricLogs: s.metricLogs.filter((m) => m.goalId !== id),
        }))
      },

      toggleCompletion: (goalId, subtaskId, date = today()) => {
        const existing = getState().completions.find(
          (c) => c.goalId === goalId && c.subtaskId === subtaskId && c.date === date,
        )
        if (existing) {
          set((s) => ({
            completions: s.completions.filter((c) => c.id !== existing.id),
          }))
          return false
        }
        const log: CompletionLog = { id: uid('c_'), goalId, subtaskId, date }
        set((s) => ({ completions: [...s.completions, log] }))
        return true
      },

      logMetric: (goalId, value, date = today()) => {
        set((s) => {
          const others = s.metricLogs.filter(
            (m) => !(m.goalId === goalId && m.date === date),
          )
          return {
            metricLogs: [...others, { id: uid('m_'), goalId, date, value }],
          }
        })
      },
    }),
    {
      name: 'goaltracker-v1',
      storage: createJSONStorage(() => idbStorage),
      // Schema version — increment this when the persisted shape changes and add a
      // migration step below. Zustand will run migrate() automatically on load when
      // the stored version is older than this number.
      version: 1,
      migrate: (stored, fromVersion) => {
        // v0 → v1 (initial baseline, no structural change needed)
        void fromVersion
        return stored
      },
      partialize: (s) => ({
        goals: s.goals,
        completions: s.completions,
        metricLogs: s.metricLogs,
      }),
    },
  ),
)

/**
 * Finalize hydration. We must use setState (not mutate the rehydrated object)
 * so React subscribers re-render out of the loading state. On first run
 * (empty store) we seed demo data in dev only — production builds start clean.
 */
function finishHydration() {
  const s = useStore.getState()
  if (s.hydrated) return
  if (import.meta.env.DEV && s.goals.length === 0) {
    useStore.setState({ ...seedGoals(), hydrated: true })
  } else {
    useStore.setState({ hydrated: true })
  }
}

// Fires once async IndexedDB rehydration completes…
useStore.persist.onFinishHydration(finishHydration)
// …or immediately if hydration was already synchronous/complete.
if (useStore.persist.hasHydrated()) finishHydration()
// Safety net: never leave the app stuck on the loading spinner.
setTimeout(finishHydration, 2000)
