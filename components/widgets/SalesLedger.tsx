
import React from 'react';
import { Sale } from '../../types';
import { exportToCSV } from '../../views/utils/crmLogic';
import { LedgerTable } from './sales-ledger/LedgerTable';
import { LedgerHeader } from './sales-ledger/LedgerHeader';
import { FilterPanel } from './sales-ledger/FilterPanel';
import { CommandBar } from './sales-ledger/CommandBar';
import { SummaryFooter } from './sales-ledger/SummaryFooter';
import { ColumnConfigModal } from './sales-ledger/ColumnConfigModal';
import { ImportWizard } from './sales-ledger/ImportWizard';
import { useSalesLedgerUI } from './sales-ledger/useSalesLedgerUI';

interface SalesLedgerProps {
  sales: Sale[];
  onAction?: (sale: Sale, action: string, payload?: any) => void;
  onBulkAction?: (ids: string[], action: string, payload?: any) => void;
  onImport?: (data: any) => Promise<number>;
  allowActions?: boolean; 
}

export const SalesLedger: React.FC<SalesLedgerProps> = ({ sales = [], onAction, onBulkAction, onImport, allowActions = false }) => {
    const {
        showAdvancedFilters, setShowAdvancedFilters, showColumnConfig, setShowConfig,
        density, setDensity, isRefreshing, selectedIds, setSelectedIds, isBulkEdit, setIsBulkEdit, 
        isSaving, processedSales, summary, searchTerm, setSearchTerm, filters, setFilters,
        sortConfig, handleSort, uniqueAgents, uniqueProducts, resetFilters,
        columnPreferences, setColumnPreferences, fileInputRef, importConfig, setImportConfig,
        columnMapping, setColumnMapping, isImporting, handleFileTrigger, handleFileChange,
        autoMapColumns, executeImport, paginatedSales, totalPages, currentPage, setCurrentPage,
        handlePageChange, handleRefresh, handleBulkCommand, handleSaveBulk
    } = useSalesLedgerUI(sales, onImport, onBulkAction);

    const handleSafeAction = (sale: Sale, action: string, payload?: any) => {
        if (onAction) {
            onAction(sale, action, payload);
        }
    };

    return (
        <div className="flex flex-col h-full gap-4 animate-in fade-in duration-500 relative">
            <input ref={fileInputRef} type="file" className="hidden" accept=".csv" onChange={handleFileChange} />

            <LedgerHeader 
                summary={summary}
                searchTerm={searchTerm}
                onSearchChange={(t) => { setSearchTerm(t); setCurrentPage(1); }}
                onToggleFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
                showFilters={showAdvancedFilters}
                onExport={() => exportToCSV(processedSales, 'Sales_Ledger_Export')}
                onConfig={() => setShowConfig(true)}
                onTemplate={() => exportToCSV([{
                    date: '2023-10-01', agent: 'Agent Name', customer: 'John Doe', 
                    phone: '555-0123', product: 'Product A', amount: '100', 
                    status: 'Pending', orderId: 'ORD-001'
                }], 'Import_Template')}
                onImport={handleFileTrigger}
                importAvailable={!!onImport}
                density={density}
                setDensity={setDensity}
                isRefreshing={isRefreshing}
                onRefresh={handleRefresh}
            />

            {showAdvancedFilters && (
                <FilterPanel 
                    filters={filters} 
                    setFilters={(f) => { setFilters(f); setCurrentPage(1); }}
                    agents={uniqueAgents} 
                    products={uniqueProducts} 
                    onReset={resetFilters}
                />
            )}

            <div className={`flex-1 min-h-0 bg-surface-main border border-border-subtle rounded-2xl overflow-hidden shadow-2xl flex flex-col relative transition-opacity duration-300 ${isRefreshing ? 'opacity-50 pointer-events-none' : ''}`}>
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
                onSave={(order, visible) => setColumnPreferences({ order, visible })}
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
        </div>
    );
};

