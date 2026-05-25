import { TabContent } from '../ui/Tabs';
import { DashView } from '../../views/DashView';
import { MessagingLayout } from '../chat/MessagingLayout';
import EnrollmentForm from '../forms/EnrollmentForm';
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
import { TelephonyPanel } from '../widgets/TelephonyPanel';
import { SmartQueue } from '../widgets/SmartQueue';
import { sfx } from '../../lib/soundService';
import { User, Sale, Note, AttendanceRecord, ToastMessage } from '../../types';

// Adaptive View Components
import { AdaptiveView } from '../Dashboard/AdaptiveView';
import { SmartLeadQueue } from '../LeadQueue/SmartLeadQueue';

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
    const handleEngageLead = (lead: any) => {
        setView('enrollment');
        setToast({ title: 'Lead Engagement', message: `Initiating sequence for: ${lead.customerName || lead.customer}`, type: 'info' });
    };

    return (
        <>
            {/* New UI Implementations Map to standard or new keys */}
            <TabContent value="home" className="w-full min-h-full flex flex-col flex-1">
                <AdaptiveView />
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
                    <AdaptiveView />
                </TabContent>
            )}

            {isAllowed('comms') && (
                <TabContent value="comms" className="w-full min-h-full flex flex-col flex-1">
                    <MessagingLayout />
                </TabContent>
            )}

            {isAllowed('dialer') && (
                <TabContent value="dialer" className="w-full h-full p-4 md:p-6 overflow-hidden">
                    <div className="flex flex-col lg:flex-row gap-6 h-full w-full">
                        <div className="flex-1 min-h-0">
                            <SmartQueue sales={sales} onEngage={handleEngageLead} />
                        </div>
                        <div className="lg:w-[400px] shrink-0 min-h-0">
                            <TelephonyPanel />
                        </div>
                    </div>
                </TabContent>
            )}

            {isAllowed('enrollment') && (
                <TabContent value="enrollment" className="w-full min-h-full flex flex-col flex-1">
                    <EnrollmentForm 
                        onSuccess={() => setView(isAllowed('ledger') ? 'ledger' : 'pipeline')} 
                        onCancel={() => setView('dash')} 
                    />
                </TabContent>
            )}

            {isAllowed('pipeline') && (
                <TabContent value="pipeline" className="w-full min-h-full flex flex-col flex-1">
                    <PipelineBoard sales={mySales} />
                </TabContent>
            )}

            {isAllowed('recovery') && (
                <TabContent value="recovery" className="w-full min-h-full flex flex-col flex-1">
                    <RecoveryEngine 
                        sales={mySales} 
                        onAction={(_sale, action) => {
                            setToast({ title: 'Recovery Action', message: `Action ${action} executed`, type: 'info' });
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
                <TabContent value="ledger" className="w-full min-h-full flex flex-col flex-1">
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
                <TabContent value="analytics" className="w-full h-full flex flex-col gap-6">
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
