import { z } from 'zod'

export const emailSchema = z.string().email('Please enter a valid email address')

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')

export const optionSchema = z.object({
  label: z.string().min(1, 'Option cannot be empty'),
})

export const questionSchema = z.object({
  text: z.string().min(3, 'Question must be at least 3 characters'),
  type: z.enum(['choice', 'text']),
  required: z.boolean(),
  options: z.array(optionSchema).max(8, 'Maximum 8 options allowed'),
}).superRefine((question, ctx) => {
  if (question.type === 'choice' && question.options.length < 2) {
    ctx.addIssue({
      code: 'custom',
      path: ['options'],
      message: 'At least 2 options are required',
    })
  }
})

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: emailSchema,
  password: passwordSchema,
})

export const createPollSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(160),
  description: z.string().max(500, 'Description must be 500 characters or less'),
  responseMode: z.enum(['anonymous', 'authenticated']),
  thankYouTitle: z.string().min(1, 'Popup title is required').max(120, 'Popup title must be 120 characters or less'),
  thankYouMessage: z.string().min(1, 'Popup message is required').max(400, 'Popup message must be 400 characters or less'),
  expiresAt: z
    .string()
    .min(1, 'Expiration is required')
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: 'Please choose a valid expiration date and time',
    })
    .refine((value) => new Date(value).getTime() > Date.now(), {
      message: 'Expiration must be in the future',
    }),
  questions: z
    .array(questionSchema)
    .min(1, 'At least one question is required')
    .max(20, 'Maximum 20 questions allowed'),
})

export const submitResponseSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      optionId: z.string().optional(),
      text: z.string().optional(),
    })
  ),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type CreatePollFormData = z.infer<typeof createPollSchema>
export type SubmitResponseFormData = z.infer<typeof submitResponseSchema>
