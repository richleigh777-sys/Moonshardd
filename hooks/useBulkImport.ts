import { useState, useRef, useMemo, ChangeEvent, DragEvent } from 'react';
import { Customer, Sale } from '../types';
import { useCRMData } from './useCRMData';
import { useSystem } from './useSystem';
import { useAuth } from './useAuth';
import { sfx } from '../lib/soundService';
import { parseCSV } from '../components/widgets/sales-ledger/utils';
import { parseImportRow } from '../components/admin/UniqueSalesPool';

export const CONTACT_MAPPABLES = [
    { key: 'firstName', label: 'First Name', required: true, synonyms: ['first', 'firstname', 'first name', 'given name_'] },
    { key: 'lastName', label: 'Last Name', required: true, synonyms: ['last', 'lastname', 'last name', 'surname', 'family name'] },
    { key: 'phone', label: 'Phone Number (Required)', required: true, synonyms: ['phone', 'phone number', 'tel', 'mobile', 'cell', 'contact_num', 'contact'] },
    { key: 'email', label: 'Email Address', required: false, synonyms: ['email', 'email address', 'mail', 'e-mail', 'email_address'] },
    { key: 'dob', label: 'Date of Birth', required: false, synonyms: ['dob', 'date of birth', 'birthday', 'birth'] },
    { key: 'age', label: 'Age', required: false, synonyms: ['age', 'years old', 'years'] },
    { key: 'shippingAddress', label: 'Shipping Street', required: false, synonyms: ['shipping address', 'shipping street', 'street', 'ship_address'] },
    { key: 'shippingCity', label: 'Shipping City', required: false, synonyms: ['shipping city', 'ship_city', 'city'] },
    { key: 'shippingState', label: 'Shipping State', required: false, synonyms: ['shipping state', 'ship_state', 'state', 'province'] },
    { key: 'shippingZip', label: 'Shipping ZIP', required: false, synonyms: ['shipping zip', 'ship_zip', 'zip', 'postal'] },
    { key: 'billingAddress', label: 'Billing Street', required: false, synonyms: ['billing address', 'billing street', 'bill_address'] },
    { key: 'billingCity', label: 'Billing City', required: false, synonyms: ['billing city', 'bill_city'] },
    { key: 'billingState', label: 'Billing State', required: false, synonyms: ['billing state', 'bill_state'] },
    { key: 'billingZip', label: 'Billing ZIP', required: false, synonyms: ['billing zip', 'bill_zip', 'billing zip code'] },
    { key: 'height', label: 'Height', required: false, synonyms: ['height', 'tall'] },
    { key: 'weight', label: 'Weight', required: false, synonyms: ['weight', 'mass'] },
    { key: 'medicalConditions', label: 'Medical Conditions', required: false, synonyms: ['conditions', 'medical', 'symptoms', 'history', 'health', 'illness'] },
    { key: 'crmTags', label: 'CRM Tags', required: false, synonyms: ['crm tags', 'tags', 'global tags'] },
    { key: 'leadSources', label: 'Lead Sources', required: false, synonyms: ['lead source', 'source', 'origin', 'marketing source'] },
    { key: 'pipelineStages', label: 'Pipeline Stages', required: false, synonyms: ['pipeline', 'stage', 'status', 'funnel stage'] }
];

