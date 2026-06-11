import { useMemo } from 'react'
import { useStore } from './useStore'
import { deriveGoal, dashboardStats, aggregateActivity, activityFeed } from './selectors'

/** All active (non-archived) goals. */
export function useActiveGoals() {
  // Select the stable array, then derive — returning a fresh `.filter()` array
  // directly from the selector breaks useSyncExternalStore (infinite re-render).
  const goals = useStore((s) => s.goals)
  return useMemo(() => goals.filter((g) => !g.archived), [goals])
}

export function useGoal(id: string | undefined) {
  return useStore((s) => s.goals.find((g) => g.id === id))
}

/** Derived data for a single goal, memoized on the relevant slices. */
export function useGoalDerived(id: string | undefined) {
  const goal = useGoal(id)
  const completions = useStore((s) => s.completions)
  const metricLogs = useStore((s) => s.metricLogs)
  return useMemo(
    () => (goal ? deriveGoal(goal, completions, metricLogs) : undefined),
    [goal, completions, metricLogs],
  )
}

/** Reverse-chronological feed of every completion + metric log across all goals. */
export function useActivityFeed() {
  const goals = useStore((s) => s.goals)
  const completions = useStore((s) => s.completions)
  const metricLogs = useStore((s) => s.metricLogs)
  return useMemo(
    () => activityFeed(goals, completions, metricLogs),
    [goals, completions, metricLogs],
  )
}

export function useDashboard() {
  const goals = useStore((s) => s.goals)
  const completions = useStore((s) => s.completions)
  const metricLogs = useStore((s) => s.metricLogs)
  return useMemo(
    () => ({
      stats: dashboardStats(goals, completions, metricLogs),
      activity: aggregateActivity(completions, 30),
    }),
    [goals, completions, metricLogs],
  )
}
