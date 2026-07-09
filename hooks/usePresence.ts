import { useEffect, useContext } from 'react';
import { CRMContext } from '../context/CRMContextCore';

export const usePresence = (resourceId: string, resourceType: 'sale' | 'customer' | 'dashboard' | 'chat', action: 'viewing' | 'editing' = 'viewing', subResource?: string) => {
    const context = useContext(CRMContext);
    const updatePresence = context?.updatePresence;
    const clearPresence = context?.clearPresence;
    const currentUser = context?.currentUser;
    
    useEffect(() => {
        if (!currentUser || !resourceId || !updatePresence || !clearPresence) return;

        const heartbeat = () => {
            updatePresence({
                userId: currentUser.id,
                userName: currentUser.name,
                resourceId,
                resourceType,
                action,
                subResource
            });
        };

        heartbeat(); // Initial
        const interval = setInterval(heartbeat, 15000); // Heartbeat every 15s

        return () => {
            clearInterval(interval);
            clearPresence(currentUser.id, resourceId);
        };
    }, [currentUser, resourceId, resourceType, action, subResource, updatePresence, clearPresence]);
};
