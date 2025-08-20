import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/tailwind.css'

// Wait for DOM to be ready
function initApp() {
  const container = document.getElementById('surefeedback-admin-app')
  if (!container) return
  try {
    const pinia = createPinia()
    const app = createApp(App)
    app.use(pinia)
    app.mount('#surefeedback-admin-app')
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
