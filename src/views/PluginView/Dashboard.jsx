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
import PluginDashboardView from './DashboardView.jsx';
import PluginConnectionView from './PluginConnectionView.jsx';
import SettingsView from './SettingsView.jsx';

// Import shared components
import NavMenu from '../../components/SaaS/NavMenu.jsx';

/**
 * Plugin Dashboard Content Component
 */
const PluginDashboardContent = () => {
    const { currentRoute } = useRouter();
    
    const isConnectionRoute = currentRoute === 'plugin-connection';
    const isSettingsRoute = currentRoute === 'settings';

    return (
        <div className="surefeedback-dashboard flex flex-col bg-gray-50 w-full overflow-x-hidden" style={{ margin: 0, padding: 0, width: "100%", maxWidth: "100vw" }}>
            {/* Top Navigation - show for all routes except connection form */}
            <div className="bg-white shadow-sm w-full" style={{ margin: 0, padding: 0, width: "100%" }}>
                <NavMenu />
            </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    <main>
                        <Route path="plugin-dashboard" exact>
                            <PluginDashboardView />
                        </Route>
                        <Route path="plugin-connection" exact>
                            <PluginConnectionView />
                        </Route>
                        <Route path="settings" exact>
                            <SettingsView />
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
            if (containerType === 'connection') return 'plugin-connection';
            if (containerType === 'dashboard') return 'plugin-dashboard';
            
            // Default to dashboard view for plugin
            return 'plugin-dashboard';
        };

    return (
        <RouterProvider defaultRoute={getDefaultRoute()}>
            <PluginDashboardContent />
        </RouterProvider>
    );
};

export default PluginDashboard;

