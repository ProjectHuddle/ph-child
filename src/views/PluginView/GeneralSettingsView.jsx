import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Switch } from '../../components/ui/switch.jsx';
import { Checkbox } from '../../components/ui/checkbox.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Loader2, Info } from 'lucide-react';
import { toast } from '../../components/ui/toast.jsx';
import useSettings from '../../hooks/useSettings.js';
import apiGateway from '../../api/gateway.js';

/**
 * General Settings View
 * 
 * Converted from Vue to React
 */
const GeneralSettingsView = () => {
  const {
    state,
    availableRoles,
    loadSettings,
    saveGeneralSettings,
    updateState,
    updateRoleSelection,
    clearErrors,
  } = useSettings();

  const [localRoles, setLocalRoles] = useState([]);

  useEffect(() => {
    if (availableRoles.length === 0) {
      loadSettings();
    } else {
      setLocalRoles(availableRoles);
    }
  }, [availableRoles, loadSettings]);

  // Load roles from WordPress if not available
  useEffect(() => {
    if (localRoles.length === 0) {
      // Try to get roles from WordPress
      const wpRoles = window.sureFeedbackAdmin?.roles || [];
      if (wpRoles.length > 0) {
        setLocalRoles(wpRoles.map(role => ({
          name: role.slug,
          label: role.name,
          selected: state.general.ph_child_role_can_comment.includes(role.slug),
        })));
      }
    }
  }, [state.general.ph_child_role_can_comment]);

  const handleRoleChange = (roleName, selected) => {
    updateRoleSelection(roleName, selected);
  };

  const toggleRole = (roleName) => {
    const currentSelection = state.general.ph_child_role_can_comment.includes(roleName);
    handleRoleChange(roleName, !currentSelection);
  };

  const toggleGuestComments = () => {
    updateState({
      general: {
        ...state.general,
        ph_child_guest_comments_enabled: !state.general.ph_child_guest_comments_enabled,
      },
    });
  };

  const toggleAdminComments = () => {
    updateState({
      general: {
        ...state.general,
        ph_child_admin: !state.general.ph_child_admin,
      },
    });
  };

  const handleSave = async () => {
    const success = await saveGeneralSettings();
    if (success) {
      // Settings saved successfully
    }
  };

  const rolesToShow = localRoles.length > 0 ? localRoles : availableRoles;

  return (
    <div className="general-settings space-y-6 max-w-4xl mx-auto p-8 bg-white">
      {/* Header */}
      <div className="pb-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {__('Permission Management', 'surefeedback')}
        </h1>
        <p className="text-base text-gray-600">
          {__('Control what each user role can do in SureFeedback.', 'surefeedback')}
        </p>
      </div>

      {/* User Roles Section */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-gray-900">
            {__('User Permissions', 'surefeedback')}
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 mt-1">
            {__('Allow user roles to view comments on your site without access token.', 'surefeedback')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {rolesToShow.map((role) => (
              <div
                key={role.name}
                className="role-card flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200 cursor-pointer"
                onClick={() => toggleRole(role.name)}
              >
                <Checkbox
                  id={`role-${role.name}`}
                  checked={state.general.ph_child_role_can_comment.includes(role.name)}
                  onCheckedChange={(checked) => handleRoleChange(role.name, checked)}
                  className="pointer-events-none"
                />
                <Label
                  htmlFor={`role-${role.name}`}
                  className="text-sm font-medium text-gray-900 cursor-pointer flex-1 pointer-events-none"
                >
                  {role.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Allow Site Visitors */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-6">
              <h4 className="text-base font-semibold text-gray-900 mb-1">
                {__('Allow Site Visitors', 'surefeedback')}
              </h4>
              <p className="text-sm text-gray-600">
                {__('Allow the site visitors to view and add comments on your site without access token.', 'surefeedback')}
              </p>
            </div>
            <Switch
              checked={state.general.ph_child_guest_comments_enabled}
              onCheckedChange={toggleGuestComments}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Commenting */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-6">
              <h4 className="text-base font-semibold text-gray-900 mb-1">
                {__('Dashboard Commenting', 'surefeedback')}
              </h4>
              <p className="text-sm text-gray-600">
                {__('Allow commenting in your site\'s Wordpress dashboard area', 'surefeedback')}
              </p>
            </div>
            <Switch
              checked={state.general.ph_child_admin}
              onCheckedChange={toggleAdminComments}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          disabled={state.saving}
          size="default"
          className="h-10 px-8 bg-primary hover:bg-primary/90"
        >
          {state.saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {__('Saving...', 'surefeedback')}
            </>
          ) : (
            __('Save Changes', 'surefeedback')
          )}
        </Button>
      </div>

      {/* Error Notice */}
      {state.errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-700">{state.errors.general}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearErrors}
            className="mt-2 text-xs"
          >
            {__('Dismiss', 'surefeedback')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default GeneralSettingsView;

