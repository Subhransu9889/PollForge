export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export const STORAGE_KEYS = {
  TOKEN: 'pollforge_token',
  USER: 'pollforge_user',
} as const

export const POLL_STATUS = {
  ACCEPTING: 'Accepting responses',
  EXPIRED: 'Expired',
  PUBLISHED: 'Results published',
} as const

export const RESPONSE_MODES = {
  ANONYMOUS: 'anonymous',
  AUTHENTICATED: 'authenticated',
} as const

export const ERROR_MESSAGES = {
  REQUIRED_FIELD: (fieldName: string) => `${fieldName} is required`,
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters',
  ANSWER_REQUIRED: (questionText: string) => `Please answer: ${questionText}`,
  POLL_NOT_FOUND: 'Poll not found',
  UNAUTHORIZED: 'Please sign in to perform this action',
  SUBMISSION_FAILED: 'Could not submit your response. Please try again.',
  CREATION_FAILED: 'Could not create poll. Please try again.',
  SIGN_IN_FAILED: 'Authentication failed. Please check your credentials.',
} as const

export const SUCCESS_MESSAGES = {
  SIGN_IN: 'Signed in successfully.',
  POLL_CREATED: 'Poll created. Share the public link when you are ready.',
  RESPONSE_SUBMITTED: 'Thanks, your feedback was submitted.',
  RESULTS_PUBLISHED: 'Final results published on the same public link.',
} as const
