import { Sale } from '../types';

/**
 * Calculates a weighted Urgency Score for a lead.
 * Higher score = higher priority.
 */
export const calculateUrgencyScore = (sale: Sale): number => {
  const now = Date.now();
  const daysOld = Math.floor((now - sale.timestamp) / (1000 * 60 * 60 * 24));
  
  // Weight 1: Financial Value (1 point per $500)
  const valueWeight = (Number(sale.amount) || 0) / 500;
  
  // Weight 2: Stagnation (1.5 points per day old)
  const ageWeight = daysOld * 1.5;
  
  // Weight 3: Strategic Context
  let strategicBonus = 0;
  if (sale.status === 'Declined' || sale.status === 'Rescue In Progress') {
    strategicBonus = 15; // Highest priority for saves
  } else if (sale.isReorder) {
    strategicBonus = 10; // High priority for renewals
  }

  // Weight 4: Interaction Friction
  const noteCountBonus = (sale.callSummary?.length || 0) > 100 ? 5 : 0;

  return valueWeight + ageWeight + strategicBonus + noteCountBonus;
};

/**
 * Sorts an array of sales by Smart Rank
 */
export const sortBySmartRank = (sales: Sale[]): Sale[] => {
  return [...sales].sort((a, b) => calculateUrgencyScore(b) - calculateUrgencyScore(a));
};