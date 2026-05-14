import { useState } from 'react'
import type { Poll } from '@/types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { TypographyH3, TypographySmall } from '@/components/ui/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader } from 'lucide-react'

interface ResponseFormProps {
  poll: Poll
  onSubmit: (answers: Record<string, string | string[]>) => Promise<void>
  isLoading?: boolean
}

export function ResponseForm({ poll, onSubmit, isLoading }: ResponseFormProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [error, setError] = useState<string | null>(null)

  const hasAnswer = (questionId: string) => {
    const answer = answers[questionId]
    return Array.isArray(answer) ? answer.length > 0 : Boolean(answer?.trim())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const missing = poll.questions.find((q) => q.required && !hasAnswer(q.id!))
    if (missing) {
      setError(`Please answer: ${missing.text}`)
      return
    }

    try {
      await onSubmit(answers)
      setAnswers({})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit response')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {poll.questions.map((question, index) => (
          <Card key={question.id}>
            <CardContent className="pt-6 space-y-3">
              <div>
                <TypographyH3>{index + 1}. {question.text}</TypographyH3>
                {!question.required && (
                  <TypographySmall className="text-secondary">Optional</TypographySmall>
                )}
              </div>

              {question.type === 'text' ? (
                <Textarea
                  value={answers[question.id!] || ''}
                  maxLength={1000}
                  placeholder="Share your feedback anonymously"
                  onChange={(event) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [question.id!]: event.target.value,
                    }))
                  }
                />
              ) : (
                question.allowMultiple ? (
                  <div className="space-y-2">
                    {question.options.map((option) => {
                      const selectedOptions = Array.isArray(answers[question.id!])
                        ? answers[question.id!] as string[]
                        : []

                      return (
                        <div key={option.id} className="flex items-center space-x-3 rounded-lg border border-border bg-white/[0.035] px-3 py-2.5">
                          <Checkbox
                            id={option.id}
                            checked={selectedOptions.includes(option.id!)}
                            onCheckedChange={(checked: boolean) =>
                              setAnswers((prev) => {
                                const current = Array.isArray(prev[question.id!])
                                  ? prev[question.id!] as string[]
                                  : []
                                const next = checked
                                  ? [...current, option.id!]
                                  : current.filter((id) => id !== option.id)

                                return {
                                  ...prev,
                                  [question.id!]: next,
                                }
                              })
                            }
                          />
                          <Label htmlFor={option.id} className="flex-1 cursor-pointer text-sm leading-6 text-foreground">
                            {option.label}
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <RadioGroup
                    value={typeof answers[question.id!] === 'string' ? answers[question.id!] as string : ''}
                    onValueChange={(value) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [question.id!]: value,
                      }))
                    }
                  >
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <div key={option.id} className="flex items-center space-x-3 rounded-lg border border-border bg-white/[0.035] px-3 py-2.5">
                          <RadioGroupItem value={option.id!} id={option.id} />
                          <Label htmlFor={option.id} className="flex-1 cursor-pointer text-sm leading-6 text-foreground">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
        size="lg"
      >
        {isLoading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
        Submit Feedback
      </Button>
    </form>
  )
}
