import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Find the container element
  const container = document.getElementById('ph-child-app');

  // Only initialize if the container exists
  if (container) {
    const root = createRoot(container);

    root.render(
      <App />
    );
  }
});

