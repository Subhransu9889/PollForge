import type { Analytics } from '../types/index'

export type PollExport = { id: string; title: string; analytics: Analytics }

export function buildPollCsv(polls: PollExport[]) {
  const rows: (string | number)[][] = [['Poll ID', 'Poll title', 'Question', 'Option', 'Votes', 'Percent', 'Answered', 'Skipped']]
  for (const poll of polls) {
    for (const question of poll.analytics.questions) {
      const prefix = [poll.id, poll.title, question.text]
      if (question.type === 'choice' && question.options.length) {
        for (const option of question.options) rows.push([...prefix, option.label, option.count, option.percent, question.answered, question.skipped])
      } else {
        rows.push([...prefix, question.type === 'text' ? 'Text question (aggregate only)' : 'No options', '', '', question.answered, question.skipped])
      }
    }
  }
  return '\uFEFF' + rows.map(row => row.map(value => {
    const text = String(value)
    const safe = /^\s*[=+@-]/.test(text) || /^[\t\r\n]/.test(text) ? "'" + text : text
    return `"${safe.replaceAll('"', '""')}"`
  }).join(',')).join('\r\n')
}

export function downloadPollCsv(polls: PollExport[], filename: string) {
  const url = URL.createObjectURL(new Blob([buildPollCsv(polls)], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
