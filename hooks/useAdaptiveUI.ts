import { useContext, useMemo } from 'react';
import { CRMContext } from '../context/CRMContextCore';
import { AuthContext } from '../context/AuthContextCore';
import { AdaptiveUserProfile, UserTier } from '../types/uiState';
import { useTodayStats } from './useTodayStats';

export function useAdaptiveUI(): AdaptiveUserProfile {
  const { sales } = useContext(CRMContext)!;
  const { currentUser } = useContext(AuthContext)!;
  const stats = useTodayStats();

  const user = currentUser;

  const profile = useMemo((): AdaptiveUserProfile => {
    if (!user || !sales) {
      return {
        tier: 'new',
        daysSinceSignup: 0,
        totalSalesAllTime: 0,
        averageSalesPerDay: 0,
        currentStreak: 0,
        bestDay: 0,
        needsSupport: false,
        preferredWorkStyle: 'steady',
      };
    }

    // Calculate account age
    const accountCreatedMs = (user as any).created || Date.now();
    const daysSinceSignup = Math.floor((Date.now() - accountCreatedMs) / 1000 / 60 / 60 / 24);

    // Get all-time stats
    const userSales = sales.filter((s: any) => s.agentId === user.id && s.status === 'Approved');
    const totalSalesAllTime = userSales.length;
    const averageSalesPerDay = daysSinceSignup > 0 ? totalSalesAllTime / daysSinceSignup : 0;

    // Calculate streak
    let currentStreak = 0;
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const salesThatDay = userSales.filter((s: any) => s.timestamp >= date.getTime());
      if (salesThatDay.length > 0) currentStreak++;
      else break;
    }

    // Calculate best day
    const bestDay = Math.max(
      0,
      ...Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        return userSales
          .filter((s: any) => s.timestamp >= date.getTime() && s.timestamp < nextDay.getTime())
          .reduce((sum, s: any) => sum + (s.amount || 0), 0);
      })
    );

    // Determine tier
    let tier: UserTier = 'average';
    if (daysSinceSignup < 1) tier = 'new';
    else if (stats.status === 'crushing' || averageSalesPerDay > 5) tier = 'top-performer';
    else if (stats.status === 'critical' || averageSalesPerDay < 1) tier = 'struggling';

    return {
      tier,
      daysSinceSignup,
      totalSalesAllTime,
      averageSalesPerDay: Math.round(averageSalesPerDay * 10) / 10,
      currentStreak,
      bestDay,
      needsSupport: stats.status === 'critical',
      preferredWorkStyle: averageSalesPerDay > 5 ? 'aggressive' : averageSalesPerDay > 3 ? 'steady' : 'casual',
    };
  }, [user, sales, stats]);

  return profile;
}
