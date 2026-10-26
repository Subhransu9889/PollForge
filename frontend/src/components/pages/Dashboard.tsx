import { duplicatePoll } from '@/utils/pollDraft'
import { PollQrDialog } from '@/components/polls/PollQrDialog'
import { downloadPollCsv, type PollExport } from '@/utils/csv'
import './dashboard.css'
import { useAuth } from '@/context/AuthContext'
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
import { Activity, Check, Copy, Send, Plus, LayoutDashboard, BarChart3, MessageSquareText, RadioTower, CircleCheck, ArrowUpRight, Download } from 'lucide-react'
import { toast } from 'sonner'

export function Dashboard() {
  const { user } = useAuth()
  const { api } = useApi()
  const { polls, loading, error, loadPolls, createPoll } = usePolls()
  const [view, setView] = useState<'create' | 'results'>('results')
  const [builderSeed, setBuilderSeed] = useState<{ revision: number; values: CreatePollFormData } | null>(null)
  const [exporting, setExporting] = useState<'selected' | 'all' | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [analyticsError, setAnalyticsError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [selectedPollId, setSelectedPollId] = useState('')
  const [selectedAnalytics, setSelectedAnalytics] = useState<Analytics | null>(null)
  const [pollCreating, setPollCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const activePollId = selectedPollId || polls[0]?.id || ''

  const activePoll = polls.find(poll => poll.id === activePollId)
  const workspaceStats = [
    { label: 'Total polls', value: polls.length, detail: 'Across your workspace', icon: BarChart3, tone: 'mint' },
    { label: 'Responses collected', value: polls.reduce((sum, poll) => sum + (poll.totalResponses ?? 0), 0), detail: 'Every voice, in one place', icon: MessageSquareText, tone: 'lavender' },
    { label: 'Accepting responses', value: polls.filter(poll => !poll.isExpired && !poll.isPublished).length, detail: 'Open for participation', icon: RadioTower, tone: 'blue' },
    { label: 'Published results', value: polls.filter(poll => poll.isPublished).length, detail: 'Ready to share with everyone', icon: CircleCheck, tone: 'peach' },
  ]

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
          setAnalyticsError('')
          setSelectedAnalytics(data.analytics)
        }
      })
      .catch((err) => {
        if (isCurrent) {
          setAnalyticsError(err.message)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [activePollId, api, retryCount])

  const handleAnalyticsUpdate = useCallback((analytics: Analytics) => {
    setSelectedAnalytics(analytics)
  }, [])

  const refreshPollsQuietly = useCallback(() => {
    loadPolls().catch(() => {})
  }, [loadPolls])

  const handleSelectPoll = useCallback((pollId: string) => {
    setView('results')
    setAnalyticsError('')
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
      setAnalyticsError('')
      setSelectedPollId(poll.id)
      setSelectedAnalytics(null)
      setView('results')
      toast.success('Poll created successfully!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create poll')
      throw err
    } finally {
      setPollCreating(false)
    }
  }

  const handlePublishResults = async () => {
    if (!activePollId || publishing) return

    setPublishing(true)
    try {
      const data = await api(`/api/polls/${activePollId}/publish`, { method: 'POST' })
      setSelectedAnalytics(data.analytics)
      await loadPolls()
      toast.success('Results published!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish')
    } finally {
      setPublishing(false)
    }
  }

  const handleDuplicate = () => {
    if (!activePoll || pollCreating) return
    if (!window.confirm(`Create an editable copy of “${activePoll.title}”? This replaces your current saved draft. Responses will not be copied.`)) return
    setBuilderSeed({ revision: Date.now(), values: duplicatePoll(activePoll) })
    setView('create')
    toast.success('Poll copied to the builder. Review it, then create your new poll.')
  }

  const exportCsv = async (scope: 'selected' | 'all') => {
    if (exporting) return
    const targets = scope === 'selected' ? (activePoll ? [activePoll] : []) : polls
    if (!targets.length) return
    setExporting(scope)
    try {
      const exports: PollExport[] = []
      for (const poll of targets) {
        const data = await api(`/api/polls/${poll.id}/analytics`)
        exports.push({ id: poll.id, title: poll.title, analytics: data.analytics })
      }
      const slug = (targets[0].title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'poll')
      downloadPollCsv(exports, scope === 'selected' ? `${slug}-${targets[0].id}-results.csv` : 'pollforge-all-polls-results.csv')
      toast.success(scope === 'selected' ? 'Selected poll exported.' : 'All polls exported.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed. Please try again.')
    } finally {
      setExporting(null)
    }
  }

  const copyShareLink = async () => {
    const link = `${window.location.origin}/p/${activePollId}`
    try {
      await navigator.clipboard.writeText(link)
      setCopiedId(activePollId)
      toast.success('Share link copied!')
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error('Could not copy the link. Select and copy it manually.')
    }
  }

  return (
    <div className="app-shell dashboard-shell">
      <a href="#workspace-content" className="skip-link">Skip to workspace</a>
      <div className="container-max">
        <Header />

        <section className="dashboard-hero">
          <div>
            <p className="eyebrow">WORKSPACE / OVERVIEW</p>
            <h1>Welcome back{user?.firstName ? `, ${user.firstName}` : ''}<span className="dashboard-heading-dot">.</span></h1>
            <TypographyP className="max-w-2xl">
              A little feedback. A clearer picture. Here’s where your conversations stand.
            </TypographyP>
          </div>
          <Button size="lg" onClick={() => setView('create')}><Plus className="size-4" />Create a poll<ArrowUpRight className="size-4" /></Button>
        </section>

        <section className="workspace-stat-grid" aria-label="Workspace overview">
          {workspaceStats.map(stat => <article className={`workspace-stat workspace-stat-${stat.tone}`} key={stat.label}>
            <div className="workspace-stat-top"><span>{stat.label}</span><stat.icon className="size-4" /></div>
            <strong>{loading && !polls.length ? '—' : stat.value.toLocaleString()}</strong><p>{stat.detail}</p>
          </article>)}
        </section>
        {error && <div role="alert" className="workspace-error">{error}<Button variant="outline" onClick={() => loadPolls().catch(() => {})}>Try again</Button></div>}
        <div className="workspace dashboard-workspace">
          <div className="workspace-top-row">
            <Sidebar
              polls={polls}
              selectedPollId={activePollId}
              onSelectPoll={handleSelectPoll}
              onCreateNew={() => setView('create')}
              loading={loading}
            />

            <main id="workspace-content" className="workspace-content" tabIndex={-1}>
            <section className="poll-export-toolbar" aria-label="CSV export options">
              <div><h2>Export results</h2><p>Choose one poll from your library, or download all polls. Text answers are summarized as counts.</p></div>
              <div className="poll-export-actions">
                <Button variant="outline" disabled={!activePoll || exporting !== null} onClick={() => exportCsv('selected')}><Download className="size-4" />{exporting === 'selected' ? 'Exporting…' : 'Selected poll CSV'}</Button>
                <Button variant="outline" disabled={!polls.length || exporting !== null} onClick={() => exportCsv('all')}><Download className="size-4" />{exporting === 'all' ? 'Exporting…' : 'All polls CSV'}</Button>
              </div>
              {activePoll && <p className="poll-export-selection">Selected: {activePoll.title}</p>}
            </section>
            <nav className="workspace-tabs" aria-label="Workspace views">
              <button aria-current={view === 'create' ? 'page' : undefined} onClick={() => setView('create')}><Plus className="size-4" />Create poll</button>
              <button aria-current={view === 'results' ? 'page' : undefined} onClick={() => setView('results')}><BarChart3 className="size-4" />Results & sharing</button>
            </nav>
            <div hidden={view !== 'create'}><PollBuilder key={`${user!.id}-${builderSeed?.revision ?? 0}`} userId={user!.id} initialValues={builderSeed?.values} onSubmit={handleCreatePoll} isLoading={pollCreating} /></div>

          <Card className={`live-view-card ${view !== 'results' ? 'hidden' : ''}`}>
            <CardHeader className="dashboard-card-head live-view-head">
              <div>
                <p className="eyebrow">POLL PERFORMANCE</p>
                <CardTitle>{activePoll?.title || 'Your response overview'}</CardTitle>
                <p className="dashboard-poll-description">{activePoll?.description || 'Explore participation, compare choices, and share the outcome.'}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" disabled={!activePoll || pollCreating} onClick={handleDuplicate}><Copy className="size-4" />Duplicate poll</Button>
              <div className="live-view-status">
                <Activity className="size-4" />
                {activePoll?.isPublished ? 'Published' : activePoll?.isExpired ? 'Closed' : 'Results'}
              </div>
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
                        aria-label="Copy poll share link"
                      >
                        {copiedId === activePollId ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {activePoll && <PollQrDialog key={`qr-${activePollId}`} pollId={activePollId} title={activePoll.title} />}
                  <AnalyticsPanel key={`analytics-${activePollId}`} analytics={selectedAnalytics} />
                  {!polls.find(p => p.id === activePollId)?.isPublished && (
                    <div className="publish-bar">
                      <div>
                        <strong>Ready to close the loop?</strong>
                        <span>Publish final results when your response window is complete.</span>
                      </div>
                      <Button onClick={handlePublishResults} disabled={publishing} size="lg">
                        <Send className="size-4" />
                        {publishing ? 'Publishing…' : 'Publish Final Results'}
                      </Button>
                    </div>
                  )}
                </>
              ) : analyticsError ? (
                <div role="alert" className="workspace-error">{analyticsError}<Button variant="outline" onClick={() => { setAnalyticsError(''); setRetryCount(c => c + 1) }}>Retry analytics</Button></div>
              ) : activePollId ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : (
                <div className="workspace-empty"><LayoutDashboard className="size-10 text-primary" /><h2>No results just yet</h2><TypographyP>Select a poll from your library, or create your first one.</TypographyP><Button onClick={() => setView('create')}>Create a poll</Button></div>
              )}
            </CardContent>
          </Card>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
