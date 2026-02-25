import type { AttendanceRecord, ScheduleSlot } from '../db/db'
import { getDateForDayOfWeek, isPastDate, isTodayDate } from './dates'
import { getISOWeek, getYear } from 'date-fns'

export interface CourseStats {
  courseId: number
  totalClasses: number
  attended: number        // past attended + past holiday + future pending
  absent: number          // past absent only
  worstCaseAttended: number  // only past attended + past holiday (no future)
  currentPercent: number     // optimistic (future = attended)
  worstCasePercent: number   // if all future classes are absent
  requiredPercent: number
  status: 'pass' | 'fail' | 'risk' | 'unknown'
  worstCaseStatus: 'pass' | 'fail' | 'risk' | 'unknown'
}

/**
 * Calculates attendance stats for a course.
 *
 * Rules:
 * - past attended   → counts as attended
 * - past absent     → counts as absent
 * - past holiday    → counts as attended (not subtracted from total)
 * - future/pending  → optimistically counts as attended
 */
export function calcCourseStats(
  courseId: number,
  requiredPercent: number,
  slots: ScheduleSlot[],
  records: AttendanceRecord[],
  semesterWeeks: { week: number; year: number }[]
): CourseStats {
  const courseSlots = slots.filter(s => s.courseId === courseId)
  const recordMap = new Map(records.map(r => [`${r.scheduleSlotId}-${r.date}`, r]))

  let totalClasses = 0
  let attended = 0
  let absent = 0
  let worstCaseAttended = 0

  for (const { week, year } of semesterWeeks) {
    for (const slot of courseSlots) {
      const date = getDateForDayOfWeek(week, year, slot.dayOfWeek)
      const key = `${slot.id}-${date}`
      const record = recordMap.get(key)
      const status = record?.status ?? 'pending'

      totalClasses++

      const isPast = isPastDate(date)
      const isToday = isTodayDate(date)
      const isFuture = !isPast && !isToday

      if (status === 'attended') {
        attended++
        worstCaseAttended++
      } else if (status === 'official_holiday') {
        // holiday counts as attended
        attended++
        worstCaseAttended++
      } else if (status === 'absent') {
        absent++
      } else {
        // pending
        if (isFuture || isToday) {
          // optimistic: count as attended
          attended++
          // worst case: count as absent
        } else {
          // past but not yet marked → treat as absent in calculations
          absent++
        }
      }
    }
  }

  const currentPercent = totalClasses > 0 ? Math.round((attended / totalClasses) * 100) : 100
  const worstCasePercent = totalClasses > 0 ? Math.round((worstCaseAttended / totalClasses) * 100) : 100

  return {
    courseId,
    totalClasses,
    attended,
    absent,
    worstCaseAttended,
    currentPercent,
    worstCasePercent,
    requiredPercent,
    status: getStatus(currentPercent, requiredPercent),
    worstCaseStatus: getStatus(worstCasePercent, requiredPercent),
  }
}

function getStatus(percent: number, required: number): 'pass' | 'fail' | 'risk' | 'unknown' {
  if (percent >= required) return 'pass'
  if (percent >= required - 5) return 'risk'
  return 'fail'
}

export function buildSemesterWeeks(
  startWeek: number,
  startYear: number,
  endWeek: number,
  endYear: number
): { week: number; year: number }[] {
  const weeks: { week: number; year: number }[] = []
  let w = startWeek
  let y = startYear
  while (y < endYear || (y === endYear && w <= endWeek)) {
    weeks.push({ week: w, year: y })
    w++
    // Simple overflow: most years have 52-53 weeks
    const maxWeeks = 52
    if (w > maxWeeks) {
      w = 1
      y++
    }
  }
  return weeks
}

export function getAllWeeksWithRecords(records: AttendanceRecord[]): { week: number; year: number }[] {
  const now = new Date()
  const currentWeek = getISOWeek(now)
  const currentYear = getYear(now)

  const weekSet = new Set<string>()
  weekSet.add(`${currentWeek}-${currentYear}`)
  for (const r of records) {
    weekSet.add(`${r.week}-${r.year}`)
  }

  return [...weekSet]
    .map(s => {
      const [w, y] = s.split('-').map(Number)
      return { week: w, year: y }
    })
    .sort((a, b) => a.year !== b.year ? a.year - b.year : a.week - b.week)
}
