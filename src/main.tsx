import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './assets/tailwind.css'

// Wait for DOM to be ready
function initApp() {
  const container = document.getElementById('surefeedback-dashboard-app')
  if (!container) return
  try {
    const root = createRoot(container)
    root.render(<App />)
  } catch (error) {
    console.error('SureFeedback Admin: Failed to initialize app', error)
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp)
} else {
  initApp()
}
