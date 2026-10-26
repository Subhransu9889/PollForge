import type { Analytics } from '@/types'
import type { ComponentType } from 'react'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TypographySmall } from '@/components/ui/typography'
import { formatPercentage } from '@/utils/formatting'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import {
  BarChart3,
  ChevronDown,
  CircleCheck,
  MessageSquareText,
  MousePointerClick,
  Sparkles,
  TrendingUp,
  UserRound,
} from 'lucide-react'

interface AnalyticsPanelProps {
  analytics: Analytics
  questionsOnly?: boolean
}

type QuestionAnalytics = Analytics['questions'][number]
type OptionAnalytics = QuestionAnalytics['options'][number]

const chartColors = ['#2dd4bf', '#f4a261', '#b8f7c2', '#8ab4ff', '#f7b2d9', '#d8b4fe']

export function AnalyticsPanel({ analytics, questionsOnly = false }: AnalyticsPanelProps) {
  const totalAnswered = analytics.questions.reduce((sum, question) => sum + question.answered, 0)
  const totalSkipped = analytics.questions.reduce((sum, question) => sum + question.skipped, 0)
  const answerRate = totalAnswered + totalSkipped ? (totalAnswered / (totalAnswered + totalSkipped)) * 100 : 0
  const responseTypes = [
    { label: 'Anonymous', count: analytics.participation.anonymousResponses, color: '#5eead4' },
    { label: 'Authenticated', count: analytics.participation.authenticatedResponses, color: '#a5b4fc' },
  ]


  return (
    <div className="analytics-suite">
      {!questionsOnly && (
        <>
          <div className="analysis-section-heading"><div><p className="eyebrow">THE BIG PICTURE</p><h3>Every response tells a story.</h3></div></div>
          <div className="analytics-metric-grid">
            <MetricCard
              icon={MessageSquareText}
              label="Total Responses"
              value={analytics.totalResponses.toLocaleString()}
              tone="primary"
              delay={0}
            />
            <MetricCard
              icon={CircleCheck}
              label="Completion Rate"
              value={formatPercentage(analytics.participation.completionRate)}
              tone="accent"
              delay={80}
            />
            <MetricCard
              icon={UserRound}
              label="Anonymous"
              value={analytics.participation.anonymousResponses.toLocaleString()}
              tone="secondary"
              delay={160}
            />
            <MetricCard
              icon={MousePointerClick}
              label="Question answer rate"
              value={formatPercentage(answerRate)}
              tone="blue"
              delay={240}
            />
          </div>

          <div className="analysis-overview-grid">
            <section className="analysis-participation"><div className="analysis-block-title"><UsersIcon /><h4>Who’s participating</h4></div>
              <p>Response identity across this poll</p>
              <div className="participation-track" aria-hidden="true">{responseTypes.map(type => <span key={type.label} style={{ width: `${analytics.totalResponses ? type.count / analytics.totalResponses * 100 : 0}%`, background: type.color }} />)}</div>
              {responseTypes.map(type => <div className="participation-legend" key={type.label}><span><i style={{ background: type.color }} />{type.label}</span><strong>{type.count.toLocaleString()}<small>{formatPercentage(analytics.totalResponses ? type.count / analytics.totalResponses * 100 : 0)}</small></strong></div>)}
            </section>
            <section className="analysis-coverage"><div className="analysis-block-title"><CircleCheck className="size-4" /><h4>Response coverage</h4></div><p>How often questions receive an answer</p>
              <div className="coverage-number">{formatPercentage(answerRate)}<span>of question opportunities answered</span></div>
              <div className="coverage-footer"><span><b>{totalAnswered.toLocaleString()}</b> answered</span><span><b>{totalSkipped.toLocaleString()}</b> skipped</span><span><b>{analytics.questions.length}</b> questions</span></div>
            </section>
          </div>
          <div className="analysis-results-heading"><h3>Question breakdown</h3><span>{analytics.questions.length} questions · Counts update as responses arrive</span></div>
        </>
      )}

      <div className="analytics-results-stack">
        {analytics.questions.map((question, questionIndex) => (
          <QuestionResultCard
            key={question.id}
            question={question}
            questionIndex={questionIndex}
            compact={questionsOnly}
          />
        ))}
      </div>
    </div>
  )
}

