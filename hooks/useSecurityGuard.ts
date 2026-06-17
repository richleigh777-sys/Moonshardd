import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { SecurityEngine } from '../nexus/services/SecurityEngine';
import { useSystem } from './useSystem';

export function useSecurityGuard(requiredLevel: number, moduleName: string) {
    const { currentUser } = useAuth();
    const { setToast } = useSystem();

    useEffect(() => {
        if (!currentUser) return; // Wait for auth to resolve
        
        try {
            SecurityEngine.checkAccessOrThrow(currentUser.level, requiredLevel, `Access ${moduleName}`);
        } catch (error: any) {
            setToast({
                title: "DLP SECURITY LOCKDOWN",
                message: error.message,
                type: "error"
            });
            // Auto redirect to a safe zone
            window.location.hash = '#/';
        }
    }, [currentUser, requiredLevel, moduleName, setToast]);

    return {
        isAuthorized: (currentUser?.level || 0) >= requiredLevel
    };
}
