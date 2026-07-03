import { Sale, Note } from '../../types';
import { SmartLead } from '../../types/uiState';

export function calculateNextBestAction(
  leads: SmartLead[],
  sales: Sale[],
  notes: Note[],
  currentUser: any
): SmartLead | null {
  if (leads.length === 0) return null;

  let topLead = leads[0];
  let topScore = topLead.score;

  for (const lead of leads) {
    let score = lead.score;

    if (lead.callbackTime) {
      const minutesUntil = Math.round((lead.callbackTime - Date.now()) / 1000 / 60);
      if (minutesUntil < 60 && minutesUntil > 0) {
        score += 20;
      }
    }

    if (lead.amount > 1000) {
      score += 15;
    }

    const agentSales = sales.filter((s) => s.agentId === currentUser.id);
    const conversionRate = agentSales.filter((s) => s.status === 'Approved').length /
      Math.max(1, agentSales.length);

    if (conversionRate > 0.5) {
      score += 10;
    } else if (conversionRate < 0.2) {
      if (lead.conversionProbability > 50) {
        score += 15;
      }
    }

    if (score > topScore) {
      topScore = score;
      topLead = lead;
    }
  }

  return topLead;
}

export function scoreLead(
  lead: Sale,
  allSales: Sale[],
  notes: Note[],
  _days: number = 7
): number {
  let score = 0;

  const relatedNote = notes.find((n) => n.linkedSaleId === lead.id);
  if (relatedNote?.reminderAt) {
    const minutesUntil = Math.round((relatedNote.reminderAt - Date.now()) / 1000 / 60);
    if (minutesUntil < 60) score += 40;
    else if (minutesUntil < 240) score += 30;
    else if (minutesUntil < 1440) score += 20;
  }

  if (lead.amount > 500) score += 25;
  else if (lead.amount > 250) score += 15;
  else score += 5;

  const ageMinutes = (Date.now() - lead.timestamp) / 1000 / 60;
  if (ageMinutes < 60) score += 20;
  else if (ageMinutes < 240) score += 15;
  else if (ageMinutes < 1440) score += 10;
  else if (ageMinutes < 1440 * 3) score += 5;

  const isRecoverable = lead.declineReason && 
    ['Bank Security Hold', 'Insufficient Funds', 'Price', 'Trust/Scam Fear'].includes(
      lead.declineReason
    );
  if (isRecoverable) score += 15;

  return Math.min(100, score);
}
