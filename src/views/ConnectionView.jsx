import React, { useEffect } from 'react';
import { useConnection } from '../hooks/useConnection.js';
import Connected from '../components/Connected';
import NotConnected from '../components/NotConnected';
import ConnectionFailed from '../components/ConnectionFailed';
import UnverifiedState from '../components/UnverifiedState';

const ConnectionView = () => {
    const { 
        isAuthenticated, 
        isLoading, 
        error, 
        connectionData,
        handleCallback 
    } = useConnection();

    // Handle OAuth callback on mount
    useEffect(() => {
        // Check for oauth_token in URL
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('oauth_token')) {
            handleCallback();
        }
    }, [handleCallback]);

    // Check for auth error in URL
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('auth_error')) {
            // Auth error will be handled by the hook
        }
    }, []);

    const renderConnectionStatus = () => {
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
    };
    
    return (
        <div className="surefeedback-connection-view">
            {renderConnectionStatus()}
        </div>
    );
};

export default ConnectionView;