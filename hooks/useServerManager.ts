import { useState, useCallback, useMemo, useEffect } from 'react';
import { Server } from '../types';
import { nexusGateway } from '../nexus/adapters/DataGateway';

import { useAuth } from './useAuth';

export const useServerManager = () => {
    const { currentUser } = useAuth();
    const [serverList, setServerList] = useState<Server[]>(() => nexusGateway.getData('servers') || []);
    const [activeServer, setActiveServer] = useState<Server | null>(() => {
        const list = nexusGateway.getData('servers') || [];
        return list.find((s: Server) => s.id === nexusGateway.activeServerId) || list[0] || null;
    });

    useEffect(() => {
        if (!currentUser) {
            // Use setTimeout to skip the current render cycle for setState
            setTimeout(() => {
                setServerList([]);
                setActiveServer(null);
            }, 0);
            return;
        }

        const unsubscribe = nexusGateway.subscribe('servers', currentUser, (data) => {
            setServerList(data);
            const active = data.find((s: Server) => s.id === nexusGateway.activeServerId);
            if (active) setActiveServer(active);
        });
        return unsubscribe;
    }, [currentUser]);

    const switchServer = useCallback((serverId: string) => {
        nexusGateway.setActiveServer(serverId);
        const target = serverList.find(s => s.id === serverId);
        if (target) setActiveServer(target);
    }, [serverList]);

    const createNewServer = useCallback(async (name: string, region: string) => {
        const newServer = await nexusGateway.createServer(name, region);
        if (newServer) {
            setServerList(prev => {
                if (prev.find(s => s.id === newServer.id)) return prev;
                return [...prev, newServer];
            });
        }
    }, [setServerList]);

    const updateServer = useCallback(async (serverId: string, data: Partial<Server>) => {
        await nexusGateway.updateServer(serverId, data);
    }, []);

    return useMemo(() => ({
        activeServer,
        serverList,
        switchServer,
        createNewServer,
        updateServer
    }), [activeServer, serverList, switchServer, createNewServer, updateServer]);
};
