import React, { lazy, Suspense } from 'react';
import { TabContent } from '../ui/Tabs';
import { sfx } from '../../lib/soundService';
import { User, Sale, Note, SystemConfig, ProductConfig, SystemHealth, ToastMessage } from '../../types';
import { Loader2 } from 'lucide-react';

// Lazy load all heavy terminal components to optimize bundle size and runtime performance
const AdminDashboard = lazy(() => import('./AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const EnrollmentFormV2 = lazy(() => import('../forms/EnrollmentFormV2'));
const PipelineBoard = lazy(() => import('../pipeline/PipelineBoard').then(m => ({ default: m.PipelineBoard })));
const RetentionView = lazy(() => import('../../views/RetentionView').then(m => ({ default: m.RetentionView })));
const SalesLedger = lazy(() => import('../widgets/SalesLedger').then(m => ({ default: m.SalesLedger })));
const PayrollManager = lazy(() => import('./dashboard/financials/PayrollManager').then(m => ({ default: m.PayrollManager })));
const OperativeRoster = lazy(() => import('./OperativeRoster').then(m => ({ default: m.OperativeRoster })));
const TeamLeaderboard = lazy(() => import('../widgets/TeamLeaderboard').then(m => ({ default: m.TeamLeaderboard })));
const MessagingLayout = lazy(() => import('../chat/MessagingLayout').then(m => ({ default: m.MessagingLayout })));
const ScriptManager = lazy(() => import('../../views/ScriptManager').then(m => ({ default: m.ScriptManager })));
const ProductManager = lazy(() => import('./ProductManager').then(m => ({ default: m.ProductManager })));
const AdminAnalytics = lazy(() => import('../widgets/AdminAnalytics').then(m => ({ default: m.AdminAnalytics })));
const PerformanceCenter = lazy(() => import('../widgets/PerformanceCenter').then(m => ({ default: m.PerformanceCenter })));
const SystemConfigPanel = lazy(() => import('./SystemConfigPanel').then(m => ({ default: m.SystemConfigPanel })));
const GodModePanel = lazy(() => import('../widgets/GodModePanel').then(m => ({ default: m.GodModePanel })));
const CRMAuditDashboard = lazy(() => import('./CRMAuditDashboard').then(m => ({ default: m.CRMAuditDashboard })));
const UniqueSalesPool = lazy(() => import('./UniqueSalesPool').then(m => ({ default: m.UniqueSalesPool })));

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

// Global Terminal Loader
const TerminalLoader = () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-text-muted space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
        <div className="text-sm font-mono uppercase tracking-widest animate-pulse">Initializing Terminal Module...</div>
    </div>
);

export const AdminViewManager: React.FC<AdminTerminalManagerProps> = ({
    isAllowed, setView, currentUser, sales, users, notes, health, productConfig, updateProductConfig,
    systemConfig, updateSystemConfig, updateUser, addUser, importSales, sendDirective,
    runDiagnostic, testUplink, handleLedgerAction, handleBulkLedgerAction, setToast,
    onGhostLogin, showTerminals, setShowTerminals
}) => {
    return (
        <Suspense fallback={<TerminalLoader />}>
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
            {isAllowed('campaigns') && <TabContent value="campaigns" className="w-full h-full"><CampaignManager /></TabContent>}
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
        </Suspense>
    );
};

