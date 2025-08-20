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

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${++toastCounter}`
    const newToast: ToastMessage = {
      ...toast,
      id,
      life: toast.life || 3000
    }

    setToasts(prev => [...prev, newToast])

    // Auto-remove toast after the specified life duration
    if (newToast.life && newToast.life > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, newToast.life)
    }

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