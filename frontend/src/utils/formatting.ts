import { format, formatDistanceToNow, isPast } from 'date-fns'

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy')
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy HH:mm')
}

export function formatTimeRemaining(date: string | Date): string {
  const dateObj = new Date(date)
  if (isPast(dateObj)) {
    return 'Expired'
  }
  return `Expires ${formatDistanceToNow(dateObj, { addSuffix: true })}`
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`
}

export function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

export function getUserDisplayName(firstName?: string, lastName?: string, email?: string): string {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`
  }
  if (firstName) {
    return firstName
  }
  return email?.split('@')[0] || 'User'
}

export function formatPollTitle(title: string, maxLength = 50): string {
  if (title.length <= maxLength) {
    return title
  }
  return `${title.substring(0, maxLength)}...`
}
