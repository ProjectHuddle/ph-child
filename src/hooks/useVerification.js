/**
 * useVerification Hook
 * 
 * React hook for verifying connection status
 * 
 * @package SureFeedback
 */

import { useState, useCallback } from 'react';
import apiGateway from '../api/gateway.js';
import { ApiError } from '../utils/errors.js';

/**
 * useVerification hook
 * 
 * @returns {Object} Verification state and methods
 */
export const useVerification = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Verify connection
     * 
     * @param {Object} options - Verification options
     * @returns {Promise<Object>} Verification result
     */
    const verifyConnection = useCallback(async (options = {}) => {
        try {
            setIsLoading(true);
            setError(null);

            // Call WordPress REST API to verify connection
            const response = await apiGateway.post('connection/verify', options);

            if (response.success) {
                return {
                    status: response.data?.status || 'verified',
                    message: response.data?.message || 'Connection verified',
                    ...response.data,
                };
            }

            return {
                status: 'failed',
                message: response.message || 'Verification failed',
            };
        } catch (err) {
            const errorMessage = err instanceof ApiError 
                ? err.getUserMessage() 
                : err.message || 'Verification failed';
            
            setError(errorMessage);
            
            return {
                status: 'failed',
                message: errorMessage,
            };
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        verifyConnection,
        isLoading,
        error,
    };
};

export default useVerification;

