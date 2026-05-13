import { useCallback, useState } from 'react'
import { useApi } from './useApi'
import type { Poll, Question } from '@/types'
import type { CreatePollFormData } from '@/utils/validation'

export function usePolls() {
  const { api } = useApi()
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPolls = useCallback(async () => {
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
  }, [api])

  const createPoll = useCallback(async (pollData: CreatePollFormData) => {
    setLoading(true)
    setError(null)
    try {
      const expiresAt = new Date(pollData.expiresAt)
      if (Number.isNaN(expiresAt.getTime())) {
        throw new Error('Please choose a valid expiration date and time')
      }

      const cleanQuestions: Question[] = pollData.questions.map((question) => ({
        ...question,
        options: question.options.filter((option) => option.label.trim()),
      }))

      const data = await api('/api/polls', {
        method: 'POST',
        body: JSON.stringify({
          ...pollData,
          expiresAt: expiresAt.toISOString(),
          questions: cleanQuestions,
        }),
      })

      setPolls((currentPolls) => [data.poll, ...currentPolls])
      return data.poll
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create poll'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [api])

  const publishPoll = useCallback(async (pollId: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api(`/api/polls/${pollId}/publish`, { method: 'POST' })
      setPolls((currentPolls) => currentPolls.map(p => (p.id === pollId ? data.poll : p)))
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to publish poll'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [api])

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
