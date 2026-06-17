import React, { useMemo, useEffect, useState } from 'react';
import { TabContent } from '../ui/Tabs';
import { DashView } from '../../views/DashView';
import { MessagingLayout } from '../chat/MessagingLayout';
import EnrollmentFormV2 from '../forms/EnrollmentFormV2';
import { PipelineBoard } from '../pipeline/PipelineBoard';
import { RecoveryEngine } from '../widgets/RecoveryEngine';
import { LeadHub } from '../leads/LeadHub';
import { ContactManager } from '../widgets/ContactManager';
import { SalesLedger } from '../widgets/SalesLedger';
import { AgentPayouts } from '../widgets/payouts/AgentPayouts';
import { TeamLeaderboard } from '../widgets/TeamLeaderboard';
import { AgentScriptHub } from '../widgets/AgentScriptHub';
import { PerformanceCenter } from '../widgets/PerformanceCenter';
import { OperationalRhythm } from './OperationalRhythm';
import { SmartQueue } from '../widgets/SmartQueue';
import { sfx } from '../../lib/soundService';
import { User, Sale, Note, AttendanceRecord, ToastMessage } from '../../types';
import { useCRM } from '../../hooks/useCRM';

// Adaptive View Components
import { AdaptiveView } from '../Dashboard/AdaptiveView';
import { SmartLeadQueue } from '../LeadQueue/SmartLeadQueue';
import { SmartPitchWorkspace } from './SmartPitchWorkspace';

interface AgentTerminalManagerProps {
    isAllowed: (id: string) => boolean;
    mySales: Sale[];
    myNotes: Note[];
    sales: Sale[];
    attendance: AttendanceRecord[];
    currentUser: User;
    deleteNote: (id: string) => Promise<void>;
    setToast: (toast: ToastMessage | null) => void;
    setView: (view: string) => void;
}

