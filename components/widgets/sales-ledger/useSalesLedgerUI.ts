import { useState, useMemo } from 'react';
import { Sale } from '../../../types';
import { sfx } from '../../../lib/soundService';
import { useCRM } from '../../../hooks/useCRM';
import { useSystem } from '../../../hooks/useSystem';
import { useLedgerData, useLedgerLayout } from './hooks';
import { useImportLogic } from './useImportLogic';

const ITEMS_PER_PAGE = 1000;

export const useSalesLedgerUI = (sales: Sale[], onImport?: (data: any) => Promise<number>, onBulkAction?: (ids: string[], action: string, payload?: any) => void) => {
    const { bulkUpdateSales, bulkDeleteSales } = useCRM();
    const { setToast } = useSystem();
    
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [showColumnConfig, setShowConfig] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [density, setDensity] = useState<'compact' | 'comfortable'>('comfortable');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkEdit, setIsBulkEdit] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const { 
        processedSales, summary, searchTerm, setSearchTerm, 
        filters, setFilters, sortConfig, handleSort,
        uniqueAgents, uniqueProducts, resetFilters 
    } = useLedgerData(sales);

    const [columnPreferences, setColumnPreferences] = useLedgerLayout();
    
    const { 
        fileInputRef, importConfig, setImportConfig, columnMapping, 
        setColumnMapping, isProcessing: isImporting, 
        handleFileTrigger, handleFileChange, autoMapColumns, executeImport 
    } = useImportLogic(onImport);

    const paginatedSales = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return processedSales.slice(start, start + ITEMS_PER_PAGE);
    }, [processedSales, currentPage]);

    const totalPages = Math.ceil(processedSales.length / ITEMS_PER_PAGE);

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;
        sfx.playClick();
        setCurrentPage(newPage);
    };
    
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await new Promise(r => setTimeout(r, 1000));
        setIsRefreshing(false);
        setToast({ title: 'Ledger', message: "Ledger Synchronized", type: "success" });
        sfx.playSuccess();
    };

    const handleBulkCommand = async (command: string) => {
        if (!selectedIds.size) return;

        if (command === 'edit') {
            setIsBulkEdit(true);
            return;
        }

        if (command === 'delete') {
            if(confirm(`Permanently delete ${selectedIds.size} records?`)) {
                await bulkDeleteSales(Array.from(selectedIds));
                setSelectedIds(new Set());
                setToast({ title: 'Bulk Action', message: "Records Purged", type: "success" });
            }
            return;
        }

        if (['Approved', 'Declined', 'Pending', 'Cancelled'].includes(command)) {
            await bulkUpdateSales(Array.from(selectedIds), { status: command as any });
            setToast({ title: 'Bulk Action', message: `Bulk updated to ${command}`, type: "success" });
            setSelectedIds(new Set());
            return;
        }

        if (onBulkAction) {
            onBulkAction(Array.from(selectedIds), command);
            setSelectedIds(new Set());
            setToast({ title: 'Bulk Action', message: "Bulk Operation Initiated", type: "success" });
        }
    };

    const handleSaveBulk = async () => {
        setIsSaving(true);
        await new Promise(r => setTimeout(r, 500)); 
        setIsSaving(false);
        setIsBulkEdit(false);
        setSelectedIds(new Set());
        setToast({ title: 'Bulk Action', message: "Bulk edits applied", type: "success" });
    };

    return {
        showAdvancedFilters, setShowAdvancedFilters, showColumnConfig, setShowConfig,
        currentPage, setCurrentPage, density, setDensity, isRefreshing, setIsRefreshing,
        selectedIds, setSelectedIds, isBulkEdit, setIsBulkEdit, isSaving, setIsSaving,
        processedSales, summary, searchTerm, setSearchTerm, filters, setFilters,
        sortConfig, handleSort, uniqueAgents, uniqueProducts, resetFilters,
        columnPreferences, setColumnPreferences, fileInputRef, importConfig, setImportConfig,
        columnMapping, setColumnMapping, isImporting, handleFileTrigger, handleFileChange,
        autoMapColumns, executeImport, paginatedSales, totalPages, handlePageChange,
        handleRefresh, handleBulkCommand, handleSaveBulk
    };
};
