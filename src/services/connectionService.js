/**
 * Connection Service
 * 
 * Service for handling OAuth-like connection flow with SureFeedback API
 * 
 * @package SureFeedback
 */

import { CONNECTION_API, APP_URLS, getCallbackUrl, getSiteUrl } from '../api/apiurls.js';
import { ApiError } from '../utils/errors.js';
import { ERROR_CODES } from '../constants/api.js';
import apiGateway from '../api/gateway.js';

/**
 * Connection Service
 */
class ConnectionService {
    /**
     * Initiate connection - redirect to SureFeedback app
     * The SureFeedback app will handle authentication and token creation
     * 
     * @param {string} projectId - Optional project ID (if available)
     * @returns {void} Redirects to SureFeedback connect page
     */
    initiateConnection(projectId = null) {
        const callbackUrl = encodeURIComponent(getCallbackUrl());
        
        // Build connect URL with callback
        let connectUrl = `${APP_URLS.CONNECT()}?redirect_url=${callbackUrl}`;
        
        // Add project ID if provided
        if (projectId) {
            connectUrl += `&project_id=${encodeURIComponent(projectId)}`;
        }
        
        // Redirect to SureFeedback app
        window.location.href = connectUrl;
    }

    /**
     * Exchange OAuth token for bearer token
     * 
     * @param {string} oauthToken - OAuth token from URL
     * @returns {Promise<Object>} Connection data with bearer token
     */
    async exchangeToken(oauthToken) {
        try {
            const siteUrl = getSiteUrl();
            
            const response = await apiGateway.post(
                CONNECTION_API.EXCHANGE(),
                {
                    oauth_token: oauthToken,
                    site_url: siteUrl,
                },
                {
                    requireAuth: false,
                }
            );

            if (!response.success) {
                throw new ApiError(
                    response.message || 'Failed to exchange token',
                    response.status_code || 400,
                    response,
                    response.error_code || ERROR_CODES.TOKEN_EXCHANGE_FAILED
                );
            }

            // Store bearer token
            if (response.data?.access_token) {
                apiGateway.storeBearerToken(response.data.access_token);
                
                // Also store in WordPress options via REST API for persistence
                // This allows PHP to detect SaaS connections
                try {
                    await apiGateway.post('connection/store-token', {
                        access_token: response.data.access_token,
                        connection_id: response.data.connection_id,
                        organization_id: response.data.organization_id,
                        project_id: response.data.project_id,
                        site_id: response.data.site_id,
                    });
                } catch (e) {
                    console.warn('Failed to store token in WordPress options:', e);
                    // Continue even if storage fails - token is still in localStorage
                }
            }

            return response.data;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            
            throw new ApiError(
                error.message || 'Failed to exchange token',
                0,
                null,
                ERROR_CODES.TOKEN_EXCHANGE_FAILED
            );
        }
    }

    /**
     * Handle OAuth callback - check for token in URL and exchange it
     * 
     * @returns {Promise<Object|null>} Connection data if token was exchanged, null otherwise
     */
    async handleOAuthCallback() {
        // Check for oauth_token in URL
        const urlParams = new URLSearchParams(window.location.search);
        const oauthToken = urlParams.get('oauth_token');

        if (!oauthToken) {
            return null;
        }

        try {
            // Exchange token
            const connectionData = await this.exchangeToken(oauthToken);

            // Remove oauth_token from URL
            urlParams.delete('oauth_token');
            const newUrl = window.location.pathname + 
                (urlParams.toString() ? '?' + urlParams.toString() : '') + 
                window.location.hash;
            window.history.replaceState({}, '', newUrl);

            return connectionData;
        } catch (error) {
            // Add error to URL for display
            urlParams.delete('oauth_token');
            urlParams.set('auth_error', '1');
            const newUrl = window.location.pathname + 
                '?' + urlParams.toString() + 
                window.location.hash;
            window.history.replaceState({}, '', newUrl);

            throw error;
        }
    }

    /**
     * Check if user is authenticated (has bearer token)
     * 
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!apiGateway.getBearerToken();
    }

    /**
     * Get stored bearer token
     * 
     * @returns {string|null}
     */
    getBearerToken() {
        return apiGateway.getBearerToken();
    }

    /**
     * Disconnect - remove bearer token
     */
    disconnect() {
        apiGateway.removeBearerToken();
    }

    /**
     * Get connection status
     * 
     * @returns {Promise<Object>} Connection status
     */
    async getConnectionStatus() {
        try {
            const response = await apiGateway.get(
                CONNECTION_API.STATUS(),
                {
                    requireAuth: true,
                }
            );

            return response.data || response;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            
            throw new ApiError(
                error.message || 'Failed to get connection status',
                0,
                null,
                ERROR_CODES.CONNECTION_FAILED
            );
        }
    }
}

// Export singleton instance
export const connectionService = new ConnectionService();
export default connectionService;

