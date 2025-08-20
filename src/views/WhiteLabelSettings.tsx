import React from 'react'
import { useSettings } from '../hooks/useSettings'
import ErrorNotice from '../components/ErrorNotice'

const WhiteLabelSettings: React.FC = () => {
  const { settings, clearErrors } = useSettings()

  const handleInputChange = (field: keyof typeof settings.whiteLabel, value: string) => {
    // Direct mutation for now - this will be handled by the parent component
    (settings.whiteLabel as any)[field] = value
  }

  return (
    <div className="white-label-settings space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-gray-200/60">
        <h2 className="text-base font-semibold text-gray-900 mb-0.5">White Label Settings</h2>
        <p className="text-xs text-gray-600">{__('Customize plugin branding for your agency', 'ph-child')}</p>
      </div>

      {/* Branding Form */}
      <div className="bg-white border border-gray-200/60 rounded-md overflow-hidden">
        <div className="px-3 py-2 bg-gray-50/50 border-b border-gray-200/60">
          <h4 className="text-xs font-medium text-gray-900">Plugin Branding</h4>
        </div>
        <div className="p-3 space-y-3">
          {/* Plugin Name */}
          <div className="form-group">
            <label htmlFor="ph_child_plugin_name" className="block text-xs font-medium text-gray-700 mb-1.5">
              {__('Plugin Name', 'ph-child')}
            </label>
            <input 
              id="ph_child_plugin_name"
              type="text"
              value={settings.whiteLabel.ph_child_plugin_name}
              onChange={(e) => handleInputChange('ph_child_plugin_name', e.target.value)}
              disabled={settings.saving}
              placeholder={__('SureFeedback Client Site', 'ph-child')}
              className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500 leading-tight">
              {__('Name displayed in plugins list and admin menu', 'ph-child')}
            </p>
          </div>

          {/* Plugin Description */}
          <div className="form-group">
            <label htmlFor="ph_child_plugin_description" className="block text-xs font-medium text-gray-700 mb-1.5">
              {__('Plugin Description', 'ph-child')}
            </label>
            <textarea 
              id="ph_child_plugin_description"
              value={settings.whiteLabel.ph_child_plugin_description}
              onChange={(e) => handleInputChange('ph_child_plugin_description', e.target.value)}
              rows={2}
              disabled={settings.saving}
              placeholder={__('Collect feedback from client websites and sync with SureFeedback parent project', 'ph-child')}
              className="w-full resize-none text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500 leading-tight">
              {__('Description shown in plugins list', 'ph-child')}
            </p>
          </div>

          {/* Author Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Plugin Author */}
            <div className="form-group">
              <label htmlFor="ph_child_plugin_author" className="block text-xs font-medium text-gray-700 mb-1.5">
                {__('Plugin Author', 'ph-child')}
              </label>
              <input 
                id="ph_child_plugin_author"
                type="text"
                value={settings.whiteLabel.ph_child_plugin_author}
                onChange={(e) => handleInputChange('ph_child_plugin_author', e.target.value)}
                disabled={settings.saving}
                placeholder={__('Your Agency Name', 'ph-child')}
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500 leading-tight">
                {__('Author name shown in plugins list', 'ph-child')}
              </p>
            </div>

            {/* Author URL */}
            <div className="form-group">
              <label htmlFor="ph_child_plugin_author_url" className="block text-xs font-medium text-gray-700 mb-1.5">
                {__('Author URL', 'ph-child')}
              </label>
              <input 
                id="ph_child_plugin_author_url"
                type="url"
                value={settings.whiteLabel.ph_child_plugin_author_url}
                onChange={(e) => handleInputChange('ph_child_plugin_author_url', e.target.value)}
                disabled={settings.saving}
                placeholder={__('https://youragency.com', 'ph-child')}
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500 leading-tight">
                {__('URL linked from author name', 'ph-child')}
              </p>
            </div>
          </div>

          {/* Plugin URL */}
          <div className="form-group">
            <label htmlFor="ph_child_plugin_link" className="block text-xs font-medium text-gray-700 mb-1.5">
              {__('Plugin URL', 'ph-child')}
            </label>
            <input 
              id="ph_child_plugin_link"
              type="url"
              value={settings.whiteLabel.ph_child_plugin_link}
              onChange={(e) => handleInputChange('ph_child_plugin_link', e.target.value)}
              disabled={settings.saving}
              placeholder={__('https://youragency.com/feedback-solution', 'ph-child')}
              className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500 leading-tight">
              {__('URL linked from plugin name', 'ph-child')}
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="px-3 py-2 bg-blue-50/50 border-t border-blue-200/60">
          <p className="text-xs text-blue-700 flex items-start gap-1.5">
            <svg className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>{__('These settings customize how the plugin appears to your clients in their WordPress admin area', 'ph-child')}</span>
          </p>
        </div>
      </div>

      {/* Error Notice */}
      <ErrorNotice
        message={settings.errors.whiteLabel}
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
    'Customize plugin branding for your agency': 'Customize plugin branding for your agency',
    'Plugin Name': 'Plugin Name',
    'SureFeedback Client Site': 'SureFeedback Client Site',
    'Name displayed in plugins list and admin menu': 'Name displayed in plugins list and admin menu',
    'Plugin Description': 'Plugin Description',
    'Collect feedback from client websites and sync with SureFeedback parent project': 'Collect feedback from client websites and sync with SureFeedback parent project',
    'Description shown in plugins list': 'Description shown in plugins list',
    'Plugin Author': 'Plugin Author',
    'Your Agency Name': 'Your Agency Name',
    'Author name shown in plugins list': 'Author name shown in plugins list',
    'Author URL': 'Author URL',
    'https://youragency.com': 'https://youragency.com',
    'URL linked from author name': 'URL linked from author name',
    'Plugin URL': 'Plugin URL',
    'https://youragency.com/feedback-solution': 'https://youragency.com/feedback-solution',
    'URL linked from plugin name': 'URL linked from plugin name',
    'These settings customize how the plugin appears to your clients in their WordPress admin area': 'These settings customize how the plugin appears to your clients in their WordPress admin area'
  }
  
  return translations[text] || text
}

export default WhiteLabelSettings