import { CONNECTION_API, APP_URLS, getCallbackUrl, getSiteUrl } from '../api/apiurls.js';
import { ApiError } from '../utils/errors.js';
import { ERROR_CODES } from '../constants/api.js';
import apiGateway from '../api/gateway.js';

class ConnectionService {
    initiateConnection(projectId = null) {
        const callbackUrl = encodeURIComponent(getCallbackUrl());

        // Similar to Sigmize: use oauth_url parameter
        let connectUrl = `${APP_URLS.CONNECT()}?oauth_url=${callbackUrl}`;

        if (projectId) {
            connectUrl += `&project_id=${encodeURIComponent(projectId)}`;
        }

        // Open in the same tab
        window.location.href = connectUrl;
    }

    async exchangeToken(oauthToken) {
        try {
            const siteUrl = getSiteUrl();
            
            console.log('🔄 Exchanging OAuth token...', { oauthToken: oauthToken?.substring(0, 20) + '...', siteUrl });
            
            const response = await apiGateway.post(
                CONNECTION_API.EXCHANGE(),
                {
                    oauth_token: oauthToken,
                    site_url: siteUrl,
                }
            );

            console.log('✅ Exchange response:', response);

            if (!response.success) {
                console.error('❌ Exchange failed:', response);
                throw new ApiError(
                    response.message || 'Failed to exchange token',
                    response.status_code || 400,
                    response,
                    response.error_code || ERROR_CODES.TOKEN_EXCHANGE_FAILED
                );
            }

            if (response.data?.access_token) {
                console.log('🔑 Access token received, storing...', {
                    has_access_token: !!response.data.access_token,
                    connection_id: response.data.connection_id,
                    site_id: response.data.site_id,
                });
                
                apiGateway.storeBearerToken(response.data.access_token);

                try {
                    const storeData = {
                        access_token: response.data.access_token,
                        connection_id: response.data.connection_id,
                        organization_id: response.data.organization_id,
                        project_id: response.data.project_id,
                        site_id: response.data.site_id,
                        site_url: response.data.site_url,
                        site_api_url: response.data.site_api_url,
                        script_token: response.data.script_token,
                    };
                    
                    console.log('💾 Storing connection data:', storeData);
                    
                    const storeResult = await apiGateway.post('connection/store-token', storeData);
                    
                    console.log('💾 Store result:', storeResult);
                    
                    if (storeResult?.success) {
                        console.log('✅ Connection stored successfully, reloading page...');
                        window.location.reload();
                    } else {
                        console.error('❌ Store failed:', storeResult);
                    }
                } catch (e) {
                    console.error('❌ Failed to store connection token:', e);
                    throw e;
                }
            } else {
                console.error('❌ No access_token in response:', response);
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

    async handleOAuthCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const oauthToken = urlParams.get('oauth_token');

        console.log('🔍 Checking for OAuth callback...', { 
            hasOAuthToken: !!oauthToken,
            url: window.location.href 
        });

        if (!oauthToken) {
            console.log('⚠️ No oauth_token found in URL');
            return null;
        }

        try {
            console.log('🚀 Starting OAuth callback handling...');
            const connectionData = await this.exchangeToken(oauthToken);

            urlParams.delete('oauth_token');
            const newUrl = window.location.pathname + 
                (urlParams.toString() ? '?' + urlParams.toString() : '') + 
                window.location.hash;
            window.history.replaceState({}, '', newUrl);

            console.log('✅ OAuth callback completed successfully');
            return connectionData;
        } catch (error) {
            console.error('❌ OAuth callback failed:', error);
            urlParams.delete('oauth_token');
            urlParams.set('auth_error', '1');
            const newUrl = window.location.pathname + 
                '?' + urlParams.toString() + 
                window.location.hash;
            window.history.replaceState({}, '', newUrl);

            throw error;
        }
    }

    isAuthenticated() {
        // Check localized bearerToken first (from PHP)
        const localizedBearerToken = window.sureFeedbackAdmin?.bearerToken;
        if (localizedBearerToken) {
            return true;
        }
        
        // Check localStorage bearerToken
        const bearerToken = apiGateway.getBearerToken();
        if (bearerToken) {
            return true;
        }
        
        // Check connection data
        const connectionData = window.sureFeedbackAdmin?.connection;
        if (connectionData?.connection_id || connectionData?.type === 'saas' || connectionData?.is_saas) {
            return true;
        }
        
        return false;
    }

    getBearerToken() {
        return apiGateway.getBearerToken();
    }

    disconnect() {
        apiGateway.removeBearerToken();
    }

    async getConnectionStatus() {
        try {
            const response = await apiGateway.get(
                'connection/status'
            );

            if (response && response.success === false) {
                return null;
            }

            return response.data || response;
        } catch (error) {
            if (error instanceof ApiError && (error.status === 404 || error.status === 0)) {
                return null;
            }
            
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

    async updateConnectionStatus(pluginVersion, sitesCount = 0) {
        try {
            const siteId = window.sureFeedbackAdmin?.saas_site_id || 
                          (typeof get_option !== 'undefined' ? get_option('ph_child_site_id') : null);
            
            if (!siteId) {
                throw new ApiError('Site ID not found', 400, null, ERROR_CODES.CONNECTION_FAILED);
            }

            const bearerToken = apiGateway.getBearerToken();
            if (!bearerToken) {
                throw new ApiError('Bearer token not found', 401, null, ERROR_CODES.CONNECTION_FAILED);
            }

            const response = await fetch(CONNECTION_API.STATUS(), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${bearerToken}`,
                },
                body: JSON.stringify({
                    site_id: siteId,
                    plugin_version: pluginVersion,
                    sites_count: sitesCount,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new ApiError(
                    data.message || 'Failed to update connection status',
                    response.status || 400,
                    data,
                    data.error_code || ERROR_CODES.CONNECTION_FAILED
                );
            }

            return data.data;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            
            throw new ApiError(
                error.message || 'Failed to update connection status',
                0,
                null,
                ERROR_CODES.CONNECTION_FAILED
            );
        }
    }
}

export const connectionService = new ConnectionService();
export default connectionService;

