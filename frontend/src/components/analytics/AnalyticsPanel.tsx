import type { Analytics } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TypographySmall } from '@/components/ui/typography'
import { Progress } from '@/components/ui/progress'
import { formatPercentage } from '@/utils/formatting'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { CircleCheck, MessageSquareText, UserRound } from 'lucide-react'

interface AnalyticsPanelProps {
  analytics: Analytics
}

export function AnalyticsPanel({ analytics }: AnalyticsPanelProps) {
  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="metric-card">
          <CardContent className="pt-6 text-center">
            <MessageSquareText className="mx-auto mb-2 size-5 text-primary" />
            <div className="text-3xl font-bold text-primary">{analytics.totalResponses}</div>
            <TypographySmall className="text-center">Total Responses</TypographySmall>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardContent className="pt-6 text-center">
            <CircleCheck className="mx-auto mb-2 size-5 text-accent" />
            <div className="text-3xl font-bold text-accent">
              {formatPercentage(analytics.participation.completionRate)}
            </div>
            <TypographySmall className="text-center">Completion Rate</TypographySmall>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardContent className="pt-6 text-center">
            <UserRound className="mx-auto mb-2 size-5 text-secondary" />
            <div className="text-3xl font-bold text-secondary">
              {analytics.participation.anonymousResponses}
            </div>
            <TypographySmall className="text-center">Anonymous</TypographySmall>
          </CardContent>
        </Card>
      </div>

      {/* Question Results */}
      <div className="space-y-4">
        {analytics.questions.map((question) => (
          <Card key={question.id} className="result-card">
            <CardHeader>
              <CardTitle className="text-lg">{question.text}</CardTitle>
              <TypographySmall>
                {question.answered} answered • {question.skipped} skipped
              </TypographySmall>
            </CardHeader>
            <CardContent className="space-y-3">
              {question.options.map((option) => (
                <div key={option.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{option.label}</span>
                    <span className="text-sm font-semibold">
                      {option.count} ({formatPercentage(option.percent)})
                    </span>
                  </div>
                  <Progress
                    value={option.percent}
                    className="h-2"
                  />
                </div>
              ))}

              {question.options.length > 0 && (
                <OptionChart options={question.options} />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function OptionChart({ options }: { options: any[] }) {
  const chartData = options.map((opt) => ({
    name: opt.label,
    responses: opt.count,
  }))

  return (
    <div className="mt-4 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="responses" fill="#2dd4bf" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
