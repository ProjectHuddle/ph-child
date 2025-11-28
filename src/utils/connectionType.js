/**
 * Connection Type Detection
 * 
 * Detects whether the connection is legacy (old plugin) or SaaS (new OAuth flow)
 * 
 * @package SureFeedback
 */

// Check for bearer token without importing connectionService to avoid circular dependencies
const hasBearerToken = () => {
    try {
        // Check localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
            const token = localStorage.getItem('surefeedback_bearer_token');
            if (token) return true;
        }
        // Check window object
        if (window.sureFeedbackAdmin?.bearerToken) {
            return true;
        }
    } catch (e) {
        // localStorage might not be available
    }
    return false;
};

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
    if (typeof window === 'undefined' || !window.sureFeedbackAdmin) {
        return false;
    }
    
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
    if (typeof window === 'undefined' || !window.sureFeedbackAdmin) {
        return false;
    }
    
    const connectionData = window.sureFeedbackAdmin?.connection;
    
    // Use the connection type from PHP if available
    if (connectionData?.type === 'saas') {
        return true;
    }
    
    if (connectionData?.is_saas === true) {
        return true;
    }
    
    // Check for bearer token (safely, without importing connectionService)
    if (hasBearerToken()) {
        return true;
    }
    
    // Check for SaaS connection data
    const hasSaaSData = connectionData?.connection_id || connectionData?.access_token;
    
    return hasSaaSData;
};

/**
 * Get connection type
 * 
 * @returns {'legacy'|'saas'|'none'}
 */
export const getConnectionType = () => {
    // Safely check for window and sureFeedbackAdmin
    if (typeof window === 'undefined' || !window.sureFeedbackAdmin) {
        return 'none';
    }
    
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

