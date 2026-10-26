import { test, expect } from '@playwright/test'
import jsQR from 'jsqr'

const poll = {
  id: 'poll-one', title: 'Team direction', description: 'Choose the next step', responseMode: 'anonymous',
  thankYouTitle: 'Fixed title', thankYouMessage: 'Thanks for sharing your thoughts.', expiresAt: '2020-01-01T00:00:00Z',
  isExpired: true, isPublished: false, totalResponses: 2,
  questions: [{ id: 'question-old', text: 'What should we build?', type: 'choice', required: true, allowMultiple: false, options: [{ id: 'old-a', label: 'First option' }, { id: 'old-b', label: 'Second option' }] }],
}
const analytics = { totalResponses: 2, participation: { anonymousResponses: 2, authenticatedResponses: 0, completionRate: 100 }, questions: [{ ...poll.questions[0], answered: 2, skipped: 0, options: poll.questions[0].options.map(option => ({ ...option, count: 1, percent: 50 })) }] }

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('pollforge_user')) {
      localStorage.setItem('pollforge_token', 'test-token')
      localStorage.setItem('pollforge_user', JSON.stringify({ id: 'user-one', firstName: 'Taylor', email: 'taylor@example.com' }))
    }
  })
  await page.route('**/api/polls/mine', route => route.fulfill({ json: { polls: [poll] } }))
  await page.route('**/api/polls/*/analytics', route => route.fulfill({ json: { analytics } }))
  await page.goto('/dashboard')
})

test('draft restores incomplete inputs and question changes, and isolates users', async ({ page }) => {
  await page.getByRole('button', { name: 'Create poll', exact: true }).click()
  await page.getByLabel('Poll Title', { exact: true }).fill('Unfinished draft')
  await page.getByPlaceholder('Question 1', { exact: true }).fill('Saved question')
  await expect(page.getByText('Draft saved on this device')).toBeVisible()
  await page.reload()
  await page.getByRole('button', { name: 'Create poll', exact: true }).click()
  await expect(page.getByLabel('Poll Title', { exact: true })).toHaveValue('Unfinished draft')
  await expect(page.getByPlaceholder('Question 1', { exact: true })).toHaveValue('Saved question')
  await page.evaluate(() => localStorage.setItem('pollforge_user', JSON.stringify({ id: 'user-two', email: 'other@example.com' })))
  await page.reload()
  await page.getByRole('button', { name: 'Create poll', exact: true }).click()
  await expect(page.getByLabel('Poll Title', { exact: true })).toHaveValue('')
})

test('duplicate strips identities, refreshes expiry, retains draft on failure and clears on success', async ({ page }) => {
  page.on('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: 'Duplicate poll' }).click()
  await expect(page.getByLabel('Poll Title', { exact: true })).toHaveValue('Team direction (copy)')
  await expect(page.getByText('Draft saved on this device')).toBeVisible()
  const draft = await page.evaluate(() => JSON.parse(localStorage.getItem('pollforge:draft:v1:user-one')!).values)
  expect(draft.questions[0].id).toBeUndefined()
  expect(draft.questions[0].options[0].id).toBeUndefined()
  expect(new Date(draft.expiresAt).getTime()).toBeGreaterThan(Date.now())
  await page.route('**/api/polls', route => route.fulfill({ status: 500, json: { message: 'Test save failed' } }))
  await page.getByRole('button', { name: 'Create Poll', exact: true }).last().click()
  await expect(page.getByText('Test save failed', { exact: true })).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('pollforge:draft:v1:user-one'))).not.toBeNull()
  await page.route('**/api/polls', route => route.fulfill({ json: { poll: { ...poll, id: 'new-poll' } } }))
  await page.getByRole('button', { name: 'Create Poll', exact: true }).last().click()
  await expect(page.getByText('Poll created successfully!')).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('pollforge:draft:v1:user-one'))).toBeNull()
  await page.getByRole('button', { name: 'Create poll', exact: true }).click()
  await expect(page.getByLabel('Poll Title', { exact: true })).toHaveValue('')
})

test('QR decodes to selected poll and downloads on mobile without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Share QR code' }).click()
  const img = page.getByRole('img', { name: 'QR code linking to Team direction' })
  await expect(img).toBeVisible()
  const pixels = await img.evaluate(async (element: HTMLImageElement) => {
    await element.decode()
    const canvas = document.createElement('canvas')
    canvas.width = element.naturalWidth
    canvas.height = element.naturalHeight
    const context = canvas.getContext('2d')!
    context.drawImage(element, 0, 0)
    return { data: Array.from(context.getImageData(0, 0, canvas.width, canvas.height).data), width: canvas.width, height: canvas.height }
  })
  expect(jsQR(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height)?.data).toBe('http://127.0.0.1:4173/p/poll-one')
  const download = page.waitForEvent('download')
  await page.getByRole('link', { name: 'Download QR image' }).click()
  expect((await download).suggestedFilename()).toBe('pollforge-poll-one-qr.png')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('storage failure is visible without blocking the builder', async ({ page }) => {
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('Quota exceeded', 'QuotaExceededError') } })
  await page.getByRole('button', { name: 'Create poll', exact: true }).click()
  await page.getByLabel('Poll Title', { exact: true }).fill('Still editable')
  await expect(page.getByText(/Draft could not be saved/)).toBeVisible()
  await expect(page.getByLabel('Poll Title', { exact: true })).toHaveValue('Still editable')
})


test('discard clears the draft and immediate reload flushes pending changes', async ({ page }) => {
  await page.getByRole('button', { name: 'Create poll', exact: true }).click()
  await page.getByLabel('Poll Title', { exact: true }).fill('Last moment edit')
  await page.reload()
  await page.getByRole('button', { name: 'Create poll', exact: true }).click()
  await expect(page.getByLabel('Poll Title', { exact: true })).toHaveValue('Last moment edit')
  page.once('dialog', dialog => dialog.dismiss())
  await page.getByRole('button', { name: 'Discard draft' }).click()
  await expect(page.getByLabel('Poll Title', { exact: true })).toHaveValue('Last moment edit')
  page.once('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: 'Discard draft' }).click()
  await page.reload()
  await page.getByRole('button', { name: 'Create poll', exact: true }).click()
  await expect(page.getByLabel('Poll Title', { exact: true })).toHaveValue('')
})

test('malformed saved draft does not crash the builder', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('pollforge:draft:v1:user-one', '{bad json'))
  await page.reload()
  await page.getByRole('button', { name: 'Create poll', exact: true }).click()
  await expect(page.getByText(/Saved draft unavailable/)).toBeVisible()
  await page.getByLabel('Poll Title', { exact: true }).fill('Recovered draft')
  await expect(page.getByText('Draft saved on this device')).toBeVisible()
})
