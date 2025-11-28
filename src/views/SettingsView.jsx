import React from 'react';
import { __ } from '@wordpress/i18n';

// Import the GeneralSettings component
import GeneralSettings from '../components/GeneralSettings';

const SettingsView = () => {
    return (
        <div className="surefeedback-settings-view">
            <GeneralSettings />
        </div>
    );
};

export default SettingsView;