import React from 'react';
import { useAdaptiveUI } from '../../hooks/useAdaptiveUI';
import { CommandCenter } from './CommandCenter';
import { ProgressTracker } from './ProgressTracker';
import { useTodayStats } from '../../hooks/useTodayStats';

export const AdaptiveView: React.FC = () => {
  const profile = useAdaptiveUI();
  const stats = useTodayStats();

  if (profile.tier === 'new' && profile.daysSinceSignup < 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 pb-24 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <h1 className="text-4xl mb-4">👋 Welcome!</h1>
          <p className="text-xl text-slate-300 mb-8">Let's get you making your first sale</p>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 space-y-4 text-left">
            <div className="flex gap-4">
              <div className="text-3xl">1️⃣</div>
              <div>
                <h3 className="font-bold text-white">Navigate to Enrollment</h3>
                <p className="text-sm text-slate-400">Open the full form to log your first order</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-3xl">2️⃣</div>
              <div>
                <h3 className="font-bold text-white">Fill required fields</h3>
                <p className="text-sm text-slate-400">Customer details, payment, and medical</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-3xl">3️⃣</div>
              <div>
                <h3 className="font-bold text-white">Submit to Ledger</h3>
                <p className="text-sm text-slate-400">Approve the order and earn commission!</p>
              </div>
            </div>
          </div>
          <button className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg" onClick={() => window.dispatchEvent(new CustomEvent('NAVIGATE', { detail: 'enrollment' }))}>
            Go to Enrollment →
          </button>
        </div>
      </div>
    );
  }

  if (profile.tier === 'top-performer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 bg-gradient-to-r from-purple-900 to-purple-800 rounded-lg p-6 border border-purple-700">
            <h1 className="text-3xl font-bold text-white mb-2">🏆 You're Dominating!</h1>
            <p className="text-purple-100">
              Rank #1 team this week. Keep crushing it!
            </p>
          </div>
          <CommandCenter />
        </div>
      </div>
    );
  }

  if (profile.tier === 'struggling' && profile.needsSupport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 bg-gradient-to-r from-orange-900 to-red-900 rounded-lg p-6 border border-red-700">
            <h1 className="text-2xl font-bold text-white mb-2">💪 Let's Turn This Around</h1>
            <p className="text-red-100 mb-4">
              You're having a slow day, but one great call can change everything.
            </p>
            <div className="bg-red-900 bg-opacity-50 rounded p-4 border border-red-600">
              <p className="text-sm font-semibold text-red-200 mb-2">🎯 Your target right now:</p>
              <p className="text-2xl font-bold text-white">
                {Math.max(1, stats.dailyGoal - stats.salesCount)} more sales
              </p>
              <p className="text-sm text-red-100 mt-2">
                Each sale = ${Math.round(500 * (0.15))} commission
              </p>
            </div>
          </div>
          <CommandCenter />
          <div className="mt-6 bg-slate-700 rounded-lg p-4 border border-slate-600">
            <p className="text-white font-semibold mb-3">💡 Quick Tips:</p>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li>✓ Call your callbacks first (highest conversion)</li>
              <li>✓ Use the suggested scripts (they work!)</li>
              <li>✓ Follow up with texts if they don't answer</li>
              <li>✓ You've got this! 🔥</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        <CommandCenter />
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4">📊 Detailed Progress</h2>
          <ProgressTracker />
        </div>
      </div>
    </div>
  );
};
