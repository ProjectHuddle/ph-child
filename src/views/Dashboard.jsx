import React from 'react';
import { RouterProvider, Route, useRouter } from '../utils/Router.jsx';
import { getConnectionType } from '../utils/connectionType.js';

import ConnectionChoiceView from './ConnectionChoiceView.jsx';

import PluginDashboard from './PluginView/Dashboard.jsx';

import SaasDashboard from './SaasView/Dashboard.jsx';

const DashboardContent = ({ containerType = 'dashboard' }) => {
    const { currentRoute } = useRouter();
    const [connectionTypePreference, setConnectionTypePreference] = React.useState(
        () => window.sureFeedbackAdmin?.connectionTypePreference || ''
    );

    React.useEffect(() => {
        const handleConnectionTypeChange = (event) => {
            const newType = event.detail?.type || window.sureFeedbackAdmin?.connectionTypePreference || '';
            setConnectionTypePreference(newType);
        };

        const checkPreference = () => {
            const currentPreference = window.sureFeedbackAdmin?.connectionTypePreference || '';
            if (currentPreference !== connectionTypePreference) {
                setConnectionTypePreference(currentPreference);
            }
        };
        
        window.addEventListener('connectionTypeChanged', handleConnectionTypeChange);
        const interval = setInterval(checkPreference, 500);
        
        return () => {
            window.removeEventListener('connectionTypeChanged', handleConnectionTypeChange);
            clearInterval(interval);
        };
    }, [connectionTypePreference]);

    if (currentRoute === 'connection-choice') {
        return <ConnectionChoiceView />;
    }

    if (!connectionTypePreference || connectionTypePreference === '') {
        return <ConnectionChoiceView />;
    }

    if (connectionTypePreference === 'plugin') {
        return <PluginDashboard containerType={containerType} />;
    }

    if (connectionTypePreference === 'saas') {
        return <SaasDashboard containerType={containerType} />;
    }

    return <ConnectionChoiceView />;
};

const Dashboard = ({ containerType: propContainerType = 'dashboard' }) => {
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

    const getDefaultRoute = () => {
        const connectionTypePreference = window.sureFeedbackAdmin?.connectionTypePreference || '';

        if (!connectionTypePreference || connectionTypePreference === '' || connectionTypePreference === null || connectionTypePreference === undefined) {
            return 'connection-choice';
        }

        if (containerType === 'settings') return 'settings';
        if (containerType === 'white-label') return 'white-label';
        if (containerType === 'widget-control') return 'widget-control';
        if (containerType === 'tools') return 'tools';
        if (containerType === 'connection') {
            // Connection page - route based on connection type preference
            if (connectionTypePreference === 'saas') {
                return 'setup';
            }
            if (connectionTypePreference === 'plugin') {
                return 'plugin-connection';
            }
            return 'connection-choice';
        }
        if (containerType === 'dashboard') {
            return connectionTypePreference === 'plugin' ? 'plugin-dashboard' : 'dashboard';
        }

        let connectionType = 'none';
        try {
            connectionType = getConnectionType();
        } catch (e) {
        }

        const hasLegacyConnection = connectionType === 'legacy';
        const hasSaaSConnection = connectionType === 'saas';

        if (hasLegacyConnection && connectionTypePreference === 'plugin') {
            return 'plugin-dashboard';
        }
        if (hasSaaSConnection && connectionTypePreference === 'saas') {
            return 'dashboard';
        }

        if (connectionTypePreference === 'plugin') {
            return 'plugin-connection';
        }
        if (connectionTypePreference === 'saas') {
            return 'setup';
        }

        return 'connection-choice';
    };

    return (
        <RouterProvider defaultRoute={getDefaultRoute()}>
            <DashboardContent containerType={containerType} />
        </RouterProvider>
    );
};

export default Dashboard;

