import React from 'react'

interface LoadingSpinnerProps {
  message?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="loading-container flex flex-col items-center justify-center gap-3 p-6">
      <div className="relative">
        <div className="loading-spinner w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        <div className="loading-pulse absolute -top-1.5 -left-1.5 w-11 h-11 border border-blue-500/20 rounded-full animate-pulse"></div>
      </div>
      {message && (
        <div className="text-center">
          <p className="text-sm text-gray-600 font-medium">{message}</p>
          <div className="loading-dots mt-2 flex gap-1 justify-center items-center">
            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '-0.32s' }}></span>
            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '-0.16s' }}></span>
            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoadingSpinner