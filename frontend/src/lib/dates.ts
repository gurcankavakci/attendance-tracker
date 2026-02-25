import { getISOWeek, getYear, startOfISOWeek, addWeeks, format, parseISO, isBefore, isToday } from 'date-fns'
import { tr } from 'date-fns/locale'

export const DAY_NAMES = ['', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']
export const DAY_NAMES_SHORT = ['', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

export function getCurrentWeek() {
  const now = new Date()
  return { week: getISOWeek(now), year: getYear(now) }
}

export function getWeekDates(week: number, year: number): Date[] {
  // Get the Monday of the given ISO week
  const jan4 = new Date(year, 0, 4) // Jan 4 is always in week 1
  const startOfWeek1 = startOfISOWeek(jan4)
  const targetMonday = addWeeks(startOfWeek1, week - 1)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(targetMonday)
    d.setDate(d.getDate() + i)
    return d
  })
}

export function getDateForDayOfWeek(week: number, year: number, dayOfWeek: number): string {
  const dates = getWeekDates(week, year)
  return format(dates[dayOfWeek - 1], 'yyyy-MM-dd')
}

export function isPastDate(dateStr: string): boolean {
  const date = parseISO(dateStr)
  return isBefore(date, new Date()) && !isToday(date)
}

export function isTodayDate(dateStr: string): boolean {
  return isToday(parseISO(dateStr))
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMMM yyyy', { locale: tr })
}

export function formatWeekRange(week: number, year: number): string {
  const dates = getWeekDates(week, year)
  const start = format(dates[0], 'd MMM', { locale: tr })
  const end = format(dates[6], 'd MMM yyyy', { locale: tr })
  return `${start} – ${end}`
}

export function navigateWeek(week: number, year: number, delta: number): { week: number; year: number } {
  const dates = getWeekDates(week, year)
  const monday = dates[0]
  monday.setDate(monday.getDate() + delta * 7)
  return { week: getISOWeek(monday), year: getYear(monday) }
}
