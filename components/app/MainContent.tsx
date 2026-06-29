import React, { Suspense, lazy } from 'react';
import { LoginScreen } from '../../views/LoginScreen';
import { SyncOverlay } from '../ui/Feedback';
import { Toast } from '../ui/Toast';
import { WarRoomDirectives } from '../widgets/WarRoomDirectives';
import { CallbackManager } from '../logic/CallbackManager';
import { SecurityLayout } from '../layout/SecurityLayout';
import { VibeLayout } from '../layout/VibeLayout';
import { MoneyRain } from '../ui/Celebration';
import { useSystem } from '../../hooks/useSystem';
import { ServerGateway } from '../auth/ServerGateway';
import { CommandPalette } from '../layout/CommandPalette';
import { SystemBootSequence } from './SystemBootSequence';
import { GhostModeBanner } from './GhostModeBanner';
import { useAppInitialization } from '../../hooks/useAppInitialization';
import { GlobalWorkers } from './GlobalWorkers';

const AgentPortal = lazy(() => import('../../views/AgentPortal').then(m => ({ default: m.AgentPortal })));
const AdminPortal = lazy(() => import('../../views/AdminPortal').then(m => ({ default: m.AdminPortal })));

export const MainContent: React.FC = () => {
    const { activeServer } = useSystem();
    const {
        currentUser, originalAdmin, exitGhostMode, view,
        isSyncing, showMoneyRain, directives, isBooting, handleLogin, handleGhostLogin
    } = useAppInitialization();

    if (isBooting) {
        return <SystemBootSequence />;
    }

    return (
        <SecurityLayout>
            <VibeLayout>
                <div className="h-full w-full text-text-primary transition-all duration-300 font-sans relative">
                    <GlobalWorkers />
                    <MoneyRain active={showMoneyRain && (activeServer?.config?.enableConfetti !== false)} />
                    <SyncOverlay isSyncing={isSyncing} />
                    <CallbackManager />
                    <Toast />
                    <WarRoomDirectives directives={directives} />
                    
                    {currentUser && <CommandPalette />}

                    {originalAdmin && (
                        <GhostModeBanner currentUser={currentUser} exitGhostMode={exitGhostMode} />
                    )}

                    <div className="h-full">
                        {(!currentUser || view === 'login') && (
                            <LoginScreen onLogin={handleLogin} isDbConnected={true} users={[]} />
                        )}
                        
                        {currentUser && view === 'server_select' && (currentUser.level || currentUser.accessLevel || 0) >= 10 && (
                            <ServerGateway />
                        )}
                        
                        <Suspense fallback={<SystemBootSequence />}>
                            {view === 'agent_dashboard' && currentUser && (currentUser.role === 'agent' || (currentUser.level || 0) < 5) && <AgentPortal />}
                            {view === 'admin_dashboard' && currentUser && (currentUser.role === 'admin' || (currentUser.level || 0) >= 5) && <AdminPortal onGhostLogin={handleGhostLogin} />}
                        </Suspense>
                    </div>
                </div>
            </VibeLayout>
        </SecurityLayout>
    );
};
