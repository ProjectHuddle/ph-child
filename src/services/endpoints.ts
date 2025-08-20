/**
 * API Endpoints configuration
 */

export const API_ENDPOINTS = {
  // Base configuration
  BASE_URL: '/wp-json/surefeedback/v1',
  
  // Settings endpoints
  SETTINGS: {
    GET: 'settings',
    GENERAL: 'settings/general',
    CONNECTION: 'settings/connection',
    WHITE_LABEL: 'settings/white-label',
    MANUAL_IMPORT: 'settings/manual-import',
    TEST_CONNECTION: 'settings/test-connection',
  },
} as const;

/**
 * Build full URL for an endpoint
 */
export function buildApiUrl(endpoint: string): string {
  const baseUrl = window.sureFeedbackAdmin?.rest_url || '/wp-json/';
  return `${baseUrl}surefeedback/v1/${endpoint}`;
}

/**
 * Get API headers with nonce
 */
export function getApiHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-WP-Nonce': window.sureFeedbackAdmin?.rest_nonce || '',
  };
}