<template>
  <div class="connection-settings space-y-6">
    <!-- Header -->
    <div class="pb-3 border-b border-gray-200/60">
      <h2 class="text-base font-semibold text-gray-900 mb-0.5">Connection Settings</h2>
      <p class="text-xs text-gray-600">Manage your SureFeedback dashboard connection</p>
    </div>

    <!-- Connection Status - Connected -->
    <div v-if="settingsStore.isConnected" class="space-y-3">
      <div class="bg-emerald-50/50 border border-emerald-200/60 rounded-md p-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="flex-shrink-0">
              <div class="w-6 h-6 bg-emerald-100 rounded-md flex items-center justify-center">
                <svg class="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <div>
              <h3 class="text-sm font-medium text-emerald-900 leading-tight">
                {{ __('Connected', 'ph-child') }}
              </h3>
              <p class="text-xs text-emerald-700 leading-tight">
                {{ __('Ready to sync comments', 'ph-child') }}
              </p>
            </div>
          </div>
          <div class="flex-shrink-0">
            <div class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <!-- Connection Details -->
      <div class="bg-white border border-gray-200/60 rounded-md overflow-hidden">
        <div class="px-3 py-2 bg-gray-50/50 border-b border-gray-200/60">
          <h4 class="text-xs font-medium text-gray-900">Connection Details</h4>
        </div>
        <div class="p-3 space-y-2">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="connection-detail">
              <dt class="text-xs font-medium text-gray-500 mb-1">Parent Site URL</dt>
              <dd class="text-xs text-gray-900 bg-gray-50/50 px-2 py-1.5 rounded border border-gray-200/60 font-mono break-all">
                {{ settingsStore.state.connection.ph_child_parent_url }}
              </dd>
            </div>
            <div class="connection-detail">
              <dt class="text-xs font-medium text-gray-500 mb-1">Project ID</dt>
              <dd class="text-xs text-gray-900 bg-gray-50/50 px-2 py-1.5 rounded border border-gray-200/60 font-mono">
                {{ settingsStore.state.connection.ph_child_id }}
              </dd>
            </div>
          </div>
        </div>
        <div class="px-3 py-2 bg-gray-50/50 border-t border-gray-200/60 flex items-center justify-between">
          <p class="text-xs text-gray-600">Manage connection</p>
          <div class="flex items-center gap-1.5">
            <Button 
              :href="visitDashboardUrl" 
              target="_blank" 
              variant="outline"
              size="sm"
              class="text-xs px-2 py-1"
            >
              {{ __('Dashboard', 'ph-child') }}
            </Button>
            <Button 
              variant="secondary" 
              :disabled="settingsStore.state.loading" 
              @click="testConnection" 
              size="sm"
              class="text-xs px-2 py-1"
            >
              {{ __('Test', 'ph-child') }}
            </Button>
            <Button 
              variant="destructive" 
              @click="confirmDisconnect" 
              size="sm"
              class="text-xs px-2 py-1"
            >
              {{ __('Disconnect', 'ph-child') }}
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Connection Setup Form -->
    <div v-else class="space-y-3">
      <!-- Setup Header -->
      <div class="bg-orange-50/50 border border-orange-200/60 rounded-md p-3">
        <div class="flex items-center gap-2.5">
          <div class="flex-shrink-0">
            <div class="w-6 h-6 bg-orange-100 rounded-md flex items-center justify-center">
              <i class="pi pi-exclamation-triangle text-orange-600 text-xs"></i>
            </div>
          </div>
          <div>
            <h3 class="text-sm font-medium text-orange-900 leading-tight">
              {{ __('Connect to SureFeedback', 'ph-child') }}
            </h3>
            <p class="text-xs text-orange-700 leading-tight">
              {{ __('Enter your connection details to link this site', 'ph-child') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Connection Form -->
      <div class="bg-white border border-gray-200/60 rounded-md overflow-hidden">
        <div class="px-3 py-2 bg-gray-50/50 border-b border-gray-200/60">
          <h4 class="text-xs font-medium text-gray-900">Connection Details</h4>
        </div>
        <div class="p-3 space-y-3">
          <!-- Parent Site URL -->
          <div class="form-group">
            <label for="parent_url" class="block text-xs font-medium text-gray-700 mb-1.5">
              {{ __('Parent Site URL', 'ph-child') }}
            </label>
            <Input 
              id="parent_url" 
              type="url" 
              v-model="importData.parent_url" 
              :disabled="settingsStore.state.saving" 
              placeholder="https://your-dashboard-site.com" 
              class="w-full"
            />
            <p class="mt-1 text-xs text-gray-500">
              {{ __('The URL of your SureFeedback dashboard site.', 'ph-child') }}
            </p>
          </div>

          <!-- Project ID -->
          <div class="form-group">
            <label for="project_id" class="block text-sm font-medium text-gray-700 mb-2">
              {{ __('Project ID', 'ph-child') }}
            </label>
            <InputNumber 
              inputId="project_id" 
              v-model="importData.project_id" 
              :disabled="settingsStore.state.saving" 
              placeholder="123" 
              class="w-full"
              :class="{ 'border-red-300': !importData.project_id }"
            />
            <p class="mt-1 text-xs text-gray-500">
              {{ __('The project ID from your SureFeedback dashboard.', 'ph-child') }}
            </p>
          </div>

          <!-- API Credentials Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- API Key -->
            <div class="form-group">
              <label for="api_key" class="block text-sm font-medium text-gray-700 mb-2">
                {{ __('API Key', 'ph-child') }}
              </label>
              <Input 
                id="api_key" 
                v-model="importData.api_key" 
                :disabled="settingsStore.state.saving" 
                placeholder="your-api-key" 
                class="w-full"
              />
              <p class="mt-1 text-xs text-gray-500">
                {{ __('The public API key for script loading.', 'ph-child') }}
              </p>
            </div>

            <!-- Access Token -->
            <div class="form-group">
              <label for="access_token" class="block text-sm font-medium text-gray-700 mb-2">
                {{ __('Access Token', 'ph-child') }}
              </label>
              <IconField>
                <InputIcon class="pi pi-lock" />
                <InputText 
                  id="access_token" 
                  v-model="importData.access_token" 
                  :disabled="settingsStore.state.saving" 
                  placeholder="your-access-token" 
                  class="w-full"
                  :class="{ 'border-red-300': !importData.access_token && importData.access_token !== '' }"
                />
              </IconField>
              <p class="mt-1 text-xs text-gray-500">
                {{ __('The access token for API authentication.', 'ph-child') }}
              </p>
            </div>
          </div>

          <!-- Signature -->
          <div class="form-group">
            <label for="signature" class="block text-sm font-medium text-gray-700 mb-2">
              {{ __('Signature', 'ph-child') }}
            </label>
            <IconField>
              <InputIcon class="pi pi-pencil" />
              <InputText 
                id="signature" 
                v-model="importData.signature" 
                :disabled="settingsStore.state.saving" 
                placeholder="your-signature" 
                class="w-full"
                :class="{ 'border-red-300': !importData.signature && importData.signature !== '' }"
              />
            </IconField>
            <p class="mt-1 text-xs text-gray-500">
              {{ __('The secret signature for identity verification.', 'ph-child') }}
            </p>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            <p class="text-sm text-gray-600">All fields are required to establish a connection.</p>
          </div>
          <div class="flex items-center gap-3">
            <Button 
              type="button" 
              :loading="settingsStore.state.saving" 
              :disabled="!canImport" 
              @click="handleManualImport"
              size="lg"
            >
              {{ settingsStore.state.saving ? __('Connecting...', 'ph-child') : __('Connect Site', 'ph-child') }}
            </Button>
          </div>
        </div>
      </div>
    </div>

    <ErrorNotice
      :message="settingsStore.state.errors.connection"
      :dismissible="true"
      @dismiss="settingsStore.clearErrors"
    />
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import type { ManualImportData } from '@/types'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorNotice from '@/components/ErrorNotice.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'

const settingsStore = useSettingsStore()
// Removed PrimeVue confirm - using simple browser confirm for now

const importData = reactive<ManualImportData>({
  parent_url: '',
  project_id: 0,
  api_key: '',
  access_token: '',
  signature: ''
})

const canImport = computed(() => {
  return importData.parent_url &&
         importData.project_id > 0 &&
         importData.api_key &&
         importData.access_token &&
         importData.signature
})

const visitDashboardUrl = computed(() => {
  return settingsStore.state.connection.ph_child_parent_url || '#'
})

async function handleManualImport() {
  const success = await settingsStore.manualImport(importData)
  if (success) {
    // Clear form on successful import
    Object.assign(importData, {
      parent_url: '',
      project_id: 0,
      api_key: '',
      access_token: '',
      signature: ''
    })
  }
}

async function testConnection() {
  await settingsStore.testConnection()
}

function confirmDisconnect() {
  if (confirm(__('Are you sure you want to disconnect from SureFeedback? This will remove all connection settings.', 'ph-child'))) {
    window.location.href = settingsStore.disconnectUrl
  }
}

// WordPress translation function fallback
function __(text: string, domain: string = 'ph-child'): string {
  const translations: Record<string, string> = {
    'Confirm': 'Confirm',
    'Cancel': 'Cancel',
    'Connection Status': 'Connection Status',
    'Connected to SureFeedback': 'Connected to SureFeedback',
    'Successfully Connected': 'Successfully Connected',
    'Your site is connected to SureFeedback and ready to sync comments.': 'Your site is connected to SureFeedback and ready to sync comments.',
    'Parent Site:': 'Parent Site:',
    'Project ID:': 'Project ID:',
    'Visit Dashboard': 'Visit Dashboard',
    'Visit Dashboard Site': 'Visit Dashboard Site',
    'Disconnect': 'Disconnect',
    'Connect to SureFeedback': 'Connect to SureFeedback',
    'Enter your connection details to link this site with your SureFeedback dashboard.': 'Enter your connection details to link this site with your SureFeedback dashboard.',
    'Parent Site URL': 'Parent Site URL',
    'The URL of your SureFeedback dashboard site.': 'The URL of your SureFeedback dashboard site.',
    'Project ID': 'Project ID',
    'The project ID from your SureFeedback dashboard.': 'The project ID from your SureFeedback dashboard.',
    'API Key': 'API Key',
    'The public API key for script loading.': 'The public API key for script loading.',
    'Access Token': 'Access Token',
    'The access token for API authentication.': 'The access token for API authentication.',
    'Signature': 'Signature',
    'The secret signature for identity verification.': 'The secret signature for identity verification.',
    'Connecting...': 'Connecting...',
    'Connect Site': 'Connect Site',
    'Test Connection': 'Test Connection',
    'Are you sure you want to disconnect from SureFeedback? This will remove all connection settings.': 'Are you sure you want to disconnect from SureFeedback? This will remove all connection settings.'
  }
  
  return translations[text] || text
}

onMounted(() => {
  if (!settingsStore.state.connection.ph_child_id) {
    settingsStore.loadSettings()
  }
})
</script>

<style scoped>
.connection-settings {
  max-width: none;
}

/* Status indicators */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

/* Form styling */
.form-group {
  transition: all 0.2s ease;
}

.form-group label {
  transition: color 0.2s ease;
}

.form-group:focus-within label {
  color: #3b82f6;
}

/* Input validation styling */
.border-red-300 {
  border-color: #fca5a5 !important;
  box-shadow: 0 0 0 1px #fca5a5;
}

/* Connection detail styling */
.connection-detail dt {
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 4px;
}

.connection-detail dd {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
  word-break: break-all;
}

/* Card animations */
.bg-green-50,
.bg-amber-50,
.bg-white {
  animation: slideInUp 0.5s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Hover effects */
.connection-detail dd:hover {
  background-color: #f3f4f6;
}

/* Responsive form layout */
@media (max-width: 1024px) {
  .grid-cols-1.lg\\:grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

/* Button group spacing */
.flex.items-center.gap-3 > * {
  flex-shrink: 0;
}

/* Success state styling */
.bg-green-50 {
  background-color: rgba(236, 253, 245, 0.8);
  border-color: rgba(34, 197, 94, 0.3);
}

.bg-amber-50 {
  background-color: rgba(254, 252, 232, 0.8);
  border-color: rgba(245, 158, 11, 0.3);
}

/* Icon container styling */
.w-10.h-10 {
  transition: all 0.2s ease;
}

.w-10.h-10:hover {
  transform: scale(1.05);
}

/* Form validation feedback */
.form-group:has(.border-red-300) label {
  color: #dc2626;
}

/* Focus states for better accessibility */
.form-group input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
}
</style>