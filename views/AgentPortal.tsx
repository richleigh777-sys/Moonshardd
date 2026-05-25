
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

// NEW COMPONENTS
import { ContextualHelp } from '../components/Common/ContextualHelp';
import { BottomNav } from '../components/Layout/BottomNav';

export const AgentPortal: React.FC = () => {
    const {
        currentUser, sales, deleteNote, attendance, notifications, clearNotification,
        view, setView, isFocusMode, setIsFocusMode, showCalculator, setShowCalculator,
        showScratchpad, setShowScratchpad, showTimeSheet, setShowTimeSheet,
        isAllowed, mySales, myNotes, setToast
    } = useAgentPortalLogic();

    const { dialerLists, customers } = useCRM();

    const handleNextCall = () => {
        // 1. Strict Priority: Urgent Callbacks & Protocols
        const sorted = [...myNotes]
            .filter(n => n.type === 'callback' || n.type === 'protocol')
            .sort((a, b) => (a.reminderAt || Infinity) - (b.reminderAt || Infinity));
        const urgent = sorted[0];
        
        if (urgent && urgent.reminderAt && urgent.reminderAt < Date.now() + 3600000) {
            setView('enrollment');
            window.dispatchEvent(new CustomEvent('LOAD_LEAD', { detail: urgent }));
            setToast({ title: 'Navigation Auto-Pilot', message: `Priority Override: Vectoring to ${urgent.customerName}`, type: 'warning' });
            return;
        }

        // 2. Intelligence Engine: Lead Routing from Dialer Lists
        if (dialerLists && dialerLists.length > 0) {
            const activeList = dialerLists.sort((a, b) => b.uploadedAt - a.uploadedAt).find(l => l.status === 'Active' && l.dataUrl);
            if (activeList && activeList.dataUrl) {
                try {
                    const csvText = decodeURIComponent(escape(atob(activeList.dataUrl)));
                    const lines = csvText.split('\n').filter(r => r.trim().length > 0);
                    if (lines.length > 1) {
                        const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim());
                        
                        // Simulate Queue pointer: Pick a random lead from lower half to avoid collision (in lieu of backend locking)
                        const rawRowIndex = Math.floor(Math.random() * (lines.length - 1)) + 1;
                        const leadRow = lines[rawRowIndex].split(',').map(h => h.replace(/^["']|["']$/g, '').trim());

                        // We map the active fields based on the system mapper
                        const mapping = activeList.mapping || {};
                        const leadRowMapped: any = {};
                        
                        Object.entries(mapping).forEach(([key, colName]) => {
                            const idx = headers.indexOf(colName as string);
                            if (idx >= 0) {
                                leadRowMapped[key] = leadRow[idx];
                            }
                        });

                        // Fallback heurustics if mapping is missing
                        const phone = leadRowMapped.phone || leadRow[headers.findIndex(h => h.toLowerCase().includes('phone') || h.toLowerCase().includes('number'))] || '';
                        const fName = leadRowMapped.firstName || leadRow[headers.findIndex(h => h.toLowerCase().includes('first') || h.toLowerCase() === 'name')] || 'Undisclosed';
                        const lName = leadRowMapped.lastName || leadRow[headers.findIndex(h => h.toLowerCase().includes('last'))] || 'Lead';
                        const customerName = leadRowMapped.customer || `${fName} ${lName}`.trim();
                        
                        // Construct the full address
                        let finalAddress = leadRowMapped.address || '';
                        if (leadRowMapped.city || leadRowMapped.state || leadRowMapped.zip) {
                             if (!finalAddress.includes(leadRowMapped.city || '')) {
                                 finalAddress = `${finalAddress}, ${leadRowMapped.city || ''}, ${leadRowMapped.state || ''} ${leadRowMapped.zip || ''}`.replace(/,\s*,/g, ',').replace(/^, /, '').trim();
                             }
                        }

                        if (leadRow.length > 0) {
                            setView('enrollment');
                            window.dispatchEvent(new CustomEvent('LOAD_LEAD', { detail: {
                                customerName: customerName,
                                phone: phone,
                                email: leadRowMapped.email || '',
                                shippingAddress: finalAddress,
                                ...leadRowMapped
                            }}));
                            setToast({ title: 'Dialer Queue Routed', message: `New prospect loaded from ${activeList.name}`, type: 'success' });
                            return;
                        }
                    }
                } catch (e) {
                    console.error("Queue parsing failure", e);
                }
            }
        }

        // 3. Fallback: Orphaned CRM Leads (Prospects with no sales)
        const orphans = customers?.filter(c => !c.salesHistory || c.salesHistory.length === 0);
        if (orphans && orphans.length > 0) {
            const rando = orphans[Math.floor(Math.random() * orphans.length)];
            setView('enrollment');
            window.dispatchEvent(new CustomEvent('LOAD_LEAD', { detail: { 
                id: rando.id,
                customerName: rando.fullName, 
                phone: rando.phone, 
                email: rando.email,
                shippingAddress: rando.address || '',
                dob: rando.dob,
                medicalConditions: rando.tags 
            } }));
            setToast({ title: 'Cold Queue Activated', message: `Sourced orphaned lead: ${rando.fullName}`, type: 'info' });
            return;
        }

        setToast({ title: 'Queue Exhausted', message: 'No more leads available in active lists or orphaned queue.', type: 'error' });
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
                <div className="w-full min-h-full flex-1 relative flex flex-col pb-16 md:pb-0">
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

                    <BottomNav />
                </div>
            </PortalShell>
        </Tabs>
    );
};

