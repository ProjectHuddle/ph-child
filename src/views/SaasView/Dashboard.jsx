/**
 * SaaS Dashboard Component
 * 
 * Routes for SaaS connection views
 * 
 * @package SureFeedback
 */

import React from 'react';
import { RouterProvider, Route, useRouter } from '../../utils/Router.jsx';

// Import SaaS views
import SetupView from './SetupView.jsx';
import ConnectionView from './ConnectionView.jsx';
import SettingsView from './SettingsView.jsx';
import WidgetControlView from './WidgetControlView.jsx';

// Import navigation
import NavMenu from '../../components/SaaS/NavMenu.jsx';

/**
 * SaaS Dashboard Content Component
 */
const SaasDashboardContent = () => {
    const { currentRoute } = useRouter();
    
    const isSetupRoute = currentRoute === 'setup';
    const isConnectionRoute = currentRoute === 'connections';

    return (
        <div className="surefeedback-dashboard flex flex-col bg-gray-50 w-full overflow-x-hidden" style={{ margin: 0, padding: 0, width: "100%", maxWidth: "100vw" }}>
            {/* Top Navigation - hide on setup route */}
            {!isSetupRoute && (
                <div className="bg-white shadow-sm w-full" style={{ margin: 0, padding: 0, width: "100%" }}>
                    <NavMenu />
                </div>
            )}

            {/* Main Content Area */}
            <div className={`flex-1 ${isSetupRoute || isConnectionRoute ? '' : 'bg-white'}`}>
                <main className={isSetupRoute || isConnectionRoute ? '' : 'p-2'}>
                    <Route path="setup" exact>
                        <SetupView />
                    </Route>
                    <Route path="connections" exact>
                        <ConnectionView />
                    </Route>
                    <Route path="settings" exact>
                        <SettingsView />
                    </Route>
                    <Route path="widget-control" exact>
                        <WidgetControlView />
                    </Route>
                </main>
            </div>
        </div>
    );
};

/**
 * SaaS Dashboard Component
 */
const SaasDashboard = ({ containerType = 'dashboard' }) => {
    const getDefaultRoute = () => {
        // Check for specific page requests
        if (containerType === 'settings') return 'settings';
        if (containerType === 'connection') return 'connections';
        if (containerType === 'widget-control') return 'widget-control';
        if (containerType === 'tools') return 'tools';

        // Check actual connection status
        const { getConnectionType } = require('../../utils/connectionType.js');
        let connectionType = 'none';
        try {
            connectionType = getConnectionType();
        } catch (e) {
            console.warn('Error getting connection type:', e);
        }
        
        const hasSaaSConnection = connectionType === 'saas';
        
        // If already connected, show connections view
        if (hasSaaSConnection) {
            return 'connections';
        }

        // If not connected, show setup
        return 'setup';
    };

    return (
        <RouterProvider defaultRoute={getDefaultRoute()}>
            <SaasDashboardContent />
        </RouterProvider>
    );
};

export default SaasDashboard;