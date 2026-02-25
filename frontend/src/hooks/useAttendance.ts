import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import { queryClient } from '../lib/queryClient'
import type { AttendanceRecord, AttendanceStatus } from '../db/db'

export function useAttendanceForWeek(week: number, year: number): AttendanceRecord[] {
  const { data } = useQuery({
    queryKey: ['attendance', week, year],
    queryFn: () => apiFetch<AttendanceRecord[]>(`/attendance?week=${week}&year=${year}`),
  })
  return data ?? []
}

export function useAllAttendanceRecords(): AttendanceRecord[] {
  const { data } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => apiFetch<AttendanceRecord[]>('/attendance'),
  })
  return data ?? []
}

export async function setAttendance(
  scheduleSlotId: number,
  courseId: number,
  date: string,
  week: number,
  year: number,
  status: AttendanceStatus
) {
  await apiFetch('/attendance', {
    method: 'PUT',
    body: JSON.stringify({ scheduleSlotId, courseId, date, week, year, status }),
  })
  await queryClient.invalidateQueries({ queryKey: ['attendance', week, year] })
  await queryClient.invalidateQueries({ queryKey: ['attendance'] })
}
