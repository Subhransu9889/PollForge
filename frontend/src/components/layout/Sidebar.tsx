import { useState } from 'react'
import { Input } from '@/components/ui/input'
import type { Poll } from '@/types'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { TypographyH3, TypographyP } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Clock3, PlusCircle, RadioTower } from 'lucide-react'
import { formatTimeRemaining } from '@/utils/formatting'

interface SidebarProps {
  polls: Poll[]
  selectedPollId: string
  onSelectPoll: (id: string) => void
  onCreateNew: () => void
  loading?: boolean
}

export function Sidebar({
  polls,
  selectedPollId,
  onSelectPoll,
  onCreateNew,
  loading,
}: SidebarProps) {
  const [search, setSearch] = useState('')
  const filteredPolls = polls.filter(poll => poll.title.toLowerCase().includes(search.toLowerCase()))
  const totalResponses = polls.reduce((sum, poll) => sum + (poll.totalResponses ?? 0), 0)

  return (
    <aside className="poll-library space-y-4" aria-label="Poll library">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <TypographyH3>Your library</TypographyH3>
            <TypographyP>All your questions, in one place.</TypographyP>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="stat-item">
              <div className="stat-number">{polls.length}</div>
              <div className="stat-label">Polls</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{totalResponses}</div>
              <div className="stat-label">Responses</div>
            </div>
          </div>

          <Button onClick={onCreateNew} className="w-full" size="lg">
            <PlusCircle className="w-4 h-4 mr-2" />
            New Poll
          </Button>
        </CardContent>
      </Card>

      {polls.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h4 className="text-sm font-semibold mb-3">Your Polls</h4>
            <Input aria-label="Search polls" placeholder="Search your polls…" value={search} onChange={event => setSearch(event.target.value)} className="mb-3" />
            <ScrollArea className="poll-library-list">
              <div className="space-y-2 pr-4">
                {filteredPolls.map((poll) => (
                  <button
                    key={poll.id}
                    aria-current={selectedPollId === poll.id ? 'true' : undefined}
                    className={`poll-row ${selectedPollId === poll.id ? 'is-active' : ''}`}
                    onClick={() => onSelectPoll(poll.id)}
                  >
                    <span className="flex w-full items-start justify-between gap-2">
                      <span className="font-semibold text-sm line-clamp-2">{poll.title}</span>
                      <Badge
                        variant="outline"
                        className={poll.isPublished ? 'border-accent/40 text-accent' : poll.isExpired ? 'border-secondary/40 text-secondary' : 'border-primary/40 text-primary'}
                      >
                        {poll.isPublished ? 'Published' : poll.isExpired ? 'Expired' : 'Live'}
                      </Badge>
                    </span>
                    <span className="mt-3 flex w-full items-center justify-between text-xs text-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <RadioTower className="size-3.5" />
                        {poll.totalResponses ?? 0} responses
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="size-3.5" />
                        {formatTimeRemaining(poll.expiresAt)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </ScrollArea>
            {filteredPolls.length === 0 && <p className="py-4 text-sm text-muted" role="status">No polls match your search.</p>}
          </CardContent>
        </Card>
      )}

      {polls.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <BarChart3 className="mx-auto mb-3 size-8 text-primary" />
            <TypographyP>{loading ? 'Loading your polls…' : 'No polls yet. Create your first one to start collecting responses.'}</TypographyP>
          </CardContent>
        </Card>
      )}
    </aside>
  )
}
