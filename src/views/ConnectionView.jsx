import React, { useEffect } from 'react';
import { useConnection } from '../hooks/useConnection.js';
import { getConnectionType } from '../utils/connectionType.js';
import Connected from '../components/Connected';
import NotConnected from '../components/NotConnected';
import ConnectionFailed from '../components/ConnectionFailed';
import UnverifiedState from '../components/UnverifiedState';
import LegacyConnected from '../components/LegacyConnected';

const ConnectionView = () => {
    const { 
        isAuthenticated, 
        isLoading, 
        error, 
        connectionData,
        handleCallback 
    } = useConnection();

    // Get connection type
    const connectionType = getConnectionType();

    // Handle OAuth callback on mount (only for SaaS connections)
    useEffect(() => {
        if (connectionType === 'saas') {
            // Check for oauth_token in URL
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('oauth_token')) {
                handleCallback();
            }
        }
    }, [handleCallback, connectionType]);

    const renderConnectionStatus = () => {
        // Legacy connection - show legacy UI
        if (connectionType === 'legacy') {
            return <LegacyConnected />;
        }

        // SaaS connection flow
        if (connectionType === 'saas') {
            // Show loading state
            if (isLoading) {
                return <UnverifiedState showLoading={true} />;
            }

            // Show error state
            if (error && !isAuthenticated) {
                return <ConnectionFailed error={error} />;
            }

            // Show connected state
            if (isAuthenticated && connectionData) {
                return <Connected connectionData={connectionData} />;
            }

            // Show not connected state
            return <NotConnected />;
        }

        // No connection - show not connected (will show SaaS flow)
        return <NotConnected />;
    };
    
    return (
        <div className="surefeedback-connection-view">
            {renderConnectionStatus()}
        </div>
    );
};

export default ConnectionView;