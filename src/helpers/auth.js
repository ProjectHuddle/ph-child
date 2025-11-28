/**
 * Authentication Helpers
 * 
 * @package SureFeedback
 */

import { APP_URLS } from '../api/apiurls.js';

/**
 * Redirect to authentication/connection page
 * 
 * @returns {void}
 */
export function authenticateRedirect() {
    const projectId = window.sureFeedbackAdmin?.project_id;
    const callbackUrl = encodeURIComponent(window.location.href);
    
    if (projectId) {
        // If project ID exists, redirect to connect with project
        const connectUrl = `${APP_URLS.CONNECT()}?redirect_url=${callbackUrl}&project_id=${projectId}`;
        window.location.href = connectUrl;
    } else {
        // Otherwise, redirect to connect page to select project
        const connectUrl = `${APP_URLS.CONNECT()}?redirect_url=${callbackUrl}`;
        window.location.href = connectUrl;
    }
}

export default {
    authenticateRedirect,
};

