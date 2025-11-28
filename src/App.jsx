import React from 'react';
import Dashboard from './views/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  // Get container type from data attribute or determine from current page
  const appElement = document.getElementById('ph-child-app');
  const containerType = appElement?.getAttribute('data-container-type') || 'dashboard';

  return (
    <ErrorBoundary>
      <Dashboard containerType={containerType} />
    </ErrorBoundary>
  );
};

export default App;

