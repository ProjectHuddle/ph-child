import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import type {
  SettingsState,
  GeneralSettings,
  ConnectionSettings,
  WhiteLabelSettings,
  ConnectionStatus,
  ManualImportData,
  UserRole
} from '@/types'
import { settingsService } from '@/services'

export const useSettingsStore = defineStore('settings', () => {
  // State
  const state = reactive<SettingsState>({
    general: {
      ph_child_role_can_comment: [],
      ph_child_guest_comments_enabled: false,
      ph_child_admin: false
    },
    connection: {
      ph_child_id: '',
      ph_child_api_key: '',
      ph_child_access_token: '',
      ph_child_parent_url: '',
      ph_child_signature: '',
      ph_child_installed: false
    },
    whiteLabel: {
      ph_child_plugin_name: '',
      ph_child_plugin_description: '',
      ph_child_plugin_author: '',
      ph_child_plugin_author_url: '',
      ph_child_plugin_link: ''
    },
    connectionStatus: {
      connected: false
    },
    loading: false,
    saving: false,
    errors: {},
    activeTab: 'general'
  })

  const availableRoles = ref<UserRole[]>([])

  // Computed
  const isConnected = computed(() => {
    return state.connection.ph_child_id && 
           state.connection.ph_child_api_key && 
           state.connection.ph_child_access_token &&
           state.connection.ph_child_parent_url
  })

  const disconnectUrl = computed(() => {
    if (typeof window !== 'undefined' && window.sureFeedbackAdmin) {
      const nonce = window.sureFeedbackAdmin.disconnect_nonce
      const adminUrl = window.sureFeedbackAdmin.admin_url
      return `${adminUrl}options-general.php?page=feedback-connection-options&ph-child-site-disconnect=1&ph-child-site-disconnect-nonce=${nonce}`
    }
    return ''
  })

  // Actions
  async function loadSettings() {
    state.loading = true
    state.errors = {}
    
    try {
      const response = await settingsService.getSettings()
      if (response.success && response.data) {
        // Update state with loaded settings
        Object.assign(state.general, response.data.general || {})
        Object.assign(state.connection, response.data.connection || {})
        Object.assign(state.whiteLabel, response.data.whiteLabel || {})
        Object.assign(state.connectionStatus, response.data.connectionStatus || {})
        
        if (response.data.availableRoles) {
          availableRoles.value = response.data.availableRoles
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      state.errors.general = 'Failed to load settings. Please refresh the page.'
    } finally {
      state.loading = false
    }
  }

  async function saveGeneralSettings() {
    state.saving = true
    state.errors = {}

    try {
      const response = await settingsService.saveGeneralSettings(state.general)
      if (!response.success) {
        state.errors = response.errors || { general: response.message || 'Save failed' }
        return false
      }
      return true
    } catch (error) {
      console.error('Failed to save general settings:', error)
      state.errors.general = 'Failed to save settings. Please try again.'
      return false
    } finally {
      state.saving = false
    }
  }

  async function saveConnectionSettings() {
    state.saving = true
    state.errors = {}

    try {
      const response = await settingsService.saveConnectionSettings(state.connection)
      if (!response.success) {
        state.errors = response.errors || { connection: response.message || 'Save failed' }
        return false
      }
      
      // Update connection status after successful save
      if (response.data?.connectionStatus) {
        Object.assign(state.connectionStatus, response.data.connectionStatus)
      }
      
      return true
    } catch (error) {
      console.error('Failed to save connection settings:', error)
      state.errors.connection = 'Failed to save settings. Please try again.'
      return false
    } finally {
      state.saving = false
    }
  }

  async function saveWhiteLabelSettings() {
    state.saving = true
    state.errors = {}

    try {
      const response = await settingsService.saveWhiteLabelSettings(state.whiteLabel)
      if (!response.success) {
        state.errors = response.errors || { whiteLabel: response.message || 'Save failed' }
        return false
      }
      return true
    } catch (error) {
      console.error('Failed to save white label settings:', error)
      state.errors.whiteLabel = 'Failed to save settings. Please try again.'
      return false
    } finally {
      state.saving = false
    }
  }

  async function manualImport(importData: ManualImportData) {
    state.saving = true
    state.errors = {}

    try {
      const response = await settingsService.manualImport(importData)
      if (!response.success) {
        state.errors = response.errors || { connection: response.message || 'Import failed' }
        return false
      }

      // Update connection settings with imported data
      state.connection.ph_child_id = importData.project_id
      state.connection.ph_child_api_key = importData.api_key
      state.connection.ph_child_access_token = importData.access_token
      state.connection.ph_child_parent_url = importData.parent_url
      state.connection.ph_child_signature = importData.signature

      // Update connection status
      if (response.data?.connectionStatus) {
        Object.assign(state.connectionStatus, response.data.connectionStatus)
      }

      return true
    } catch (error) {
      console.error('Failed to import settings:', error)
      state.errors.connection = 'Failed to import settings. Please try again.'
      return false
    } finally {
      state.saving = false
    }
  }

  async function testConnection() {
    state.loading = true
    state.errors = {}

    try {
      const response = await settingsService.testConnection(state.connection)
      if (response.success && response.data) {
        Object.assign(state.connectionStatus, response.data)
        return true
      } else {
        state.errors.connection = response.message || 'Connection test failed'
        return false
      }
    } catch (error) {
      console.error('Connection test failed:', error)
      state.errors.connection = 'Failed to test connection. Please try again.'
      return false
    } finally {
      state.loading = false
    }
  }

  function setActiveTab(tab: string) {
    state.activeTab = tab
    state.errors = {}
  }

  function clearErrors() {
    state.errors = {}
  }

  function updateRoleSelection(roleName: string, selected: boolean) {
    if (selected && !state.general.ph_child_role_can_comment.includes(roleName)) {
      state.general.ph_child_role_can_comment.push(roleName)
    } else if (!selected) {
      const index = state.general.ph_child_role_can_comment.indexOf(roleName)
      if (index > -1) {
        state.general.ph_child_role_can_comment.splice(index, 1)
      }
    }
  }

  return {
    // State
    state,
    availableRoles,
    
    // Computed
    isConnected,
    disconnectUrl,
    
    // Actions
    loadSettings,
    saveGeneralSettings,
    saveConnectionSettings,
    saveWhiteLabelSettings,
    manualImport,
    testConnection,
    setActiveTab,
    clearErrors,
    updateRoleSelection
  }
})