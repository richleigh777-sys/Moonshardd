import React, { Suspense } from 'react';
import { LoginScreen } from '../../views/LoginScreen';
import { SyncOverlay } from '../ui/Feedback';
import { Toast } from '../ui/Toast';
import { WarRoomDirectives } from '../widgets/WarRoomDirectives';
import { CallbackManager } from '../logic/CallbackManager';
import { SecurityLayout } from '../layout/SecurityLayout';
import { VibeLayout } from '../layout/VibeLayout';
import { MoneyRain } from '../ui/Celebration';
import { ServerGateway } from '../auth/ServerGateway';
import { CommandPalette } from '../layout/CommandPalette';
import { SystemBootSequence } from './SystemBootSequence';
import { GhostModeBanner } from './GhostModeBanner';
import { useAppInitialization } from '../../hooks/useAppInitialization';

const AgentPortal = React.lazy(() => import('../../views/AgentPortal').then(module => ({ default: module.AgentPortal })));
const AdminPortal = React.lazy(() => import('../../views/AdminPortal').then(module => ({ default: module.AdminPortal })));

export const MainContent: React.FC = () => {
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
                    <MoneyRain active={showMoneyRain} />
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
                        
                        {currentUser && view === 'server_select' && (
                            <ServerGateway />
                        )}
                        
                        <Suspense fallback={<SystemBootSequence />}>
                            {view === 'agent_dashboard' && currentUser && <AgentPortal />}
                            {view === 'admin_dashboard' && currentUser && <AdminPortal onGhostLogin={handleGhostLogin} />}
                        </Suspense>
                    </div>
                </div>
            </VibeLayout>
        </SecurityLayout>
    );
};
