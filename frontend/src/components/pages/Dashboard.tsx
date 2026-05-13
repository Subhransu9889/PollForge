import { useCallback, useEffect, useState } from 'react'
import type { CreatePollFormData } from '@/utils/validation'
import type { Analytics } from '@/types'
import { usePolls } from '@/hooks/usePolls'
import { useApi } from '@/hooks/useApi'
import { usePollSocket } from '@/hooks/usePollSocket'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { PollBuilder } from '@/components/polls/PollBuilder'
import { AnalyticsPanel } from '@/components/analytics/AnalyticsPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TypographyP, TypographySmall } from '@/components/ui/typography'
import { Activity, Check, Copy, Send } from 'lucide-react'
import { toast } from 'sonner'

export function Dashboard() {
  const { api } = useApi()
  const { polls, loadPolls, createPoll } = usePolls()
  const [selectedPollId, setSelectedPollId] = useState('')
  const [selectedAnalytics, setSelectedAnalytics] = useState<Analytics | null>(null)
  const [pollCreating, setPollCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const activePollId = selectedPollId || polls[0]?.id || ''

  // Load polls on mount
  useEffect(() => {
    loadPolls().catch((err) => {
      toast.error(err.message)
    })
  }, [loadPolls])

  // Load analytics when selected poll changes
  useEffect(() => {
    if (!activePollId) {
      return
    }

    let isCurrent = true
    api(`/api/polls/${activePollId}/analytics`)
      .then((data) => {
        if (isCurrent) {
          setSelectedAnalytics(data.analytics)
        }
      })
      .catch((err) => {
        if (isCurrent) {
          toast.error(err.message)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [activePollId, api])

  const handleAnalyticsUpdate = useCallback((analytics: Analytics) => {
    setSelectedAnalytics(analytics)
  }, [])

  const refreshPollsQuietly = useCallback(() => {
    loadPolls().catch(() => {})
  }, [loadPolls])

  const handleSelectPoll = useCallback((pollId: string) => {
    setSelectedPollId(pollId)
    setSelectedAnalytics(null)
  }, [])

  // Socket updates
  usePollSocket(
    activePollId,
    handleAnalyticsUpdate,
    refreshPollsQuietly
  )

  const handleCreatePoll = async (data: CreatePollFormData) => {
    setPollCreating(true)
    try {
      const poll = await createPoll(data)
      setSelectedPollId(poll.id)
      setSelectedAnalytics(null)
      toast.success('Poll created successfully!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create poll')
      throw err
    } finally {
      setPollCreating(false)
    }
  }

  const handlePublishResults = async () => {
    if (!activePollId) return

    try {
      const data = await api(`/api/polls/${activePollId}/publish`, { method: 'POST' })
      setSelectedAnalytics(data.analytics)
      await loadPolls()
      toast.success('Results published!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish')
    }
  }

  const copyShareLink = () => {
    const link = `${window.location.origin}/p/${activePollId}`
    navigator.clipboard.writeText(link)
    setCopiedId(activePollId)
    toast.success('Share link copied!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="app-shell">
      <div className="container-max">
        <Header />

        <section className="dashboard-hero">
          <div>
            <p className="eyebrow">Workspace</p>
            <h1>Design polls, monitor responses, publish outcomes.</h1>
            <TypographyP className="max-w-2xl">
              Keep creation and analytics side by side so every poll moves from draft to shared result without context switching.
            </TypographyP>
          </div>
          <div className="hero-actions">
            <div className="hero-stat">
              <span>{polls.length}</span>
              <small>active polls</small>
            </div>
            <div className="hero-stat">
              <span>{polls.reduce((sum, poll) => sum + (poll.totalResponses ?? 0), 0)}</span>
              <small>responses</small>
            </div>
          </div>
        </section>

        <div className="workspace dashboard-workspace">
          <div className="workspace-top-row">
            <Sidebar
              polls={polls}
              selectedPollId={activePollId}
              onSelectPoll={handleSelectPoll}
              onCreateNew={() => {}}
            />

            <PollBuilder onSubmit={handleCreatePoll} isLoading={pollCreating} />
          </div>

          <Card className="live-view-card">
            <CardHeader className="dashboard-card-head live-view-head">
              <div>
                <p className="eyebrow">Live view</p>
                <CardTitle>Analytics & Results</CardTitle>
              </div>
              <div className="live-view-status">
                <Activity className="size-4" />
                Realtime
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {activePollId && selectedAnalytics ? (
                <>
                  <div className="share-panel live-share-panel">
                    <div>
                      <TypographySmall className="text-primary">Share Link</TypographySmall>
                      <p className="text-xs text-muted">Send this poll out and watch the results update below.</p>
                    </div>
                    <div className="live-share-row">
                      <code className="share-code">
                        {window.location.origin}/p/{activePollId}
                      </code>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={copyShareLink}
                      >
                        {copiedId === activePollId ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <AnalyticsPanel analytics={selectedAnalytics} />
                  {!polls.find(p => p.id === activePollId)?.isPublished && (
                    <div className="publish-bar">
                      <div>
                        <strong>Ready to close the loop?</strong>
                        <span>Publish final results when your response window is complete.</span>
                      </div>
                      <Button onClick={handlePublishResults} size="lg">
                        <Send className="size-4" />
                        Publish Final Results
                      </Button>
                    </div>
                  )}
                </>
              ) : activePollId ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : (
                <TypographyP>Select or create a poll to see analytics.</TypographyP>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
