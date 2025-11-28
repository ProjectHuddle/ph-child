/**
 * API Gateway
 * 
 * Centralized API client for making requests to WordPress REST API
 * 
 * @package SureFeedback
 */

import { ApiError } from '../utils/errors.js';
import { HTTP_STATUS, ERROR_CODES } from '../constants/api.js';

/**
 * Get default headers for API requests
 */
const getDefaultHeaders = () => {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    // Add nonce for WordPress REST API
    const nonce = window.sureFeedbackAdmin?.nonce || '';
    if (nonce) {
        headers['X-WP-Nonce'] = nonce;
    }

    return headers;
};

/**
 * Get bearer token from storage
 */
const getBearerToken = () => {
    // Try to get from secure cookie or localStorage
    if (window.sureFeedbackAdmin?.bearerToken) {
        return window.sureFeedbackAdmin.bearerToken;
    }
    
    // Try localStorage
    try {
        const stored = localStorage.getItem('surefeedback_bearer_token');
        if (stored) {
            return stored;
        }
    } catch (e) {
        // localStorage not available
    }
    
    return null;
};

/**
 * Store bearer token
 */
const storeBearerToken = (token) => {
    try {
        localStorage.setItem('surefeedback_bearer_token', token);
        if (window.sureFeedbackAdmin) {
            window.sureFeedbackAdmin.bearerToken = token;
        }
    } catch (e) {
        console.error('Failed to store bearer token:', e);
    }
};

/**
 * Remove bearer token
 */
const removeBearerToken = () => {
    try {
        localStorage.removeItem('surefeedback_bearer_token');
        if (window.sureFeedbackAdmin) {
            delete window.sureFeedbackAdmin.bearerToken;
        }
    } catch (e) {
        console.error('Failed to remove bearer token:', e);
    }
};

/**
 * Make API request
 */
const request = async (url, options = {}) => {
    const {
        method = 'GET',
        body = null,
        headers = {},
        requireAuth = false,
    } = options;

    const requestHeaders = {
        ...getDefaultHeaders(),
        ...headers,
    };

    // Add bearer token if required
    if (requireAuth) {
        const token = getBearerToken();
        if (token) {
            requestHeaders['Authorization'] = `Bearer ${token}`;
        }
    }

    const config = {
        method,
        headers: requestHeaders,
        credentials: 'same-origin',
    };

    if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, config);
        
        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');
        
        let data;
        if (isJson) {
            data = await response.json();
        } else {
            const text = await response.text();
            data = { message: text || 'Request failed' };
        }

        // Handle error responses
        if (!response.ok) {
            throw new ApiError(
                data.message || `HTTP ${response.status}: ${response.statusText}`,
                response.status,
                data,
                data.error_code || ERROR_CODES.NETWORK_ERROR,
                data.data || null
            );
        }

        return data;
    } catch (error) {
        // Handle network errors
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw new ApiError(
                'Network error: Unable to connect to the server',
                0,
                null,
                ERROR_CODES.NETWORK_ERROR
            );
        }

        // Re-throw ApiError instances
        if (error instanceof ApiError) {
            throw error;
        }

        // Wrap other errors
        throw new ApiError(
            error.message || 'An unexpected error occurred',
            0,
            null,
            ERROR_CODES.NETWORK_ERROR
        );
    }
};

/**
 * API Gateway object
 */
export const apiGateway = {
    /**
     * GET request
     */
    get: async (endpoint, options = {}) => {
        const baseUrl = window.sureFeedbackAdmin?.restUrl || '/wp-json/ph-child/v1';
        const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}/${endpoint}`;
        return request(url, { ...options, method: 'GET' });
    },

    /**
     * POST request
     */
    post: async (endpoint, body = null, options = {}) => {
        const baseUrl = window.sureFeedbackAdmin?.restUrl || '/wp-json/ph-child/v1';
        const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}/${endpoint}`;
        return request(url, { ...options, method: 'POST', body });
    },

    /**
     * PUT request
     */
    put: async (endpoint, body = null, options = {}) => {
        const baseUrl = window.sureFeedbackAdmin?.restUrl || '/wp-json/ph-child/v1';
        const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}/${endpoint}`;
        return request(url, { ...options, method: 'PUT', body });
    },

    /**
     * PATCH request
     */
    patch: async (endpoint, body = null, options = {}) => {
        const baseUrl = window.sureFeedbackAdmin?.restUrl || '/wp-json/ph-child/v1';
        const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}/${endpoint}`;
        return request(url, { ...options, method: 'PATCH', body });
    },

    /**
     * DELETE request
     */
    delete: async (endpoint, options = {}) => {
        const baseUrl = window.sureFeedbackAdmin?.restUrl || '/wp-json/ph-child/v1';
        const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}/${endpoint}`;
        return request(url, { ...options, method: 'DELETE' });
    },

    /**
     * Get bearer token
     */
    getBearerToken,

    /**
     * Store bearer token
     */
    storeBearerToken,

    /**
     * Remove bearer token
     */
    removeBearerToken,
};

export default apiGateway;

