/**
 * UI State Management Types
 * Defines the shape of user interface state
 */

import { Sale } from '../types';

export type ViewType = 'home' | 'leads' | 'chat' | 'me' | 'sales' | 'overview' | 'enrollment';
export type UserTier = 'new' | 'average' | 'top-performer' | 'struggling';
export type NotificationType = 'action-required' | 'milestone' | 'motivational' | 'alert';
export type LeadPriority = 'urgent' | 'high' | 'standard' | 'low';

export interface UIState {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  showHelpTip: boolean;
  setShowHelpTip: (show: boolean) => void;
}

export interface DailyStats {
  salesCount: number;
  totalRevenue: number;
  commission: number;
  dailyGoal: number;
  commissionTarget: number;
  progressPercentage: number;
  status: 'crushing' | 'on-track' | 'below-target' | 'critical';
}

export interface SmartLead extends Sale {
  priority: LeadPriority;
  score: number;
  reason: string;
  callbackTime?: number;
  suggestedScript?: string;
  estimatedValue: number;
  lastContactDaysAgo: number;
  conversionProbability: number;
  name?: string;
  interactionCount?: number;
}

export interface AdaptiveUserProfile {
  tier: UserTier;
  daysSinceSignup: number;
  totalSalesAllTime: number;
  averageSalesPerDay: number;
  currentStreak: number;
  bestDay: number;
  needsSupport: boolean;
  preferredWorkStyle: 'aggressive' | 'steady' | 'casual';
}

export interface HelpTip {
  id: string;
  title: string;
  message: string;
  icon?: string;
  trigger: 'first-time' | 'stuck' | 'momentum' | 'milestone' | 'always';
  action?: {
    label: string;
    handler: () => void;
  };
  dismissible: boolean;
  frequency: 'once' | 'daily' | 'always';
}

export interface SmartNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  priority: 'high' | 'medium' | 'low';
  action?: string;
  timestamp: number;
  read: boolean;
  sound?: 'coin-drop' | 'success' | 'alert' | 'none';
  duration?: number;
}

export interface UIMetrics {
  timePerSale: number;
  saleEntryCompletionRate: number;
  leadClickThroughRate: number;
  navigationDepth: number;
  helpTipDismissRate: number;
  userSatisfactionScore: number;
}
