import { parseDay, dayKey } from './date'

/**
 * Compute current and longest streak (in days) from a set of completed day keys.
 * A "completed day" is any day with at least one completion for the goal.
 * The current streak counts back from today (or yesterday, to stay forgiving until
 * the day ends).
 */
export function computeStreaks(days: Set<string>): {
  current: number
  longest: number
} {
  if (days.size === 0) return { current: 0, longest: 0 }

  const sorted = [...days].map((d) => parseDay(d).getTime()).sort((a, b) => a - b)
  const DAY = 86_400_000

  // longest run of consecutive days
  let longest = 1
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] === DAY) {
      run += 1
      longest = Math.max(longest, run)
    } else if (sorted[i] !== sorted[i - 1]) {
      run = 1
    }
  }

  // current streak: walk back from today; allow today to be incomplete
  const todayT = parseDay(dayKey()).getTime()
  let current = 0
  let cursor = todayT
  if (!days.has(dayKey(new Date(cursor)))) {
    cursor -= DAY // grace: if today not done yet, start from yesterday
  }
  while (days.has(dayKey(new Date(cursor)))) {
    current += 1
    cursor -= DAY
  }

  return { current, longest }
}
