import { useEffect, useState } from 'react'
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
import { Toaster, toast } from 'sonner'

export function Dashboard() {
  const { api } = useApi()
  const { polls, loadPolls, createPoll } = usePolls()
  const [selectedPollId, setSelectedPollId] = useState('')
  const [selectedAnalytics, setSelectedAnalytics] = useState<Analytics | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [pollCreating, setPollCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Load polls on mount
  useEffect(() => {
    loadPolls().catch((err) => {
      toast.error(err.message)
    })
  }, [])

  // Set first poll as selected if available
  useEffect(() => {
    if (!selectedPollId && polls.length > 0) {
      setSelectedPollId(polls[0].id)
    }
  }, [polls, selectedPollId])

  // Load analytics when selected poll changes
  useEffect(() => {
    if (!selectedPollId) return

    setAnalyticsLoading(true)
    api(`/api/polls/${selectedPollId}/analytics`)
      .then((data) => setSelectedAnalytics(data.analytics))
      .catch((err) => toast.error(err.message))
      .finally(() => setAnalyticsLoading(false))
  }, [selectedPollId, api])

  // Socket updates
  usePollSocket(
    selectedPollId,
    (analytics) => setSelectedAnalytics(analytics),
    () => loadPolls().catch(() => {})
  )

  const handleCreatePoll = async (data: CreatePollFormData) => {
    setPollCreating(true)
    try {
      await createPoll(data)
      toast.success('Poll created successfully!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create poll')
      throw err
    } finally {
      setPollCreating(false)
    }
  }

  const handlePublishResults = async () => {
    if (!selectedPollId) return

    try {
      const data = await api(`/api/polls/${selectedPollId}/publish`, { method: 'POST' })
      setSelectedAnalytics(data.analytics)
      await loadPolls()
      toast.success('Results published!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish')
    }
  }

  const copyShareLink = () => {
    const link = `${window.location.origin}/p/${selectedPollId}`
    navigator.clipboard.writeText(link)
    setCopiedId(selectedPollId)
    toast.success('Share link copied!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <>
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

          <div className="workspace">
            <Sidebar
              polls={polls}
              selectedPollId={selectedPollId}
              onSelectPoll={setSelectedPollId}
              onCreateNew={() => {}}
            />

            <div className="main-grid">
              <PollBuilder onSubmit={handleCreatePoll} isLoading={pollCreating} />

              <div className="space-y-4">
                <Card className="sticky-card">
                  <CardHeader className="dashboard-card-head">
                    <div>
                      <p className="eyebrow">Live view</p>
                      <CardTitle>Analytics & Results</CardTitle>
                    </div>
                    <Activity className="size-5 text-primary" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedPollId && !analyticsLoading && selectedAnalytics ? (
                      <>
                        <div className="share-panel">
                          <TypographySmall className="text-primary">Share Link</TypographySmall>
                          <div className="flex gap-2 items-center">
                            <code className="share-code">
                              {window.location.origin}/p/{selectedPollId}
                            </code>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={copyShareLink}
                            >
                              {copiedId === selectedPollId ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {!selectedAnalytics && (
                          <TypographyP>No responses yet. Share the link to start collecting feedback.</TypographyP>
                        )}

                        {selectedAnalytics && (
                          <>
                            <AnalyticsPanel analytics={selectedAnalytics} />
                            {!polls.find(p => p.id === selectedPollId)?.isPublished && (
                              <Button onClick={handlePublishResults} className="w-full" size="lg">
                                <Send className="size-4" />
                                Publish Final Results
                              </Button>
                            )}
                          </>
                        )}
                      </>
                    ) : analyticsLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
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
        </div>
      </div>
      <Toaster position="bottom-right" />
    </>
  )
}
