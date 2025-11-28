import React, { useState, useEffect } from 'react';
import TabNavigation from '../../components/Plugin/TabNavigation';
import GeneralSettingsView from '../../views/PluginView/GeneralSettingsView';
import WhiteLabelSettingsView from '../../views/PluginView/WhiteLabelSettingsView';

// WordPress i18n fallback
const __ = (text, domain) => {
  if (typeof window !== 'undefined' && window.wp && window.wp.i18n) {
    return window.wp.i18n.__(text, domain);
  }
  return text;
};

/**
 * Settings View with Tabs
 * 
 * Shows General Settings and White Label Settings in tabs
 */
const SettingsView = () => {
    const [activeTab, setActiveTab] = useState('general');

    // Get initial tab from URL hash
    useEffect(() => {
        const hash = window.location.hash.replace('#', '');
        if (hash === 'general' || hash === 'white-label') {
            setActiveTab(hash);
        }
    }, []);

    const tabs = [
        {
            id: 'general',
            label: __('General', 'surefeedback'),
            visible: true,
        },
        {
            id: 'white-label',
            label: __('White Label', 'surefeedback'),
            visible: true,
        },
    ].filter(tab => tab.visible);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        window.location.hash = tabId;
    };

    return (
        <div className="surefeedback-settings-view">
            <TabNavigation
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />
            <div className="settings-content">
                {activeTab === 'general' && <GeneralSettingsView />}
                {activeTab === 'white-label' && <WhiteLabelSettingsView />}
            </div>
        </div>
    );
};

export default SettingsView;