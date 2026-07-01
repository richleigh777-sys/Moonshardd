import React, { Suspense } from 'react';
import { TabContent, Tabs, TabList, TabTrigger } from '../ui/Tabs';
import { sfx } from '../../lib/soundService';
import { User, Sale, Note, SystemConfig, ProductConfig, SystemHealth, ToastMessage } from '../../types';
import { Loader2 } from 'lucide-react';

// Standard Imports for fast routing
import { AdminDashboard } from './AdminDashboard';
import EnrollmentFormV2 from '../forms/EnrollmentFormV2';
import { PipelineBoard } from '../pipeline/PipelineBoard';
import { RetentionView } from '../../views/RetentionView';
import { SalesLedger } from '../widgets/SalesLedger';
import { PayrollManager } from './dashboard/financials/PayrollManager';
import { OperativeRoster } from './OperativeRoster';
import { TeamLeaderboard } from '../widgets/TeamLeaderboard';
import { MessagingLayout } from '../chat/MessagingLayout';
import { CampaignManager } from './campaigns/CampaignManager';
import { ScriptManager } from '../../views/ScriptManager';
import { ProductManager } from './ProductManager';
import { AdminAnalytics } from '../widgets/AdminAnalytics';
import { PerformanceCenter } from '../widgets/PerformanceCenter';
import { SystemConfigPanel } from './SystemConfigPanel';
import { GodModePanel } from '../widgets/GodModePanel';
import { CRMAuditDashboard } from './CRMAuditDashboard';
import { UniqueSalesPool } from './UniqueSalesPool';

interface AdminTerminalManagerProps {
    isAllowed: (id: string) => boolean;
    setView: (view: string) => void;
    currentUser: User;
    sales: Sale[];
    users: User[];
    notes: Note[];
    health: SystemHealth;
    productConfig: ProductConfig;
    updateProductConfig: (config: ProductConfig) => void;
    systemConfig: SystemConfig;
    updateSystemConfig: (config: SystemConfig) => Promise<void>;
    updateUser: (id: string, data: Partial<User>) => Promise<void>;
    addUser: (data: User) => Promise<void>;
    importSales: (data: any[]) => Promise<number>;
    sendDirective: (data: { message: string, urgency: 'Routine' | 'Immediate' | 'Flash', senderName: string }) => Promise<void>;
    runDiagnostic: () => void;
    testUplink: () => Promise<boolean>;
    handleLedgerAction: (sale: Sale, action: string, payload?: any) => Promise<void>;
    handleBulkLedgerAction: (ids: string[], action: string, payload?: any) => Promise<void>;
    setToast: (toast: ToastMessage | null) => void;
    onGhostLogin: (userId: string) => void;
    showTerminals: boolean;
    setShowTerminals: (show: boolean) => void;
}

