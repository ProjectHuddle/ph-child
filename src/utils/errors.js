/**
 * Error Handling Utilities
 * 
 * Custom error classes and error handling utilities
 * for consistent error management across the application.
 * 
 * @package SureFeedback
 */

import { ERROR_CODES, HTTP_STATUS } from '../constants/api.js';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
    constructor(message, status = 0, response = null, code = null, data = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.response = response;
        this.code = code;
        this.data = data;
        this.timestamp = new Date().toISOString();
        
        // Maintain proper stack trace for where the error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }

    /**
     * Check if error is a network error
     * @returns {boolean}
     */
    isNetworkError() {
        return this.status === 0 || this.code === ERROR_CODES.NETWORK_ERROR;
    }

    /**
     * Check if error is an authentication error
     * @returns {boolean}
     */
    isAuthError() {
        return [
            HTTP_STATUS.UNAUTHORIZED,
            HTTP_STATUS.FORBIDDEN
        ].includes(this.status) || [
            ERROR_CODES.INVALID_TOKEN,
            ERROR_CODES.INVALID_NONCE,
            ERROR_CODES.INVALID_CREDENTIALS
        ].includes(this.code);
    }

    /**
     * Check if error is a validation error
     * @returns {boolean}
     */
    isValidationError() {
        return this.status === HTTP_STATUS.UNPROCESSABLE_ENTITY ||
               this.status === HTTP_STATUS.BAD_REQUEST ||
               [
                   ERROR_CODES.VALIDATION_ERROR,
                   ERROR_CODES.MISSING_PARAMETER
               ].includes(this.code);
    }

    /**
     * Check if error is retryable
     * @returns {boolean}
     */
    isRetryable() {
        return [
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            HTTP_STATUS.BAD_GATEWAY,
            HTTP_STATUS.SERVICE_UNAVAILABLE,
            HTTP_STATUS.GATEWAY_TIMEOUT,
            HTTP_STATUS.TOO_MANY_REQUESTS
        ].includes(this.status) || this.isNetworkError();
    }

    /**
     * Get user-friendly error message
     * @returns {string}
     */
    getUserMessage() {
        if (this.isNetworkError()) {
            return 'Unable to connect to the server. Please check your internet connection and try again.';
        }

        if (this.isAuthError()) {
            return 'You are not authorized to perform this action. Please refresh the page and try again.';
        }

        if (this.status === HTTP_STATUS.NOT_FOUND) {
            return 'The requested resource was not found.';
        }

        if (this.status === HTTP_STATUS.TOO_MANY_REQUESTS) {
            return 'Too many requests. Please wait a moment and try again.';
        }

        if (this.status >= 500) {
            return 'A server error occurred. Please try again later.';
        }

        // Return original message for client errors with user-friendly messages
        return this.message || 'An unexpected error occurred.';
    }

    /**
     * Convert to plain object for logging
     * @returns {Object}
     */
    toObject() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
            code: this.code,
            data: this.data,
            timestamp: this.timestamp,
            stack: this.stack
        };
    }
}

/**
 * Validation Error class
 */
export class ValidationError extends Error {
    constructor(field, message, value = null) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
        this.value = value;
        this.timestamp = new Date().toISOString();
    }

    toObject() {
        return {
            name: this.name,
            message: this.message,
            field: this.field,
            value: this.value,
            timestamp: this.timestamp
        };
    }
}

/**
 * Connection Error class
 */
export class ConnectionError extends Error {
    constructor(message, parentUrl = null, details = null) {
        super(message);
        this.name = 'ConnectionError';
        this.parentUrl = parentUrl;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }

    toObject() {
        return {
            name: this.name,
            message: this.message,
            parentUrl: this.parentUrl,
            details: this.details,
            timestamp: this.timestamp
        };
    }
}

/**
 * Error Handler utility class
 */
export class ErrorHandler {
    constructor() {
        this.listeners = [];
        this.setupGlobalErrorHandling();
    }

    /**
     * Setup global error handling
     */
    setupGlobalErrorHandling() {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason);
        });

        // Handle general JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleError(event.error);
        });
    }

    /**
     * Add error listener
     * @param {Function} callback 
     */
    addListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * Remove error listener
     * @param {Function} callback 
     */
    removeListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    /**
     * Handle error
     * @param {Error} error 
     * @param {Object} context 
     */
    handleError(error, context = {}) {
        // Log error details
        this.logError(error, context);

        // Notify listeners
        this.listeners.forEach(listener => {
            try {
                listener(error, context);
            } catch (listenerError) {
                // Error handled silently
            }
        });
    }

    /**
     * Log error
     * @param {Error} error 
     * @param {Object} context 
     */
    logError(error, context = {}) {
        const errorDetails = {
            message: error.message,
            name: error.name,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            context,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        // Add specific error details
        if (error instanceof ApiError) {
            Object.assign(errorDetails, error.toObject());
        } else if (error instanceof ValidationError) {
            Object.assign(errorDetails, error.toObject());
        } else if (error instanceof ConnectionError) {
            Object.assign(errorDetails, error.toObject());
        }

        // Send to logging service if available
        this.sendToLoggingService(errorDetails);
    }

    /**
     * Send error to logging service
     * @param {Object} errorDetails 
     */
    async sendToLoggingService(errorDetails) {
        try {
            // Only send errors in production
            if (process.env.NODE_ENV === 'production') {
                // Implementation would depend on your logging service
                // Example: send to WordPress admin-ajax.php or external service
                await fetch(window.ajaxurl || '/wp-admin/admin-ajax.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'surefeedback_log_error',
                        error: JSON.stringify(errorDetails),
                        nonce: window.wpApiSettings?.nonce || ''
                    })
                });
            }
        } catch (loggingError) {
            // Error handled silently
        }
    }

    /**
     * Create user-friendly error message
     * @param {Error} error 
     * @returns {string}
     */
    getUserMessage(error) {
        if (error instanceof ApiError) {
            return error.getUserMessage();
        }

        if (error instanceof ValidationError) {
            return `Validation error: ${error.message}`;
        }

        if (error instanceof ConnectionError) {
            return `Connection error: ${error.message}`;
        }

        // Generic error message
        return 'An unexpected error occurred. Please try again.';
    }

    /**
     * Check if error should be reported to user
     * @param {Error} error 
     * @returns {boolean}
     */
    shouldReportToUser(error) {
        // Don't report network errors in development
        if (process.env.NODE_ENV === 'development' && 
            error instanceof ApiError && 
            error.isNetworkError()) {
            return false;
        }

        // Always report validation and connection errors
        if (error instanceof ValidationError || error instanceof ConnectionError) {
            return true;
        }

        // Report API errors except for auth errors (handled separately)
        if (error instanceof ApiError) {
            return !error.isAuthError();
        }

        // Don't report generic JavaScript errors to users
        return false;
    }
}

// Create singleton instance
export const errorHandler = new ErrorHandler();

/**
 * Utility function to wrap async functions with error handling
 * @param {Function} fn 
 * @param {Object} context 
 * @returns {Function}
 */
export function withErrorHandling(fn, context = {}) {
    return async (...args) => {
        try {
            return await fn(...args);
        } catch (error) {
            errorHandler.handleError(error, { ...context, args });
            throw error;
        }
    };
}

/**
 * Utility function to create safe async function that doesn't throw
 * @param {Function} fn 
 * @param {any} defaultValue 
 * @returns {Function}
 */
export function safeAsync(fn, defaultValue = null) {
    return async (...args) => {
        try {
            return await fn(...args);
        } catch (error) {
            errorHandler.handleError(error, { args });
            return defaultValue;
        }
    };
}