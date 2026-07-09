
import React, { useState, useRef } from 'react';
import { useSystem } from '../../../hooks/useSystem';
import { useCRM } from '../../../hooks/useCRM';
import { sfx } from '../../../lib/soundService';
import { parseCSV } from './utils';
import { Sale } from '../../../types';
import { GLOBAL_REGISTRY } from '../../../lib/registry';
import { normalizePhone, parseFullAddressString } from '../../../views/utils/dataSanitizer';

export const useImportLogic = (onImport?: (data: Partial<Sale>[]) => Promise<any>) => {
    const { setToast } = useSystem();
    const { users } = useCRM();
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importConfig, setImportConfig] = useState<{ headers: string[]; previewData: string[][]; fullData: string[][]; fileName: string; } | null>(null);
    const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
    const [isProcessing, setIsProcessing] = useState(false);

    // --- FILE HANDLING ---
    const handleFileTrigger = () => {
        sfx.playClick();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        sfx.playSubmit();
        const reader = new FileReader();
        
        reader.onload = (event) => {
            const csvText = event.target?.result as string;
            const rows = parseCSV(csvText);
            
            if (rows.length < 2) {
                setToast({ title: 'Import Error', message: "Invalid CSV: No data rows found", type: 'error' });
                return;
            }

            const headers = rows[0];
            const data = rows.slice(1).filter(row => row.some(cell => cell && cell.trim() !== ''));
            
            setImportConfig({
                headers,
                previewData: data.slice(0, 5),
                fullData: data,
                fileName: file.name
            });
            setColumnMapping({}); 
        };
        
        reader.readAsText(file);
    };

    // --- AUTO MAPPING ALGORITHM ---
    const autoMapColumns = () => {
        if (!importConfig) return;
        
        const headers = importConfig.headers;
        const initialMap: Record<string, string> = {};
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        const usedHeaders = new Set<string>();

        // Priority 1: Exact Matches (Key or Label)
        GLOBAL_REGISTRY.forEach(field => {
            const match = headers.find(h => 
                normalize(h) === normalize(field.key) || 
                normalize(h) === normalize(field.label)
            );
            if (match && !usedHeaders.has(match)) {
                initialMap[field.key] = match;
                usedHeaders.add(match);
            }
        });

        // Priority 2: Fuzzy Synonym Matches
        GLOBAL_REGISTRY.forEach(field => {
            if (initialMap[field.key]) return; // Already mapped
            const match = headers.find(h => {
                if (usedHeaders.has(h)) return false;
                const hNorm = normalize(h);
                // Check if header contains any synonym
                return field.synonyms.some(syn => hNorm.includes(normalize(syn)));
            });
            if (match) {
                initialMap[field.key] = match;
                usedHeaders.add(match);
            }
        });

        setColumnMapping(initialMap);
        sfx.playSubmit();
        setToast({ title: 'Import', message: "Intelligent Mapping Applied", type: "success" });
    };

    // --- EXECUTION LOGIC ---
    const executeImport = async (targetAgentId: string, defaultStatus: Sale['status']) => {
        if (!onImport || !importConfig) return;
        setIsProcessing(true);
        const attributionAgent = users.find(u => u.id === targetAgentId);
        
        try {
            const mappedData = importConfig.fullData.map((row: string[]) => {
                const entry: any = { 
                    agentId: targetAgentId,
                    agent: attributionAgent?.name || 'System Import',
                    status: defaultStatus, 
                    timestamp: Date.now(),
                    dosage: 'Standard',
                    quantity: '1',
                    address: '',
                    product: 'Imported',
                    sourceType: 'import'
                };

                Object.entries(columnMapping).forEach(([sysKey, csvHeader]) => {
                    const csvIdx = importConfig.headers.indexOf(csvHeader);
                    if (csvIdx !== -1 && row[csvIdx] !== undefined) {
                        let value: any = row[csvIdx];
                        
                        // Normalization Logic based on Type
                        if (sysKey === 'amount') {
                            const cleanNum = value.toString().replace(/[^0-9.-]+/g, '');
                            value = parseFloat(cleanNum) || 0;
                        }
                        if (sysKey === 'date' && value) {
                            const parsedDate = Date.parse(value);
                            if (!isNaN(parsedDate)) entry.timestamp = parsedDate;
                        }
                        if (sysKey === 'phone' && value) {
                            value = normalizePhone(value);
                        }
                        
                        if ((sysKey === 'address' || sysKey === 'shippingAddress' || sysKey === 'billingAddress') && value && typeof value === 'string') {
                            const parsed = parseFullAddressString(value);
                            value = parsed.street || value;
                            
                            const prefix = sysKey === 'billingAddress' ? 'billing' : (sysKey === 'shippingAddress' ? 'shipping' : '');
                            const cityKey = prefix ? prefix + 'City' : 'city';
                            const stateKey = prefix ? prefix + 'State' : 'state';
                            const zipKey = prefix ? prefix + 'Zip' : 'zip';

                            if (parsed.city && !columnMapping[cityKey]) {
                                entry[cityKey] = parsed.city;
                            }
                            if (parsed.state && !columnMapping[stateKey]) {
                                entry[stateKey] = parsed.state;
                            }
                            if (parsed.zip && !columnMapping[zipKey]) {
                                entry[zipKey] = parsed.zip;
                            }
                        }
                        
                        if (sysKey !== 'date') {
                            entry[sysKey] = value;
                        }
                    }
                });
                return entry;
            });

            const validData = mappedData.filter((d: any) => d.amount || d.customer || d.phone || d.email || d.firstName || d.lastName);
            const count = await onImport(validData);
            setToast({ title: 'Import Complete', message: `Import Complete: ${count} records`, type: 'success' });
            setImportConfig(null);
            sfx.playSuccess();
        } catch {
            setToast({ title: 'Import Aborted', message: "Import Aborted", type: "error" });
            sfx.playError();
        } finally {
            setIsProcessing(false);
        }
    };

    return {
        fileInputRef,
        importConfig, setImportConfig,
        columnMapping, setColumnMapping,
        isProcessing,
        handleFileTrigger,
        handleFileChange,
        autoMapColumns,
        executeImport
    };
};
