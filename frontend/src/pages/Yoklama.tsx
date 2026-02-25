import { useState } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Palmtree, Clock4, Calendar } from 'lucide-react'
import { useCourses } from '../hooks/useCourses'
import { useScheduleSlots } from '../hooks/useSchedule'
import { useAttendanceForWeek, setAttendance } from '../hooks/useAttendance'
import { getCurrentWeek, navigateWeek, formatWeekRange, getDateForDayOfWeek, DAY_NAMES, formatDate, isPastDate, isTodayDate } from '../lib/dates'
import Badge from '../components/ui/Badge'
import type { AttendanceStatus } from '../db/db'

interface StatusButtonProps {
  current: AttendanceStatus
  value: AttendanceStatus
  label: string
  icon: React.ReactNode
  color: string
  onClick: () => void
}

function StatusButton({ current, value, label, icon, color, onClick }: StatusButtonProps) {
  const active = current === value
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 px-2 rounded-lg text-xs font-medium transition-all border-2 ${
        active
          ? `${color} border-current`
          : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden text-[10px]">{label.split(' ')[0]}</span>
    </button>
  )
}

export default function Yoklama() {
  const [{ week, year }, setWeek] = useState(getCurrentWeek())
  const courses = useCourses()
  const slots = useScheduleSlots()
  const records = useAttendanceForWeek(week, year)

  const courseMap = new Map(courses.map(c => [c.id!, c]))
  const recordMap = new Map(records.map(r => [`${r.scheduleSlotId}-${r.date}`, r]))

  const slotsByDay = [1, 2, 3, 4, 5, 6, 7].flatMap(day => {
    const daySlots = slots
      .filter(s => s.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
    if (daySlots.length === 0) return []
    const date = getDateForDayOfWeek(week, year, day)
    return [{ day, date, slots: daySlots }]
  })

  async function handleStatus(slotId: number, courseId: number, date: string, status: AttendanceStatus) {
    await setAttendance(slotId, courseId, date, week, year, status)
  }

  function getStatus(slotId: number, date: string): AttendanceStatus {
    return recordMap.get(`${slotId}-${date}`)?.status ?? 'pending'
  }

  function getDayLabel(date: string, dayName: string): string {
    if (isTodayDate(date)) return `${dayName} (Bugün)`
    return dayName
  }

  if (slots.length === 0) {
    return (
      <div className="p-4 lg:p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Yoklama</h1>
        <div className="card p-12 flex flex-col items-center text-center text-gray-400">
          <Calendar size={40} className="mb-3 opacity-30" />
          <p className="font-medium">Önce haftalık programı oluşturun</p>
          <p className="text-sm mt-1">Program sayfasından derslerinizi ekleyin</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Yoklama</h1>
        <p className="text-sm text-gray-500 mt-0.5">Her ders için devam durumunu işaretle</p>
      </div>

      {/* Week navigator */}
      <div className="card px-4 py-3 flex items-center justify-between mb-5">
        <button
          onClick={() => setWeek(navigateWeek(week, year, -1))}
          className="btn-ghost p-2"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-900">{formatWeekRange(week, year)}</div>
          <div className="text-xs text-gray-400">{year} – {week}. Hafta</div>
        </div>
        <button
          onClick={() => setWeek(navigateWeek(week, year, 1))}
          className="btn-ghost p-2"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Slots by day */}
      <div className="space-y-4">
        {slotsByDay.map(({ day, date, slots: daySlots }) => {
          const isPast = isPastDate(date)
          const isToday = isTodayDate(date)
          return (
            <div key={day} className="card overflow-hidden">
              <div className={`px-4 py-2.5 border-b border-gray-100 flex items-center justify-between ${
                isToday ? 'bg-blue-50' : isPast ? 'bg-gray-50' : 'bg-white'
              }`}>
                <span className={`font-semibold text-sm ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                  {getDayLabel(date, DAY_NAMES[day])}
                </span>
                <span className="text-xs text-gray-400">{formatDate(date)}</span>
              </div>
              <div className="divide-y divide-gray-100">
                {daySlots.map(slot => {
                  const course = courseMap.get(slot.courseId)
                  if (!course) return null
                  const status = getStatus(slot.id!, date)
                  return (
                    <div key={slot.id} className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: course.color }}
                        >
                          {course.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm truncate">{course.name}</div>
                          <div className="text-xs text-gray-400">{slot.startTime} – {slot.endTime}{slot.location ? ` · ${slot.location}` : ''}</div>
                        </div>
                        <StatusBadge status={status} />
                      </div>
                      {/* Status buttons */}
                      <div className="flex gap-2">
                        <StatusButton
                          current={status}
                          value="attended"
                          label="Katıldım"
                          icon={<CheckCircle2 size={15} />}
                          color="text-green-600 bg-green-50 border-green-400"
                          onClick={() => handleStatus(slot.id!, course.id!, date, 'attended')}
                        />
                        <StatusButton
                          current={status}
                          value="absent"
                          label="Katılmadım"
                          icon={<XCircle size={15} />}
                          color="text-red-600 bg-red-50 border-red-400"
                          onClick={() => handleStatus(slot.id!, course.id!, date, 'absent')}
                        />
                        <StatusButton
                          current={status}
                          value="official_holiday"
                          label="Resmi Tatil"
                          icon={<Palmtree size={15} />}
                          color="text-blue-600 bg-blue-50 border-blue-400"
                          onClick={() => handleStatus(slot.id!, course.id!, date, 'official_holiday')}
                        />
                        <StatusButton
                          current={status}
                          value="pending"
                          label="Belirsiz"
                          icon={<Clock4 size={15} />}
                          color="text-gray-500 bg-gray-50 border-gray-400"
                          onClick={() => handleStatus(slot.id!, course.id!, date, 'pending')}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: AttendanceStatus }) {
  const configs: Record<AttendanceStatus, { variant: 'attended' | 'absent' | 'holiday' | 'pending'; label: string }> = {
    attended: { variant: 'attended', label: 'Katıldı' },
    absent: { variant: 'absent', label: 'Katılmadı' },
    official_holiday: { variant: 'holiday', label: 'Tatil' },
    pending: { variant: 'pending', label: 'Belirsiz' },
  }
  const config = configs[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
