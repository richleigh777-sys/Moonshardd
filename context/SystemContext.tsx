import { getStorageItem, setStorageItem } from '../lib/storage';

import React, { useState, useEffect } from 'react';
import { ToastMessage, ViewState, Theme } from '../types';
import { tabManager } from '../lib/tabManager';
import { sfx } from '../lib/soundService';
import { useServerManager } from '../hooks/useServerManager';
import { SystemContext } from './SystemContextCore';

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [view, setView] = useState<ViewState>('login');
    const [toast, setToast] = useState<ToastMessage | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showMoneyRain, setShowMoneyRain] = useState(false);
    const [systemLoad, setSystemLoad] = useState(12);
    const [isChatOpen, setChatOpen] = useState(false);
    const [isTabLeader, setIsTabLeader] = useState(tabManager.isLeader);
    const [targetChannelId, setTargetChannelId] = useState<string | null>(null);
    const [callTarget, setCallTarget] = useState<string | null>(null);
    
    // Zoom control with persistence
    const [uiZoom, setUiZoom] = useState<number>(() => {
        const stored = getStorageItem('bh_ui_zoom');
        return stored ? parseFloat(stored) : 1.0;
    });

    useEffect(() => {
        setStorageItem('bh_ui_zoom', String(uiZoom));
        // Apply scaling globally if browser doesn't natively perform well
        // Actually, CSS zoom handles this gracefully or we can use font-size scaling.
        document.documentElement.style.fontSize = `${uiZoom * 100}%`;
    }, [uiZoom]);
    
    const [theme, setTheme] = useState<Theme>(() => (getStorageItem('bh_theme') as Theme) || 'light');
    const [isChromatic, setIsChromatic] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
        const stored = getStorageItem('bh_notifs_enabled');
        return stored === null ? true : stored === 'true';
    });

    const { serverList, activeServer, switchServer, createNewServer } = useServerManager();

    useEffect(() => {
        const interval = setInterval(() => {
            const leaderStatus = tabManager.isLeader;
            if (leaderStatus !== isTabLeader) {
                setIsTabLeader(leaderStatus);
                sfx.setLeaderStatus(leaderStatus);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [isTabLeader]);

    useEffect(() => {
        const enforced = activeServer?.config?.enforceTheme;
        const appliedTheme = (enforced === 'light' || enforced === 'dark') ? enforced : theme;
        document.documentElement.className = appliedTheme;
        
        // Apply other UX Vibe settings globally via data attributes
        document.documentElement.setAttribute('data-transition-speed', activeServer?.config?.transitionSpeed || 'gentle');
        document.documentElement.setAttribute('data-eye-care-filter', activeServer?.config?.eyeCareFilter || 'neutral');
        
        // Push SFX enablement down safely
        if (activeServer?.config?.enableSoundFx !== undefined) {
            sfx.setEnabled(activeServer.config.enableSoundFx);
        }

        setStorageItem('bh_theme', theme);
    }, [theme, activeServer?.config?.enforceTheme, activeServer?.config?.transitionSpeed, activeServer?.config?.eyeCareFilter]);

    useEffect(() => {
        setStorageItem('bh_notifs_enabled', String(notificationsEnabled));
    }, [notificationsEnabled]);

    useEffect(() => {
        const interval = setInterval(() => {
            setSystemLoad(prev => {
                const variance = Math.random() > 0.5 ? 1 : -1;
                const change = Math.floor(Math.random() * 3);
                const next = prev + (variance * change);
                return Math.max(10, Math.min(45, next));
            });
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    const toggleResonance = () => setIsChromatic(prev => !prev);
    const toggleNotifications = () => {
        sfx.playClick();
        setNotificationsEnabled(prev => !prev);
    };

    const triggerMoneyRain = () => {
        setShowMoneyRain(true);
        setTimeout(() => setShowMoneyRain(false), 5000);
    };

    const openSystemChat = (channelId: string) => {
        setTargetChannelId(channelId);
        setChatOpen(true);
    };

    const systemValue = React.useMemo(() => ({
        view, setView,
        toast, setToast: (t: ToastMessage | null) => {
            if (notificationsEnabled) {
                setToast(t);
            }
        },
        isSyncing, setIsSyncing,
        showMoneyRain, triggerMoneyRain,
        systemLoad,
        theme, toggleTheme,
        isChromatic, toggleResonance,
        isChatOpen, setChatOpen,
        isTabLeader,
        notificationsEnabled,
        toggleNotifications,
        targetChannelId,
        openSystemChat,
        callTarget,
        initiateCall: (number: string) => {
            setCallTarget(number);
            // Reset after short delay to allow re-triggering same number
            setTimeout(() => setCallTarget(null), 500);
        },
        activeServer,
        serverList,
        switchServer,
        createNewServer,
        uiZoom,
        setUiZoom
    }), [
        view, toast, notificationsEnabled, isSyncing, showMoneyRain, systemLoad, 
        theme, isChromatic, isChatOpen, isTabLeader, targetChannelId, callTarget,
        activeServer, serverList, switchServer, createNewServer, uiZoom
    ]);

    return (
        <SystemContext.Provider value={systemValue}>
            {children}
        </SystemContext.Provider>
    );
};
