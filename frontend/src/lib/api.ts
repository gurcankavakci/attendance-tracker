import { clearToken, getToken } from './auth'

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  })

  if (res.status === 401) {
    clearToken()
    window.location.href = '/login'
    throw new Error('Oturum sona erdi')
  }

  if (!res.ok) {
    const msg = await res.text().catch(() => 'İstek başarısız')
    throw new Error(msg)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}
