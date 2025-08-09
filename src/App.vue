<template>
  <div id="surefeedback-admin" class="min-h-screen bg-gray-50/50">
    <Toast />
    
    <!-- Compact Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200/60">
      <div class="max-w-5xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-md flex items-center justify-center shadow-sm">
              <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 class="text-lg font-semibold text-gray-900 leading-tight">{{ pageTitle }}</h1>
              <p class="text-xs text-gray-500 leading-tight">Manage integration settings</p>
            </div>
          </div>
          <div class="flex items-center">
            <div v-if="settingsStore.isConnected" class="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              <div class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span class="text-xs font-medium">Connected</span>
            </div>
            <div v-else class="flex items-center gap-2 px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full border border-orange-200">
              <div class="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
              <span class="text-xs font-medium">Disconnected</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Container -->
    <div class="max-w-5xl mx-auto px-4 py-4">
      <!-- Loading State -->
      <div v-if="settingsStore.state.loading" class="flex items-center justify-center py-8">
        <LoadingSpinner :message="__('Loading settings...', 'ph-child')" />
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- Compact Navigation & Content Card -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200/60 overflow-hidden">
          <!-- Tab Navigation -->
          <TabNavigation
            :tabs="availableTabs"
            :active-tab="settingsStore.state.activeTab"
            @tab-change="settingsStore.setActiveTab"
          />
          
          <!-- Settings Form -->
          <form @submit.prevent="handleSave">
            <!-- Content Area -->
            <div class="p-5">
              <!-- General Tab -->
              <GeneralSettings v-if="settingsStore.state.activeTab === 'general'" />

              <!-- Connection Tab -->
              <ConnectionSettings v-else-if="settingsStore.state.activeTab === 'connection'" />

              <!-- White Label Tab -->
              <WhiteLabelSettings v-else-if="settingsStore.state.activeTab === 'white_label'" />
            </div>

            <!-- Compact Save Section -->
            <div class="bg-gray-50/50 border-t border-gray-200/60 px-5 py-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-xs text-gray-600">
                  <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                  <span>Changes are saved automatically</span>
                </div>
                <Button
                  type="submit"
                  :loading="settingsStore.state.saving"
                  size="sm"
                  class="px-4 text-xs"
                >
                  {{ settingsStore.state.saving ? __('Saving...', 'ph-child') : __('Save Changes', 'ph-child') }}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import type { TabConfig } from '@/types'

import TabNavigation from '@/components/TabNavigation.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import GeneralSettings from '@/views/GeneralSettings.vue'
import ConnectionSettings from '@/views/ConnectionSettings.vue'
import WhiteLabelSettings from '@/views/WhiteLabelSettings.vue'
import Button from '@/components/ui/Button.vue'
import Toast from '@/components/ui/Toast.vue'
import { useToast } from '@/components/ui/use-toast'

const settingsStore = useSettingsStore()
const toast = useToast()

// Computed properties
const pageTitle = computed(() => {
  const pluginName = settingsStore.state.whiteLabel.ph_child_plugin_name
  if (pluginName) {
    return `${pluginName} ${__('Options', 'ph-child')}`
  }
  return __('SureFeedback Options', 'ph-child')
})

const availableTabs = computed((): TabConfig[] => {
  const tabs: TabConfig[] = [
    {
      id: 'general',
      label: __('General', 'ph-child'),
      visible: true
    },
    {
      id: 'connection',
      label: __('Connection', 'ph-child'),
      visible: true
    }
  ]

  // Only show White Label tab if not hidden
  if (typeof window !== 'undefined' && window.sureFeedbackAdmin?.showWhiteLabel !== false) {
    tabs.push({
      id: 'white_label',
      label: __('White Label', 'ph-child'),
      visible: true
    })
  }

  return tabs.filter(tab => tab.visible)
})

