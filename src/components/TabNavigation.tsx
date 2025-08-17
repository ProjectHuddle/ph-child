import React from 'react'
import type { TabConfig } from '../types'

interface TabNavigationProps {
  tabs: TabConfig[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

const TabNavigation: React.FC<TabNavigationProps> = ({ tabs, activeTab, onTabChange }) => {
  const handleTabChange = (index: number) => {
    const tab = tabs[index]
    if (tab) {
      onTabChange(tab.id)
      window.location.hash = tab.id
    }
  }

  return (
    <div className="tab-navigation bg-white border-b border-gray-200/60">
      <nav className="flex" role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            className={`
              relative px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 
              focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-inset
              ${activeTab === tab.id
                ? 'text-blue-600 border-blue-500 bg-blue-50/40'
                : 'text-gray-600 border-transparent hover:text-gray-800 hover:border-gray-300 hover:bg-gray-50/60'
              }
            `}
            aria-selected={activeTab === tab.id}
            role="tab"
            onClick={() => handleTabChange(index)}
          >
            {tab.label}
            {/* Active indicator */}
            {activeTab === tab.id && (
              <span
                className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500 rounded-full"
                aria-hidden="true"
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default TabNavigation