export const AgentViewManager: React.FC<AgentTerminalManagerProps> = ({
    isAllowed, mySales, myNotes, sales, attendance, currentUser, deleteNote, setToast, setView
}) => {
    const { updateSaleStatus } = useCRM();
    const [activeLeadPhone, setActiveLeadPhone] = useState<string | null>(null);
    const [smartPitchContext, setSmartPitchContext] = useState<any>(null);

    useEffect(() => {
        const handleSmartPitch = (e: Event) => {
            const customEvent = e as CustomEvent;
            setSmartPitchContext(customEvent.detail);
            setView('smart_pitch');
        };
        const handleEngageLeadEvent = (e: Event) => {
            const customEvent = e as CustomEvent;
            handleEngageLead(customEvent.detail);
        };
        
        window.addEventListener('SMART_PITCH', handleSmartPitch);
        window.addEventListener('ENGAGE_LEAD', handleEngageLeadEvent);
        return () => {
            window.removeEventListener('SMART_PITCH', handleSmartPitch);
            window.removeEventListener('ENGAGE_LEAD', handleEngageLeadEvent);
        };
    }, [setView]);

    const handleEngageLead = (lead: any) => {
        setActiveLeadPhone(lead.phone || null);
        setView('enrollment');
        setToast({ title: 'Lead Engagement', message: `Initiating sequence for: ${lead.customerName || lead.customer || 'Unknown'}`, type: 'info' });
    };

    const recoverySales = useMemo(() => {
        const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
        return sales.filter(s => {
            if (s.status !== 'Declined' && s.status !== 'Rescue In Progress') return false;
            
            const ageMs = Date.now() - (s.declineTimestamp || s.timestamp);
            if (ageMs > TWO_DAYS_MS) {
                return true; // Open to everyone after 2 days
            } else {
                return s.agentId === currentUser.id; // Only original agent before 2 days
            }
        });
    }, [sales, currentUser.id]);

    return (
        <>
            <TabContent value="smart_pitch" className="w-full min-h-full flex flex-col flex-1 p-0 overflow-hidden">
                {smartPitchContext && (
                    <SmartPitchWorkspace 
                        context={smartPitchContext} 
                        currentUser={currentUser}
                        onCancel={() => { setSmartPitchContext(null); setView('dash'); }}
                        onSuccess={() => { setSmartPitchContext(null); setView(isAllowed('ledger') ? 'ledger' : 'pipeline'); }}
                    />
                )}
            </TabContent>

            {/* New UI Implementations Map to standard or new keys */}
            <TabContent value="home" className="w-full min-h-full flex flex-col flex-1">
                <DashView sales={sales} />
            </TabContent>
            <TabContent value="leads" className="w-full min-h-full flex flex-col flex-1">
                <SmartLeadQueue />
            </TabContent>
            <TabContent value="chat" className="w-full min-h-full flex flex-col flex-1">
                <MessagingLayout />
            </TabContent>
            <TabContent value="me" className="w-full min-h-full flex flex-col flex-1 overflow-auto p-4">
                <PerformanceCenter sales={mySales} currentUser={currentUser} attendance={attendance} />
            </TabContent>

            {isAllowed('rhythm') && (
                <TabContent value="rhythm" className="w-full min-h-full flex flex-col flex-1">
                    <OperationalRhythm 
                        notes={myNotes} 
                        sales={mySales}
                        currentUser={currentUser} 
                        onLoadLead={handleEngageLead} 
                    />
                </TabContent>
            )}
            
            {isAllowed('dash') && (
                <TabContent value="dash" className="w-full min-h-full flex flex-col flex-1">
                    <DashView sales={sales} />
                </TabContent>
            )}

            {isAllowed('comms') && (
                <TabContent value="comms" className="w-full min-h-full flex flex-col flex-1">
                    <MessagingLayout />
                </TabContent>
            )}


            {isAllowed('enrollment') && (
                <TabContent value="enrollment" className="w-full min-h-full flex flex-col flex-1">
                    <EnrollmentFormV2 
                        currentUser={currentUser}
                        prefillPhone={activeLeadPhone}
                        onSuccess={() => { setActiveLeadPhone(null); setView(isAllowed('ledger') ? 'ledger' : 'pipeline'); }} 
                        onCancel={() => { setActiveLeadPhone(null); setView('dash'); }} 
                    />
                </TabContent>
            )}

            {isAllowed('pipeline') && (
                <TabContent value="pipeline" className="w-full min-h-full flex flex-col flex-1">
                    <PipelineBoard sales={mySales} onProcessSale={handleEngageLead} />
                </TabContent>
            )}

            {isAllowed('recovery') && (
                <TabContent value="recovery" className="w-full min-h-full flex flex-col flex-1">
                    <RecoveryEngine 
                        sales={recoverySales} 
                        onAction={async (sale, action) => {
                            if (action === 'resurrect') {
                                await updateSaleStatus(sale.id, 'Pending', { pipelineStatus: 'Rebuttal', systemNotes: (sale.systemNotes || '') + '\n[System]: Recovered from RecoveryEngine. Added to Callback rhythm.' });
                                setToast({ title: 'Recovery Action', message: `Sale moved to Pending pipeline`, type: 'success' });
                            } else if (action === 'delete') {
                                await updateSaleStatus(sale.id, 'Cancelled', { systemNotes: (sale.systemNotes || '') + '\n[System]: Archived from RecoveryEngine.' });
                                setToast({ title: 'Recovery Action', message: `Sale archived`, type: 'info' });
                            }
                        }} 
                    />
                </TabContent>
            )}

            {isAllowed('callbacks') && (
                <TabContent value="callbacks" className="w-full min-h-full flex flex-col flex-1">
                    <LeadHub 
                        notes={myNotes} 
                        onMarkDone={async (id) => { await deleteNote(id); sfx.playSuccess(); }}
                        onEngage={handleEngageLead}
                    />
                </TabContent>
            )}

            {isAllowed('contacts') && (
                <TabContent value="contacts" className="w-full min-h-full flex flex-col flex-1">
                    <ContactManager />
                </TabContent>
            )}

            {isAllowed('ledger') && (
                <TabContent value="ledger" className="w-full h-full flex flex-col flex-1 min-h-0">
                    <SalesLedger sales={mySales} allowActions={false} />
                </TabContent>
            )}

            {isAllowed('payouts') && (
                <TabContent value="payouts" className="w-full min-h-full flex flex-col flex-1">
                    <AgentPayouts />
                </TabContent>
            )}

            {isAllowed('standings') && (
                <TabContent value="standings" className="w-full min-h-full flex flex-col flex-1">
                    <TeamLeaderboard 
                        currentUserName={currentUser.name} 
                        currentUserRole="agent" 
                        currentUserTeam={currentUser.team}
                        currentUserLevel={currentUser.level}
                    />
                </TabContent>
            )}

            {isAllowed('scripts') && (
                <TabContent value="scripts" className="w-full min-h-full flex flex-col flex-1">
                    <AgentScriptHub />
                </TabContent>
            )}

            {isAllowed('analytics') && (
                <TabContent value="analytics" className="w-full h-full flex flex-col gap-4">
                    <PerformanceCenter 
                        sales={mySales} 
                        currentUser={currentUser} 
                        attendance={attendance} 
                    />
                </TabContent>
            )}
        </>
    );
};
