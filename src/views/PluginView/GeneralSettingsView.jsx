import React from 'react';
import { __ } from '@wordpress/i18n';
import ContentSection from '../../components/Plugin/ContentSection.jsx';

/**
 * General Settings View
 * 
 * General settings page (can be expanded with more general settings in the future)
 */
const GeneralSettingsView = () => {
  return (
    <div className="space-y-6">
      <ContentSection
        loading={false}
        title={__('General Settings', 'surefeedback')}
        content={
          <div className="text-sm text-gray-600">
            <p>{__('General settings for SureFeedback will be available here.', 'surefeedback')}</p>
          </div>
        }
      />
    </div>
  );
};

export default GeneralSettingsView;
