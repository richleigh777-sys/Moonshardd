import { useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContextCore';
import { HelpTip } from '../types/uiState';
import { useTodayStats } from './useTodayStats';

export function useContextualHelp(): HelpTip | null {
  const { currentUser } = useContext(AuthContext)!;
  const stats = useTodayStats();

  const user = currentUser;

  const tip = useMemo((): HelpTip | null => {
    if (!user) return null;

    // Check if new user (created in last 24 hours)
    const accountAgeMs = Date.now() - ((user as any).created || Date.now());
    const accountAgeDays = accountAgeMs / 1000 / 60 / 60 / 24;
    const isNewUser = accountAgeDays < 1;

    // Onboarding tip
    if (isNewUser) {
      return {
        id: 'welcome-tip',
        title: '🎯 Welcome to Braveheart!',
        message: 'Navigate to Enrollment to log your first order!',
        icon: '👋',
        trigger: 'first-time',
        dismissible: true,
        frequency: 'once',
      };
    }

    // Momentum tip
    if (stats.salesCount >= 2 && stats.salesCount < 5) {
      return {
        id: 'momentum-tip',
        title: '🔥 You\'re on a roll!',
        message: `You have ${stats.dailyGoal - stats.salesCount} more sales to hit today's goal. Keep pushing!`,
        icon: '💪',
        trigger: 'momentum',
        dismissible: true,
        frequency: 'daily',
      };
    }

    // Commission tracking tip
    if (stats.status === 'below-target' && new Date().getHours() >= 14) {
      const needed = stats.commissionTarget - stats.commission;
      return {
        id: 'commission-tip',
        title: '💰 Commission Target',
        message: `You need $${Math.max(0, needed)} more to hit today's commission goal!`,
        icon: '📈',
        trigger: 'milestone',
        dismissible: true,
        frequency: 'daily',
      };
    }

    // Struggling support tip
    if (stats.status === 'critical' && new Date().getHours() >= 10) {
      return {
        id: 'support-tip',
        title: '💪 Let\'s get you back on track',
        message: 'One more sale = $75 commission. Your next lead is ready to call!',
        icon: '🚀',
        trigger: 'stuck',
        dismissible: true,
        frequency: 'daily',
        action: {
          label: 'See Leads',
          handler: () => console.log('Navigate to leads'),
        },
      };
    }

    // Achievement tip
    if (stats.status === 'crushing') {
      return {
        id: 'crushing-tip',
        title: '🏆 You\'re crushing it!',
        message: `You've hit your goal! Check the leaderboard to see your rank.`,
        icon: '🎉',
        trigger: 'milestone',
        dismissible: true,
        frequency: 'daily',
      };
    }

    return null;
  }, [user, stats]);

  return tip;
}
