import React from 'react';
import { useTodayStats } from '../../hooks/useTodayStats';

export const ProgressTracker: React.FC = () => {
  const stats = useTodayStats();

  const getStatusColor = () => {
    switch (stats.status) {
      case 'crushing':
        return 'from-green-600 to-green-700';
      case 'on-track':
        return 'from-blue-600 to-blue-700';
      case 'below-target':
        return 'from-yellow-600 to-yellow-700';
      case 'critical':
        return 'from-red-600 to-red-700';
      default:
        return 'from-slate-600 to-slate-700';
    }
  };

  const getProgressColor = () => {
    switch (stats.status) {
      case 'crushing':
        return 'bg-green-500';
      case 'on-track':
        return 'bg-blue-500';
      case 'below-target':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Sales Progress */}
      <div className={`bg-gradient-to-r ${getStatusColor()} rounded-lg p-4 text-white`}>
        <div className="flex justify-between items-center mb-2">
          <p className="font-semibold">Sales Progress</p>
          <span className="text-lg font-bold">
            {stats.salesCount}/{stats.dailyGoal}
          </span>
        </div>
        <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
          <div
            className={`h-3 rounded-full ${getProgressColor()} transition-all duration-300`}
            style={{ width: `${stats.progressPercentage}%` }}
          />
        </div>
        <p className="text-sm mt-2 opacity-90">
          {stats.dailyGoal - stats.salesCount === 0
            ? '🎉 Goal achieved!'
            : `${stats.dailyGoal - stats.salesCount} more to reach goal`}
        </p>
      </div>

      {/* Revenue Progress */}
      <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
        <div className="flex justify-between items-center mb-2">
          <p className="font-semibold text-white">Revenue Today</p>
          <span className="text-lg font-bold text-green-400">
            ${stats.totalRevenue.toLocaleString()}
          </span>
        </div>
        <p className="text-sm text-slate-300">
          Average per sale: ${stats.totalRevenue / Math.max(1, stats.salesCount)}
        </p>
      </div>

      {/* Commission Progress */}
      <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
        <div className="flex justify-between items-center mb-2">
          <p className="font-semibold text-white">Commission Earned</p>
          <span className="text-lg font-bold text-blue-400">
            ${stats.commission.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-slate-600 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-blue-500 transition-all duration-300"
            style={{
              width: `${Math.min(100, (stats.commission / stats.commissionTarget) * 100)}%`,
            }}
          />
        </div>
        <p className="text-sm text-slate-300 mt-2">
          {stats.commission >= stats.commissionTarget
            ? '✅ Commission goal reached!'
            : `$${Math.max(0, stats.commissionTarget - stats.commission)} to commission goal`}
        </p>
      </div>
    </div>
  );
};
