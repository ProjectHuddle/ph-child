import React from 'react'
import { createRoot } from 'react-dom/client'
import Dashboard from './views/Dashboard'
import './assets/tailwind.css'
import './assets/dashboard.css'

// Wait for DOM to be ready
function initDashboard() {
  const container = document.getElementById('surefeedback-dashboard-app')
  if (!container) return
  try {
    const root = createRoot(container)
    root.render(<Dashboard />)
  } catch (error) {
    console.error('SureFeedback Dashboard: Failed to initialize app', error)
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard)
} else {
  initDashboard()
}