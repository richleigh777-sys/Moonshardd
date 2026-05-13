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
import { sfx } from '../../lib/soundService';
import { User, Sale, Note, AttendanceRecord, ToastMessage } from '../../types';

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
            {isAllowed('rhythm') && (
                <TabContent value="rhythm" className="w-full h-full">
                    <OperationalRhythm 
                        notes={myNotes} 
                        currentUser={currentUser} 
                        onLoadLead={handleEngageLead} 
                    />
                </TabContent>
            )}
            
            {isAllowed('dash') && (
                <TabContent value="dash" className="w-full h-full">
                    <DashView sales={sales} onEngage={handleEngageLead} />
                </TabContent>
            )}

            {isAllowed('comms') && (
                <TabContent value="comms" className="w-full h-full">
                    <MessagingLayout />
                </TabContent>
            )}

            {isAllowed('enrollment') && (
                <TabContent value="enrollment" className="w-full h-full">
                    <EnrollmentFormV2 
                        onSuccess={() => setView('dash')} 
                        onCancel={() => setView('dash')} 
                    />
                </TabContent>
            )}

            {isAllowed('pipeline') && (
                <TabContent value="pipeline" className="w-full h-full">
                    <PipelineBoard sales={mySales} />
                </TabContent>
            )}

            {isAllowed('recovery') && (
                <TabContent value="recovery" className="w-full h-full">
                    <RecoveryEngine 
                        sales={mySales} 
                        onAction={(_sale, action) => {
                            setToast({ title: 'Recovery Action', message: `Action ${action} executed`, type: 'info' });
                        }} 
                    />
                </TabContent>
            )}

            {isAllowed('callbacks') && (
                <TabContent value="callbacks" className="w-full h-full">
                    <LeadHub 
                        notes={myNotes} 
                        onMarkDone={async (id) => { await deleteNote(id); sfx.playSuccess(); }}
                        onEngage={handleEngageLead}
                    />
                </TabContent>
            )}

            {isAllowed('contacts') && (
                <TabContent value="contacts" className="w-full h-full">
                    <ContactManager />
                </TabContent>
            )}

            {isAllowed('ledger') && (
                <TabContent value="ledger" className="w-full h-full">
                    <SalesLedger sales={mySales} allowActions={false} />
                </TabContent>
            )}

            {isAllowed('payouts') && (
                <TabContent value="payouts" className="w-full h-full">
                    <AgentPayouts />
                </TabContent>
            )}

            {isAllowed('standings') && (
                <TabContent value="standings" className="w-full h-full">
                    <TeamLeaderboard 
                        currentUserName={currentUser.name} 
                        currentUserRole="agent" 
                        currentUserTeam={currentUser.team}
                    />
                </TabContent>
            )}

            {isAllowed('scripts') && (
                <TabContent value="scripts" className="w-full h-full">
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
