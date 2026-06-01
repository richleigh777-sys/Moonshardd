import { useContext, useEffect, useState } from 'react';
import { CRMContext } from '../context/CRMContextCore';
import { AuthContext } from '../context/AuthContextCore';
import { DailyStats } from '../types/uiState';
import { Sale } from '../types';

export function useTodayStats(): DailyStats {
  const { sales } = useContext(CRMContext)!;
  const { currentUser } = useContext(AuthContext)!;
  const [stats, setStats] = useState<DailyStats>({
    salesCount: 0,
    totalRevenue: 0,
    commission: 0,
    dailyGoal: 5,
    commissionTarget: 300,
    progressPercentage: 0,
    status: 'below-target',
  });

  useEffect(() => {
    if (!currentUser || !sales) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const todaysSales = sales.filter(
      (sale: Sale) =>
        sale.agentId === currentUser.id &&
        sale.timestamp >= todayTimestamp &&
        (sale.status === 'Approved' || sale.status === 'Pending')
    );

    const totalRevenue = todaysSales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
    const rawRate = (currentUser as any).commissionRate || 15;
    const commissionRate = rawRate > 1 ? rawRate / 100 : rawRate;
    const commission = Math.round(totalRevenue * commissionRate);

    const dailyGoal = 5;
    const progressPercentage = Math.min(100, (todaysSales.length / dailyGoal) * 100);

    let status: DailyStats['status'] = 'below-target';
    if (progressPercentage >= 100) status = 'crushing';
    else if (progressPercentage >= 80) status = 'on-track';
    else if (progressPercentage >= 50) status = 'below-target';
    else status = 'critical';

    setStats({
      salesCount: todaysSales.length,
      totalRevenue,
      commission,
      dailyGoal,
      commissionTarget: 300,
      progressPercentage,
      status,
    });
  }, [sales, currentUser]);

  return stats;
}
