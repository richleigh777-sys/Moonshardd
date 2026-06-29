
import React, { useLayoutEffect } from 'react';
import { Search, Filter, RefreshCw, LayoutList, AlignJustify, Upload, FileSpreadsheet, Database, Settings2, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Base';
import { Sale } from '../../types';
import { exportToCSV } from '../../views/utils/crmLogic';
import { LedgerTable } from './sales-ledger/LedgerTable';
import { FilterPanel } from './sales-ledger/FilterPanel';
import { CommandBar } from './sales-ledger/CommandBar';
import { SummaryFooter } from './sales-ledger/SummaryFooter';
import { ColumnConfigModal } from './sales-ledger/ColumnConfigModal';
import { ImportWizard } from './sales-ledger/ImportWizard';
import { CustomerProfileModal } from '../modals/CustomerProfileModal';
import { useSalesLedgerUI } from './sales-ledger/useSalesLedgerUI';
import { useSystem } from '../../hooks/useSystem';
import { useAuth } from '../../hooks/useAuth';
import { sfx } from '../../lib/soundService';
import { AudioPlayerModal } from '../modals/AudioPlayerModal';

interface SalesLedgerProps {
  sales: Sale[];
  onAction?: (sale: Sale, action: string, payload?: any) => void;
  onBulkAction?: (ids: string[], action: string, payload?: any) => void;
  onImport?: (data: any) => Promise<number>;
  allowActions?: boolean; 
}

export const SalesLedger: React.FC<SalesLedgerProps> = ({ sales = [], onAction, onBulkAction, onImport, allowActions = false }) => {
    const { setToast } = useSystem();
    const { currentUser } = useAuth();
    const isSuperAdmin = currentUser?.level === 10;
    const [selectedRecordingUrl, setSelectedRecordingUrl] = React.useState<{src: string, saleName: string} | null>(null);
    const [protectedModeExpiration, setProtectedModeExpiration] = React.useState<number>(0);
    const [pendingAction, setPendingAction] = React.useState<{sale: Sale, action: string, payload?: any} | null>(null);
    const {
        showAdvancedFilters, setShowAdvancedFilters, showColumnConfig, setShowConfig,
        density, setDensity, isRefreshing, selectedIds, setSelectedIds, isBulkEdit, setIsBulkEdit, 
        isSaving, activePreset, setActivePreset, processedSales, summary, searchTerm, setSearchTerm, filters, setFilters,
        sortConfig, handleSort, uniqueAgents, uniqueProducts, resetFilters,
        columnPreferences, setColumnPreferences, fileInputRef, importConfig, setImportConfig,
        columnMapping, setColumnMapping, isImporting, handleFileTrigger, handleFileChange,
        autoMapColumns, executeImport, paginatedSales, totalPages, currentPage, setCurrentPage,
        handlePageChange, handleRefresh, handleBulkCommand, handleSaveBulk
    } = useSalesLedgerUI(sales, onImport, onBulkAction);

    // const { systemConfig } = useCRM();

    const [selectedProfilePhone, setSelectedProfilePhone] = React.useState<string | null>(null);

    useLayoutEffect(() => {
        const handleKeyDown = async (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedIds.size > 0 && !isBulkEdit) {
                // Determine if we're focused inside an input or text area
                if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
                    return;
                }
                
                e.preventDefault();
                const selectedSales = processedSales.filter(s => selectedIds.has(s.id));
                const { generateSheetTsv } = await import('./sales-ledger/sheetExport');
                const tsv = generateSheetTsv(selectedSales, currentUser?.level || 0);
                
                try {
                    await navigator.clipboard.writeText(tsv);
                    setToast({ title: 'Spreadsheet Integration', message: `${selectedSales.length} rows copied in strict external spreadsheet format!`, type: "success" });
                    sfx.playConfirm();
                } catch (err) {
                    console.error("Copy failed", err);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIds, processedSales, columnPreferences, isBulkEdit]);

    const handleSafeAction = (sale: Sale, action: string, payload?: any) => {
        if (!isSuperAdmin && action !== 'qa' && action !== 'listen_recording' && action !== 'view_profile') {
            setToast({ title: 'Access Denied', message: 'Clearance level insufficient for ledger mutation.', type: 'error' });
            sfx.playError();
            return;
        }

        if (action === 'update' || action === 'edit_field' || action === 'approve' || action === 'decline' || action === 'delete' || action === 'assign') {
            if (Date.now() > protectedModeExpiration) {
                setPendingAction({ sale, action, payload });
                sfx.playError();
                return;
            }
        }

        if (action === 'view_profile') {
            setSelectedProfilePhone(typeof payload === 'string' ? payload : sale.phone);
            return;
        }
        if (action === 'listen_recording') {
            // Check if mock recording exists, otherwise use a placeholder beep or music
            const url = sale.recording || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
            setSelectedRecordingUrl({ src: url, saleName: sale.customer || 'Unknown' });
            return;
        }
        if (action === 'upload_recording') {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'audio/*';
            fileInput.onchange = (e: any) => {
                const file = e.target.files?.[0];
                if (file) {
                    setToast({ title: 'Recording Initialized', message: `Uploading ${file.name}...`, type: 'info' });
                    // Mock upload delay
                    setTimeout(() => {
                        const url = URL.createObjectURL(file);
                        if (Date.now() > protectedModeExpiration) {
                            setPendingAction({ sale, action: 'edit_field', payload: { field: 'recording', value: url } });
                            sfx.playError();
                            return;
                        }
                        if (onAction) {
                            onAction(sale, 'edit_field', { field: 'recording', value: url });
                        }
                        setToast({ title: 'Recording Secured', message: 'Audio attached to ledger.', type: 'success' });
                        sfx.playConfirm();
                    }, 1000);
                }
            };
            fileInput.click();
            return;
        }
        if (onAction) {
            onAction(sale, action, payload);
        }
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 relative bg-surface-main">
            {pendingAction && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-surface-alt/80 backdrop-blur-sm">
                    <div className="bg-surface-main border border-status-warning p-4 rounded-xl shadow-2xl max-w-sm w-full text-center">
                        <ShieldAlert size={48} className="text-status-warning mx-auto mb-4" />
                        <h3 className="text-lg font-bold mb-2 text-text-primary">Protected Data Mode</h3>
                        <p className="text-sm text-text-muted mb-6">
                            This ledger is in Protected Data Mode to prevent accidental changes. Allow edits for the next 5 minutes?
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button variant="secondary" onClick={() => setPendingAction(null)}>Cancel</Button>
                            <Button variant="primary" className="bg-status-warning hover:bg-status-warning/80 text-surface-alt border-none" onClick={() => {
                                setProtectedModeExpiration(Date.now() + 5 * 60 * 1000);
                                if (onAction) onAction(pendingAction.sale, pendingAction.action, pendingAction.payload);
                                setPendingAction(null);
                                sfx.playConfirm();
                            }}>Allow Edit</Button>
                        </div>
                    </div>
                </div>
            )}
            <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} ref={fileInputRef} type="file" className="hidden" accept=".csv" onChange={handleFileChange} />

            {showAdvancedFilters && (
                <FilterPanel 
                    filters={filters} 
                    setFilters={(f) => { setFilters(f); setCurrentPage(1); }}
                    agents={uniqueAgents} 
                    products={uniqueProducts} 
                    onReset={resetFilters}
                    activePreset={activePreset}
                    setActivePreset={setActivePreset}
                />
            )}

            <div className={`flex-1 min-h-0 ${activePreset ? 'border-4 border-slate-700/80 rounded-xl' : 'bg-surface-main '} overflow-hidden flex flex-col relative transition-all duration-300`}>
                
                {/* Active View Banner (Google Sheets style) */}
                {activePreset && (
                    <div className="bg-slate-800 text-white px-4 py-1.5 flex justify-between items-center text-xs font-bold border-b border-slate-900 shadow-md z-10 shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse"></span>
                            Active View: <span>{activePreset}</span>
                        </div>
                        <button onClick={() => { resetFilters(); setActivePreset(null); }} className="text-white hover:text-red-400 transition-colors bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded">
                            Clear View
                        </button>
                    </div>
                )}

                {/* Compact Toolbar Replacing Legend */}
                <div className="bg-surface-alt/40 border-b border-border-subtle p-2 px-4 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 select-none">
                    
                    <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <div className="relative group w-[240px] sm:w-[280px]">
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-accent-primary" />
                            <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                value={searchTerm} 
                                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                                placeholder="Search Data Stream..." 
                                className="w-full bg-surface-main/50 border border-border-subtle rounded-md py-1 pl-8 pr-3 text-[11px] font-bold outline-none focus:border-accent-primary focus:bg-surface-main transition-all shadow-inner placeholder:text-text-muted/50"
                            />
                        </div>
                        <Button variant="secondary" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className={`h-7 w-7 p-0 flex items-center justify-center border-border-subtle transition-all rounded-md ${showAdvancedFilters ? 'bg-accent-primary text-white border-accent-primary shadow-sm' : 'bg-surface-main/50 text-text-muted hover:text-text-primary hover:bg-surface-main'}`}>
                            <Filter size={14}/>
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                        <div className="w-px h-4 bg-border-subtle mx-0.5"></div>

                        {!!onImport && (
                            <Button variant="secondary" onClick={handleFileTrigger} className="h-7 px-2.5 text-[10px] font-[700] tracking-wider border-border-subtle hover:border-accent-primary/30 bg-surface-main/50 rounded-md">
                                <Upload size={14} className="mr-1.5"/> Import
                            </Button>
                        )}
                        
                        {allowActions && isSuperAdmin && (
                            <></>
                        )}
                        
                        <button onClick={() => setShowConfig(true)} className="p-1.5 rounded-md hover:bg-surface-alt text-text-muted hover:text-text-primary transition-colors ml-0.5">
                            <Settings2 size={16}/>
                        </button>
                    </div>
                </div>

                <LedgerTable 
                    sales={paginatedSales}
                    columnOrder={columnPreferences.order}
                    visibleColumns={columnPreferences.visible}
                    sortConfig={sortConfig}
                    handleSort={handleSort}
                    selectedIds={selectedIds}
                        toggleSelect={(id) => {
                            const newSet = new Set(selectedIds);
                            if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
                            setSelectedIds(newSet);
                        }}
                        toggleSelectAll={() => {
                            const pageIds = paginatedSales.map(s => s.id);
                            const allSelected = pageIds.every(id => selectedIds.has(id));
                            const newSet = new Set(selectedIds);
                            if (allSelected) pageIds.forEach(id => newSet.delete(id)); else pageIds.forEach(id => newSet.add(id));
                            setSelectedIds(newSet);
                        }}
                        allowActions={allowActions}
                        onAction={handleSafeAction}
                        onColumnReorder={(newOrder) => setColumnPreferences(prev => ({ ...prev, order: newOrder }))}
                        density={density}
                        isLoading={isRefreshing}
                    />
                
                <SummaryFooter 
                    count={processedSales.length} 
                    approved={summary.approved} 
                    pending={summary.pending} 
                    total={summary.total}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>

            {selectedIds.size > 0 && allowActions && (
                <CommandBar 
                    count={selectedIds.size} 
                    isBulkEdit={isBulkEdit}
                    isSaving={isSaving}
                    onSave={handleSaveBulk}
                    onCancel={() => setIsBulkEdit(false)}
                    onAction={handleBulkCommand}
                />
            )}

            <ColumnConfigModal 
                isOpen={showColumnConfig}
                onClose={() => setShowConfig(false)}
                currentOrder={columnPreferences.order}
                currentVisibility={columnPreferences.visible}
                onSave={(order, visible) => {
                    const newVisible = { ...columnPreferences.visible, ...visible };
                    setColumnPreferences({ order: order, visible: newVisible });
                }}
            />

            <ImportWizard 
                importConfig={importConfig}
                onClose={() => setImportConfig(null)}
                columnMapping={columnMapping}
                setColumnMapping={setColumnMapping}
                onAutoMap={autoMapColumns}
                onExecute={executeImport}
                isProcessing={isImporting}
            />

            {selectedProfilePhone && (
                <CustomerProfileModal
                    isOpen={!!selectedProfilePhone}
                    onClose={() => setSelectedProfilePhone(null)}
                    phone={selectedProfilePhone}
                    allSales={sales}
                    role={allowActions ? 'admin' : 'agent'}
                />
            )}

            {selectedRecordingUrl && (
                <AudioPlayerModal
                    src={selectedRecordingUrl.src}
                    saleName={selectedRecordingUrl.saleName}
                    onClose={() => setSelectedRecordingUrl(null)}
                />
            )}
        </div>
    );
};

