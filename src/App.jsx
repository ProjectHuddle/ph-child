import React, { useEffect } from 'react';
import Dashboard from './views/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import connectionService from './services/connectionService.js';

const App = () => {
  // Get container type from data attribute or determine from current page
  const appElement = document.getElementById('ph-child-app');
  const containerType = appElement?.getAttribute('data-container-type') || 'dashboard';

  // Global OAuth callback handler - runs on every page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oauthToken = urlParams.get('oauth_token');
    
    if (oauthToken) {
      console.log('🔍 Global OAuth callback detected, processing...', { oauthToken: oauthToken.substring(0, 20) + '...' });
      
      // Handle the callback
      connectionService.handleOAuthCallback()
        .then((data) => {
          console.log('✅ OAuth callback completed successfully:', data);
        })
        .catch((error) => {
          console.error('❌ OAuth callback failed:', error);
        });
    }
  }, []);

  return (
    <ErrorBoundary>
      <Dashboard containerType={containerType} />
    </ErrorBoundary>
  );
};

export default App;