function QuestionResultCard({
  question,
  questionIndex,
  compact,
}: {
  question: QuestionAnalytics
  questionIndex: number
  compact: boolean
}) {
  const [isOpen, setIsOpen] = useState(questionIndex === 0)
  const [chartView, setChartView] = useState(false)
  const detailsId = useId()
  const total = question.answered + question.skipped
  const engagement = total ? (question.answered / total) * 100 : 0
  const topOption = question.type === 'choice' && question.answered > 0 ? [...question.options].sort((a, b) => b.count - a.count)[0] : undefined
  const sentiment = getQuestionSentiment(question, topOption)
  const summary = getQuestionSummary(question, topOption)

  return (
    <Card
      className={`result-card analytics-result-card ${compact ? 'analytics-result-card-compact' : ''} ${isOpen ? 'analytics-result-card-open' : ''}`}
      style={{ animationDelay: `${questionIndex * 90}ms` }}
    >
      <CardHeader>
        <div className="analytics-question-head">
          <div>
            {!compact && <TypographySmall>Question {questionIndex + 1}</TypographySmall>}
            <CardTitle className="text-lg">{question.text}</CardTitle>
            {compact ? (
              <p className="analytics-compact-response-count">{question.answered.toLocaleString()} responses</p>
            ) : !isOpen && (
              <div className="analytics-question-preview">
                <span>{question.answered.toLocaleString()} responses</span>
                <span>{question.skipped.toLocaleString()} skipped</span>
                {topOption && <span>Leading: {topOption.label}</span>}
                {question.type === 'text' && <span>Text response</span>}
              </div>
            )}
          </div>
          <div className="analytics-question-actions">
            {!compact && <div className="analytics-answer-badge">
              <strong>{question.answered}</strong>
              <span>responses</span>
            </div>}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="analytics-details-button"
              aria-expanded={isOpen}
              aria-controls={detailsId}
              onClick={() => setIsOpen((current) => !current)}
            >
              <BarChart3 className="size-4" />
              {isOpen ? 'Hide Details' : 'View Details'}
              <ChevronDown className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent id={detailsId} className="space-y-4">
          <div className="analytics-summary-grid">
            <div>
              <Sparkles className="size-4 text-primary" />
              <span>Response summary</span>
              <p>{summary}</p>
            </div>
            <div>
              <TrendingUp className="size-4 text-secondary" />
              <span>Distribution</span>
              <p>{sentiment}</p>
            </div>
          </div>

          {question.type === 'text' ? (
            <div className="analytics-text-response-list">
              {(question.textResponses ?? []).length > 0 ? (
                question.textResponses?.map((response, index) => (
                  <div key={`${question.id}-text-${index}`} className="analytics-text-response">
                    {response}
                  </div>
                ))
              ) : (
                <div className="analytics-text-response">No text responses yet.</div>
              )}
            </div>
          ) : (
            <>
              <div className="analysis-chart-toggle"><span>Response distribution</span><Button variant="outline" size="sm" aria-pressed={chartView} onClick={() => setChartView(value => !value)}>{chartView ? 'Show breakdown' : 'Show chart'}</Button></div>
              <div className="analytics-option-list" style={{ display: chartView ? 'none' : undefined }}>
                {question.options.map((option, optionIndex) => (
                  <div key={option.id} className="analytics-option-row">
                    <div className="analytics-option-meta">
                      <span className="analytics-option-dot" style={{ backgroundColor: chartColors[optionIndex % chartColors.length] }} />
                      <span>{option.label}</span>
                      <b>{option.count} votes</b>
                    </div>
                    <div className="analytics-option-score">{formatPercentage(option.percent)}</div>
                    <div className="analytics-progress-track">
                      <span
                        className="analytics-progress-fill"
                        style={{
                          width: `${Math.min(100, Math.max(0, option.percent))}%`,
                          background: `linear-gradient(90deg, ${chartColors[optionIndex % chartColors.length]}, rgba(255,255,255,0.86))`,
                          animationDelay: `${optionIndex * 120}ms`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {chartView && question.options.length > 0 && (
                <OptionChart options={question.options} />
              )}
            </>
          )}

          <div className="analytics-card-footer">
            <span>{question.skipped} skipped</span>
            <span>{formatPercentage(engagement)} engagement</span>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

function UsersIcon() { return <UserRound className="size-4" /> }

function getQuestionSummary(question: QuestionAnalytics, topOption?: OptionAnalytics) {
  if (!question.answered) {
    return 'No responses have been recorded for this question yet.'
  }

  if (!topOption) {
    return question.type === 'text'
      ? `${question.answered.toLocaleString()} text responses were recorded.`
      : `${question.answered.toLocaleString()} responses were recorded.`
  }

  const tied = question.options.filter(option => option.count === topOption.count).length > 1
  if (tied) return `The top choices are tied at ${topOption.count} votes each across ${question.answered.toLocaleString()} responses.`
  return `${topOption.label} leads with ${formatPercentage(topOption.percent)} across ${question.answered.toLocaleString()} responses.`
}

function getQuestionSentiment(question: QuestionAnalytics, topOption?: OptionAnalytics) {
  if (!question.answered || !topOption) {
    return question.answered && question.type === 'text'
      ? 'Open-ended feedback is ready for review.'
      : 'No response distribution is available yet.'
  }

  if (question.allowMultiple) return 'Multiple selections are allowed. Percentages may total more than 100%.'
  const sorted = [...question.options].sort((a, b) => b.count - a.count)
  const gap = sorted.length > 1 ? sorted[0].count - sorted[1].count : 0
  if (sorted.length < 2) return 'Only one choice is available for this question.'
  if (gap === 0) return 'The leading choices are tied. No single choice is ahead.'
  return `The leading choice is ahead by ${gap} ${gap === 1 ? 'vote' : 'votes'}. Based on ${question.answered} responses so far.`
}

function MetricCard({
  icon: Icon,
  label,
  value,
  tone,
  delay,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
  tone: 'primary' | 'accent' | 'secondary' | 'blue'
  delay: number
}) {
  return (
    <Card className={`metric-card analytics-metric-card analytics-metric-${tone}`} style={{ animationDelay: `${delay}ms` }}>
      <CardContent>
        <div className="analytics-metric-icon">
          <Icon className="size-5" />
        </div>
        <div>
          <div className="analytics-metric-value">{value}</div>
          <TypographySmall>{label}</TypographySmall>
        </div>
      </CardContent>
    </Card>
  )
}

function OptionChart({ options }: { options: OptionAnalytics[] }) {
  const chartData = options.map((opt) => ({
    name: opt.label,
    responses: opt.count,
    percent: opt.percent,
  }))

  return (
    <div className="analytics-chart-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 12, right: 8, left: -22, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 8" stroke="rgba(255,255,255,0.12)" vertical={false} />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#aebccd', fontSize: 11, fontWeight: 700 }}
            interval={0}
            tickFormatter={(value: string) => value.length > 14 ? `${value.slice(0, 12)}…` : value}
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: '#aebccd', fontSize: 11 }} allowDecimals={false} />
          <Tooltip cursor={{ fill: 'rgba(45, 212, 191, 0.08)' }} content={<AnalyticsTooltip />} />
          <Bar dataKey="responses" radius={[8, 8, 3, 3]} isAnimationActive={false}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function AnalyticsTooltip({ active, payload, label }: { active?: boolean; payload?: ReadonlyArray<{ payload?: { responses: number; percent: number } }>; label?: string | number }) {
  if (!active || !payload?.length) {
    return null
  }

  const data = payload[0].payload
  if (!data) return null

  return (
    <div className="analytics-tooltip">
      <strong>{label}</strong>
      <span>{data.responses} responses</span>
      <small>{formatPercentage(data.percent)}</small>
    </div>
  )
}
