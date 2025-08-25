import { useState, useCallback, useMemo } from 'react'
import type {
  SettingsState,
  GeneralSettings,
  ConnectionSettings,
  WhiteLabelSettings,
  ConnectionStatus,
  ManualImportData,
  UserRole
} from '../types'
import { settingsService } from '../services'

const initialState: SettingsState = {
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
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsState>(initialState)
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([])

  // Computed values
  const isConnected = useMemo(() => {
    return !!(settings.connection.ph_child_id && 
             settings.connection.ph_child_api_key && 
             settings.connection.ph_child_access_token &&
             settings.connection.ph_child_parent_url)
  }, [settings.connection])

  const disconnectUrl = useMemo(() => {
    if (typeof window !== 'undefined' && window.sureFeedbackAdmin) {
      const nonce = window.sureFeedbackAdmin.disconnect_nonce
      const adminUrl = window.sureFeedbackAdmin.admin_url
      return `${adminUrl}options-general.php?page=feedback-connection-options&ph-child-site-disconnect=1&ph-child-site-disconnect-nonce=${nonce}`
    }
    return ''
  }, [])

  // Actions
  const loadSettings = useCallback(async () => {
    setSettings(prev => ({ ...prev, loading: true, errors: {} }))
    
    try {
      const response = await settingsService.getSettings()
      if (response.success && response.data) {
        setSettings(prev => ({
          ...prev,
          general: { ...prev.general, ...response.data.general },
          connection: { ...prev.connection, ...response.data.connection },
          whiteLabel: { ...prev.whiteLabel, ...response.data.whiteLabel },
          connectionStatus: { ...prev.connectionStatus, ...response.data.connectionStatus },
          loading: false
        }))
        
        if (response.data.availableRoles) {
          setAvailableRoles(response.data.availableRoles)
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      setSettings(prev => ({
        ...prev,
        errors: { general: 'Failed to load settings. Please refresh the page.' },
        loading: false
      }))
    }
  }, [])

  const saveGeneralSettings = useCallback(async () => {
    setSettings(prev => ({ ...prev, saving: true, errors: {} }))

    try {
      const response = await settingsService.saveGeneralSettings(settings.general)
      if (!response.success) {
        setSettings(prev => ({
          ...prev,
          errors: response.errors || { general: response.message || 'Save failed' },
          saving: false
        }))
        return false
      }
      setSettings(prev => ({ ...prev, saving: false }))
      return true
    } catch (error) {
      console.error('Failed to save general settings:', error)
      setSettings(prev => ({
        ...prev,
        errors: { general: 'Failed to save settings. Please try again.' },
        saving: false
      }))
      return false
    }
  }, [settings.general])

  const saveConnectionSettings = useCallback(async () => {
    setSettings(prev => ({ ...prev, saving: true, errors: {} }))

    try {
      const response = await settingsService.saveConnectionSettings(settings.connection)
      if (!response.success) {
        setSettings(prev => ({
          ...prev,
          errors: response.errors || { connection: response.message || 'Save failed' },
          saving: false
        }))
        return false
      }
      
      // Update connection status after successful save
      if (response.data?.connectionStatus) {
        setSettings(prev => ({
          ...prev,
          connectionStatus: { ...prev.connectionStatus, ...response.data.connectionStatus },
          saving: false
        }))
      } else {
        setSettings(prev => ({ ...prev, saving: false }))
      }
      
      return true
    } catch (error) {
      console.error('Failed to save connection settings:', error)
      setSettings(prev => ({
        ...prev,
        errors: { connection: 'Failed to save settings. Please try again.' },
        saving: false
      }))
      return false
    }
  }, [settings.connection])

  const saveWhiteLabelSettings = useCallback(async () => {
    setSettings(prev => ({ ...prev, saving: true, errors: {} }))

    try {
      const response = await settingsService.saveWhiteLabelSettings(settings.whiteLabel)
      if (!response.success) {
        setSettings(prev => ({
          ...prev,
          errors: response.errors || { whiteLabel: response.message || 'Save failed' },
          saving: false
        }))
        return false
      }
      setSettings(prev => ({ ...prev, saving: false }))
      return true
    } catch (error) {
      console.error('Failed to save white label settings:', error)
      setSettings(prev => ({
        ...prev,
        errors: { whiteLabel: 'Failed to save settings. Please try again.' },
        saving: false
      }))
      return false
    }
  }, [settings.whiteLabel])

  const manualImport = useCallback(async (importData: ManualImportData) => {
    setSettings(prev => ({ ...prev, saving: true, errors: {} }))

    try {
      const response = await settingsService.manualImport(importData)
      if (!response.success) {
        setSettings(prev => ({
          ...prev,
          errors: response.errors || { connection: response.message || 'Import failed' },
          saving: false
        }))
        return false
      }

      // Update connection settings with imported data
      setSettings(prev => ({
        ...prev,
        connection: {
          ...prev.connection,
          ph_child_id: importData.project_id,
          ph_child_api_key: importData.api_key,
          ph_child_access_token: importData.access_token,
          ph_child_parent_url: importData.parent_url,
          ph_child_signature: importData.signature
        },
        connectionStatus: response.data?.connectionStatus ? 
          { ...prev.connectionStatus, ...response.data.connectionStatus } : 
          prev.connectionStatus,
        saving: false
      }))

      return true
    } catch (error) {
      console.error('Failed to import settings:', error)
      setSettings(prev => ({
        ...prev,
        errors: { connection: 'Failed to import settings. Please try again.' },
        saving: false
      }))
      return false
    }
  }, [])

  const testConnection = useCallback(async () => {
    setSettings(prev => ({ ...prev, loading: true, errors: {} }))

    try {
      const response = await settingsService.testConnection(settings.connection)
      if (response.success && response.data) {
        setSettings(prev => ({
          ...prev,
          connectionStatus: { ...prev.connectionStatus, ...response.data },
          loading: false
        }))
        return true
      } else {
        setSettings(prev => ({
          ...prev,
          errors: { connection: response.message || 'Connection test failed' },
          loading: false
        }))
        return false
      }
    } catch (error) {
      console.error('Connection test failed:', error)
      setSettings(prev => ({
        ...prev,
        errors: { connection: 'Failed to test connection. Please try again.' },
        loading: false
      }))
      return false
    }
  }, [settings.connection])

  const setActiveTab = useCallback((tab: string) => {
    setSettings(prev => ({ ...prev, activeTab: tab, errors: {} }))
  }, [])

  const clearErrors = useCallback(() => {
    setSettings(prev => ({ ...prev, errors: {} }))
  }, [])

  const updateRoleSelection = useCallback((roleName: string, selected: boolean) => {
    setSettings(prev => {
      const currentRoles = [...prev.general.ph_child_role_can_comment]
      
      if (selected && !currentRoles.includes(roleName)) {
        currentRoles.push(roleName)
      } else if (!selected) {
        const index = currentRoles.indexOf(roleName)
        if (index > -1) {
          currentRoles.splice(index, 1)
        }
      }
      
      return {
        ...prev,
        general: {
          ...prev.general,
          ph_child_role_can_comment: currentRoles
        }
      }
    })
  }, [])

  const updateGuestComments = useCallback((enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        ph_child_guest_comments_enabled: enabled
      }
    }))
  }, [])

  const updateAdminComments = useCallback((enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        ph_child_admin: enabled
      }
    }))
  }, [])

  const updateWhiteLabelField = useCallback((field: keyof typeof initialState.whiteLabel, value: string) => {
    setSettings(prev => ({
      ...prev,
      whiteLabel: {
        ...prev.whiteLabel,
        [field]: value
      }
    }))
  }, [])

  return {
    // State
    settings,
    availableRoles,
    loading: settings.loading,
    saving: settings.saving,
    errors: settings.errors,
    activeTab: settings.activeTab,
    
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
    updateRoleSelection,
    updateGuestComments,
    updateAdminComments,
    updateWhiteLabelField
  }
}