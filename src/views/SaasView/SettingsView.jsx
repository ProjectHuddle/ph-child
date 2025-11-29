import React, { useState, useEffect } from 'react';
import { useRouter } from '../../utils/Router.jsx';
import SaaSSettingsNavigation from '../../components/Plugin/SaaSSettingsNavigation.jsx';
import PermissionsView from './PermissionsView';
import WidgetControl from '../../components/SaaS/WidgetControl';

// WordPress i18n fallback
const __ = (text, domain) => {
  if (typeof window !== 'undefined' && window.wp && window.wp.i18n) {
    return window.wp.i18n.__(text, domain);
  }
  return text;
};

/**
 * Settings View for SaaS
 * 
 * Shows Settings with left sidebar navigation and main content area
 * Shows User Roles and Widget Control
 */
const SettingsView = () => {
    const router = useRouter();
    
    // Function to extract tab from URL
    const getTabFromUrl = () => {
        const hash = window.location.hash || '';
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        
        // Check hash for tab parameter (e.g., #settings?tab=user-roles)
        const hashMatch = hash.match(/[?&]tab=([^&]+)/);
        const tabFromHash = hashMatch ? hashMatch[1] : null;
        
        const activeTabValue = tabParam || tabFromHash || 'user-roles';
        
        // Valid tabs: user-roles, widget-control
        if (activeTabValue === 'user-roles' || activeTabValue === 'widget-control') {
            return activeTabValue;
        }
        
        return 'user-roles';
    };
    
    const [activeTab, setActiveTab] = useState(getTabFromUrl);

    // Update tab on mount and when route changes
    useEffect(() => {
        const tab = getTabFromUrl();
        setActiveTab(tab);
    }, [router.currentRoute]);

    // Listen for hash changes
    useEffect(() => {
        const handleHashChange = () => {
            const tab = getTabFromUrl();
            setActiveTab(tab);
        };

        // Also check on initial load
        const tab = getTabFromUrl();
        setActiveTab(tab);

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case 'user-roles':
                return (
                    <>
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                {__('Permission Management', 'surefeedback')}
                            </h2>
                            <p className="text-gray-600">
                                {__('Control what each user role can do in SureFeedback.', 'surefeedback')}
                            </p>
                        </div>
                        <PermissionsView activeTab={activeTab} />
                    </>
                );
            case 'widget-control':
                return <WidgetControl />;
            default:
                return (
                    <>
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                {__('Permission Management', 'surefeedback')}
                            </h2>
                            <p className="text-gray-600">
                                {__('Control what each user role can do in SureFeedback.', 'surefeedback')}
                            </p>
                        </div>
                        <PermissionsView activeTab={activeTab} />
                    </>
                );
        }
    };

    return (
        <div className="grid grid-cols-[15rem_1fr] auto-rows-fr bg-gray-50" style={{ minHeight: 'calc(100vh - 60px)' }}>
            <SaaSSettingsNavigation activeTab={activeTab} />
            <div className="max-h-full h-full overflow-y-auto bg-gray-50">
                <div className="p-8">
                    <div className="mx-auto" style={{ maxWidth: '800px' }}>
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;