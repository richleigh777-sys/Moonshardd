import { useContext, useEffect, useState } from 'react';
import { CRMContext } from '../context/CRMContextCore';
import { AuthContext } from '../context/AuthContextCore';
import { SmartLead, LeadPriority } from '../types/uiState';
import { Sale, Note } from '../types';

export function useSmartLeadQueue(): SmartLead[] {
  const { sales, notes } = useContext(CRMContext)!;
  const { currentUser } = useContext(AuthContext)!;
  const [smartLeads, setSmartLeads] = useState<SmartLead[]>([]);

  useEffect(() => {
    if (!currentUser || !sales || !notes) return;

    const now = Date.now();

    const scoredLeads: SmartLead[] = sales
      .filter((sale: Sale) => 
        sale.agentId === currentUser.id && 
        (sale.status === 'Pending' || sale.status === 'Declined')
      )
      .map((sale: Sale) => {
        let score = 0;
        let priority: LeadPriority = 'standard';
        let reason = '';

        // Check if callback is due
        const relatedNote = notes.find((n: Note) => n.linkedSaleId === sale.id && n.type === 'callback');
        const callbackTime = relatedNote?.reminderAt || relatedNote?.timestamp;
        const minutesUntilCallback = callbackTime ? Math.round((callbackTime - now) / 1000 / 60) : 999;

        if (minutesUntilCallback < 60 && minutesUntilCallback >= 0) {
          score += 40;
          priority = 'urgent';
          reason = `Callback due in ${minutesUntilCallback} minutes`;
        } else if (minutesUntilCallback < 240) {
          score += 30;
          priority = 'high';
          reason = `Callback due in ${Math.round(minutesUntilCallback / 60)} hours`;
        } else if (minutesUntilCallback < 1440) {
          score += 20;
          priority = 'high';
          reason = 'Callback due today';
        }

        // Score by sale amount
        if (sale.amount > 500) score += 25;
        else if (sale.amount > 250) score += 15;
        else score += 5;

        // Score by age
        const daysOld = Math.floor((now - sale.timestamp) / 1000 / 60 / 60 / 24);
        if (daysOld < 1) score += 15;
        else if (daysOld < 3) score += 10;
        else if (daysOld < 7) score += 5;

        // Score by decline reason
        const isRecoverable = sale.declineReason && 
          ['Bank Security Hold', 'Insufficient Funds', 'Price'].includes(sale.declineReason);
        if (isRecoverable) score += 10;

        // Set priority if not already urgent/high
        if (score >= 80) priority = 'urgent';
        else if (score >= 60) priority = 'high';
        else if (score >= 40) priority = 'standard';
        else priority = 'low';

        const conversionProbability = Math.min(100, Math.max(20, 60 - daysOld * 5));

        return {
          ...sale,
          score: Math.min(100, score),
          priority,
          reason,
          callbackTime,
          suggestedScript: sale.declineReason ? getScriptForReason(sale.declineReason) : undefined,
          estimatedValue: sale.amount,
          lastContactDaysAgo: daysOld,
          conversionProbability,
        } as SmartLead;
      })
      .sort((a, b) => b.score - a.score);

    setSmartLeads(scoredLeads);
  }, [sales, notes, currentUser]);

  return smartLeads;
}

function getScriptForReason(reason: string): string {
  const scripts: Record<string, string> = {
    'Bank Security Hold': 'Your bank is protecting you. Just need a quick confirmation.',
    'Insufficient Funds': 'No rush, when is a better time?',
    'Price': 'I have a smaller package that might work better.',
    'Trust/Scam Fear': 'Your peace of mind is our priority.',
    'High Risk / Fraud Alert': 'Your bank is being cautious, totally normal.',
  };
  return scripts[reason] || 'Thanks for your interest, let me help!';
}
