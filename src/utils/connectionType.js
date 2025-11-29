/**
 * Connection Type Detection
 * 
 * Detects whether the connection is legacy (old plugin) or SaaS (new OAuth flow)
 * 
 * @package SureFeedback
 */

// Bearer token check removed - using nonce-only authentication

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
 * - Connection data from API
 * - Nonce-based authentication
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
    
    // Check connection type preference first - if set, prioritize it
    const preference = window.sureFeedbackAdmin?.connectionTypePreference || '';
    
    if (preference === 'saas') {
        // If preference is SaaS, return 'saas' to trigger SaaS flow
        // The actual connection status will be determined by connection data
        return 'saas';
    }
    
    if (preference === 'plugin') {
        // If preference is plugin, check if legacy connection exists
        if (isLegacyConnection()) {
            return 'legacy';
        }
        return 'none';
    }
    
    // No preference set, use type from PHP if available
    const connectionData = window.sureFeedbackAdmin?.connection;
    if (connectionData?.type) {
        return connectionData.type;
    }
    
    // Fallback to detection
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

