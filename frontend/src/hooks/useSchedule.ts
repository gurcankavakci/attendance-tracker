import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import { queryClient } from '../lib/queryClient'
import type { ScheduleSlot } from '../db/db'

export function useScheduleSlots(): ScheduleSlot[] {
  const { data } = useQuery({
    queryKey: ['schedule-slots'],
    queryFn: () => apiFetch<ScheduleSlot[]>('/schedule-slots'),
  })
  return data ?? []
}

export async function addScheduleSlot(data: Omit<ScheduleSlot, 'id'>) {
  await apiFetch('/schedule-slots', { method: 'POST', body: JSON.stringify(data) })
  await queryClient.invalidateQueries({ queryKey: ['schedule-slots'] })
}

export async function updateScheduleSlot(id: number, data: Omit<ScheduleSlot, 'id'>) {
  await apiFetch(`/schedule-slots/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  await queryClient.invalidateQueries({ queryKey: ['schedule-slots'] })
}

export async function deleteScheduleSlot(id: number) {
  await apiFetch(`/schedule-slots/${id}`, { method: 'DELETE' })
  await queryClient.invalidateQueries({ queryKey: ['schedule-slots'] })
  await queryClient.invalidateQueries({ queryKey: ['attendance'] })
}
