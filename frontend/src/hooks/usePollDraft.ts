import { useEffect, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { CreatePollFormData } from '@/utils/validation'
import { draftKey } from '@/utils/pollDraft'

export function usePollDraft(form: UseFormReturn<CreatePollFormData>, userId: string, initialStatus: string, seed?: CreatePollFormData) {
  const [status, setStatus] = useState(initialStatus)
  const key = draftKey(userId)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    let pending: CreatePollFormData | null = seed ?? null
    let mounted = true
    const save = () => {
      clearTimeout(timer)
      if (!pending) return
      try {
        localStorage.setItem(key, JSON.stringify({ version: 1, savedAt: new Date().toISOString(), values: pending }))
        pending = null
        if (mounted) setStatus('Draft saved on this device')
      } catch {
        if (mounted) setStatus('Draft could not be saved. Keep this page open and retry after freeing browser storage.')
      }
    }
    if (pending) save()
    const subscription = form.watch((_values, event) => {
      clearTimeout(timer)
      // reset() clears the saved draft; it must not persist the blank form.
      if (!event.name) { pending = null; return }
      pending = form.getValues()
      setStatus('Saving draft…')
      timer = setTimeout(save, 500)
    })
    const onVisibility = () => { if (document.visibilityState === 'hidden') save() }
    window.addEventListener('pagehide', save)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      mounted = false
      subscription.unsubscribe()
      save()
      window.removeEventListener('pagehide', save)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [form, key, seed])

  const clearDraft = () => {
    try {
      localStorage.removeItem(key)
      setStatus('No saved draft')
    } catch {
      setStatus('Could not remove the saved draft from browser storage.')
    }
  }
  return { status, clearDraft }
}
