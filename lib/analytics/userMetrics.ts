import { Sale, User } from '../../types';
import { UIMetrics } from '../../types/uiState';

export function calculateUIMetrics(
  sales: Sale[],
  userSessions: any[],
  currentUser: User
): UIMetrics {
  const approvedSales = sales.filter((s) => s.status === 'Approved' && s.agentId === currentUser.id);
  const timePerSale =
    approvedSales.reduce((sum, sale) => {
      return sum + ((sale.closedAt || Date.now()) - sale.timestamp);
    }, 0) / Math.max(1, approvedSales.length);

  const sessionsWithSales = userSessions.filter((s) => s.salesCreated > 0).length;
  const saleEntryCompletionRate = userSessions.length > 0
    ? (sessionsWithSales / userSessions.length) * 100
    : 0;

  const leadClicks = userSessions.reduce((sum, s) => sum + s.leadClicks, 0);
  const leadClickThroughRate = userSessions.length > 0
    ? (leadClicks / (userSessions.length * 5)) * 100
    : 0;

  const navigationDepth =
    userSessions.reduce((sum, s) => sum + s.navigationClicks, 0) /
    Math.max(1, userSessions.length);

  const helpTipShown = userSessions.reduce((sum, s) => sum + s.helpTipsShown, 0);
  const helpTipDismissed = userSessions.reduce((sum, s) => sum + s.helpTipsDismissed, 0);
  const helpTipDismissRate = helpTipShown > 0 ? (helpTipDismissed / helpTipShown) * 100 : 0;

  const userSatisfactionScore = calculateUserSatisfaction(sales, currentUser);

  return {
    timePerSale: Math.round(timePerSale),
    saleEntryCompletionRate: Math.round(saleEntryCompletionRate),
    leadClickThroughRate: Math.round(leadClickThroughRate),
    navigationDepth: Math.round(navigationDepth * 10) / 10,
    helpTipDismissRate: Math.round(helpTipDismissRate),
    userSatisfactionScore,
  };
}

function calculateUserSatisfaction(sales: Sale[], user: User): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysSales = sales.filter(
    (s) => s.agentId === user.id && s.timestamp >= today.getTime()
  );

  let score = 5;

  if (todaysSales.length >= 5) score += 3;
  else if (todaysSales.length >= 3) score += 2;
  else if (todaysSales.length >= 1) score += 1;

  const approvalRate = todaysSales.length > 0
    ? todaysSales.filter((s) => s.status === 'Approved').length / todaysSales.length
    : 0;
  if (approvalRate > 0.7) score += 2;

  return Math.min(10, score);
}

export function trackSessionMetric(metricName: string, value: any): void {
  if (typeof window === 'undefined') return;

  if ((window as any).gtag) {
    (window as any).gtag('event', metricName, { value });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`[METRIC] ${metricName}:`, value);
  }
}
