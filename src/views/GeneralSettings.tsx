import React, { useEffect } from 'react'
import { useSettings } from '../hooks/useSettings'
import ErrorNotice from '../components/ErrorNotice'
import Switch from '../components/ui/Switch'
import Checkbox from '../components/ui/Checkbox'
import { Info } from 'lucide-react'

const GeneralSettings: React.FC = () => {
  const {
    settings,
    availableRoles,
    loadSettings,
    updateRoleSelection,
    clearErrors
  } = useSettings()

  useEffect(() => {
    if (availableRoles.length === 0) {
      loadSettings()
    }
  }, [availableRoles.length, loadSettings])

  const handleRoleChange = (roleName: string, selected: boolean) => {
    updateRoleSelection(roleName, selected)
  }

  const toggleRole = (roleName: string) => {
    const currentSelection = settings.general.ph_child_role_can_comment.includes(roleName)
    handleRoleChange(roleName, !currentSelection)
  }

  const toggleGuestComments = () => {
    // This will be handled by the parent form's useSettings hook
  }

  const toggleAdminComments = () => {
    // This will be handled by the parent form's useSettings hook
  }

  return (
    <div className="general-settings space-y-4">
      {/* Header */}
      <div className="pb-3 border-b border-gray-200/60">
        <h2 className="text-base font-semibold text-gray-900 mb-0.5">General Settings</h2>
        <p className="text-xs text-gray-600">Configure user permissions and commenting features</p>
      </div>

      {/* User Roles Section */}
      <div className="space-y-3">
        <div className="bg-gray-50/50 rounded-md p-4 border border-gray-200/60">
          <div className="mb-3">
            <h3 className="text-sm font-medium text-gray-900 mb-0.5">User Permissions</h3>
            <p className="text-xs text-gray-600">{__('Select which roles can leave comments', 'ph-child')}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
            {availableRoles.map((role) => (
              <div
                key={role.name}
                className="role-card flex items-center space-x-2 p-2.5 bg-white rounded border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5"
                onClick={() => toggleRole(role.name)}
              >
                <Checkbox 
                  id={`role-${role.name}`}
                  checked={settings.general.ph_child_role_can_comment.includes(role.name)}
                  onChange={(val) => handleRoleChange(role.name, val)}
                  className="role-checkbox pointer-events-none"
                />
                <label 
                  htmlFor={`role-${role.name}`} 
                  className="text-xs font-medium text-gray-700 cursor-pointer flex-1 pointer-events-none leading-tight"
                >
                  {role.label}
                </label>
              </div>
            ))}
          </div>
          
          <div className="mt-3 p-2.5 bg-blue-50/50 rounded border border-blue-200/50">
            <p className="text-xs text-blue-700 flex items-start gap-1.5">
              <Info className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>{__('Selected user roles will be able to leave comments on this site', 'ph-child')}</span>
            </p>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="space-y-2">
          {/* Guest Comments */}
          <div className="setting-card bg-white border border-gray-200/60 rounded-md p-3 hover:shadow-sm transition-shadow duration-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-3">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="text-sm font-medium text-gray-900">
                    {__('Guest Comments', 'ph-child')}
                  </h4>
                  <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                    {settings.general.ph_child_guest_comments_enabled ? 'ON' : 'OFF'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-tight">
                  {__('Allow non-logged in visitors to view and add comments', 'ph-child')}
                </p>
              </div>
              <div className="flex-shrink-0">
                <Switch 
                  checked={settings.general.ph_child_guest_comments_enabled}
                  onChange={(checked) => {
                    // Direct mutation for now - this will be handled by the parent component
                    settings.general.ph_child_guest_comments_enabled = checked
                  }}
                />
              </div>
            </div>
          </div>

          {/* Admin Comments */}
          <div className="setting-card bg-white border border-gray-200/60 rounded-md p-3 hover:shadow-sm transition-shadow duration-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-3">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="text-sm font-medium text-gray-900">
                    {__('Admin Area Comments', 'ph-child')}
                  </h4>
                  <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                    {settings.general.ph_child_admin ? 'ON' : 'OFF'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-tight">
                  {__('Enable commenting on WordPress admin pages', 'ph-child')}
                </p>
              </div>
              <div className="flex-shrink-0">
                <Switch 
                  checked={settings.general.ph_child_admin}
                  onChange={(checked) => {
                    // Direct mutation for now - this will be handled by the parent component
                    settings.general.ph_child_admin = checked
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Notice */}
      <ErrorNotice
        message={settings.errors.general}
        dismissible={true}
        onDismiss={clearErrors}
      />
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
    'Select which roles can leave comments': 'Select which roles can leave comments',
    'Selected user roles will be able to leave comments on this site': 'Selected user roles will be able to leave comments on this site',
    'Guest Comments': 'Guest Comments',
    'Allow non-logged in visitors to view and add comments': 'Allow non-logged in visitors to view and add comments',
    'Admin Area Comments': 'Admin Area Comments',
    'Enable commenting on WordPress admin pages': 'Enable commenting on WordPress admin pages'
  }
  
  return translations[text] || text
}

export default GeneralSettings