import React from 'react';
import { cn } from '../../lib/utils.js';

/**
 * Tab Navigation Component
 * 
 * Converted from Vue to React
 */
const TabNavigation = ({ tabs = [], activeTab, onTabChange }) => {
  const handleTabClick = (tabId) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
    // Update URL hash
    window.location.hash = tabId;
  };

  return (
    <div className="tab-navigation bg-white border-b border-gray-200">
      <nav className="flex gap-1" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              'relative px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-inset',
              activeTab === tab.id
                ? 'text-primary border-primary bg-primary/5'
                : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50/60'
            )}
            aria-selected={activeTab === tab.id}
            role="tab"
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
            {/* Active indicator */}
            {activeTab === tab.id && (
              <span
                className="absolute inset-x-0 bottom-0 h-0.5 bg-primary rounded-full"
                aria-hidden="true"
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabNavigation;

