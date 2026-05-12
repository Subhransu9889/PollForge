import { useState } from 'react'
import { useApi } from './useApi'
import type { Poll } from '@/types'

export function usePolls() {
  const { api } = useApi()
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadPolls() {
    setLoading(true)
    setError(null)
    try {
      const data = await api('/api/polls/mine')
      setPolls(data.polls)
      return data.polls
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load polls'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function createPoll(pollData: any) {
    setLoading(true)
    setError(null)
    try {
      const cleanQuestions = pollData.questions.map((question: any) => ({
        ...question,
        options: question.options.filter((option: any) => option.label.trim()),
      }))

      const data = await api('/api/polls', {
        method: 'POST',
        body: JSON.stringify({
          ...pollData,
          expiresAt: new Date(pollData.expiresAt).toISOString(),
          questions: cleanQuestions,
        }),
      })

      setPolls([data.poll, ...polls])
      return data.poll
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create poll'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function publishPoll(pollId: string) {
    setLoading(true)
    setError(null)
    try {
      const data = await api(`/api/polls/${pollId}/publish`, { method: 'POST' })
      setPolls(polls.map(p => (p.id === pollId ? data.poll : p)))
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to publish poll'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    polls,
    setPolls,
    loading,
    error,
    loadPolls,
    createPoll,
    publishPoll,
  }
}
