import React, { useContext } from 'react';

// Instead of creating a new SystemContext, we'll try to just hook into wherever `view` is available if needed,
// For now, I'll export a props-based approach or use the provided SystemContext 
import { SystemContext } from '../../context/SystemContextCore';

export const BottomNav: React.FC = () => {
  const { view, setView } = useContext(SystemContext)!;

  const tabs = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'leads', icon: '📞', label: 'Leads' },
    { id: 'chat', icon: '💬', label: 'Chat' },
    { id: 'me', icon: '⚙️', label: 'Me' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-border-subtle flex md:hidden z-40">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setView(tab.id as any)}
          className={`flex-1 py-4 text-center transition-colors ${
            view === tab.id
              ? 'border-t-4 border-blue-500 bg-slate-700 text-blue-400'
              : 'text-text-secondary hover:text-white'
          }`}
        >
          <div className="text-lg mb-1">{tab.icon}</div>
          <div className="text-sm font-semibold">{tab.label}</div>
        </button>
      ))}
    </div>
  );
};
