import { ApiError } from '../utils/errors.js';
import { HTTP_STATUS, ERROR_CODES } from '../constants/api.js';

const isExternalApiCall = (url) => {
    // Check if URL is external (starts with http/https and is not WordPress REST API)
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return false; // Relative URL, assume WordPress REST API
    }
    
    const restUrl = window.sureFeedbackAdmin?.restUrl || '/wp-json/ph-child/v1';
    const restBaseUrl = restUrl.startsWith('http') 
        ? restUrl 
        : `${window.location.origin}${restUrl}`;
    
    // If URL doesn't start with WordPress REST API base URL, it's external
    return !url.startsWith(restBaseUrl);
};

const getDefaultHeaders = (url = '') => {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };
    
    // Only add WordPress nonce for WordPress REST API calls, not external APIs
    if (!isExternalApiCall(url)) {
        const nonce = window.sureFeedbackAdmin?.nonce || '';
        if (nonce) {
            headers['X-WP-Nonce'] = nonce;
        }
    }
    
    return headers;
};

const getBearerToken = () => {
    if (window.sureFeedbackAdmin?.bearerToken) {
        return window.sureFeedbackAdmin.bearerToken;
    }

    try {
        const stored = localStorage.getItem('surefeedback_bearer_token');
        if (stored) {
            return stored;
        }
    } catch (e) {
    }

    return null;
};

const storeBearerToken = (token) => {
    try {
        localStorage.setItem('surefeedback_bearer_token', token);
        if (window.sureFeedbackAdmin) {
            window.sureFeedbackAdmin.bearerToken = token;
        }
    } catch (e) {
    }
};

const removeBearerToken = () => {
    try {
        localStorage.removeItem('surefeedback_bearer_token');
        if (window.sureFeedbackAdmin) {
            delete window.sureFeedbackAdmin.bearerToken;
        }
    } catch (e) {
    }
};

const request = async (url, options = {}) => {
    const {
        method = 'GET',
        body = null,
        headers = {},
    } = options;

    const requestHeaders = {
        ...getDefaultHeaders(url),
        ...headers,
    };

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

        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');

        let data;
        if (isJson) {
            data = await response.json();
        } else {
            const text = await response.text();
            data = { message: text || 'Request failed' };
        }

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
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw new ApiError(
                'Network error: Unable to connect to the server',
                0,
                null,
                ERROR_CODES.NETWORK_ERROR
            );
        }

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            error.message || 'An unexpected error occurred',
            0,
            null,
            ERROR_CODES.NETWORK_ERROR
        );
    }
};

const apiGateway = {
    get: async (endpoint, options = {}) => {
        const baseUrl = window.sureFeedbackAdmin?.restUrl || '/wp-json/ph-child/v1';
        const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}/${endpoint}`;
        return request(url, { ...options, method: 'GET' });
    },

    post: async (endpoint, body = null, options = {}) => {
        const baseUrl = window.sureFeedbackAdmin?.restUrl || '/wp-json/ph-child/v1';
        const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}/${endpoint}`;
        return request(url, { ...options, method: 'POST', body });
    },

    put: async (endpoint, body = null, options = {}) => {
        const baseUrl = window.sureFeedbackAdmin?.restUrl || '/wp-json/ph-child/v1';
        const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}/${endpoint}`;
        return request(url, { ...options, method: 'PUT', body });
    },

    patch: async (endpoint, body = null, options = {}) => {
        const baseUrl = window.sureFeedbackAdmin?.restUrl || '/wp-json/ph-child/v1';
        const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}/${endpoint}`;
        return request(url, { ...options, method: 'PATCH', body });
    },

    delete: async (endpoint, options = {}) => {
        const baseUrl = window.sureFeedbackAdmin?.restUrl || '/wp-json/ph-child/v1';
        const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}/${endpoint}`;
        return request(url, { ...options, method: 'DELETE' });
    },

    getBearerToken,

    storeBearerToken,

    removeBearerToken,
};

export default apiGateway;

