/**
 * Main Dashboard Component
 * 
 * Routes to Plugin or SaaS views based on connection type preference
 * 
 * @package SureFeedback
 */

import React from 'react';
import { RouterProvider, Route, useRouter } from '../utils/Router.jsx';
import { getConnectionType } from '../utils/connectionType.js';

// Import choice view
import ConnectionChoiceView from './ConnectionChoiceView.jsx';

// Import Plugin views
import PluginDashboard from './PluginView/Dashboard.jsx';

// Import SaaS views
import SaasDashboard from './SaasView/Dashboard.jsx';

/**
 * Dashboard Content Component
 * Routes based on connection type preference
 */
const DashboardContent = ({ containerType = 'dashboard' }) => {
    const { currentRoute } = useRouter();
    
    // Get connection type preference
    const connectionTypePreference = window.sureFeedbackAdmin?.connectionTypePreference || '';
    
    // Always show choice screen if no preference
    if (!connectionTypePreference || connectionTypePreference === '') {
        return <ConnectionChoiceView />;
    }

    // Route to appropriate dashboard based on preference
    if (connectionTypePreference === 'plugin') {
        return <PluginDashboard containerType={containerType} />;
    }

    if (connectionTypePreference === 'saas') {
        return <SaasDashboard containerType={containerType} />;
    }

    // Fallback to choice screen
    return <ConnectionChoiceView />;
};

/**
 * Main Dashboard Component
 * 
 * Acts as the main router and layout container for the application
 * Routes between different views based on connection type preference
 */
const Dashboard = ({ containerType: propContainerType = 'dashboard' }) => {
    // Get containerType from data attribute or prop
    // Use React.useEffect to safely access DOM
    const [containerType, setContainerType] = React.useState(propContainerType);
    
    React.useEffect(() => {
        const appElement = document.getElementById('ph-child-app');
        if (appElement) {
            const dataType = appElement.getAttribute('data-container-type');
            if (dataType) {
                setContainerType(dataType);
            }
        }
    }, []);
    
    // Determine default route based on container type and connection status
    const getDefaultRoute = () => {
        // FIRST: ALWAYS check for connection type preference FIRST
        const connectionTypePreference = window.sureFeedbackAdmin?.connectionTypePreference || '';
        
        if (!connectionTypePreference || connectionTypePreference === '' || connectionTypePreference === null || connectionTypePreference === undefined) {
            // No preference saved - ALWAYS show choice screen first
            return 'connection-choice';
        }

        // Only after preference is confirmed, check for specific page requests
        if (containerType === 'settings') return 'settings';
        if (containerType === 'white-label') return 'white-label';
        if (containerType === 'connection') {
            return connectionTypePreference === 'plugin' ? 'plugin-connection' : 'connections';
        }
        if (containerType === 'widget-control') return 'widget-control';
        if (containerType === 'tools') return 'tools';

        // Check actual connection status
        let connectionType = 'none';
        try {
            connectionType = getConnectionType();
        } catch (e) {
            console.warn('Error getting connection type:', e);
        }
        
        const hasLegacyConnection = connectionType === 'legacy';
        const hasSaaSConnection = connectionType === 'saas';
        
        // If already connected, show appropriate view
        if (hasLegacyConnection && connectionTypePreference === 'plugin') {
            return 'plugin-connection';
        }
        if (hasSaaSConnection && connectionTypePreference === 'saas') {
            return 'connections';
        }

        // If preference is saved but no connection yet, show appropriate setup
        if (connectionTypePreference === 'plugin') {
            return 'plugin-connection';
        }
        if (connectionTypePreference === 'saas') {
            return 'setup';
        }

        // Fallback to choice screen
        return 'connection-choice';
    };

    return (
        <RouterProvider defaultRoute={getDefaultRoute()}>
            <DashboardContent containerType={containerType} />
        </RouterProvider>
    );
};

export default Dashboard;

