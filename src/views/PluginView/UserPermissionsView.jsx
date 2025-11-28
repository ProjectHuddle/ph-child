import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import useSettings from '../../hooks/useSettings.js';
import ContentSection from '../../components/Plugin/ContentSection.jsx';
import UserPermissionsSection from '../../components/Plugin/UserPermissionsSection.jsx';
import SaveButton from '../../components/Plugin/SaveButton.jsx';
import ErrorNotice from '../../components/Plugin/ErrorNotice.jsx';

/**
 * User Permissions View
 * 
 * Manages user role permissions for viewing comments
 */
const UserPermissionsView = () => {
  const {
    state,
    availableRoles,
    loadSettings,
    saveGeneralSettings,
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

  const handleSave = async () => {
    const success = await saveGeneralSettings();
    if (success) {
      // Settings saved successfully
    }
  };

  const rolesToShow = localRoles.length > 0 ? localRoles : availableRoles;

  return (
    <div className="space-y-6">
      <ContentSection
        loading={state.loading}
        title={__('User Permissions', 'surefeedback')}
        content={
          <UserPermissionsSection
            roles={rolesToShow}
            selectedRoles={state.general?.ph_child_role_can_comment || []}
            onRoleChange={handleRoleChange}
            onRoleToggle={toggleRole}
          />
        }
      />

      <SaveButton
        onClick={handleSave}
        saving={state.saving}
        disabled={state.saving}
      />

      <ErrorNotice
        error={state.errors?.general}
        onDismiss={clearErrors}
      />
    </div>
  );
};

export default UserPermissionsView;

