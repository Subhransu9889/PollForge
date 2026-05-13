import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { API_URL } from '@/constants'
import type { Analytics } from '@/types'

export function usePollSocket(
  pollId: string | null,
  onAnalyticsUpdate: (analytics: Analytics) => void,
  onPollsUpdate?: () => void
) {
  const onAnalyticsUpdateRef = useRef(onAnalyticsUpdate)
  const onPollsUpdateRef = useRef(onPollsUpdate)

  useEffect(() => {
    onAnalyticsUpdateRef.current = onAnalyticsUpdate
    onPollsUpdateRef.current = onPollsUpdate
  }, [onAnalyticsUpdate, onPollsUpdate])

  useEffect(() => {
    if (!pollId) return

    const socket = io(API_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 500,
      reconnectionDelayMax: 5000,
    })

    const joinPollRoom = () => {
      socket.emit('poll:join', pollId)
    }

    socket.on('connect', joinPollRoom)

    socket.on('poll:analytics', (analytics: Analytics) => {
      onAnalyticsUpdateRef.current(analytics)
      if (onPollsUpdateRef.current) {
        onPollsUpdateRef.current()
      }
    })

    socket.connect()

    return () => {
      if (socket.connected) {
        socket.emit('poll:leave', pollId)
      }
      socket.off('connect', joinPollRoom)
      socket.off('poll:analytics')
      socket.disconnect()
    }
  }, [pollId])
}
