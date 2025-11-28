/**
 * Settings View for Plugin
 * 
 * Shows General Settings only (White Label is now a separate top-level navigation item)
 * 
 * @package SureFeedback
 */

import React from 'react';
import GeneralSettingsView from './GeneralSettingsView';

/**
 * Settings View
 * 
 * Shows General Settings directly without tabs
 */
const SettingsView = () => {
    return (
        <div className="surefeedback-settings-view">
            <GeneralSettingsView />
        </div>
    );
};

export default SettingsView;
