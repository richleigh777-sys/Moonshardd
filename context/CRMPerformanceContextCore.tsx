import { createContext } from 'react';
import { AgentPerformance } from '../types';

export interface CRMPerformanceContextType {
    leaderboard: AgentPerformance[];
    topPerformers: AgentPerformance[];
    wallOfShame: AgentPerformance[];
    myStats: AgentPerformance | null;
    shiftDuration: number;
    isClockedIn: boolean;
    clockIn: () => Promise<void>;
    clockOut: () => Promise<void>;
}

export const CRMPerformanceContext = createContext<CRMPerformanceContextType | undefined>(undefined);
