import React from 'react';
import { __ } from '@wordpress/i18n';
import useSettings from '../../hooks/useSettings.js';
import ContentSection from '../../components/Plugin/ContentSection.jsx';
import WhiteLabelSection from '../../components/Plugin/WhiteLabelSection.jsx';
import SaveButton from '../../components/Plugin/SaveButton.jsx';
import ErrorNotice from '../../components/Plugin/ErrorNotice.jsx';

/**
 * White Label View
 * 
 * Manages white label settings for plugin branding
 */
const WhiteLabelView = () => {
  const {
    state,
    saveWhiteLabelSettings,
    updateState,
    clearErrors,
  } = useSettings();

  const handlePluginNameChange = (value) => {
    updateState({
      whiteLabel: {
        ...state.whiteLabel,
        ph_child_plugin_name: value,
      },
    });
  };

  const handlePluginDescriptionChange = (value) => {
    updateState({
      whiteLabel: {
        ...state.whiteLabel,
        ph_child_plugin_description: value,
      },
    });
  };

  const handlePluginAuthorChange = (value) => {
    updateState({
      whiteLabel: {
        ...state.whiteLabel,
        ph_child_plugin_author: value,
      },
    });
  };

  const handlePluginAuthorUrlChange = (value) => {
    updateState({
      whiteLabel: {
        ...state.whiteLabel,
        ph_child_plugin_author_url: value,
      },
    });
  };

  const handlePluginLinkChange = (value) => {
    updateState({
      whiteLabel: {
        ...state.whiteLabel,
        ph_child_plugin_link: value,
      },
    });
  };

  const handleSave = async () => {
    const success = await saveWhiteLabelSettings();
    if (success) {
      // Settings saved successfully
    }
  };

  return (
    <div className="space-y-6">
      <ContentSection
        loading={state.loading}
        title={__('White Label Settings', 'surefeedback')}
        content={
          <WhiteLabelSection
            pluginName={state.whiteLabel?.ph_child_plugin_name || ''}
            onPluginNameChange={handlePluginNameChange}
            pluginDescription={state.whiteLabel?.ph_child_plugin_description || ''}
            onPluginDescriptionChange={handlePluginDescriptionChange}
            pluginAuthor={state.whiteLabel?.ph_child_plugin_author || ''}
            onPluginAuthorChange={handlePluginAuthorChange}
            pluginAuthorUrl={state.whiteLabel?.ph_child_plugin_author_url || ''}
            onPluginAuthorUrlChange={handlePluginAuthorUrlChange}
            pluginLink={state.whiteLabel?.ph_child_plugin_link || ''}
            onPluginLinkChange={handlePluginLinkChange}
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
            error={state.errors?.whiteLabel}
            onDismiss={clearErrors}
          />
        </>
      )}
    </div>
  );
};

export default WhiteLabelView;

