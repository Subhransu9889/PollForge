import { z } from 'zod'
import type { Poll } from '../types/index'
import type { CreatePollFormData } from './validation'

export const FIXED_TITLE = '✨ Thank you for testing PollForge!'
export const draftKey = (userId: string) => `pollforge:draft:v1:${userId}`
export const localDateTime = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)

// Drafts deliberately accept incomplete fields and expired dates.
const draftValues = z.object({
  title: z.string(), description: z.string(), responseMode: z.enum(['anonymous', 'authenticated']),
  thankYouMessage: z.string(), expiresAt: z.string(),
  questions: z.array(z.object({
    text: z.string(), type: z.enum(['choice', 'text']), required: z.boolean(), allowMultiple: z.boolean().optional(),
    options: z.array(z.object({ label: z.string() })),
  })),
})
const draftSchema = z.object({ version: z.literal(1), savedAt: z.string(), values: draftValues })

export function parseDraft(raw: string | null): { values: CreatePollFormData; savedAt: string } | null {
  if (!raw) return null
  const result = draftSchema.safeParse(JSON.parse(raw))
  if (!result.success) throw new Error('Saved draft could not be restored.')
  return { values: { ...result.data.values, thankYouTitle: FIXED_TITLE }, savedAt: result.data.savedAt }
}

export function duplicatePoll(poll: Poll): CreatePollFormData {
  return {
    title: `${poll.title.slice(0, 153)} (copy)`, description: poll.description,
    responseMode: poll.responseMode, thankYouTitle: FIXED_TITLE, thankYouMessage: poll.thankYouMessage,
    expiresAt: localDateTime(new Date(Date.now() + 86400000)),
    questions: poll.questions.map(question => ({
      text: question.text, type: question.type, required: question.required, allowMultiple: question.allowMultiple,
      options: question.options.map(option => ({ label: option.label })),
    })),
  }
}
