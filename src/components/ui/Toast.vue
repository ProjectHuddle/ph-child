<template>
  <ToastProvider>
    <ToastRoot
      v-for="toast in toasts"
      :key="toast.id"
      v-model:open="toast.open"
      :class="cn(
        'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all data-[state=open]:animate-toast-slide-in data-[state=closed]:animate-toast-slide-out',
        toastVariants({ variant: toast.variant })
      )"
      @open-change="(open: boolean) => !open && removeToast(toast.id)"
    >
      <div class="grid gap-1 flex-1">
        <ToastTitle v-if="toast.title" class="text-sm font-semibold">
          {{ toast.title }}
        </ToastTitle>
        <ToastDescription v-if="toast.description" class="text-sm opacity-90">
          {{ toast.description }}
        </ToastDescription>
      </div>
      <ToastClose class="ml-2 opacity-70 hover:opacity-100">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </ToastClose>
    </ToastRoot>
    <ToastViewport class="toast-viewport" data-position="bottom-right" />
  </ToastProvider>
</template>

<script setup lang="ts">
import {
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport,
} from 'radix-vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useToast } from './use-toast'

const toastVariants = cva(
  'w-full max-w-sm',
  {
    variants: {
      variant: {
        default: 'bg-white border border-gray-200 text-gray-900',
        destructive: 'bg-red-50 border border-red-200 text-red-900',
        success: 'bg-green-50 border border-green-200 text-green-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type ToastVariants = VariantProps<typeof toastVariants>

const { toasts, removeToast } = useToast()
</script>