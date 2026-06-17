import { createContext } from 'react';
import { ToastMessage, ViewState, Theme, Server } from '../types';

export interface SystemContextType {
    view: ViewState;
    setView: (view: ViewState) => void;
    toast: ToastMessage | null;
    setToast: (toast: ToastMessage | null) => void;
    isSyncing: boolean;
    setIsSyncing: (is: boolean) => void;
    showMoneyRain: boolean;
    triggerMoneyRain: () => void;
    systemLoad: number;
    theme: Theme;
    toggleTheme: () => void;
    isChromatic: boolean;
    toggleResonance: () => void;
    isChatOpen: boolean;
    setChatOpen: (isOpen: boolean) => void;
    isTabLeader: boolean;
    notificationsEnabled: boolean;
    toggleNotifications: () => void;
    targetChannelId: string | null;
    openSystemChat: (channelId: string) => void;
    
    // Telephony
    callTarget: string | null;
    initiateCall: (number: string) => void;
    
    // Server Management
    activeServer: Server | null;
    serverList: Server[];
    switchServer: (serverId: string) => void;
    createNewServer: (name: string, region: string) => Promise<void>;
    
    // UI Scaling
    uiZoom: number;
    setUiZoom: (zoom: number) => void;
}

export const SystemContext = createContext<SystemContextType | undefined>(undefined);
