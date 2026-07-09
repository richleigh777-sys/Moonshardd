import React, { useMemo, useEffect, useState } from 'react';
import { TabContent, Tabs, TabList, TabTrigger } from '../ui/Tabs';
import { sfx } from '../../lib/soundService';
import { User, Sale, Note, AttendanceRecord, ToastMessage } from '../../types';
import { useCRM } from '../../hooks/useCRM';
import { realtimeClient } from '../../lib/realtimeClient';
import { 
    Home, Clock, UserPlus, LayoutDashboard, Phone, MessageSquare, 
    CircleDollarSign, Database, Trophy, LineChart 
} from 'lucide-react';

// Standard Imports (removing lazy to prevent initialization flash)
import { DashView } from '../../views/DashView';
import { MessagingLayout } from '../chat/MessagingLayout';
import EnrollmentFormV2 from '../forms/EnrollmentFormV2';
import { PipelineBoard } from '../pipeline/PipelineBoard';
import { LeadHub } from '../leads/LeadHub';
import { SalesLedger } from '../widgets/SalesLedger';
import { AgentPayouts } from '../widgets/payouts/AgentPayouts';
import { TeamLeaderboard } from '../widgets/TeamLeaderboard';
import { PerformanceCenter } from '../widgets/PerformanceCenter';
import { OperationalRhythm } from './OperationalRhythm';
import { SmartPitchWorkspace } from './SmartPitchWorkspace';
import { AgentSettingsView } from './AgentSettingsView';

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

    const [activeActionTab, setActiveActionTab] = useState('dash');
    const [activeMoneyTab, setActiveMoneyTab] = useState('payouts');

    const handleEngageLead = (lead: any) => {
        setActiveLeadPhone(lead.phone || null);
        setView('action');
        setActiveActionTab('enrollment');
        setToast({ title: 'Lead Engagement', message: `Initiating sequence for: ${lead.customerName || lead.customer || 'Unknown'}`, type: 'info' });
    };

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
    }, [setView, setToast]);

    // Live Telephony Global Hook
    useEffect(() => {
        const unsubscribe = realtimeClient.subscribe((event: any) => {
            if (event?.type === 'COLLECTION_MUTATED' && event.collectionName === 'customers') {
                const isViciPush = event.id && (String(event.id).startsWith('vici-') || (event.notification && String(event.notification.message).includes('connected')));
                if (isViciPush) {
                    sfx.playPhoneRing();
                    setToast({
                        title: "Live Call Attached",
                        message: event.notification?.message || "Customer synced from ViciDial",
                        type: "success"
                    });
                    
                    let leadPhone = '';
                    let leadName = '';
                    if (event.notification?.message) {
                        const msg = event.notification.message;
                        const phoneMatch = msg.match(/\(([0-9]+)\)/);
                        const nameMatch = msg.replace('📞 Call connected with ', '').split('(')[0].trim();
                        leadName = nameMatch || 'Live Customer';
                        leadPhone = phoneMatch ? phoneMatch[1] : 'Unknown';
                    }
                    if(!leadPhone && String(event.id).startsWith('vici-')) {
                        leadPhone = String(event.id).replace('vici-', '');
                    }
                    
                    // Auto-navigate to Enrollment and auto-populate
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('ENGAGE_LEAD', { detail: { 
                            phone: leadPhone, 
                            customerName: leadName 
                        }}));
                    }, 300);
                }
            }
        });
        return () => unsubscribe();
    }, [setToast]);


    const _recoverySales = useMemo(() => {
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
                        onCancel={() => { setSmartPitchContext(null); setView('action'); }}
                        onSuccess={() => { setSmartPitchContext(null); setView('action'); }}
                    />
                )}
            </TabContent>

            <TabContent value="action" className="w-full min-h-full flex flex-col flex-1">
                <Tabs value={activeActionTab} onValueChange={setActiveActionTab} className="w-full h-full flex flex-col min-h-0" orientation="horizontal">
                    <TabList className="mb-2 shrink-0">
                        <TabTrigger value="dash" icon={<Home size={18} />}>My Home</TabTrigger>
                        <TabTrigger value="rhythm" icon={<Clock size={18} />}>Ops Rhythm</TabTrigger>
                        <TabTrigger value="enrollment" icon={<UserPlus size={18} />}>Help Customer</TabTrigger>
                        <TabTrigger value="pipeline" icon={<LayoutDashboard size={18} />}>Pipeline</TabTrigger>
                        <TabTrigger value="callbacks" icon={<Phone size={18} />}>Callbacks</TabTrigger>
                        <TabTrigger value="comms" icon={<MessageSquare size={18} />}>Comms</TabTrigger>
                    </TabList>
                    
                    <TabContent value="dash" className="w-full h-full flex flex-col flex-1 min-h-0">
                        <DashView sales={sales} />
                    </TabContent>
                    
                    <TabContent value="rhythm" className="w-full h-full flex flex-col flex-1 min-h-0">
                        <OperationalRhythm 
                            notes={myNotes} 
                            sales={mySales}
                            currentUser={currentUser} 
                            onLoadLead={handleEngageLead} 
                        />
                    </TabContent>

                    <TabContent value="enrollment" className="w-full h-full flex flex-col flex-1 min-h-0">
                        <EnrollmentFormV2 
                            currentUser={currentUser}
                            prefillPhone={activeLeadPhone}
                            onSuccess={() => { setActiveLeadPhone(null); setActiveActionTab('pipeline'); }} 
                            onCancel={() => { setActiveLeadPhone(null); setActiveActionTab('dash'); }} 
                        />
                    </TabContent>

                    <TabContent value="pipeline" className="w-full h-full flex flex-col flex-1 min-h-0">
                        <PipelineBoard sales={mySales} onProcessSale={handleEngageLead} />
                    </TabContent>

                    <TabContent value="callbacks" className="w-full h-full flex flex-col flex-1 min-h-0">
                        <LeadHub 
                            notes={myNotes} 
                            onMarkDone={async (id) => { await deleteNote(id); sfx.playSuccess(); }}
                            onEngage={handleEngageLead}
                        />
                    </TabContent>
                    
                    <TabContent value="comms" className="w-full h-full flex flex-col flex-1 min-h-0">
                        <MessagingLayout />
                    </TabContent>
                </Tabs>
            </TabContent>

            <TabContent value="money" className="w-full h-full flex flex-col flex-1 min-h-0">
                <Tabs value={activeMoneyTab} onValueChange={setActiveMoneyTab} className="w-full h-full flex flex-col min-h-0" orientation="horizontal">
                    <TabList className="mb-2 shrink-0">
                        <TabTrigger value="payouts" icon={<CircleDollarSign size={18} />}>Earnings</TabTrigger>
                        <TabTrigger value="ledger" icon={<Database size={18} />}>Records</TabTrigger>
                        <TabTrigger value="standings" icon={<Trophy size={18} />}>Leaderboard</TabTrigger>
                        <TabTrigger value="analytics" icon={<LineChart size={18} />}>Progress Analytics</TabTrigger>
                    </TabList>
                    
                    <TabContent value="payouts" className="w-full h-full flex flex-col flex-1 min-h-0">
                        <AgentPayouts />
                    </TabContent>

                    <TabContent value="ledger" className="w-full h-full flex flex-col flex-1 min-h-0">
                        <SalesLedger sales={mySales} allowActions={false} />
                    </TabContent>

                    <TabContent value="standings" className="w-full h-full flex flex-col flex-1 min-h-0">
                        <TeamLeaderboard 
                            currentUserName={currentUser.name} 
                            currentUserRole="agent" 
                            currentUserTeam={currentUser.team}
                            currentUserLevel={currentUser.level}
                        />
                    </TabContent>
                    
                    <TabContent value="analytics" className="w-full h-full flex flex-col gap-4 overflow-y-auto">
                        <PerformanceCenter 
                            sales={mySales} 
                            currentUser={currentUser} 
                            attendance={attendance} 
                        />
                    </TabContent>
                </Tabs>
            </TabContent>

            <TabContent value="settings" className="w-full h-full flex flex-col flex-1 min-h-0">
                <AgentSettingsView />
            </TabContent>
        </>
    
    );
};
