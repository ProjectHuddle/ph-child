import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ErrorNoticeProps {
  message?: string
  dismissible?: boolean
  onDismiss?: () => void
}

const ErrorNotice: React.FC<ErrorNoticeProps> = ({ message, dismissible, onDismiss }) => {
  if (!message) return null

  return (
    <div
      className="error-notice flex items-start gap-3 p-3 bg-red-50/80 border border-red-200/60 rounded-lg shadow-sm animate-shake"
      role="alert"
    >
      <div className="flex-shrink-0">
        <AlertTriangle className="w-4 h-4 text-red-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-red-800">{message}</p>
      </div>
      {dismissible && (
        <div className="flex-shrink-0">
          <button
            type="button"
            className="inline-flex rounded-md bg-red-50/50 p-1 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-1 transition-colors"
            onClick={onDismiss}
          >
            <span className="sr-only">Dismiss</span>
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}

export default ErrorNotice