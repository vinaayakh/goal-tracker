import {
  format,
  parseISO,
  differenceInCalendarDays,
  eachDayOfInterval,
  startOfDay,
  isWeekend,
} from 'date-fns'
import type { Recurrence } from '../types'

/** Canonical day key, YYYY-MM-DD, in local time. */
export function dayKey(d: Date = new Date()): string {
  return format(d, 'yyyy-MM-dd')
}

export const today = (): string => dayKey()

export function parseDay(key: string): Date {
  return startOfDay(parseISO(key))
}

export function fromNowDays(key: string): number {
  return differenceInCalendarDays(parseDay(key), startOfDay(new Date()))
}

export function daysBetween(a: string, b: string): number {
  return differenceInCalendarDays(parseDay(b), parseDay(a))
}

/** Inclusive list of day keys between two dates. */
export function dayRange(start: string, end: string): string[] {
  const s = parseDay(start)
  const e = parseDay(end)
  if (e < s) return []
  return eachDayOfInterval({ start: s, end: e }).map((d) => dayKey(d))
}

/** Does a recurrence "occur" on the given day? (used to count expected occurrences) */
export function occursOn(recurrence: Recurrence, day: string, start: string): boolean {
  if (parseDay(day) < parseDay(start)) return false
  switch (recurrence) {
    case 'daily':
      return true
    case 'weekly':
      // occurs on the same weekday as the start date
      return parseDay(day).getDay() === parseDay(start).getDay()
    case 'once':
      return day === start
  }
}

/** Count expected occurrences of a recurrence between start and end (inclusive). */
export function expectedOccurrences(
  recurrence: Recurrence,
  start: string,
  end: string,
): number {
  if (parseDay(end) < parseDay(start)) return 0
  switch (recurrence) {
    case 'daily':
      return daysBetween(start, end) + 1
    case 'weekly':
      return Math.floor(daysBetween(start, end) / 7) + 1
    case 'once':
      return 1
  }
}

export function prettyDate(key: string): string {
  return format(parseDay(key), 'MMM d, yyyy')
}

export function prettyDateShort(key: string): string {
  return format(parseDay(key), 'MMM d')
}

export { isWeekend, format }
