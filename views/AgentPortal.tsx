
import React from 'react';
import { PortalShell } from '../components/layout/PortalShell';
import { Tabs } from '../components/ui/Tabs';
import { EntryView } from './EntryView';
import { AgentSidebar } from '../components/agent/AgentSidebar';
import { AgentHeaderControls } from '../components/agent/AgentHeaderControls';
import { AgentTimeSheet } from '../components/modals/AgentTimeSheet';
import { QuickCalculator } from '../components/widgets/QuickCalculator';
import { Scratchpad } from '../components/widgets/Scratchpad';
import { useAgentPortalLogic } from '../components/agent/hooks/useAgentPortalLogic';
import { AgentViewManager } from '../components/agent/AgentViewManager';

export const AgentPortal: React.FC = () => {
    const {
        currentUser, sales, deleteNote, attendance, notifications, clearNotification,
        view, setView, isFocusMode, setIsFocusMode, showCalculator, setShowCalculator,
        showScratchpad, setShowScratchpad, showTimeSheet, setShowTimeSheet,
        isAllowed, mySales, myNotes, setToast
    } = useAgentPortalLogic();

    const handleNextCall = () => {
        const sorted = [...myNotes].sort((a, b) => (a.reminderAt || Infinity) - (b.reminderAt || Infinity));
        const urgent = sorted[0];
        if (urgent) {
            setView('enrollment');
            // We could trigger a navigation with state, but for now we'll just set the view
            // and maybe Dispatch an event that EnrollmentForm picks up.
            window.dispatchEvent(new CustomEvent('LOAD_LEAD', { detail: urgent }));
            setToast({ title: 'Navigation Auto-Pilot', message: `Vectoring to next priority: ${urgent.customerName}`, type: 'info' });
        }
    };

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
        <Tabs value={view} onValueChange={setView} orientation="vertical" className="h-full">
            
            <PortalShell 
                user={currentUser} 
                title="Agent Terminal" 
                sidebarContent={<AgentSidebar isAllowed={isAllowed} />}
                headerContent={
                    <AgentHeaderControls 
                        onFocusMode={() => setIsFocusMode(true)}
                        onToggleCalculator={() => setShowCalculator(!showCalculator)}
                        isCalculatorOpen={showCalculator}
                        onToggleScratchpad={() => setShowScratchpad(!showScratchpad)}
                        isScratchpadOpen={showScratchpad}
                        onOpenTimeSheet={() => setShowTimeSheet(true)}
                        onNextCall={handleNextCall}
                        hasPendingCallbacks={myNotes.length > 0}
                    />
                }
                notifications={notifications}
                clearNotification={clearNotification}
            >
                <div className="w-full h-full relative">
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
            </PortalShell>
        </Tabs>
    );
};

