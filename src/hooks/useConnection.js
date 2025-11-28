/**
 * useConnection Hook
 * 
 * React hook for managing connection state and OAuth flow
 * 
 * @package SureFeedback
 */

import { useState, useEffect, useCallback } from 'react';
import connectionService from '../services/connectionService.js';
import { ApiError } from '../utils/errors.js';

/**
 * useConnection hook
 * 
 * @returns {Object} Connection state and methods
 */
export const useConnection = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [connectionData, setConnectionData] = useState(null);

    /**
     * Check authentication status
     */
    const checkAuth = useCallback(() => {
        const authenticated = connectionService.isAuthenticated();
        setIsAuthenticated(authenticated);
        return authenticated;
    }, []);

    /**
     * Handle OAuth callback
     */
    const handleCallback = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await connectionService.handleOAuthCallback();
            
            if (data) {
                setConnectionData(data);
                setIsAuthenticated(true);
                return data;
            }

            return null;
        } catch (err) {
            const errorMessage = err instanceof ApiError 
                ? err.getUserMessage() 
                : err.message || 'Connection failed';
            
            setError(errorMessage);
            setIsAuthenticated(false);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Initiate connection - redirects to SureFeedback app
     */
    const initiateConnection = useCallback((projectId = null) => {
        // This redirects immediately, no async needed
        connectionService.initiateConnection(projectId);
    }, []);

    /**
     * Disconnect
     */
    const disconnect = useCallback(() => {
        connectionService.disconnect();
        setIsAuthenticated(false);
        setConnectionData(null);
    }, []);

    // Check auth on mount
    useEffect(() => {
        checkAuth();
        setIsLoading(false);
    }, [checkAuth]);

    // Handle OAuth callback on mount if token present
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('oauth_token')) {
            handleCallback();
        }
    }, [handleCallback]);

    return {
        isAuthenticated,
        isLoading,
        error,
        connectionData,
        checkAuth,
        handleCallback,
        initiateConnection,
        disconnect,
    };
};

export default useConnection;

