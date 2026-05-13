import { useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { API_URL } from '@/constants'

export function useApi() {
  const { token } = useAuth()

  const api = useCallback(async (path: string, options: RequestInit = {}) => {
    const authHeaders: Record<string, string> = token
      ? { Authorization: `Bearer ${token}` }
      : {}

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message ?? 'Request failed')
    }

    return data
  }, [token])

  return { api }
}
