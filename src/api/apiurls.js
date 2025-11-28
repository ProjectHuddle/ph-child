/**
 * API URLs Configuration
 * 
 * Centralized API endpoint URLs for SureFeedback WordPress plugin
 * 
 * @package SureFeedback
 */

// Get API base URL from localized data or use default
const getApiBaseUrl = () => {
    // Check if API base URL is provided in localized data
    if (window.sureFeedbackAdmin?.apiBaseUrl) {
        return window.sureFeedbackAdmin.apiBaseUrl;
    }
    
    return 'https://api.surefeedback.com/api/v1';
};

// Get frontend app URL
const getAppBaseUrl = () => {
    if (window.sureFeedbackAdmin?.appBaseUrl) {
        return window.sureFeedbackAdmin.appBaseUrl;
    }
    
    return 'https://app.surefeedback.com';
};

/**
 * Connection API endpoints
 */
export const CONNECTION_API = {
    // Initiate OAuth connection
    INITIATE: () => `${getApiBaseUrl()}/connections/initiate`,
    
    // Exchange OAuth token for bearer token
    EXCHANGE: () => `${getApiBaseUrl()}/connections/exchange`,
    
    // Get connection status
    STATUS: () => `${getApiBaseUrl()}/connections/status`,
    
    // Revoke connection
    REVOKE: (connectionId) => `${getApiBaseUrl()}/connections/${connectionId}/revoke`,
};

/**
 * WordPress API endpoints (local WordPress REST API)
 */
export const WORDPRESS_API = {
    // WordPress REST API base
    BASE: () => window.sureFeedbackAdmin?.restUrl || '/wp-json/ph-child/v1',
    
    // Settings endpoints
    SETTINGS: () => `${WORDPRESS_API.BASE()}/settings`,
    SETTINGS_GENERAL: () => `${WORDPRESS_API.BASE()}/settings/general`,
    
    // Connection endpoints
    CONNECTION_RESET: () => `${WORDPRESS_API.BASE()}/connection/reset`,
    CONNECTION_VERIFY: () => `${WORDPRESS_API.BASE()}/connection/verify`,
    
    // Page settings
    PAGE_SETTINGS: () => `${WORDPRESS_API.BASE()}/page-settings`,
    PAGE_SETTINGS_ENABLE_ALL: () => `${WORDPRESS_API.BASE()}/page-settings/enable-all`,
    PAGE_SETTINGS_DISABLE_ALL: () => `${WORDPRESS_API.BASE()}/page-settings/disable-all`,
};

/**
 * Frontend app URLs
 */
export const APP_URLS = {
    // Connect page (OAuth initiation)
    CONNECT: () => {
        const baseUrl = getAppBaseUrl();
        return `${baseUrl}/connect`;
    },
    
    // Sites page
    SITES: () => `${getAppBaseUrl()}/sites`,
    
    // Dashboard
    DASHBOARD: () => `${getAppBaseUrl()}/dashboard`,
};

/**
 * Get callback URL for OAuth redirect
 */
export const getCallbackUrl = () => {
    const adminUrl = window.sureFeedbackAdmin?.adminUrl || '/wp-admin/admin.php';
    return `${window.location.origin}${adminUrl}?page=feedback-connection-options`;
};

/**
 * Get site URL for REST API
 */
export const getSiteUrl = () => {
    return window.sureFeedbackAdmin?.restUrl || `${window.location.origin}/wp-json/ph-child/v1`;
};

export default {
    CONNECTION_API,
    WORDPRESS_API,
    APP_URLS,
    getCallbackUrl,
    getSiteUrl,
    getApiBaseUrl,
    getAppBaseUrl,
};

