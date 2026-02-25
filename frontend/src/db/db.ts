export interface Course {
  id?: number
  name: string
  code: string
  requiredPercent: number
  color: string
  createdAt: string
}

export interface ScheduleSlot {
  id?: number
  courseId: number
  dayOfWeek: number   // 1=Pazartesi ... 7=Pazar
  startTime: string   // "09:00"
  endTime: string     // "10:50"
  location: string
}

export type AttendanceStatus = 'attended' | 'absent' | 'official_holiday' | 'pending'

export interface AttendanceRecord {
  id?: number
  scheduleSlotId: number
  courseId: number
  date: string        // "2025-03-10"
  status: AttendanceStatus
  week: number
  year: number
}