export function useBulkImport(uniqueCustomers: Customer[], sales: Sale[], customerDynamicMetrics: Map<string, any>) {
    const { currentUser } = useAuth();
    const { customers, bulkAddCustomers, logAudit } = useCRMData(currentUser);
    const { setToast } = useSystem();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importConfig, setImportConfig] = useState<{
        headers: string[];
        previewData: string[][];
        fullData: string[][];
        fileName: string;
    } | null>(null);
    const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState<'mapping' | 'resolution' | 'preview'>('mapping');
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const [previewModalData, setPreviewModalData] = useState<{
        added: Partial<Customer>[];
        updated: {
            existingId: string;
            existingFullName: string;
            existingPhone: string;
            existingEmail: string;
            existingAddress: string;
            smartUpdates: Partial<Customer>;
            overwriteUpdates: Partial<Customer>;
            strategy: 'stitch' | 'overwrite' | 'skip';
        }[];
    } | null>(null);
    const [importResults, setImportResults] = useState<{
        added: number;
        stitched: number;
        stitchedDetails: Array<{ name: string, phone: string, email: string }>;
        addedDetails: Array<{ name: string, phone: string, email: string }>;
    } | null>(null);

    const processFile = (file: File | null | undefined) => {
        if (!file) return;

        sfx.playConfirm();
        const reader = new FileReader();
        reader.onload = (event) => {
            const csvText = event.target?.result as string;
            const rows = parseCSV(csvText);
            
            if (rows.length < 2) {
                setToast({
                    title: 'Invalid CSV Structure',
                    message: "No data rows detected below headers in this file.",
                    type: 'error'
                });
                return;
            }

            const headers = rows[0].map(h => h.trim().replace(/^"|"$/g, ''));
            const data = rows.slice(1).filter(row => row.some(cell => cell && cell.trim().length > 0));

            setImportConfig({
                headers,
                previewData: data.slice(0, 5),
                fullData: data,
                fileName: file.name
            });
            setColumnMapping({});
            setActiveTab('mapping');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        processFile(e.target.files?.[0]);
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        setIsDraggingOver(true);
    };

    const handleDragLeave = (e: DragEvent) => {
        e.preventDefault();
        setIsDraggingOver(false);
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDraggingOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
            processFile(file);
        } else {
            setToast({ title: 'Invalid File', message: 'Only .csv files are supported', type: 'error' });
        }
    };

    const autoMapColumns = () => {
        if (!importConfig) return;
        const headers = importConfig.headers;
        const initialMap: Record<string, string> = {};
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

        CONTACT_MAPPABLES.forEach(field => {
            // Find exact match first
            let match = headers.find(h => normalize(h) === normalize(field.key) || normalize(h) === normalize(field.label));
            
            // Fuzzy Match by synonym list
            if (!match) {
                match = headers.find(h => {
                    const normH = normalize(h);
                    return field.synonyms.some(syn => {
                        const normSyn = normalize(syn);
                        return normH === normSyn || normH.includes(normSyn) || normSyn.includes(normH);
                    });
                });
            }

            if (match) {
                initialMap[field.key] = match;
            }
        });

        setColumnMapping(initialMap);
        setToast({
            title: 'Auto Map Applied',
            message: 'Detected matching columns based on common synonym patterns.',
            type: 'success'
        });
        sfx.playSuccess();
    };

    const dryRunAnalysis = useMemo(() => {
        if (!importConfig) return { newCount: 0, duplicateCount: 0, stitchCount: 0, fupCount: 0, validRows: [] };

        const headers = importConfig.headers;
        const phoneHeader = columnMapping['phone'];
        const phoneIdx = phoneHeader ? headers.indexOf(phoneHeader) : -1;

        if (phoneIdx === -1) return { newCount: 0, duplicateCount: 0, stitchCount: 0, fupCount: 0, validRows: [] };

        let newCount = 0;
        let duplicateCount = 0;
        let stitchCount = 0;
        let fupCount = 0;
        const validRows: any[] = [];

        importConfig.fullData.forEach(row => {
            const parsedRow = parseImportRow(row, headers, columnMapping);
            if (!parsedRow) return;

            const { rawPhone, cleanPhone, fn, ln, fullName, email, shippingAddress, billingAddress, medList } = parsedRow;

            const match = uniqueCustomers.find(c => {
                const cPhone = (c.phone || '').replace(/\D/g, '');
                const cAltAlt = ((c as any).alternatePhone || '').replace(/\D/g, '');
                return cPhone === cleanPhone || cAltAlt === cleanPhone;
            });

            const phoneSales = sales.filter(s => (s.phone || '').replace(/\D/g, '') === cleanPhone);
            const hasDeclines = phoneSales.some(s => s.status === 'Declined');

            const rowData = {
                phone: rawPhone,
                firstName: fn,
                lastName: ln,
                fullName,
                email,
                shippingAddress: shippingAddress,
                billingAddress: billingAddress,
                medicalConditions: medList.join(', '),
                isMatch: !!match,
                matchName: match ? match.fullName : null,
                isFup: hasDeclines || (match && (customerDynamicMetrics.get(match.id)?.declineCount ?? 0) > 0)
            };
            validRows.push(rowData);

            if (match) {
                duplicateCount++;
                
                const hasStitchableInfo = 
                    (email && (!match.email || match.email.toLowerCase() === 'unknown')) ||
                    (shippingAddress && (match.shippingAddress || match.address) !== shippingAddress) ||
                    (billingAddress && match.billingAddress !== billingAddress) ||
                    (medList.length > 0 && (match.medicalConditions || []).length === 0);

                if (hasStitchableInfo) {
                    stitchCount++;
                }

                if (rowData.isFup) {
                    fupCount++;
                }
            } else {
                newCount++;
                if (rowData.isFup) {
                    fupCount++;
                }
            }
        });

        return { newCount, duplicateCount, stitchCount, fupCount, validRows };
    }, [importConfig, columnMapping, uniqueCustomers, sales, customerDynamicMetrics]);

    const executeContactImport = async () => {
        if (!importConfig) return;
        
        const headers = importConfig.headers;
        const phoneHeader = columnMapping['phone'];
        const phoneIdx = phoneHeader ? headers.indexOf(phoneHeader) : -1;

        if (phoneIdx === -1) {
            setToast({
                title: 'Key Field Required',
                message: 'You must map the Phone Number column. This key field is used to avoid duplicate contacts and enable stitching.',
                type: 'warning'
            });
            sfx.playDecline();
            return;
        }

        setIsProcessing(true);
        sfx.playConfirm();

        let _added = 0;
        let _updated = 0;
        const _importResultsData: any = { added: 0, stitched: 0, stitchedDetails: [], addedDetails: [] };
        const bulkOps: Partial<Customer>[] = [];

        const phoneDbMap = new Map<string, Customer>();
        
        const sortedRaw = [...customers].sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
        sortedRaw.forEach(c => {
            if (c.phone) phoneDbMap.set(c.phone.replace(/\D/g, ''), c);
            if ((c as any).alternatePhone) phoneDbMap.set((c as any).alternatePhone.replace(/\D/g, ''), c);
        });

        try {
            for (const row of importConfig.fullData) {
                const parsedRow = parseImportRow(row, headers, columnMapping);
                if (!parsedRow) continue;

                const { 
                    rawPhone, cleanPhone, fn, ln, fullName, email, 
                    shippingAddress, shippingCity, shippingState, shippingZip, 
                    billingAddress, billingCity, billingState, billingZip, 
                    age, dob, height, weight, medList, crmList, leadList, pipeList 
                } = parsedRow;

                const existingMatch = phoneDbMap.get(cleanPhone);

                if (existingMatch) {
                    const smartUpdates: Partial<Customer> = { updatedAt: Date.now() };

                    if (fn && !existingMatch.firstName) smartUpdates.firstName = fn;
                    if (ln && !existingMatch.lastName) smartUpdates.lastName = ln;
                    if (fullName && (!existingMatch.fullName || existingMatch.fullName.length < fullName.length)) {
                        smartUpdates.fullName = fullName;
                        smartUpdates.name = fullName;
                    }
                    if (email && (!existingMatch.email || existingMatch.email.toLowerCase() === 'unknown')) smartUpdates.email = email;
                    if (age && !existingMatch.age) smartUpdates.age = age;
                    if (dob && !existingMatch.dob) smartUpdates.dob = dob;
                    if (height && !existingMatch.height) smartUpdates.height = height;
                    if (weight && !existingMatch.weight) smartUpdates.weight = weight;

                    if (shippingAddress) {
                        const originalShip = existingMatch.shippingAddress || existingMatch.address;
                        if (!originalShip) {
                            smartUpdates.shippingAddress = shippingAddress;
                            smartUpdates.address = shippingAddress;
                            smartUpdates.shippingCity = shippingCity;
                            smartUpdates.shippingState = shippingState;
                            smartUpdates.shippingZip = shippingZip;
                        } else if (originalShip.toLowerCase().trim() !== shippingAddress.toLowerCase().trim()) {
                            const past = existingMatch.pastShippingAddresses || [];
                            if (!past.includes(originalShip)) {
                                smartUpdates.pastShippingAddresses = [...past, originalShip];
                            }
                            smartUpdates.shippingAddress = shippingAddress;
                            smartUpdates.address = shippingAddress;
                            smartUpdates.shippingCity = shippingCity || existingMatch.shippingCity;
                            smartUpdates.shippingState = shippingState || existingMatch.shippingState;
                            smartUpdates.shippingZip = shippingZip || existingMatch.shippingZip;
                        }
                    }

                    if (billingAddress) {
                        const originalBill = existingMatch.billingAddress;
                        if (!originalBill) {
                            smartUpdates.billingAddress = billingAddress;
                            smartUpdates.billingCity = billingCity;
                            smartUpdates.billingState = billingState;
                            smartUpdates.billingZip = billingZip;
                        } else if (originalBill.toLowerCase().trim() !== billingAddress.toLowerCase().trim()) {
                            const past = existingMatch.pastBillingAddresses || [];
                            if (!past.includes(originalBill)) {
                                smartUpdates.pastBillingAddresses = [...past, originalBill];
                            }
                            smartUpdates.billingAddress = billingAddress;
                            smartUpdates.billingCity = billingCity || existingMatch.billingCity;
                            smartUpdates.billingState = billingState || existingMatch.billingState;
                            smartUpdates.billingZip = billingZip || existingMatch.billingZip;
                        }
                    }

                    if (medList.length > 0) {
                        const originalMed = existingMatch.medicalConditions || [];
                        smartUpdates.medicalConditions = Array.from(new Set([...originalMed, ...medList]));
                    }
                    if (crmList.length > 0) {
                        const originalCrm = existingMatch.crmTags || [];
                        smartUpdates.crmTags = Array.from(new Set([...originalCrm, ...crmList]));
                    }
                    if (leadList.length > 0) {
                        const originalLead = existingMatch.leadSources || [];
                        smartUpdates.leadSources = Array.from(new Set([...originalLead, ...leadList]));
                    }
                    if (pipeList.length > 0) {
                        const originalPipe = existingMatch.pipelineStages || [];
                        smartUpdates.pipelineStages = Array.from(new Set([...originalPipe, ...pipeList]));
                    }

                    smartUpdates.id = existingMatch.id;

                    const overwriteUpdates: Partial<Customer> = { updatedAt: Date.now() };
                    if (fn) overwriteUpdates.firstName = fn;
                    if (ln) overwriteUpdates.lastName = ln;
                    if (fullName) {
                        overwriteUpdates.fullName = fullName;
                        overwriteUpdates.name = fullName;
                    }
                    if (email) overwriteUpdates.email = email;
                    if (age) overwriteUpdates.age = age;
                    if (dob) overwriteUpdates.dob = dob;
                    if (height) overwriteUpdates.height = height;
                    if (weight) overwriteUpdates.weight = weight;
                    
                    if (shippingAddress) {
                        overwriteUpdates.shippingAddress = shippingAddress;
                        overwriteUpdates.address = shippingAddress;
                        overwriteUpdates.shippingCity = shippingCity;
                        overwriteUpdates.shippingState = shippingState;
                        overwriteUpdates.shippingZip = shippingZip;
                    }
                    if (billingAddress) {
                        overwriteUpdates.billingAddress = billingAddress;
                        overwriteUpdates.billingCity = billingCity;
                        overwriteUpdates.billingState = billingState;
                        overwriteUpdates.billingZip = billingZip;
                    }
                    if (medList.length > 0) overwriteUpdates.medicalConditions = Array.from(new Set([...(existingMatch.medicalConditions || []), ...medList]));
                    if (crmList.length > 0) overwriteUpdates.crmTags = Array.from(new Set([...(existingMatch.crmTags || []), ...crmList]));
                    if (leadList.length > 0) overwriteUpdates.leadSources = Array.from(new Set([...(existingMatch.leadSources || []), ...leadList]));
                    if (pipeList.length > 0) overwriteUpdates.pipelineStages = Array.from(new Set([...(existingMatch.pipelineStages || []), ...pipeList]));

                    overwriteUpdates.id = existingMatch.id;

                    bulkOps.push({
                        existingId: existingMatch.id,
                        existingFullName: existingMatch.fullName || 'Unknown',
                        existingPhone: existingMatch.phone || '',
                        existingEmail: existingMatch.email || '',
                        existingAddress: existingMatch.shippingAddress || existingMatch.address || '',
                        smartUpdates,
                        overwriteUpdates,
                        strategy: 'stitch'
                    } as any);

                    _updated++;
                } else {
                    const id = 'cust_' + Date.now() + Math.random().toString(36).substr(2, 5);
                    const customerPayload: Partial<Customer> = {
                        id,
                        firstName: fn,
                        lastName: ln,
                        fullName,
                        name: fullName,
                        phone: rawPhone,
                        email: email || 'unknown',
                        shippingAddress,
                        shippingCity,
                        shippingState,
                        shippingZip,
                        billingAddress,
                        billingCity,
                        billingState,
                        billingZip,
                        age,
                        dob,
                        height,
                        weight,
                        medicalConditions: medList,
                        crmTags: crmList,
                        leadSources: leadList,
                        pipelineStages: pipeList,
                        status: 'Active',
                        ltv: 0,
                        orderCount: 0,
                        declineCount: 0,
                        lastOrderDate: 0,
                        firstSource: 'CSV Bulk Import',
                        tags: [],
                        salesHistory: [],
                        phones: [rawPhone],
                        emails: [email].filter(Boolean),
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    };
                    
                    bulkOps.push(customerPayload);
                    phoneDbMap.set(cleanPhone, customerPayload as Customer);
                    
                    _added++;
                }
            }

            const previewAdded: Partial<Customer>[] = [];
            const previewUpdated: any[] = [];

            for (const op of bulkOps) {
                if ('createdAt' in op && op.createdAt) {
                    previewAdded.push(op);
                } else if ('strategy' in op) {
                    previewUpdated.push(op);
                }
            }

            setPreviewModalData({
                added: previewAdded,
                updated: previewUpdated
            });
            
        } catch (err) {
            console.error('Failed to parse columns:', err);
            setToast({
                title: 'Ingestion Aborted',
                message: 'Failed to process spreadsheet contacts.',
                type: 'error'
            });
            sfx.playDecline();
        } finally {
            setIsProcessing(false);
        }
    };

    const confirmContactImport = async () => {
        if (!previewModalData) return;
        setIsProcessing(true);
        sfx.playConfirm();

        try {
            const finalBulkOps: Partial<Customer>[] = [...previewModalData.added];
            
            for (const dup of previewModalData.updated) {
                if (dup.strategy === 'skip') continue;
                if (dup.strategy === 'overwrite') finalBulkOps.push(dup.overwriteUpdates);
                if (dup.strategy === 'stitch') finalBulkOps.push(dup.smartUpdates);
            }
            
            const BATCH_SIZE = 500;
            for (let i = 0; i < finalBulkOps.length; i += BATCH_SIZE) {
                const batch = finalBulkOps.slice(i, i + BATCH_SIZE);
                await bulkAddCustomers(batch as Customer[]);
            }

            setToast({
                title: 'Data Ingestion Nexus Succeeded',
                message: `Bulk contacts parsed successfully: ${previewModalData.added.length} new unique profiles registered. ${finalBulkOps.length - previewModalData.added.length} pre-existing entries stitched/updated.`,
                type: 'success'
            });

            await logAudit({
                action: 'BULK_IMPORT',
                details: `Imported ${previewModalData.added.length} new profiles and stitched ${finalBulkOps.length - previewModalData.added.length} duplicates.`,
                module: 'CRM'
            });
            
            sfx.playSuccess();
            setImportResults({
                added: previewModalData.added.length,
                stitched: finalBulkOps.length - previewModalData.added.length,
                stitchedDetails: previewModalData.updated
                    .filter(u => u.strategy !== 'skip')
                    .map(o => ({ name: o.existingFullName || 'Unknown', phone: o.existingPhone || '', email: o.existingEmail || '' })),
                addedDetails: previewModalData.added.map(o => ({ name: o.fullName || 'Unknown', phone: o.phone || '', email: o.email || '' }))
            });
            setImportConfig(null);
            setPreviewModalData(null);
        } catch (err) {
            console.error('Bulk ingest failed:', err);
            setToast({
                title: 'Ingestion Aborted',
                message: 'Failed to save spreadsheet contacts to the CRM database.',
                type: 'error'
            });
            sfx.playDecline();
        } finally {
            setIsProcessing(false);
        }
    };

    return {
        fileInputRef,
        importConfig, setImportConfig,
        columnMapping, setColumnMapping,
        isProcessing, setIsProcessing,
        activeTab, setActiveTab,
        isDraggingOver,
        previewModalData, setPreviewModalData,
        importResults, setImportResults,
        handleFileChange, handleDragOver, handleDragLeave, handleDrop,
        autoMapColumns, dryRunAnalysis, executeContactImport, confirmContactImport
    };
}
