import React, { useState } from 'react';
import { useContextualHelp } from '../../hooks/useContextualHelp';

export const ContextualHelp: React.FC = () => {
  const tip = useContextualHelp();
  const [dismissed, setDismissed] = useState<string | null>(null);

  if (!tip || dismissed === tip.id) return null;

  return (
    <div className="fixed bottom-24 md:bottom-8 right-4 left-4 md:left-auto md:max-w-sm z-40 animate-slideUp">
      <div className={`rounded-lg p-4 border ${
        tip.trigger === 'stuck'
          ? 'bg-blue-900 border-blue-700'
          : tip.trigger === 'milestone'
          ? 'bg-green-900 border-green-700'
          : tip.trigger === 'momentum'
          ? 'bg-purple-900 border-purple-700'
          : 'bg-red-900 border-red-700'
      } shadow-lg`}>
        <div className="flex gap-3">
          <span className="text-3xl flex-shrink-0">{tip.icon}</span>
          <div className="flex-1">
            <h3 className="font-bold text-white">{tip.title}</h3>
            <p className="text-sm text-gray-200 mt-1">{tip.message}</p>
            {tip.action && (
              <button
                onClick={tip.action.handler}
                className="mt-2 px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-sm rounded font-semibold transition-colors"
              >
                {tip.action.label}
              </button>
            )}
          </div>
          {tip.dismissible && (
            <button
              onClick={() => setDismissed(tip.id)}
              className="text-gray-300 hover:text-white flex-shrink-0"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
