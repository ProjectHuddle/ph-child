import React from 'react'
import { Button } from '@bsf/force-ui'
import { useSettings } from '../hooks/useSettings'
import ErrorNotice from '../components/ErrorNotice'
import { CheckCircle, AlertTriangle } from 'lucide-react'

const ConnectionSettings: React.FC = () => {
  const { settings, isConnected, disconnectUrl, testConnection, clearErrors } = useSettings()

  const visitDashboardUrl = settings.connection.ph_child_parent_url
    ? `${settings.connection.ph_child_parent_url}/projects/${settings.connection.ph_child_id}`
    : '#'

  const handleTestConnection = async () => {
    await testConnection()
  }

  const confirmDisconnect = () => {
    if (window.confirm(__('Are you sure you want to disconnect? This will stop comment synchronization.', 'ph-child'))) {
      window.location.href = disconnectUrl
    }
  }

  return (
    <div className="connection-settings space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-gray-200/60">
        <h2 className="text-base font-semibold text-gray-900 mb-0.5">Connection Settings</h2>
        <p className="text-xs text-gray-600">Manage your SureFeedback dashboard connection</p>
      </div>

      {/* Connection Status - Connected */}
      {isConnected ? (
        <div className="space-y-3">
          <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-md p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-emerald-100 rounded-md flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-emerald-900 leading-tight">
                    {__('Connected', 'ph-child')}
                  </h3>
                  <p className="text-xs text-emerald-700 leading-tight">
                    {__('Ready to sync comments', 'ph-child')}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Connection Details */}
          <div className="bg-white border border-gray-200/60 rounded-md overflow-hidden">
            <div className="px-3 py-2 bg-gray-50/50 border-b border-gray-200/60">
              <h4 className="text-xs font-medium text-gray-900">Connection Details</h4>
            </div>
            <div className="p-3 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="connection-detail">
                  <dt className="text-xs font-medium text-gray-500 mb-1">Parent Site URL</dt>
                  <dd className="text-xs text-gray-900 bg-gray-50/50 px-2 py-1.5 rounded border border-gray-200/60 font-mono break-all">
                    {settings.connection.ph_child_parent_url}
                  </dd>
                </div>
                <div className="connection-detail">
                  <dt className="text-xs font-medium text-gray-500 mb-1">Project ID</dt>
                  <dd className="text-xs text-gray-900 bg-gray-50/50 px-2 py-1.5 rounded border border-gray-200/60 font-mono">
                    {settings.connection.ph_child_id}
                  </dd>
                </div>
              </div>
            </div>
            <div className="px-3 py-2 bg-gray-50/50 border-t border-gray-200/60 flex items-center justify-between">
              <p className="text-xs text-gray-600">Manage connection</p>
              <div className="flex items-center gap-1.5">
                <a 
                  href={visitDashboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {__('Dashboard', 'ph-child')}
                </a>
                <button 
                  disabled={settings.loading}
                  onClick={handleTestConnection}
                  className="inline-flex items-center px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {__('Test', 'ph-child')}
                </button>
                <button 
                  onClick={confirmDisconnect}
                  className="inline-flex items-center px-2 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {__('Disconnect', 'ph-child')}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Connection Setup Form */
        <div className="space-y-3">
          {/* Setup Header */}
          <div className="bg-orange-50/50 border border-orange-200/60 rounded-md p-3">
            <div className="flex items-center gap-2.5">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-orange-100 rounded-md flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-orange-900 leading-tight">
                  {__('Not Connected', 'ph-child')}
                </h3>
                <p className="text-xs text-orange-700 leading-tight">
                  {__('Connect to your SureFeedback dashboard to start collecting feedback', 'ph-child')}
                </p>
              </div>
            </div>
          </div>

          {/* Connection setup instructions would go here */}
          <div className="bg-white border border-gray-200/60 rounded-md p-3">
            <p className="text-sm text-gray-600">
              {__('Please visit your SureFeedback dashboard to connect this site.', 'ph-child')}
            </p>
          </div>
        </div>
      )}

      {/* Error Notice */}
      <ErrorNotice
        message={settings.errors.connection}
        dismissible={true}
        onDismiss={clearErrors}
      />
    </div>
  )
}

// WordPress translation function fallback
function __(text: string, domain: string = 'ph-child'): string {
  if (typeof window !== 'undefined' && window.wp?.i18n?.__) {
    return window.wp.i18n.__(text, domain)
  }

  const translations: Record<string, string> = {
    'Connected': 'Connected',
    'Ready to sync comments': 'Ready to sync comments',
    'Dashboard': 'Dashboard',
    'Test': 'Test',
    'Disconnect': 'Disconnect',
    'Not Connected': 'Not Connected',
    'Connect to your SureFeedback dashboard to start collecting feedback': 'Connect to your SureFeedback dashboard to start collecting feedback',
    'Please visit your SureFeedback dashboard to connect this site.': 'Please visit your SureFeedback dashboard to connect this site.',
    'Are you sure you want to disconnect? This will stop comment synchronization.': 'Are you sure you want to disconnect? This will stop comment synchronization.'
  }
  
  return translations[text] || text
}

export default ConnectionSettings