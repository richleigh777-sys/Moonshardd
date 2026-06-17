/**
 * NEXT-LEVEL SOLUTION 3: Strict Role-Based Access Control (RBAC) Wrapper
 * 
 * Flaw Addressed: Ad-hoc "if currentUser.level > X" scattered across React,
 * risking misconfigurations where hidden UI elements remain functionally active.
 * 
 * Solution: A robust, declarative security wrapper that completely nullifies
 * the React tree branch if permissions are unmet, preventing unauthorized state mounts.
 */

import React from 'react';
import { useAuth } from './useAuth';
import { ShieldAlert } from 'lucide-react';
import { SecurityEngine } from '../nexus/services/SecurityEngine';

interface SecureGateProps {
    requiredLevel?: number;
    requiredRole?: 'admin' | 'manager' | 'agent' | 'qa';
    moduleName: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    silent?: boolean; // If true, don't show the fallback UI, just render null
}

export const SecureGate: React.FC<SecureGateProps> = ({
    requiredLevel = 1,
    requiredRole,
    moduleName,
    children,
    fallback,
    silent = false
}) => {
    const { currentUser } = useAuth();
    
    const roleHierarchy = {
        'agent': 1,
        'qa': 4,
        'manager': 5,
        'admin': 10
    };

    const isAuthorized = React.useMemo(() => {
        if (!currentUser) return false;
        
        let valid = true;
        
        if (currentUser.level < requiredLevel) {
            valid = false;
        }

        if (requiredRole && roleHierarchy[currentUser.role as keyof typeof roleHierarchy] < roleHierarchy[requiredRole]) {
            valid = false;
        }

        return valid;
    }, [currentUser, requiredLevel, requiredRole]);

    // Only log to security engine if it's not silent (meaning someone explicitly navigated there)
    React.useEffect(() => {
        if (!isAuthorized && !silent && currentUser) {
            SecurityEngine.logEvent({
                serverId: currentUser.serverId,
                agentId: currentUser.id,
                agentName: currentUser.name || currentUser.id,
                action: 'UI_ACCESS_DENIED',
                module: 'SYSTEM',
                details: `Blocked render phase of module: ${moduleName}`,
                category: 'DLP_RESTRICTED_ACCESS'
            });
        }
    }, [isAuthorized, silent, currentUser, moduleName]);

    // Handle unauthorized states
    if (!isAuthorized) {
        if (silent) return null;

        return (
            fallback ? <>{fallback}</> : (
                <div className="flex flex-col items-center justify-center p-8 bg-surface-main border border-red-900/50 rounded-lg min-h-[300px] text-center">
                    <ShieldAlert size={48} className="text-red-500 mb-4 opacity-80" />
                    <h3 className="text-xl font-bold text-text-primary mb-2">Restricted Security Zone</h3>
                    <p className="text-text-muted mb-4 max-w-md">
                        Your current clearance level ({currentUser?.level || 0}) is insufficient to access the <span className="text-white font-mono">{moduleName}</span> module. 
                        Required Level: {requiredLevel}.
                    </p>
                    <p className="text-xs font-mono text-red-400 opacity-60">This compliance metric has been logged.</p>
                </div>
            )
        );
    }

    return <>{children}</>;
};
