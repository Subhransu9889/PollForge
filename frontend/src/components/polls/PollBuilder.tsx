import { useForm } from 'react-hook-form'
import type { ControllerRenderProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createPollSchema } from '@/utils/validation'
import type { CreatePollFormData } from '@/utils/validation'
import type { Question } from '@/types'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { QuestionEditor } from './QuestionEditor'
import { CalendarClock, Loader, Plus, Wand2 } from 'lucide-react'

interface PollBuilderProps {
  onSubmit: (data: CreatePollFormData) => Promise<void>
  isLoading?: boolean
}

const blankQuestion = (): Question => ({
  text: '',
  type: 'choice',
  required: true,
  allowMultiple: false,
  options: [{ label: '' }, { label: '' }],
})

const toLocalDateTimeInputValue = (date: Date) => {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000)
  return offsetDate.toISOString().slice(0, 16)
}

const defaultFormValues = (): CreatePollFormData => ({
  title: '',
  description: '',
  responseMode: 'anonymous',
  thankYouTitle: '✨ Thank you for testing PollForge!',
  thankYouMessage: 'Your feedback helps us improve the experience and build better features for everyone.',
  expiresAt: toLocalDateTimeInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000)),
  questions: [blankQuestion()],
})

type PollField<TName extends keyof CreatePollFormData> = ControllerRenderProps<CreatePollFormData, TName>

export function PollBuilder({ onSubmit, isLoading }: PollBuilderProps) {
  const form = useForm<CreatePollFormData>({
    resolver: zodResolver(createPollSchema),
    defaultValues: defaultFormValues(),
  })

  const questions = form.watch('questions')

  const handleSubmit = async (data: CreatePollFormData) => {
    try {
      await onSubmit(data)
      form.reset(defaultFormValues())
    } catch {
      // Error is handled by parent
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="poll-builder-form">
        <Card>
          <CardHeader className="dashboard-card-head">
            <div>
              <p className="eyebrow">Builder</p>
              <CardTitle>Create New Poll</CardTitle>
            </div>
            <Wand2 className="size-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }: { field: PollField<'title'> }) => (
                <FormItem>
                  <FormLabel>Poll Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What would you like to ask?"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }: { field: PollField<'description'> }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add context or instructions for respondents"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="builder-field-grid">
              <FormField
                control={form.control}
                name="responseMode"
                render={({ field }: { field: PollField<'responseMode'> }) => (
                  <FormItem>
                    <FormLabel>Response Mode</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger disabled={isLoading}>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="anonymous">Anonymous</SelectItem>
                        <SelectItem value="authenticated">Authenticated</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }: { field: PollField<'expiresAt'> }) => (
                  <FormItem>
                    <FormLabel className="inline-flex items-center gap-1.5">
                      <CalendarClock className="size-3.5" />
                      Expiration
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        min={toLocalDateTimeInputValue(new Date())}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="builder-field-grid">
              <FormField
                control={form.control}
                name="thankYouTitle"
                render={({ field }: { field: PollField<'thankYouTitle'> }) => (
                  <FormItem>
                    <FormLabel>Popup Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="✨ Thank you for testing PollForge!"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thankYouMessage"
                render={({ field }: { field: PollField<'thankYouMessage'> }) => (
                  <FormItem>
                    <FormLabel>Popup Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Your feedback helps us improve the experience and build better features for everyone."
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <div className="builder-section-head">
            <h3 className="font-semibold">Questions</h3>
            <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">
              {questions.length} {questions.length === 1 ? 'question' : 'questions'}
            </span>
          </div>
          {questions.map((question, index) => (
            <QuestionEditor
              key={index}
              question={question}
              index={index}
              onChange={(updated) => {
                const newQuestions = [...questions]
                newQuestions[index] = updated
                form.setValue('questions', newQuestions)
              }}
              onRemove={() => {
                const newQuestions = questions.filter((_, i) => i !== index)
                form.setValue('questions', newQuestions)
              }}
            />
          ))}
        </div>

        <div className="builder-actions">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.setValue('questions', [...questions, blankQuestion()])
            }}
            disabled={isLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading || questions.length === 0} size="lg">
          {isLoading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
          Create Poll
        </Button>
      </form>
    </Form>
  )
}
