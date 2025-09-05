import { useState, useCallback } from 'react'

export interface ToastMessage {
  id?: string
  severity: 'success' | 'error' | 'warning' | 'info'
  summary: string
  detail: string
  life?: number
}

let toastCounter = 0

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = `toast-${++toastCounter}`
    const newToast: ToastMessage = {
      id,
      severity: type,
      summary: message,
      detail: '',
      life: 3000
    }

    setToasts(prev => [...prev, newToast])

    // Auto-remove toast after the specified life duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  return {
    toasts,
    showToast,
    removeToast,
    clearToasts
  }
}