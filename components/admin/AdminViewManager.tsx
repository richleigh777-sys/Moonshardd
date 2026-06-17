import { TabContent } from '../ui/Tabs';
import { AdminDashboard } from './AdminDashboard';
import EnrollmentFormV2 from '../forms/EnrollmentFormV2';
import { PipelineBoard } from '../pipeline/PipelineBoard';
import { RetentionView } from '../../views/RetentionView';
import { SalesLedger } from '../widgets/SalesLedger';
import { PayrollManager } from './dashboard/financials/PayrollManager';
import { OperativeRoster } from './OperativeRoster';
import { TeamLeaderboard } from '../widgets/TeamLeaderboard';
import { MessagingLayout } from '../chat/MessagingLayout';
import { ScriptManager } from '../../views/ScriptManager';
import { ProductManager } from './ProductManager';
import { AdminAnalytics } from '../widgets/AdminAnalytics';
import { PerformanceCenter } from '../widgets/PerformanceCenter';
import { SystemConfigPanel } from './SystemConfigPanel';
import { GodModePanel } from '../widgets/GodModePanel';
import { CRMAuditDashboard } from './CRMAuditDashboard';
import { UniqueSalesPool } from './UniqueSalesPool';
import { sfx } from '../../lib/soundService';
import { User, Sale, Note, SystemConfig, ProductConfig, SystemHealth, ToastMessage } from '../../types';

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
    return (
        <>
            {isAllowed('overview') && (
                <TabContent value="overview" className="w-full h-full">
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
            )}
            {isAllowed('enrollment') && <TabContent value="enrollment" className="w-full h-full"><EnrollmentFormV2 onSuccess={() => setView('ledger')} onCancel={() => setView('overview')} /></TabContent>}
            {isAllowed('pipeline') && <TabContent value="pipeline" className="w-full h-full"><PipelineBoard sales={sales} /></TabContent>}
            {isAllowed('retention') && <TabContent value="retention" className="w-full h-full"><RetentionView sales={sales} /></TabContent>}
            {isAllowed('ledger') && (
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
            )}
            {isAllowed('sales_pool') && (
                <TabContent value="sales_pool" className="w-full h-full">
                    <UniqueSalesPool />
                </TabContent>
            )}
            {isAllowed('payroll') && <TabContent value="payroll" className="h-full"><PayrollManager /></TabContent>}
            {isAllowed('roster') && <TabContent value="roster" className="w-full h-full"><OperativeRoster users={users} sales={sales} onUpdateUser={updateUser} onAddUser={addUser} onGhostLogin={onGhostLogin}/></TabContent>}
            {isAllowed('standings') && <TabContent value="standings" className="w-full h-full"><TeamLeaderboard currentUserName={currentUser?.name || 'Admin'} currentUserRole="admin" currentUserTeam={currentUser.team || 'All'} currentUserLevel={currentUser.level} /></TabContent>}
            {isAllowed('comms') && <TabContent value="comms" className="w-full h-full"><MessagingLayout /></TabContent>}
            {isAllowed('scripts') && <TabContent value="scripts" className="w-full h-full"><ScriptManager /></TabContent>}
            {isAllowed('catalog') && <TabContent value="catalog" className="w-full h-full"><ProductManager configForm={productConfig} setConfigForm={updateProductConfig} onSave={updateProductConfig} /></TabContent>}
            {isAllowed('intel') && (
                <TabContent value="intel" className="w-full h-full flex flex-col gap-4">
                    <AdminAnalytics sales={sales} />
                    <PerformanceCenter sales={sales} currentUser={currentUser!} attendance={[]} users={users} />
                </TabContent>
            )}
            {isAllowed('audit') && <TabContent value="audit" className="w-full h-full"><CRMAuditDashboard users={users} sales={sales} notes={notes} /></TabContent>}
            {isAllowed('system') && <TabContent value="system" className="w-full h-full"><SystemConfigPanel config={systemConfig} onUpdate={updateSystemConfig} sales={sales} notes={notes} /></TabContent>}
            {isAllowed('nexus') && <TabContent value="nexus" className="w-full h-full"><GodModePanel /></TabContent>}
        </>
    );
};
