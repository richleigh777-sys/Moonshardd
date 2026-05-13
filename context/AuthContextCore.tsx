import { createContext } from 'react';
import { User } from '../types';

export interface AuthContextType {
    currentUser: User | null;
    originalAdmin: User | null;
    isFirebaseAuthReady: boolean;
    login: (user: User, sig?: string, isGhost?: boolean) => Promise<void>;
    exitGhostMode: () => void;
    logout: () => void;
    authenticate: (id: string, pass: string, companyId: string, companyPass: string) => Promise<{user: User, sig: string} | { error: string } | null>;
    authenticateRoot: (id: string, pass: string) => Promise<{user: User, sig: string} | { error: string } | null>;
    register: (user: Partial<User>) => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<void>;
}

export interface WorkTimerContextType {
    isOnBreak: boolean;
    breakReason: string | null;
    onToggleBreak: (reason?: string) => void;
    currentBreakDuration: number;
    workTimeSeconds: number;
    resetTimerState: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const WorkTimerContext = createContext<WorkTimerContextType | undefined>(undefined);