export const AdminViewManager: React.FC<AdminTerminalManagerProps> = ({
    isAllowed, setView, currentUser, sales, users, notes, health, productConfig, updateProductConfig,
    systemConfig, updateSystemConfig, updateUser, addUser, importSales, sendDirective,
    runDiagnostic, testUplink, handleLedgerAction, handleBulkLedgerAction, setToast,
    onGhostLogin, showTerminals, setShowTerminals
}) => {
    const [activeActionTab, setActiveActionTab] = React.useState('pipeline');
    const [activeMoneyTab, setActiveMoneyTab] = React.useState('payroll');
    const [activeOversightTab, setActiveOversightTab] = React.useState('overview');

    return (
        <>
            <TabContent value="action" className="w-full h-full flex flex-col flex-1 min-h-0">
                <Tabs value={activeActionTab} onValueChange={setActiveActionTab} className="w-full h-full flex flex-col min-h-0" orientation="horizontal">
                    <TabList className="mb-2 shrink-0">
                        <TabTrigger value="pipeline">Pipeline</TabTrigger>
                        <TabTrigger value="enrollment">Help a Customer</TabTrigger>
                        <TabTrigger value="retention">Save a Sale</TabTrigger>
                        <TabTrigger value="campaigns">Drip Campaigns</TabTrigger>
                        <TabTrigger value="comms">Chat</TabTrigger>
                    </TabList>
                    
                    <TabContent value="pipeline" className="w-full h-full flex flex-col flex-1 min-h-0">
                        <PipelineBoard sales={sales} />
                    </TabContent>
                    <TabContent value="enrollment" className="w-full h-full flex flex-col flex-1 min-h-0">
                        <EnrollmentFormV2 onSuccess={() => { setView('money'); setActiveMoneyTab('ledger'); }} onCancel={() => { setActiveActionTab('pipeline'); }} />
                    </TabContent>
                    <TabContent value="retention" className="w-full h-full flex flex-col flex-1 min-h-0">
                        <RetentionView sales={sales} />
                    </TabContent>
                    <TabContent value="campaigns" className="w-full h-full flex flex-col flex-1 min-h-0">
                        <CampaignManager />
                    </TabContent>
                    <TabContent value="comms" className="w-full h-full flex flex-col flex-1 min-h-0">
                        <MessagingLayout />
                    </TabContent>
                </Tabs>
            </TabContent>

            <TabContent value="money" className="w-full h-full flex flex-col flex-1 min-h-0">
                <Tabs value={activeMoneyTab} onValueChange={setActiveMoneyTab} className="w-full h-full flex flex-col min-h-0" orientation="horizontal">
                    <TabList className="mb-2 shrink-0">
                        <TabTrigger value="payroll">Team Earnings</TabTrigger>
                        <TabTrigger value="ledger">All Customers</TabTrigger>
                        <TabTrigger value="sales_pool">Sales Pool</TabTrigger>
                    </TabList>
                    
                    <TabContent value="payroll" className="w-full h-full flex flex-col flex-1 min-h-0">
                        <PayrollManager />
                    </TabContent>
                    <TabContent value="ledger" className="w-full h-full flex flex-col flex-1 min-h-0">
                        <SalesLedger 
                            sales={sales} 
                            onAction={handleLedgerAction} 
                            onBulkAction={handleBulkLedgerAction}
                            onImport={async (data) => { 
                                try { 
                                    sfx.playConfirm(); 
                                    const count = await importSales(data); 
                                    sfx.playSuccess(); 
                                    return count; 
                                } catch (e) { 
                                    setToast({ title: 'Import Error', message: 'Import Failed', type: 'error' }); 
                                    sfx.playError(); 
                                    throw e;
                                } 
                            }} 
                            allowActions={true} 
                        />
                    </TabContent>
                    <TabContent value="sales_pool" className="w-full h-full flex flex-col flex-1 min-h-0">
                        <UniqueSalesPool />
                    </TabContent>
                </Tabs>
            </TabContent>

            <TabContent value="oversight" className="w-full h-full flex flex-col flex-1 min-h-0">
                <Tabs value={activeOversightTab} onValueChange={setActiveOversightTab} className="w-full h-full flex flex-col min-h-0" orientation="horizontal">
                    <TabList className="mb-2 shrink-0">
                        <TabTrigger value="overview">Company Home</TabTrigger>
                        <TabTrigger value="audit">Security & Audit</TabTrigger>
                        <TabTrigger value="intel">Insights</TabTrigger>
                        <TabTrigger value="standings">Team Standings</TabTrigger>
                        <TabTrigger value="roster">Manage Team</TabTrigger>
                        <TabTrigger value="scripts">Dialogues</TabTrigger>
                        <TabTrigger value="catalog">Products</TabTrigger>
                        <TabTrigger value="system">Settings</TabTrigger>
                        <TabTrigger value="nexus" className="text-status-warning">Main Settings</TabTrigger>
                    </TabList>
                    
                    <TabContent value="overview" className="w-full h-full overflow-y-auto">
                        <AdminDashboard 
                            onToggleTerminals={() => setShowTerminals(!showTerminals)} 
                            areTerminalsOpen={showTerminals} 
                            onBroadcast={async (msg, urgency) => { 
                                await sendDirective({ message: msg, urgency, senderName: currentUser?.name || 'Admin' }); 
                                sfx.playSubmit(); 
                                setToast({ title: 'Broadcast', message: 'Message sent to team', type: 'success' }); 
                            }} 
                            health={health} 
                            onRunDiagnostics={runDiagnostic} 
                            onTestUplink={testUplink}
                            onGhostLogin={onGhostLogin}
                        />
                    </TabContent>
                    <TabContent value="audit" className="w-full h-full flex flex-col flex-1 min-h-0">
                        <CRMAuditDashboard users={users} sales={sales} notes={notes} />
                    </TabContent>
                    <TabContent value="intel" className="w-full h-full flex flex-col gap-4 overflow-y-auto">
                        <AdminAnalytics sales={sales} />
                        <PerformanceCenter sales={sales} currentUser={currentUser!} attendance={[]} users={users} />
                    </TabContent>
                    <TabContent value="standings" className="w-full h-full flex flex-col flex-1 min-h-0">
                        <TeamLeaderboard currentUserName={currentUser?.name || 'Admin'} currentUserRole="admin" currentUserTeam={currentUser.team || 'All'} currentUserLevel={currentUser.level} />
                    </TabContent>
                    <TabContent value="roster" className="w-full h-full flex flex-col flex-1 min-h-0">
                        <OperativeRoster users={users} sales={sales} onUpdateUser={updateUser} onAddUser={addUser} onGhostLogin={onGhostLogin}/>
                    </TabContent>
                    <TabContent value="scripts" className="w-full h-full flex flex-col flex-1 min-h-0">
                        <ScriptManager />
                    </TabContent>
                    <TabContent value="catalog" className="w-full h-full flex flex-col flex-1 min-h-0">
                        <ProductManager configForm={productConfig} setConfigForm={updateProductConfig} onSave={updateProductConfig} />
                    </TabContent>
                    <TabContent value="system" className="w-full h-full flex flex-col flex-1 min-h-0">
                        <SystemConfigPanel config={systemConfig} onUpdate={updateSystemConfig} sales={sales} notes={notes} />
                    </TabContent>
                    <TabContent value="nexus" className="w-full h-full flex flex-col flex-1 min-h-0">
                        <GodModePanel />
                    </TabContent>
                </Tabs>
            </TabContent>
        </>
    );
};

