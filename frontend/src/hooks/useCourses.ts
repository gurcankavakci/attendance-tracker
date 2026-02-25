import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import { queryClient } from '../lib/queryClient'
import type { Course } from '../db/db'

export function useCourses(): Course[] {
  const { data } = useQuery({
    queryKey: ['courses'],
    queryFn: () => apiFetch<Course[]>('/courses'),
  })
  return data ?? []
}

export async function addCourse(data: Omit<Course, 'id' | 'createdAt'>) {
  await apiFetch('/courses', { method: 'POST', body: JSON.stringify(data) })
  await queryClient.invalidateQueries({ queryKey: ['courses'] })
}

export async function updateCourse(id: number, data: Partial<Omit<Course, 'id' | 'createdAt'>>) {
  await apiFetch(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  await queryClient.invalidateQueries({ queryKey: ['courses'] })
}

export async function deleteCourse(id: number) {
  await apiFetch(`/courses/${id}`, { method: 'DELETE' })
  await queryClient.invalidateQueries({ queryKey: ['courses'] })
  await queryClient.invalidateQueries({ queryKey: ['schedule-slots'] })
  await queryClient.invalidateQueries({ queryKey: ['attendance'] })
}
