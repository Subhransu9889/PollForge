import { useForm } from 'react-hook-form'
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
  required: true,
  options: [{ label: '' }, { label: '' }],
})

export function PollBuilder({ onSubmit, isLoading }: PollBuilderProps) {
  const form = useForm<CreatePollFormData>({
    resolver: zodResolver(createPollSchema),
    defaultValues: {
      title: '',
      description: '',
      responseMode: 'anonymous' as const,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      questions: [blankQuestion()],
    },
  } as any)

  const questions = form.watch('questions')

  const handleSubmit = async (data: any) => {
    try {
      await onSubmit(data as CreatePollFormData)
      form.reset()
    } catch (error) {
      // Error is handled by parent
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
              render={({ field }: any) => (
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
              render={({ field }: any) => (
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

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="responseMode"
                render={({ field }: any) => (
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
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel className="inline-flex items-center gap-1.5">
                      <CalendarClock className="size-3.5" />
                      Expiration
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
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
          <div className="flex items-center justify-between">
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

        <div className="flex gap-2">
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
