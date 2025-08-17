import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@bsf/force-ui'
import { useSettings } from './hooks/useSettings'
import { useToast } from './hooks/useToast'
import type { TabConfig } from './types'

import TabNavigation from './components/TabNavigation'
import LoadingSpinner from './components/LoadingSpinner'
import GeneralSettings from './views/GeneralSettings'
import ConnectionSettings from './views/ConnectionSettings'
import WhiteLabelSettings from './views/WhiteLabelSettings'
import Toast from './components/ui/Toast'

function App() {
  const {
    settings,
    loading,
    saving,
    isConnected,
    activeTab,
    setActiveTab,
    loadSettings,
    saveGeneralSettings,
    saveConnectionSettings,
    saveWhiteLabelSettings
  } = useSettings()
  
  const { showToast } = useToast()

  // Computed properties
  const pageTitle = React.useMemo(() => {
    const pluginName = settings.whiteLabel.ph_child_plugin_name
    if (pluginName) {
      return `${pluginName} ${__('Options', 'ph-child')}`
    }
    return __('SureFeedback Options', 'ph-child')
  }, [settings.whiteLabel.ph_child_plugin_name])

  const availableTabs = React.useMemo((): TabConfig[] => {
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
  }, [])

  // Methods
  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    let success = false

    switch (activeTab) {
      case 'general':
        success = await saveGeneralSettings()
        break
      case 'connection':
        success = await saveConnectionSettings()
        break
      case 'white_label':
        success = await saveWhiteLabelSettings()
        break
    }

    if (success) {
      showNotice(__('Settings saved.', 'ph-child'), 'success')
    }
  }, [activeTab, saveGeneralSettings, saveConnectionSettings, saveWhiteLabelSettings])

  const showNotice = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    showToast({
      severity: type,
      summary: type === 'success' ? __('Success', 'ph-child') : __('Error', 'ph-child'),
      detail: message,
      life: 2500
    })
  }, [showToast])

  // Initialize on mount
  useEffect(() => {
    const initializeApp = async () => {
      console.log('SureFeedback App: Component mounted, loading settings...')
      
      try {
        await loadSettings()
        console.log('SureFeedback App: Settings loaded successfully')
        
        // Set initial tab from URL hash if present
        const hash = window.location.hash.replace('#', '')
        if (hash && availableTabs.some(tab => tab.id === hash)) {
          setActiveTab(hash)
          console.log('SureFeedback App: Set active tab from URL hash:', hash)
        }
      } catch (error) {
        console.error('SureFeedback App: Failed to load settings:', error)
      }
    }

    initializeApp()
  }, [loadSettings, setActiveTab, availableTabs])

  return (
    <div id="surefeedback-admin" className="surefeedback-styles min-h-screen bg-gray-50/50">
      <Toast />
      
      {/* Compact Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200/60">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-md flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 leading-tight">{pageTitle}</h1>
                <p className="text-xs text-gray-500 leading-tight">Manage integration settings</p>
              </div>
            </div>
            <div className="flex items-center">
              {isConnected ? (
                <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full border border-orange-200">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  <span className="text-xs font-medium">Disconnected</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner message={__('Loading settings...', 'ph-child')} />
          </div>
        ) : (
          /* Main Content */
          <div>
            {/* Compact Navigation & Content Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200/60 overflow-hidden">
              {/* Tab Navigation */}
              <TabNavigation
                tabs={availableTabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
              
              {/* Settings Form */}
              <form onSubmit={handleSave}>
                {/* Content Area */}
                <div className="p-5">
                  {/* General Tab */}
                  {activeTab === 'general' && <GeneralSettings />}

                  {/* Connection Tab */}
                  {activeTab === 'connection' && <ConnectionSettings />}

                  {/* White Label Tab */}
                  {activeTab === 'white_label' && <WhiteLabelSettings />}
                </div>

                {/* Compact Save Section */}
                <div className="bg-gray-50/50 border-t border-gray-200/60 px-5 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span>Changes are saved automatically</span>
                    </div>
                    <Button
                      type="submit"
                      loading={saving}
                      size="sm"
                      className="px-4 text-xs"
                    >
                      {saving ? __('Saving...', 'ph-child') : __('Save Changes', 'ph-child')}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
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

export default App