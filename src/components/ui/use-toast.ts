import { ref } from 'vue'

export type ToastVariant = 'default' | 'destructive' | 'success'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  open: boolean
}

const toasts = ref<Toast[]>([])

let toastIdCounter = 0

export function useToast() {
  const addToast = (toast: Omit<Toast, 'id' | 'open'>, duration = 5000) => {
    const id = `toast-${++toastIdCounter}`
    const newToast: Toast = {
      ...toast,
      id,
      open: true,
    }
    
    toasts.value.push(newToast)
    
    // Auto-remove after specified duration
    setTimeout(() => {
      removeToast(id)
    }, duration)
    
    return id
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index !== -1) {
      toasts.value[index].open = false
      // Remove from array after animation
      setTimeout(() => {
        const currentIndex = toasts.value.findIndex(toast => toast.id === id)
        if (currentIndex !== -1) {
          toasts.value.splice(currentIndex, 1)
        }
      }, 200)
    }
  }

  const toast = (toast: Omit<Toast, 'id' | 'open'>) => addToast(toast)

  // Convenience methods matching PrimeVue API
  toast.success = (title: string, description?: string) =>
    addToast({ title, description, variant: 'success' })
  
  toast.error = (title: string, description?: string) =>
    addToast({ title, description, variant: 'destructive' })

  toast.add = (options: { severity: string; summary: string; detail?: string; life?: number }) => {
    const variant = options.severity === 'success' ? 'success' : 
                   options.severity === 'error' ? 'destructive' : 'default'
    const duration = options.life || 5000
    addToast({
      title: options.summary,
      description: options.detail,
      variant,
    }, duration)
  }

  return {
    toasts,
    toast,
    addToast,
    removeToast,
  }
}