import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { API_URL } from '@/constants'
import type { Analytics } from '@/types'

export function usePollSocket(
  pollId: string | null,
  onAnalyticsUpdate: (analytics: Analytics) => void,
  onPollsUpdate?: () => void
) {
  useEffect(() => {
    if (!pollId) return

    const socket = io(API_URL)

    socket.emit('poll:join', pollId)

    socket.on('poll:analytics', (analytics: Analytics) => {
      onAnalyticsUpdate(analytics)
      if (onPollsUpdate) {
        onPollsUpdate()
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [pollId, onAnalyticsUpdate, onPollsUpdate])
}
