import type { Analytics } from '@/types'
import type { ComponentType } from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TypographySmall } from '@/components/ui/typography'
import { formatPercentage } from '@/utils/formatting'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import {
  Activity,
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
  const averageAnswered = analytics.questions.length ? Math.round(totalAnswered / analytics.questions.length) : 0
  const strongestOption = analytics.questions
    .flatMap((question) => question.options.map((option) => ({ ...option, question: question.text })))
    .sort((a, b) => b.percent - a.percent)[0]

  return (
    <div className="analytics-suite">
      {!questionsOnly && (
        <>
          <div className="analytics-hero-panel">
            <div className="analytics-hero-copy">
              <div className="analytics-live-pill">
                <Activity className="size-3.5" />
                Live analysis
              </div>
              <h3>{analytics.totalResponses ? 'Response intelligence is active' : 'Ready for the first signal'}</h3>
              <p>
                {strongestOption
                  ? `${strongestOption.label} is leading with ${formatPercentage(strongestOption.percent)} of its question.`
                  : 'Share this poll and the result stream will animate as answers arrive.'}
              </p>
            </div>
            <div className="analytics-orbit" aria-hidden="true">
              <span />
              <span />
              <span />
              <i />
            </div>
          </div>

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
              label="Avg. Answered"
              value={averageAnswered.toLocaleString()}
              tone="blue"
              delay={240}
            />
          </div>

          <div className="analytics-insight-strip">
            <div>
              <TrendingUp className="size-4 text-primary" />
              <span>{analytics.questions.length} questions tracked</span>
            </div>
            <div>
              <CircleCheck className="size-4 text-accent" />
              <span>{totalAnswered.toLocaleString()} answers captured</span>
            </div>
            <div>
              <Activity className="size-4 text-secondary" />
              <span>{totalSkipped.toLocaleString()} skipped</span>
            </div>
          </div>
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
  const [isOpen, setIsOpen] = useState(false)
  const total = question.answered + question.skipped
  const engagement = total ? (question.answered / total) * 100 : 0
  const topOption = [...question.options].sort((a, b) => b.count - a.count)[0]
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
        <CardContent className="space-y-4">
          <div className="analytics-summary-grid">
            <div>
              <Sparkles className="size-4 text-primary" />
              <span>AI summary</span>
              <p>{summary}</p>
            </div>
            <div>
              <TrendingUp className="size-4 text-secondary" />
              <span>Sentiment</span>
              <p>{sentiment}</p>
            </div>
          </div>

          <div className="analytics-option-list">
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
                      width: `${Math.max(option.percent, option.count ? 3 : 0)}%`,
                      background: `linear-gradient(90deg, ${chartColors[optionIndex % chartColors.length]}, rgba(255,255,255,0.86))`,
                      animationDelay: `${optionIndex * 120}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {question.options.length > 0 && (
            <OptionChart options={question.options} />
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

function getQuestionSummary(question: QuestionAnalytics, topOption?: OptionAnalytics) {
  if (!question.answered) {
    return 'No responses have been recorded for this question yet.'
  }

  if (!topOption) {
    return `${question.answered.toLocaleString()} responses were recorded.`
  }

  return `${topOption.label} leads with ${formatPercentage(topOption.percent)} across ${question.answered.toLocaleString()} responses.`
}

function getQuestionSentiment(question: QuestionAnalytics, topOption?: OptionAnalytics) {
  if (!question.answered || !topOption) {
    return 'Waiting for enough responses to read the signal.'
  }

  if (topOption.percent >= 65) {
    return 'Strong consensus around the leading choice.'
  }

  if (topOption.percent >= 40) {
    return 'Moderate preference, with room for mixed opinions.'
  }

  return 'Responses are distributed, so the audience is split.'
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
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: '#aebccd', fontSize: 11 }} allowDecimals={false} />
          <Tooltip cursor={{ fill: 'rgba(45, 212, 191, 0.08)' }} content={<AnalyticsTooltip />} />
          <Bar dataKey="responses" radius={[8, 8, 3, 3]} animationDuration={900}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function AnalyticsTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) {
    return null
  }

  const data = payload[0].payload

  return (
    <div className="analytics-tooltip">
      <strong>{label}</strong>
      <span>{data.responses} responses</span>
      <small>{formatPercentage(data.percent)}</small>
    </div>
  )
}