// Methods
async function handleSave() {
  let success = false

  switch (settingsStore.state.activeTab) {
    case 'general':
      success = await settingsStore.saveGeneralSettings()
      break
    case 'connection':
      success = await settingsStore.saveConnectionSettings()
      break
    case 'white_label':
      success = await settingsStore.saveWhiteLabelSettings()
      break
  }

  if (success) {
    showNotice(__('Settings saved.', 'ph-child'), 'success')
  }
}

function showNotice(message: string, type: 'success' | 'error' = 'success') {
  const { toast: toastInstance } = toast
  toastInstance.add({
    severity: type,
    summary: type === 'success' ? __('Success', 'ph-child') : __('Error', 'ph-child'),
    detail: message,
    life: 2500
  })
}

// WordPress translation function fallback
function __(text: string, domain: string = 'ph-child'): string {
  // Check if wp.i18n is available
  if (typeof window !== 'undefined' && window.wp?.i18n?.__) {
    return window.wp.i18n.__(text, domain)
  }

  const translations: Record<string, string> = {
    'Success': 'Success',
    'Error': 'Error',
    'Options': 'Options',
    'SureFeedback Options': 'SureFeedback Options',
    'General': 'General',
    'Connection': 'Connection',
    'White Label': 'White Label',
    'Loading settings...': 'Loading settings...',
    'Saving...': 'Saving...',
    'Save Changes': 'Save Changes',
    'Settings saved.': 'Settings saved.'
  }
  
  return translations[text] || text
}

// Initialize on mount
onMounted(async () => {
  console.log('SureFeedback App: Component mounted, loading settings...')
  
  try {
    await settingsStore.loadSettings()
    console.log('SureFeedback App: Settings loaded successfully')
    
    // Set initial tab from URL hash if present
    const hash = window.location.hash.replace('#', '')
    if (hash && availableTabs.value.some(tab => tab.id === hash)) {
      settingsStore.setActiveTab(hash)
      console.log('SureFeedback App: Set active tab from URL hash:', hash)
    }
  } catch (error) {
    console.error('SureFeedback App: Failed to load settings:', error)
  }
})

// Global types are now declared in env.d.ts
</script>

<style scoped>
#surefeedback-admin { 
  margin: 0; 
  padding: 0;
  background: #f9fafb;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  line-height: 1.4;
}

/* Override WordPress admin styles */
:deep(.wrap) {
  margin: 0;
  padding: 0;
}

/* Compact form elements */
:deep(.p-inputtext) {
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
}

:deep(.p-button-small) {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

/* Modern card hover effects */
.settings-card {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.settings-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Enhanced focus styles */
:deep(input:focus),
:deep(textarea:focus),
:deep(select:focus) {
  outline: 2px solid rgba(59, 130, 246, 0.5);
  outline-offset: 2px;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Compact spacing utilities */
:deep(.space-y-1 > * + *) {
  margin-top: 0.25rem;
}

:deep(.space-y-2 > * + *) {
  margin-top: 0.5rem;
}

:deep(.space-y-3 > * + *) {
  margin-top: 0.75rem;
}

/* Smooth pulse animation for status indicators */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Compact responsive design */
@media (max-width: 768px) {
  #surefeedback-admin {
    font-size: 0.875rem;
  }
  
  :deep(.grid) {
    gap: 0.5rem;
  }
  
  :deep(.p-3) {
    padding: 0.5rem;
  }
}
</style>

<style>
/* Global WordPress admin styles */
.notice {
  position: relative;
  margin: 5px 15px 2px;
  padding: 1px 12px;
  border-left: 4px solid #fff;
  box-shadow: 0 1px 1px 0 rgba(0,0,0,0.1);
  background: #fff;
}

.notice-success {
  border-left-color: #00a32a;
}

.notice-error {
  border-left-color: #d63638;
}

.is-dismissible {
  padding-right: 38px;
}

.notice-dismiss {
  position: absolute;
  top: 0;
  right: 1px;
  border: none;
  margin: 0;
  padding: 9px;
  background: none;
  color: #787c82;
  cursor: pointer;
}

.notice-dismiss:before {
  content: '×';
  font-size: 20px;
  font-weight: 400;
  line-height: 1;
}
</style>