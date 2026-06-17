import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useSystem } from '../hooks/useSystem';
import { useCRM } from './useCRM';
import { User } from '../types';
import { nexusGateway } from '../nexus/adapters/DataGateway';

export const useAppInitialization = () => {
    const { currentUser, login, logout, exitGhostMode, originalAdmin, isFirebaseAuthReady } = useAuth();
    const { view, setView, toast, setToast, isSyncing, showMoneyRain } = useSystem();
    const { logAttendance, logAudit, directives, validateGhostTarget } = useCRM();
    const [isBooting, setIsBooting] = useState(true);

    useEffect(() => {
        if (isFirebaseAuthReady) {
            // Give it a tiny bit of extra time for stable state
            const timer = setTimeout(() => setIsBooting(false), 800);
            return () => clearTimeout(timer);
        }
    }, [isFirebaseAuthReady]);

    // Session Integrity Monitor
    useEffect(() => {
        if (!currentUser) return;
        const interval = setInterval(async () => {
            const sig = localStorage.getItem('nexus_session_sig');
            if (sig) {
                try {
                    const isValid = await nexusGateway.verifySession(currentUser.id, currentUser.role, currentUser.level || currentUser.accessLevel, sig);
                    if (!isValid) {
                        console.warn("Session invalid, logging out.");
                        logout();
                    }
                } catch (e: any) {
                    const isOffline = e instanceof Error && (e.message.toLocaleLowerCase().includes("offline") || e.message.toLocaleLowerCase().includes("network") || e.message.toLocaleLowerCase().includes("unavailable"));
                    const isOfflineCode = e?.code === 'unavailable' || e?.code === 'failed-precondition';
                    
                    if (!isOffline && !isOfflineCode) {
                        console.error("Session verification failed", e);
                    }
                    // Do not logout on transient network errors, only on explicit invalidation
                }
            } else {
                logout();
            }
        }, 30000); // Increased interval to reduce load
        return () => clearInterval(interval);
    }, [currentUser, logout]);

    const handleLogin = async (user: User) => {
        setIsBooting(true);
        await new Promise(r => setTimeout(r, 1500));
        
        if ((user.level || 0) >= 10 || (user.accessLevel || 0) >= 10) {
            setView('server_select');
        } else {
            setView(user.role === 'admin' ? 'admin_dashboard' : 'agent_dashboard');
        }
        setIsBooting(false);
    };

    const handleGhostLogin = async (userId: string) => {
        if (!currentUser) return;
        try {
            const targetUser = await validateGhostTarget(userId);
            if (targetUser) {
                const currentSig = localStorage.getItem('nexus_session_sig');
                if (currentSig) localStorage.setItem('nexus_admin_sig_bkp', currentSig);
                
                await logAudit({ action: 'GHOST_MODE_ENGAGED', details: `Target: ${targetUser.name}`, module: 'AUTH' });
                await login(targetUser, undefined, true); 
                setView('agent_dashboard');
                setToast({ title: 'Ghost Mode', message: `GHOST MODE: ${targetUser.name}`, type: 'warning' });
            }
        } catch {
            setToast({ title: 'System Error', message: 'Ghost Protocol Failed', type: 'error' });
        }
    };

    useEffect(() => {
        if (currentUser && view === 'login') {
             if ((currentUser.level || 0) >= 10 || (currentUser.accessLevel || 0) >= 10) {
                 setView('server_select');
             } else {
                 setView(currentUser.role === 'admin' ? 'admin_dashboard' : 'agent_dashboard');
             }
             
            const init = async () => {
                if (currentUser.role === 'agent') await logAttendance('SESSION_START');
                await logAudit({ action: 'SESSION_START', details: 'Login', module: 'AUTH' });
            };
            init();
        }

        // Keep WebSocket registration aligned with the active session
        if (currentUser) {
            import('../lib/realtimeClient').then(({ realtimeClient }) => {
                realtimeClient.send('REGISTER_AGENT', { userId: currentUser.id, role: currentUser.role });
            });
        }
    }, [currentUser, view, setView, logAttendance, logAudit]);

    const handleExitGhostMode = useCallback(() => {
        exitGhostMode();
        if (originalAdmin) {
            setView(originalAdmin.role === 'admin' ? 'admin_dashboard' : 'agent_dashboard');
        }
    }, [exitGhostMode, originalAdmin, setView]);

    return {
        currentUser,
        originalAdmin,
        exitGhostMode: handleExitGhostMode,
        view,
        setView,
        toast,
        setToast,
        isSyncing,
        showMoneyRain,
        directives,
        isBooting,
        handleLogin,
        handleGhostLogin
    };
};
