import { useAuth } from '@/context/AuthContext'
import { API_URL } from '@/constants'

export function useApi() {
  const { token } = useAuth()

  const authHeaders: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {}

  async function api(path: string, options: RequestInit = {}) {
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
  }

  return { api }
}
