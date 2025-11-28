import React from 'react';
import { __ } from '@wordpress/i18n';
import useSettings from '../../hooks/useSettings.js';
import ContentSection from '../../components/Plugin/ContentSection.jsx';
import CommentingSection from '../../components/Plugin/CommentingSection.jsx';
import SaveButton from '../../components/Plugin/SaveButton.jsx';
import ErrorNotice from '../../components/Plugin/ErrorNotice.jsx';

/**
 * Commenting View
 * 
 * Manages commenting settings for site visitors and dashboard
 */
const CommentingView = () => {
  const {
    state,
    saveGeneralSettings,
    updateState,
    clearErrors,
  } = useSettings();

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

  return (
    <div className="space-y-6">
      <ContentSection
        loading={state.loading}
        title={__('Commenting Settings', 'surefeedback')}
        content={
          <CommentingSection
            allowSiteVisitors={state.general?.ph_child_guest_comments_enabled || false}
            onToggleSiteVisitors={toggleGuestComments}
            allowDashboardCommenting={state.general?.ph_child_admin || false}
            onToggleDashboardCommenting={toggleAdminComments}
          />
        }
      />

      {!state.loading && (
        <>
          <SaveButton
            onClick={handleSave}
            saving={state.saving}
            disabled={state.saving}
          />

          <ErrorNotice
            error={state.errors?.general}
            onDismiss={clearErrors}
          />
        </>
      )}
    </div>
  );
};

export default CommentingView;

