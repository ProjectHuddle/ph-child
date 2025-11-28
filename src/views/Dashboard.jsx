import React from 'react';
import { RouterProvider, Route, useRouter } from '../utils/Router';

// Import main views
import SetupView from './SetupView';
import ConnectionView from './ConnectionView';
import PermissionsView from './PermissionsView';
import SettingsView from './SettingsView';
import WidgetControlView from './WidgetControlView';

// Import navigation
import NavMenu from '../components/NavMenu';

/**
 * Dashboard Content Component
 * This component needs to be inside RouterProvider to access useRouter
 */
const DashboardContent = () => {
    const { currentRoute } = useRouter();
    const isSetupRoute = currentRoute === 'setup';

    return (
        <div className="surefeedback-dashboard flex flex-col bg-gray-50 w-full overflow-x-hidden" style={{ margin: 0, padding: 0, width: "100%", maxWidth: "100vw" }}>
            {/* Conditionally render Top Navigation - hide on setup route */}
            {!isSetupRoute && (
                <div className="bg-white shadow-sm w-full" style={{ margin: 0, padding: 0, width: "100%" }}>
                    <NavMenu />
                </div>
            )}

            {/* Main Content Area */}
            <div className={`flex-1 ${isSetupRoute ? '' : 'bg-white'}`}>
                <main className={isSetupRoute ? '' : 'p-2'}>
                    <Route path="setup" exact>
                        <SetupView />
                    </Route>
                    <Route path="connections" exact>
                        <ConnectionView />
                    </Route>
                    <Route path="permissions" exact>
                        <PermissionsView />
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
 * Main Dashboard Component
 *
 * Acts as the main router and layout container for the application
 * Routes between different views based on URL hash
 */
const Dashboard = ({ containerType = 'dashboard' }) => {
    // Determine default route based on container type and connection status
    const getDefaultRoute = () => {
        // If we're on a specific page (settings, connection, tools), set that as default
        if (containerType === 'settings') return 'settings';
        if (containerType === 'connection') return 'connections';
        if (containerType === 'widget-control') return 'widget-control';
        if (containerType === 'tools') return 'tools';

        // For dashboard, check connection status
        const isConnected = window.sureFeedbackAdmin?.connection?.site_data?.site_url;
        return isConnected ? 'connections' : 'setup';
    };

    return (
        <RouterProvider defaultRoute={getDefaultRoute()}>
            <DashboardContent />
        </RouterProvider>
    );
};

export default Dashboard;