export type User = {
  id: string
  firstName?: string
  lastName?: string
  email: string
  name?: string
}

export type Option = {
  id?: string
  label: string
}

export type Question = {
  id?: string
  text: string
  type: 'choice' | 'text'
  required: boolean
  options: Option[]
}

export type Poll = {
  id: string
  title: string
  description: string
  responseMode: 'anonymous' | 'authenticated'
  thankYouTitle: string
  thankYouMessage: string
  expiresAt: string
  isExpired: boolean
  isPublished: boolean
  totalResponses?: number
  questions: Question[]
}

export type Analytics = {
  totalResponses: number
  participation: {
    authenticatedResponses: number
    anonymousResponses: number
    completionRate: number
  }
  questions: Array<{
    id: string
    text: string
    type: 'choice' | 'text'
    answered: number
    skipped: number
    textResponses?: string[]
    options: Array<{
      id: string
      label: string
      count: number
      percent: number
    }>
  }>
}

export type PollBuilderForm = {
  title: string
  description: string
  responseMode: 'anonymous' | 'authenticated'
  thankYouTitle: string
  thankYouMessage: string
  expiresAt: string
  questions: Question[]
}

export type ResponseForm = {
  answers: Array<{
    questionId: string
    optionId?: string
    text?: string
  }>
}
