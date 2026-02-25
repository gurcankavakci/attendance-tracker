import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import { queryClient } from '../lib/queryClient'

export interface SemesterSettings {
  startWeek: number
  startYear: number
  endWeek: number
  endYear: number
}

export function useSemester(): SemesterSettings | null {
  const { data } = useQuery({
    queryKey: ['semester'],
    queryFn: () => apiFetch<SemesterSettings | null>('/semester'),
  })
  return data ?? null
}

export async function setSemester(data: SemesterSettings) {
  await apiFetch('/semester', { method: 'PUT', body: JSON.stringify(data) })
  await queryClient.invalidateQueries({ queryKey: ['semester'] })
}

export async function clearSemester() {
  await apiFetch('/semester', { method: 'DELETE' })
  await queryClient.invalidateQueries({ queryKey: ['semester'] })
}
