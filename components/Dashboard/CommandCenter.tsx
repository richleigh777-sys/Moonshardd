import React, { useContext, useState } from 'react';
import { useSmartLeadQueue } from '../../hooks/useSmartLeadQueue';
import { useTodayStats } from '../../hooks/useTodayStats';
import { useContextualHelp } from '../../hooks/useContextualHelp';
import { AuthContext } from '../../context/AuthContextCore';
import { sfx } from '../../lib/soundService';

export const CommandCenter: React.FC = () => {
  const leads = useSmartLeadQueue();
  const stats = useTodayStats();
  const help = useContextualHelp();
  const { currentUser } = useContext(AuthContext)!;
  const [skippedIds, setSkippedIds] = useState<string[]>([]);

  const nextAction = leads.find(l => !skippedIds.includes(l.id));

  const handleCall = async (leadId: string) => {
    if (!nextAction) return;
    sfx.playPhoneRing();
    window.dispatchEvent(new CustomEvent('NAVIGATE', { detail: 'enrollment' }));
    window.dispatchEvent(new CustomEvent('LOAD_LEAD', { 
      detail: {
        customerName: nextAction.customer,
        phone: nextAction.phone,
        email: nextAction.email || '',
        shippingAddress: nextAction.address || '',
        dob: nextAction.dob || '',
        medicalConditions: nextAction.medicalConditions || []
      } 
    }));
  };

  const handleText = async (leadId: string) => {
    if (!nextAction) return;
    sfx.playClick();
    window.dispatchEvent(new CustomEvent('NAVIGATE', { detail: 'chat' }));
    // Open chat thread with customer name
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('SELECT_CHAT_CUSTOMER', { 
        detail: { customerName: nextAction.customer, phone: nextAction.phone } 
      }));
    }, 100);
  };

  const handleSkip = () => {
    if (nextAction) {
      sfx.playTrash();
      setSkippedIds(prev => [...prev, nextAction.id]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 pb-24 md:pb-8">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-white">Sales Command Center</h1>
        <p className="text-text-secondary text-sm">Stay focused. Make the calls. Close the deals.</p>
      </div>

      {/* HELP TIP */}
      {help && (
        <div className="mb-6 bg-blue-900 border border-blue-500 rounded-lg p-4 flex items-start gap-3">
          <span className="text-lg">{help.icon}</span>
          <div className="flex-1">
            <h3 className="font-semibold text-white">{help.title}</h3>
            <p className="text-text-primary text-sm mt-1">{help.message}</p>
            {help.action && (
              <button
                onClick={help.action.handler}
                className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium"
              >
                {help.action.label}
              </button>
            )}
          </div>
        </div>
      )}

      {/* PRIMARY: NEXT ACTION */}
      {nextAction ? (
        <div className="mb-6 bg-gradient-to-r from-red-900 to-red-800 rounded-lg p-4 border border-red-700 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-red-200 uppercase tracking-wider">Next Action Required</h2>
              <p className="text-xl font-bold text-white mt-2">{nextAction.customer}</p>
            </div>
            <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              {nextAction.priority.toUpperCase()}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            {nextAction.callbackTime && (
              <p className="text-red-100">
                <span className="font-semibold">Callback Time:</span>{' '}
                {new Date(nextAction.callbackTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
            {nextAction.amount && (
              <p className="text-red-100">
                <span className="font-semibold">Amount:</span> ${nextAction.amount.toLocaleString()}
              </p>
            )}
            {nextAction.reason && (
              <p className="text-red-100">
                <span className="font-semibold">Reason:</span> {nextAction.reason}
              </p>
            )}
            {nextAction.suggestedScript && (
              <div className="mt-3 bg-red-900 bg-opacity-50 rounded p-3 border border-red-600">
                <p className="text-sm font-semibold text-red-200 uppercase mb-1">💬 Suggested Script</p>
                <p className="text-red-100 text-sm italic">"{nextAction.suggestedScript}"</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleCall(nextAction.id)}
              className="flex-1 bg-white text-red-900 hover:bg-red-50 font-bold py-3 rounded-lg transition-colors"
            >
              📞 CALL NOW
            </button>
            <button
              onClick={() => handleText(nextAction.id)}
              className="flex-1 bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-colors"
            >
              💬 SEND TEXT
            </button>
            <button
              onClick={handleSkip}
              className="px-4 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 bg-slate-700 rounded-lg p-4 border border-slate-600 text-center">
          <p className="text-text-primary text-lg font-semibold">No pending callbacks</p>
          <p className="text-text-secondary text-sm mt-2">Great! Check the lead queue for new opportunities.</p>
        </div>
      )}

      {/* SECONDARY: YOUR STATS TODAY */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-3">Your Stats Today</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sales Count */}
          <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
            <p className="text-text-secondary text-sm font-semibold uppercase mb-2">Sales Today</p>
            <p className="text-xl font-bold text-white">
              {stats.salesCount}
              <span className="text-lg text-text-secondary"> / {stats.dailyGoal}</span>
            </p>
            <div className="mt-3 w-full bg-slate-600 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  stats.status === 'crushing'
                    ? 'bg-green-500'
                    : stats.status === 'on-track'
                    ? 'bg-blue-500'
                    : stats.status === 'below-target'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${stats.progressPercentage}%` }}
              />
            </div>
            <p className="text-sm text-text-secondary mt-2">
              {stats.dailyGoal - stats.salesCount} to go!
            </p>
          </div>

          {/* Revenue */}
          <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
            <p className="text-text-secondary text-sm font-semibold uppercase mb-2">Revenue</p>
            <p className="text-xl font-bold text-green-400">${stats.totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-text-secondary mt-2 font-semibold">
              Average: ${stats.totalRevenue / Math.max(1, stats.salesCount)}
            </p>
          </div>

          {/* Commission */}
          <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
            <p className="text-text-secondary text-sm font-semibold uppercase mb-2">Commission Earned</p>
            <p className="text-xl font-bold text-blue-400">${stats.commission.toLocaleString()}</p>
            <p className={`text-sm mt-2 font-semibold ${
              stats.commission >= stats.commissionTarget ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {stats.commission >= stats.commissionTarget
                ? `✅ Goal reached!`
                : `$${Math.max(0, stats.commissionTarget - stats.commission)} to goal`}
            </p>
          </div>
        </div>
      </div>

      {/* STATUS MESSAGE */}
      <div className={`p-4 rounded-lg border ${
        stats.status === 'crushing'
          ? 'bg-green-900 border-green-700'
          : stats.status === 'on-track'
          ? 'bg-blue-900 border-blue-700'
          : stats.status === 'below-target'
          ? 'bg-yellow-900 border-yellow-700'
          : 'bg-red-900 border-red-700'
      }`}>
        <p className={`font-semibold ${
          stats.status === 'crushing'
            ? 'text-green-200'
            : stats.status === 'on-track'
            ? 'text-blue-200'
            : stats.status === 'below-target'
            ? 'text-yellow-200'
            : 'text-red-200'
        }`}>
          {stats.status === 'crushing' && '🏆 You\'re crushing it! Keep the momentum going!'}
          {stats.status === 'on-track' && '🎯 You\'re on track! Keep pushing!'}
          {stats.status === 'below-target' && '💪 You can do this! Focus on the next call!'}
          {stats.status === 'critical' && '🚀 Get moving! Every call matters right now!'}
        </p>
      </div>
    </div>
  );
};
