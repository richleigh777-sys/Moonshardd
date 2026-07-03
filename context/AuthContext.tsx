
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User } from '../types';
import { nexusGateway } from '../nexus/adapters/DataGateway';
import { sfx } from '../lib/soundService';
import { tabManager } from '../lib/tabManager';
import { useWorkTimer } from '../hooks/useWorkTimer';
import { AuthContext, WorkTimerContext } from './AuthContextCore';

const SESSION_STORAGE_KEY = 'nexus_session_user';
const SESSION_SIG_KEY = 'nexus_session_sig';
const SESSION_START_KEY = 'nexus_session_start';
const GHOST_ORIGIN_KEY = 'nexus_ghost_origin';

const AUTO_LOGOUT_MS = 12 * 60 * 60 * 1000; // 12 Hours

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [originalAdmin, setOriginalAdmin] = useState<User | null>(null);
    const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
    const [isFirebaseAuthReady] = useState(true);

    const { 
        isOnBreak, 
        breakReason,
        toggleBreak, 
        currentBreakDuration, 
        workTimeSeconds, 
        resetTimerState
    } = useWorkTimer(currentUser, sessionStartTime);

    const afkTimerRef = useRef<any>(null);

    const logout = useCallback(async (broadcast = true) => {
        if (currentUser && broadcast) {
            await nexusGateway.update('users', currentUser.id, { currentStatus: 'offline', lastActive: Date.now() });
            tabManager.broadcast('LOGOUT_SYNC', { userId: currentUser.id });
        }

        setCurrentUser(null);
        setOriginalAdmin(null);
        setSessionStartTime(null);
        resetTimerState();
        
        localStorage.removeItem(SESSION_STORAGE_KEY);
        localStorage.removeItem(SESSION_SIG_KEY);
        localStorage.removeItem(SESSION_START_KEY);
        localStorage.removeItem(GHOST_ORIGIN_KEY);
        localStorage.removeItem('nexus_admin_sig_bkp');

        if (afkTimerRef.current) clearTimeout(afkTimerRef.current);
    }, [currentUser, resetTimerState]);

    // Session Restoration Logic
    const hasRestored = useRef(false);
    useEffect(() => {
        if (hasRestored.current) return;
        hasRestored.current = true;

        const verify = async () => {
            const stored = localStorage.getItem(SESSION_STORAGE_KEY);
            const sig = localStorage.getItem(SESSION_SIG_KEY);
            if (stored && sig) {
                try {
                    const user = JSON.parse(stored);
                    const isValid = await nexusGateway.verifySession(user.id, user.role, user.level, sig);
                    if (!isValid) {
                        console.warn("[Security] Session Signature Invalid or Expired. Purging session.");
                        localStorage.removeItem(SESSION_STORAGE_KEY);
                        localStorage.removeItem(SESSION_SIG_KEY);
                        localStorage.removeItem(SESSION_START_KEY);
                        localStorage.removeItem(GHOST_ORIGIN_KEY);
                        setCurrentUser(null);
                    } else {
                        setCurrentUser(user);
                        const start = localStorage.getItem(SESSION_START_KEY);
                        if (start) setSessionStartTime(parseInt(start));
                    }
                } catch (error: any) { 
                    if (
                        (error instanceof Error && (error.message.includes("client is offline") || error.message.includes("network") || error.message.includes("unavailable"))) ||
                        error?.code === 'unavailable' || error?.code === 'failed-precondition'
                    ) {
                        console.warn("[Security] Client offline, skipping remote session verification. Using cached user.");
                        const user = JSON.parse(stored);
                        setCurrentUser(user);
                        const start = localStorage.getItem(SESSION_START_KEY);
                        if (start) setSessionStartTime(parseInt(start));
                    } else {
                        setCurrentUser(null);
                    }
                }
            }
        };
        verify();
    }, []);

    const resetAfk = useCallback(() => {
        if (isOnBreak) return;
        if (afkTimerRef.current) clearTimeout(afkTimerRef.current);
        afkTimerRef.current = setTimeout(() => logout(), AUTO_LOGOUT_MS);
    }, [logout, isOnBreak]);

    const login = useCallback(async (user: User, sig?: string, isGhost = false) => {
        const now = Date.now();
        if (isGhost && currentUser && currentUser.role === 'admin') {
            setOriginalAdmin(currentUser);
            localStorage.setItem(GHOST_ORIGIN_KEY, JSON.stringify(currentUser));
        }

        const userWithLogin = { ...user, loginTimeToday: now, currentStatus: 'online' as const };
        setCurrentUser(userWithLogin);
        setSessionStartTime(now);
        resetTimerState();
        
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userWithLogin));
        if (sig) {
            localStorage.setItem(SESSION_SIG_KEY, sig);
        } else if (isGhost) {
            const serverId = localStorage.getItem('nexus_server_id') || 'srv-001';
            const tempSig = btoa(`${user.id}:${serverId}:${now}`);
            localStorage.setItem(SESSION_SIG_KEY, tempSig);
        }
        localStorage.setItem(SESSION_START_KEY, now.toString());
        await nexusGateway.update('users', user.id, { currentStatus: 'online', lastActive: now });
        resetAfk();
    }, [currentUser, resetTimerState, resetAfk]);

    const exitGhostMode = useCallback(() => {
        if (originalAdmin) {
            const sig = localStorage.getItem('nexus_admin_sig_bkp'); 
            login(originalAdmin, sig || undefined, false);
            setOriginalAdmin(null);
            localStorage.removeItem(GHOST_ORIGIN_KEY);
            sfx.playConfirm();
        }
    }, [originalAdmin, login]);

    const handleToggleBreak = useCallback((reason?: string) => {
        toggleBreak(reason);
        resetAfk();
    }, [toggleBreak, resetAfk]);

    const authValue = React.useMemo(() => ({
        currentUser, originalAdmin, login, logout, exitGhostMode, isFirebaseAuthReady,
        authenticate: (id: string, pass: string, cid: string, cpass: string) => nexusGateway.authenticate(id, pass, cid, cpass),
        authenticateRoot: (id: string, pass: string) => nexusGateway.authenticateRoot(id, pass),
        register: (u: Partial<User>) => nexusGateway.add('users', u),
        updateProfile: async (u: Partial<User>) => {
            if(currentUser) {
                await nexusGateway.update('users', currentUser.id, u);
                setCurrentUser({...currentUser, ...u});
            }
        }
    }), [
        currentUser, originalAdmin, login, logout, exitGhostMode, isFirebaseAuthReady
    ]);

    const timerValue = React.useMemo(() => ({
        isOnBreak, breakReason, onToggleBreak: handleToggleBreak,
        currentBreakDuration, workTimeSeconds, resetTimerState
    }), [
        isOnBreak, breakReason, handleToggleBreak, currentBreakDuration, workTimeSeconds, resetTimerState
    ]);

    return (
        <AuthContext.Provider value={authValue}>
            <WorkTimerContext.Provider value={timerValue}>
                {children}
            </WorkTimerContext.Provider>
        </AuthContext.Provider>
    );
};
