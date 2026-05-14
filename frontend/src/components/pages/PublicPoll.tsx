import { useCallback, useEffect, useState } from 'react'
import type { Poll, Analytics } from '@/types'
import type { LoginFormData, RegisterFormData } from '@/utils/validation'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/context/AuthContext'
import { usePollSocket } from '@/hooks/usePollSocket'
import { ResponseForm } from '@/components/polls/ResponseForm'
import { AnalyticsPanel } from '@/components/analytics/AnalyticsPanel'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { TypographyH1, TypographyP } from '@/components/ui/typography'
import { formatTimeRemaining } from '@/utils/formatting'

interface PublicPollProps {
  pollId: string
}

const DEVICE_ID_STORAGE_KEY = 'pollforge_device_id'
const submittedPollKey = (pollId: string) => `pollforge_submitted_${pollId}`

function getAnonymousDeviceId() {
  const existing = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY)
  if (existing) {
    return existing
  }

  const deviceId = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
  window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId)
  return deviceId
}

export function PublicPoll({ pollId }: PublicPollProps) {
  const { api } = useApi()
  const { token, setToken, setUser } = useAuth()
  const [poll, setPoll] = useState<Poll | null>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authLoading, setAuthLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  // Load poll
  useEffect(() => {
    let isCurrent = true
    api(`/api/polls/${pollId}`)
      .then((data) => {
        if (!isCurrent) return
        setPoll(data.poll)
        setHasSubmitted(window.localStorage.getItem(submittedPollKey(pollId)) === 'true')
        if (data.analytics) {
          setAnalytics(data.analytics)
        }
      })
      .catch((err) => {
        if (isCurrent) {
          toast.error(err.message)
        }
      })
      .finally(() => {
        if (isCurrent) {
          setLoading(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [pollId, api])

  const handleAnalyticsUpdate = useCallback((newAnalytics: Analytics) => {
    setAnalytics(newAnalytics)
  }, [])

  // Socket updates
  usePollSocket(
    pollId,
    handleAnalyticsUpdate,
  )

  const handleSubmitResponse = async (answers: Record<string, string>) => {
    if (!poll) return

    setSubmitting(true)
    try {
      await api(`/api/polls/${pollId}/responses`, {
        method: 'POST',
        headers: poll.responseMode === 'anonymous'
          ? { 'X-PollForge-Device-Id': getAnonymousDeviceId() }
          : undefined,
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, optionId]) => ({
            questionId,
            optionId,
          })),
        }),
      })
      window.localStorage.setItem(submittedPollKey(pollId), 'true')
      setHasSubmitted(true)
      toast.success('Thanks for your feedback!')
    } catch (err) {
      if (err instanceof Error && err.message.toLowerCase().includes('already submitted')) {
        window.localStorage.setItem(submittedPollKey(pollId), 'true')
        setHasSubmitted(true)
      }

      throw err
    } finally {
      setSubmitting(false)
    }
  }

  const handleAuth = async (data: LoginFormData | RegisterFormData) => {
    setAuthLoading(true)
    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const response = await api(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      })
      setToken(response.token)
      setUser(response.user)
      toast.success(`Signed in successfully!`)
    } finally {
      setAuthLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="app-shell flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6 space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!poll) {
    return (
      <div className="app-shell flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            Poll not found or has been deleted.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const statusColor = poll.isPublished ? 'bg-accent' : poll.isExpired ? 'bg-secondary' : 'bg-primary'
  const statusText = poll.isPublished ? 'Results Published' : poll.isExpired ? 'Expired' : 'Accepting Responses'

  return (
    <div className="app-shell">
      <div className="container-max max-w-3xl">
        <header className="py-8 text-center border-b border-border mb-8">
          <div className="flex justify-center mb-3">
            <Badge className={`${statusColor}`}>{statusText}</Badge>
          </div>
          <TypographyH1>{poll.title}</TypographyH1>
          <TypographyP className="mt-3">{poll.description}</TypographyP>
          <TypographyP className="text-xs mt-2">{formatTimeRemaining(poll.expiresAt)}</TypographyP>
        </header>

        <div className="grid gap-6">
          {/* Auth Block */}
          {poll.responseMode === 'authenticated' && !token && !poll.isPublished && !poll.isExpired && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle>Sign In Required</CardTitle>
              </CardHeader>
              <CardContent>
                <TypographyP className="mb-6">
                  This poll requires authentication. Please sign in or create an account to participate.
                </TypographyP>

                <div className="space-y-4">
                  {authMode === 'login' ? (
                    <LoginForm
                      onSubmit={handleAuth}
                      isLoading={authLoading}
                      onSwitchToRegister={() => setAuthMode('register')}
                    />
                  ) : (
                    <RegisterForm
                      onSubmit={handleAuth}
                      isLoading={authLoading}
                      onSwitchToLogin={() => setAuthMode('login')}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Response Form */}
          {poll.isPublished ? (
            <>
              <div className="text-center py-6">
                <TypographyP>Poll results are now published.</TypographyP>
              </div>
              {analytics && <AnalyticsPanel analytics={analytics} questionsOnly />}
            </>
          ) : poll.isExpired ? (
            <Alert>
              <AlertDescription>
                This poll has expired. Responses are closed. The creator will publish final results here when ready.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {hasSubmitted ? (
                <Alert>
                  <AlertDescription>
                    Your response has already been recorded for this poll on this device.
                  </AlertDescription>
                </Alert>
              ) : (poll.responseMode === 'anonymous' || token) && (
                <ResponseForm
                  poll={poll}
                  onSubmit={handleSubmitResponse}
                  isLoading={submitting}
                />
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}
