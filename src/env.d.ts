/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Extend the global Window interface
interface SureFeedbackAdmin {
  rest_url: string
  rest_nonce: string
  admin_url: string
  disconnect_nonce: string
  showWhiteLabel?: boolean
}

interface WordPressI18n {
  __: (text: string, domain?: string) => string
}

interface WordPressGlobal {
  i18n?: WordPressI18n
}

declare global {
  interface Window {
    wp?: WordPressGlobal
    sureFeedbackAdmin?: SureFeedbackAdmin
  }
}

export {}