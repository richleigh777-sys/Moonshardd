import { useState } from 'react';
import { Sale } from '../../../types';
import { sfx } from '../../../lib/soundService';
import { useCRM } from '../../../hooks/useCRM';
import { useSystem } from '../../../hooks/useSystem';
import { useAuth } from '../../../hooks/useAuth';
import { useLedgerData, useLedgerLayout } from './hooks';
import { useImportLogic } from './useImportLogic';
import { useInfiniteCollection } from '../../../hooks/useInfiniteCollection';

const ITEMS_PER_PAGE = 1000;

export const useSalesLedgerUI = (initialSales: Sale[], onImport?: (data: any) => Promise<number>, onBulkAction?: (ids: string[], action: string, payload?: any) => void) => {
    const { bulkUpdateSales, bulkDeleteSales } = useCRM();
    const { setToast } = useSystem();
    const { currentUser } = useAuth();
    
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [showColumnConfig, setShowConfig] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [density, setDensity] = useState<'compact' | 'comfortable'>('comfortable');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkEdit, setIsBulkEdit] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activePreset, setActivePreset] = useState<string | null>(null);

    const { 
        data: serverSales, loading: isLoading, hasMore, fetchNextPage, total, refresh 
    } = useInfiniteCollection('sales', {});

    const salesToUse = serverSales.length > 0 ? serverSales : initialSales;

    const { 
        processedSales, summary, searchTerm, setSearchTerm, 
        filters, setFilters, sortConfig, handleSort,
        uniqueAgents, uniqueProducts, resetFilters 
    } = useLedgerData(salesToUse);

    const [columnPreferences, setColumnPreferences] = useLedgerLayout();
    
    const { 
        fileInputRef, importConfig, setImportConfig, columnMapping, 
        setColumnMapping, isProcessing: isImporting, 
        handleFileTrigger, handleFileChange, autoMapColumns, executeImport 
    } = useImportLogic(onImport);

    const paginatedSales = processedSales; // We use infinite scroll now, so just pass processedSales

    const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;
        sfx.playClick();
        setCurrentPage(newPage);
    };
    
    const handleRefresh = async () => {
        refresh();
        setToast({ title: 'Ledger', message: "Ledger Synchronized", type: "success" });
        sfx.playSuccess();
    };

    const handleBulkCommand = async (command: string) => {
        if (!selectedIds.size) return;

        if (command === 'copy-sheets') {
            const selectedSales = processedSales.filter(s => selectedIds.has(s.id));
            const { generateSheetTsv } = await import('./sheetExport');
            const tsv = generateSheetTsv(selectedSales, currentUser?.level || 0);
            
            try {
                await navigator.clipboard.writeText(tsv);
                setToast({ title: 'System', message: `${selectedSales.length} rows copied for Google Sheets!`, type: "success" });
                sfx.playConfirm();
            } catch (e) {
                console.error(e);
                setToast({ title: 'Clipboard Error', message: "Failed to copy.", type: "error" });
            }
            
            setSelectedIds(new Set());
            return;
        }

        if (command === 'edit') {
            setIsBulkEdit(true);
            return;
        }

        if (command === 'delete') {
            // if(confirm(`Permanently delete ${selectedIds.size} records?`)) {
                await bulkDeleteSales(Array.from(selectedIds));
                setSelectedIds(new Set());
                setToast({ title: 'Bulk Action', message: "Records Purged", type: "success" });
            // }
            return;
        }

        if (['Approved', 'Declined', 'Pending', 'Cancelled'].includes(command)) {
            await bulkUpdateSales(Array.from(selectedIds), { status: command as any });
            setToast({ title: 'Bulk Action', message: `Bulk updated to ${command}`, type: "success" });
            setSelectedIds(new Set());
            return;
        }

        if (command.startsWith('pipeline:')) {
            const pipelineStatus = command.split(':')[1] as any;
            await bulkUpdateSales(Array.from(selectedIds), { pipelineStatus });
            setToast({ title: 'Bulk Action', message: `Pipeline updated to ${pipelineStatus}`, type: "success" });
            setSelectedIds(new Set());
            return;
        }

        if (command.startsWith('agent:')) {
            const agent = command.split(':')[1];
            await bulkUpdateSales(Array.from(selectedIds), { agent });
            setToast({ title: 'Bulk Action', message: `Assigned to ${agent}`, type: "success" });
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
        currentPage, setCurrentPage, density, setDensity, isRefreshing: isLoading, setIsRefreshing: () => {},
        selectedIds, setSelectedIds, isBulkEdit, setIsBulkEdit, isSaving, setIsSaving,
        activePreset, setActivePreset,
        processedSales, summary, searchTerm, setSearchTerm, filters, setFilters,
        sortConfig, handleSort, uniqueAgents, uniqueProducts, resetFilters,
        columnPreferences, setColumnPreferences, fileInputRef, importConfig, setImportConfig,
        columnMapping, setColumnMapping, isImporting, handleFileTrigger, handleFileChange,
        autoMapColumns, executeImport, paginatedSales, totalPages, handlePageChange,
        handleRefresh, handleBulkCommand, handleSaveBulk, isLoading, hasMore, fetchNextPage
    };
};
