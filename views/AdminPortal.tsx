
import * as React from 'react';
import { Calculator, PenTool } from 'lucide-react';
import { PortalShell } from '../components/layout/PortalShell';
import { Tabs } from '../components/ui/Tabs';
import { Scratchpad } from '../components/widgets/Scratchpad';
import { QuickCalculator } from '../components/widgets/QuickCalculator';
import { AdminSidebarContent } from '../components/admin/AdminSidebarContent';
import { AdminViewManager } from '../components/admin/AdminViewManager';
import { useAdminPortalLogic } from '../components/admin/hooks/useAdminPortalLogic';
import { ConflictDialog } from '../components/ui/ConflictDialog';
import { OmniSearch } from '../components/admin/OmniSearch';

interface AdminPortalProps {
    onGhostLogin: (userId: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onGhostLogin }) => {
    const {
        currentUser, view, setView, showControls, setShowControls, showCalculator, setShowCalculator,
        showScratchpad, setShowScratchpad, isAllowed,
        sales, users, notes, health, notifications, clearNotification, productConfig, updateProductConfig,
        systemConfig, updateSystemConfig, updateUser, addUser, importSales, sendDirective,
        runDiagnostic, testUplink, handleLedgerAction, handleBulkLedgerAction, setToast,
        conflict, setConflict
    } = useAdminPortalLogic();

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

    return (
        <Tabs value={view} onValueChange={setView} orientation="vertical" className="h-full">
            {conflict && (
                <ConflictDialog 
                    isOpen={conflict.isOpen}
                    onClose={() => setConflict(null)}
                    onOverwrite={conflict.onOverwrite}
                    onReload={conflict.onReload}
                    itemName={conflict.itemName}
                    conflicts={conflict.conflicts}
                />
            )}
            <PortalShell 
                user={currentUser} 
                title="Admin Portal" 
                sidebarContent={<AdminSidebarContent isAllowed={isAllowed} />} 
                headerContent={
                    <div className="flex items-center gap-2">
                        <OmniSearch />
                        <button 
                            onClick={() => setShowCalculator(!showCalculator)} 
                            className={`p-2 rounded-xl transition-all ${showCalculator ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20' : 'text-text-secondary hover:bg-surface-highlight'}`} 
                            title="Calculator"
                        >
                            <Calculator size={18} />
                        </button>
                        <button 
                            onClick={() => setShowScratchpad(!showScratchpad)} 
                            className={`p-2 rounded-xl transition-all ${showScratchpad ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20' : 'text-text-secondary hover:bg-surface-highlight'}`} 
                            title="Quick Notes"
                        >
                            <PenTool size={18} />
                        </button>
                    </div>
                } 
                notifications={notifications} 
                clearNotification={clearNotification}
            >
                <div className="w-full h-full flex flex-col flex-1 relative min-h-0">
                    {showCalculator && (
                        <div className="fixed top-24 right-6 z-[100]">
                            <QuickCalculator onClose={() => setShowCalculator(false)} />
                        </div>
                    )}
                    <Scratchpad isOpen={showScratchpad} onClose={() => setShowScratchpad(false)} />
                    
                    <AdminViewManager 
                        isAllowed={isAllowed}
                        setView={setView}
                        currentUser={currentUser}
                        sales={sales}
                        users={users}
                        notes={notes}
                        health={health}
                        productConfig={productConfig}
                        updateProductConfig={updateProductConfig}
                        systemConfig={systemConfig}
                        updateSystemConfig={updateSystemConfig}
                        updateUser={updateUser}
                        addUser={addUser}
                        importSales={importSales}
                        sendDirective={sendDirective}
                        runDiagnostic={runDiagnostic}
                        testUplink={testUplink}
                        handleLedgerAction={handleLedgerAction}
                        handleBulkLedgerAction={handleBulkLedgerAction}
                        setToast={setToast}
                        onGhostLogin={onGhostLogin}
                        showControls={showControls}
                        setShowControls={setShowControls}
                    />
                </div>
            </PortalShell>
        </Tabs>
    );
};

