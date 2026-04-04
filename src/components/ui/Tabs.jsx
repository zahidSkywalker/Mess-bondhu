import { useState } from 'react';

export default function Tabs({
  tabs = [],
  activeTab,
  onTabChange,
  className = '',
  contentClassName = '',
  children,
}) {
  const [internalTab, setInternalTab] = useState(tabs[0]?.key || '');

  const currentTab = activeTab !== undefined ? activeTab : internalTab;
  const handleChange = onTabChange || setInternalTab;

  const activeContent = tabs.find((t) => t.key === currentTab)?.content || null;

  return (
    <div className={className}>
      {/* Tab buttons */}
      <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleChange(tab.key)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${
                currentTab === tab.key
                  ? 'bg-baltic text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }
            `}
          >
            {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && tab.count !== null && (
              <span
                className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  currentTab === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className={`mt-4 fade-in ${contentClassName}`}>
        {children ? (
          // If children are provided, render them directly (caller handles conditional rendering)
          children
        ) : (
          // Otherwise render the content from the tab definition
          activeContent
        )}
      </div>
    </div>
  );
}
