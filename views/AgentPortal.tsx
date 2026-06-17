
import React, { useState } from 'react';
import { PortalShell } from '../components/layout/PortalShell';
import { Tabs } from '../components/ui/Tabs';
import { EntryView } from './EntryView';
import { AgentSidebar } from '../components/agent/AgentSidebar';
import { AgentHeaderControls } from '../components/agent/AgentHeaderControls';
import { AgentTimeSheet } from '../components/modals/AgentTimeSheet';
import { QuickCalculator } from '../components/widgets/QuickCalculator';
import { Scratchpad } from '../components/widgets/Scratchpad';
import { useAgentPortalLogic } from '../components/agent/hooks/useAgentPortalLogic';
import { useCRM } from '../hooks/useCRM';
import { AgentViewManager } from '../components/agent/AgentViewManager';
import { ArrowUpDown } from 'lucide-react';

// NEW COMPONENTS
import { ContextualHelp } from '../components/Common/ContextualHelp';
import { SupportTicker } from '../components/agent/SupportTicker';

export const AgentPortal: React.FC = () => {
    const {
        currentUser, sales, deleteNote, attendance, notifications, clearNotification,
        view, setView, isFocusMode, setIsFocusMode, showCalculator, setShowCalculator,
        showScratchpad, setShowScratchpad, showTimeSheet, setShowTimeSheet,
        showDialer, setShowDialer,
        isAllowed, mySales, myNotes, setToast
    } = useAgentPortalLogic();

    const { dialerLists, customers } = useCRM();

    const isEnrollment = view === 'enrollment';

    React.useEffect(() => {
        const handleNavigate = (e: CustomEvent) => {
            const target = e.detail;
            if (isAllowed(target)) {
                setView(target);
            }
        };

        const handleOpenScratchpad = () => setShowScratchpad(true);

        window.addEventListener('NAVIGATE', handleNavigate as EventListener);
        window.addEventListener('OPEN_SCRATCHPAD', handleOpenScratchpad);

        return () => {
            window.removeEventListener('NAVIGATE', handleNavigate as EventListener);
            window.removeEventListener('OPEN_SCRATCHPAD', handleOpenScratchpad);
        };
    }, [setView, setShowScratchpad, isAllowed]);

    if (!currentUser) return null;

    if (isFocusMode) {
        return <EntryView onBack={() => setIsFocusMode(false)} />;
    }

    return (
        <Tabs value={view} onValueChange={setView} orientation="vertical" className="h-full w-full !flex-col block">
            <div className="flex flex-col w-full h-full">
                <SupportTicker />
                <PortalShell 
                    user={currentUser} 
                    title="Your Workspace" 
                    sidebarContent={<AgentSidebar isAllowed={isAllowed} />}
                    headerContent={
                        <AgentHeaderControls 
                            onFocusMode={() => setIsFocusMode(true)}
                            onToggleCalculator={() => setShowCalculator(!showCalculator)}
                            isCalculatorOpen={showCalculator}
                            onToggleScratchpad={() => setShowScratchpad(!showScratchpad)}
                            isScratchpadOpen={showScratchpad}
                            onOpenTimeSheet={() => setShowTimeSheet(true)}
                        />
                    }
                    notifications={notifications}
                    clearNotification={clearNotification}
                >
                    <div className={`w-full h-full flex-1 relative flex flex-col min-h-0 overflow-y-auto custom-scrollbar`}>
                        <ContextualHelp />
                        
                        {showCalculator && (
                            <div className="fixed top-24 right-6 z-[100] animate-in slide-in-from-top-4">
                                <QuickCalculator onClose={() => setShowCalculator(false)} />
                            </div>
                        )}

                        <Scratchpad isOpen={showScratchpad} onClose={() => setShowScratchpad(false)} />
                        
                        <AgentTimeSheet 
                            isOpen={showTimeSheet} 
                            onClose={() => setShowTimeSheet(false)}
                            currentUser={currentUser}
                            attendance={attendance}
                            sales={sales}
                        />

                        <div className="w-full h-full flex flex-col flex-1 relative min-h-0">
                            <AgentViewManager 
                                isAllowed={isAllowed}
                                mySales={mySales}
                                myNotes={myNotes}
                                sales={sales}
                                attendance={attendance}
                                currentUser={currentUser}
                                deleteNote={deleteNote}
                                setToast={setToast}
                                setView={setView}
                            />
                        </div>
                    </div>
                </PortalShell>
            </div>
        </Tabs>
    );
};

