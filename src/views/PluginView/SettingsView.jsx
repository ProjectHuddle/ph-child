/**
 * Settings View for Plugin
 * 
 * Shows Settings with sidebar navigation similar to SureForms
 * 
 * @package SureFeedback
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from '../../utils/Router.jsx';
import SettingsNavigation from '../../components/Plugin/SettingsNavigation.jsx';
import UserPermissionsView from './UserPermissionsView';
import CommentingView from './CommentingView';
import WhiteLabelView from './WhiteLabelView';

/**
 * Settings View
 * 
 * Shows Settings with left sidebar navigation and main content area
 */
const SettingsView = () => {
    const router = useRouter();
    
    // Function to extract tab from URL
    const getTabFromUrl = () => {
        const hash = window.location.hash || '';
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        
        // Check hash for tab parameter (e.g., #settings?tab=commenting)
        const hashMatch = hash.match(/[?&]tab=([^&]+)/);
        const tabFromHash = hashMatch ? hashMatch[1] : null;
        
        const activeTabValue = tabParam || tabFromHash || 'permissions';
        
        if (activeTabValue === 'permissions') {
            return 'permissions';
        } else if (activeTabValue === 'commenting') {
            return 'commenting';
        } else if (activeTabValue === 'white-label') {
            return 'white-label';
        }
        
        return 'permissions';
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
            case 'permissions':
                return <UserPermissionsView />;
            case 'commenting':
                return <CommentingView />;
            case 'white-label':
                return <WhiteLabelView />;
            default:
                return <UserPermissionsView />;
        }
    };

    return (
        <div className="grid grid-cols-[15rem_1fr] auto-rows-fr bg-gray-50" style={{ minHeight: 'calc(100vh - 60px)' }}>
            <SettingsNavigation activeTab={activeTab} />
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
