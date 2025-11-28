/**
 * Connection Type Detection
 * 
 * Detects whether the connection is legacy (old plugin) or SaaS (new OAuth flow)
 * 
 * @package SureFeedback
 */

import connectionService from '../services/connectionService.js';

/**
 * Check if connection is legacy (old plugin system)
 * Legacy connections use:
 * - ph_child_parent_url
 * - ph_child_id
 * - ph_child_api_key
 * 
 * @returns {boolean}
 */
export const isLegacyConnection = () => {
    const connectionData = window.sureFeedbackAdmin?.connection;
    
    // Use the connection type from PHP if available
    if (connectionData?.type === 'legacy') {
        return true;
    }
    
    if (connectionData?.is_legacy === true) {
        return true;
    }
    
    // Check for legacy connection indicators
    const hasParentUrl = connectionData?.site_data?.site_url;
    const hasSiteId = connectionData?.site_id;
    const hasApiKey = connectionData?.api_key;
    
    return !!(hasParentUrl && hasSiteId && hasApiKey);
};

/**
 * Check if connection is SaaS (new OAuth system)
 * SaaS connections use:
 * - Bearer token stored in localStorage
 * - Connection data from API
 * 
 * @returns {boolean}
 */
export const isSaaSConnection = () => {
    const connectionData = window.sureFeedbackAdmin?.connection;
    
    // Use the connection type from PHP if available
    if (connectionData?.type === 'saas') {
        return true;
    }
    
    if (connectionData?.is_saas === true) {
        return true;
    }
    
    // Check for bearer token
    const hasBearerToken = connectionService.isAuthenticated();
    
    // Check for SaaS connection data
    const hasSaaSData = connectionData?.connection_id || connectionData?.access_token;
    
    return hasBearerToken || hasSaaSData;
};

/**
 * Get connection type
 * 
 * @returns {'legacy'|'saas'|'none'}
 */
export const getConnectionType = () => {
    const connectionData = window.sureFeedbackAdmin?.connection;
    
    // Use type from PHP if available
    if (connectionData?.type) {
        return connectionData.type;
    }
    
    if (isLegacyConnection()) {
        return 'legacy';
    }
    
    if (isSaaSConnection()) {
        return 'saas';
    }
    
    return 'none';
};

export default {
    isLegacyConnection,
    isSaaSConnection,
    getConnectionType,
};

