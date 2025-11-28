/**
 * Plugin Dashboard Component
 * 
 * Routes for Plugin (Legacy) connection views
 * 
 * @package SureFeedback
 */

import React from 'react';
import { RouterProvider, Route, useRouter } from '../../utils/Router.jsx';

// Import Plugin views
import PluginConnectionView from './PluginConnectionView.jsx';
import SettingsView from './SettingsView.jsx';
import WhiteLabelSettingsView from './WhiteLabelSettingsView.jsx';

// Import shared components
import NavMenu from '../../components/SaaS/NavMenu.jsx';

/**
 * Plugin Dashboard Content Component
 */
const PluginDashboardContent = () => {
    const { currentRoute } = useRouter();
    
    const isConnectionRoute = currentRoute === 'plugin-connection';
    const isSettingsRoute = currentRoute === 'settings' || currentRoute === 'white-label';

    return (
        <div className="surefeedback-dashboard flex flex-col bg-gray-50 w-full overflow-x-hidden" style={{ margin: 0, padding: 0, width: "100%", maxWidth: "100vw" }}>
            {/* Top Navigation - show for all routes except connection form */}
            <div className="bg-white shadow-sm w-full" style={{ margin: 0, padding: 0, width: "100%" }}>
                <NavMenu />
            </div>

            {/* Main Content Area */}
            <div className={`flex-1 ${isConnectionRoute ? '' : 'bg-white'}`}>
                <main className={isConnectionRoute ? '' : 'p-2'}>
                    <Route path="plugin-connection" exact>
                        <PluginConnectionView />
                    </Route>
                    <Route path="settings" exact>
                        <SettingsView />
                    </Route>
                    <Route path="white-label" exact>
                        <WhiteLabelSettingsView />
                    </Route>
                </main>
            </div>
        </div>
    );
};

/**
 * Plugin Dashboard Component
 */
const PluginDashboard = ({ containerType = 'dashboard' }) => {
    const getDefaultRoute = () => {
        if (containerType === 'settings') return 'settings';
        if (containerType === 'white-label') return 'white-label';
        if (containerType === 'connection') return 'plugin-connection';
        
        // Default to connection view for plugin
        return 'plugin-connection';
    };

    return (
        <RouterProvider defaultRoute={getDefaultRoute()}>
            <PluginDashboardContent />
        </RouterProvider>
    );
};

export default PluginDashboard;

