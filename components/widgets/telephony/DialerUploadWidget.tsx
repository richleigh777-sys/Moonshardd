import React, { useState, useRef } from 'react';
import { FileSpreadsheet, CheckCircle, Database, Server, Activity, ArrowUpRight, Link2, KeyRound, Sparkles, Merge, UserPlus } from 'lucide-react';
import { useCRM } from '../../../hooks/useCRM';
import { sfx } from '../../../lib/soundService';

const SYSTEM_FIELDS = [
    { key: 'firstName', label: 'First Name', required: true },
    { key: 'lastName', label: 'Last Name', required: true },
    { key: 'phone', label: 'Primary Phone', required: true },
    { key: 'secondaryPhone', label: 'Alt Phone' },
    { key: 'email', label: 'Email Address' },
    { key: 'address', label: 'Street Address' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'zip', label: 'Zip Code' }
];

    // Note: Since dedupe needs all customers, we fetch them just-in-time
import { nexusGateway } from '../../../nexus/adapters/DataGateway';

export const DialerUploadWidget = () => {
    const { addDialerList, currentUser } = useCRM();
    const [step, setStep] = useState<'upload' | 'mapping' | 'dedup' | 'success'>('upload');
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    // Mapping & Analysis State
    const [stats, setStats] = useState({ rows: 0, sizeStr: "0 KB" });
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [rawCsvData, setRawCsvData] = useState<string>('');
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [fileName, setFileName] = useState("");
    
    const [dupStats, setDupStats] = useState({ exact: 0, fuzzy: 0, new: 0, total: 0 });
    const [processedRows, setProcessedRows] = useState<any[]>([]);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (file: File) => {
        if (!file) return;
        if (!file.name.endsWith('.csv')) {
            alert("Only CSV files are supported for Dialer Data Lists.");
            return;
        }

        sfx.playClick();
        
        try {
            const text = await file.text();
            const lines = text.split('\n').filter(r => r.trim().length > 0);
            if (lines.length === 0) return;
            
            const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim());
            
            const initialMapping: Record<string, string> = {};
            SYSTEM_FIELDS.forEach(field => {
                const match = headers.find(h => {
                    const hk = h.toLowerCase();
                    const fk = field.label.toLowerCase();
                    return hk.includes(fk.split(' ')[0]) || (field.key === 'phone' && hk.includes('number'));
                });
                if (match) initialMapping[field.key] = match;
            });
            
            const sizeKB = (file.size / 1024).toFixed(1) + " KB";
            setStats({ rows: Math.max(0, lines.length - 1), sizeStr: sizeKB });
            setCsvHeaders(headers);
            setRawCsvData(text);
            setFileName(file.name);
            setMapping(initialMapping);
            setStep('mapping');
        } catch (err) {
            console.error("Parse error", err);
            sfx.playError();
            alert("Error parsing CSV. Ensure it is valid text.");
        }
    };

    const runDeduplicationEngine = async () => {
        const missing = SYSTEM_FIELDS.filter(f => f.required && !mapping[f.key]);
        if (missing.length > 0) {
            alert(`Please map the following required fields: ${missing.map(m => m.label).join(', ')}`);
            return;
        }

        setIsUploading(true);
        sfx.playClick();
        
        try {
            const customers = await nexusGateway.get('customers');
            const res = await fetch('/api/deduplicate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    csvText: rawCsvData,
                    mapping,
                    customers
                })
            });

            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error);
            }

            setDupStats(data.dupStats);
            setProcessedRows(data.processedRows);
            setStep('dedup');
            sfx.playSuccess();
        } catch (err) {
            console.error(err);
            sfx.playError();
            alert("Error running deduplication engine.");
        } finally {
            setIsUploading(false);
        }
    };

    const confirmFinalInjection = async () => {
        setIsUploading(true);
        sfx.playClick();
        
        try {
            const lines = rawCsvData.split('\n').filter(r => r.trim().length > 0);
            
            // Check if address is mapped but city/state/zip are not
            const isAddressMapped = !!mapping['address'];
            const needsSeparation = isAddressMapped && (!mapping['city'] || !mapping['state'] || !mapping['zip']);
            
            // If needsSeparation is true, we must inject new columns for City, State, Zip into the CSV
            // so the system can natively read them! Let's build the new headers.
            let injectedHeaders = "";
            const extraMapping: Record<string, string> = {};
            
            if (needsSeparation) {
                const addH: string[] = [];
                if (!mapping['city']) { addH.push("__BRAVEHEART_AUTO_CITY__"); extraMapping['city'] = "__BRAVEHEART_AUTO_CITY__"; }
                if (!mapping['state']) { addH.push("__BRAVEHEART_AUTO_STATE__"); extraMapping['state'] = "__BRAVEHEART_AUTO_STATE__"; }
                if (!mapping['zip']) { addH.push("__BRAVEHEART_AUTO_ZIP__"); extraMapping['zip'] = "__BRAVEHEART_AUTO_ZIP__"; }
                injectedHeaders = addH.length > 0 ? "," + addH.join(",") : "";
            }

            const headerLine = lines[0].trim() + injectedHeaders + ",__BRAVEHEART_CUSTOMER_ID__,__BRAVEHEART_MATCH_TYPE__";
            const newLines = [headerLine];

            // to split the address we need to know which column the address is in the rawCsvData!
            let addressIndex = -1;
            if (needsSeparation) {
                 const originalHeaders = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim());
                 addressIndex = originalHeaders.indexOf(mapping['address']);
            }

            const parseAddress = (full: string) => {
                let street = full; let city = ''; let state = ''; let zip = '';
                const match = full.match(/(.*?)(?:,\s*|\s+)([^,]+?)(?:,\s*|\s+)([A-Za-z]{2})\s+(\d{5}(?:-\d{4})?)$/);
                if (match) {
                    street = match[1].trim(); city = match[2].trim(); state = match[3].trim().toUpperCase(); zip = match[4].trim();
                } else {
                    const match2 = full.match(/(.*?)\s+([A-Za-z]{2})\s+(\d{5}(?:-\d{4})?)$/);
                    if (match2) {
                        zip = match2[3].trim(); state = match2[2].trim().toUpperCase();
                        const remaining = match2[1].trim();
                        const cityMatch = remaining.match(/(.*?)(?:,\s*|\s+)([^,\s]+)$/);
                        if (cityMatch) { street = cityMatch[1].trim(); city = cityMatch[2].trim(); street = street.replace(/,$/, '').trim(); }
                        else { street = remaining.replace(/,$/, '').trim(); }
                    }
                }
                return { street, city, state, zip };
            };

            for (let i = 0; i < processedRows.length; i++) {
                const r = processedRows[i];
                let rowRaw = r.raw;

                if (needsSeparation && addressIndex !== -1) {
                    const columns = rowRaw.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // handle quoted csv
                    const rawAddr = columns[addressIndex] ? columns[addressIndex].replace(/^["']|["']$/g, '').trim() : '';
                    const parsed = parseAddress(rawAddr);
                    
                    const injectCols: string[] = [];
                    if (!mapping['city']) injectCols.push(`"${parsed.city}"`);
                    if (!mapping['state']) injectCols.push(`"${parsed.state}"`);
                    if (!mapping['zip']) injectCols.push(`"${parsed.zip}"`);
                    
                    if (injectCols.length > 0) {
                        rowRaw += "," + injectCols.join(",");
                    }
                }

                newLines.push(`${rowRaw},${r.matchedId || ''},${r.matchType}`);
            }

            const finalCsvText = newLines.join('\n');

            const dialerList = {
                name: fileName,
                description: `Uploaded by ${currentUser?.name || 'Agent'}`,
                uploadedBy: currentUser?.id,
                uploadedAt: Date.now(),
                rowCount: stats.rows,
                status: 'Active' as const,
                mapping: { ...mapping, ...extraMapping, customerId: '__BRAVEHEART_CUSTOMER_ID__' },
                dataUrl: finalCsvText.length < 900000 ? btoa(unescape(encodeURIComponent(finalCsvText))) : undefined
            };

            await addDialerList(dialerList);
            
            setStep('success');
            sfx.playSuccess();
            setTimeout(() => {
                setStep('upload');
                setStats({ rows: 0, sizeStr: "0 KB" });
                setMapping({});
                setProcessedRows([]);
            }, 4000);
        } catch (err) {
            console.error("Upload error", err);
            sfx.playError();
            alert("Error finalizing data injection.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const dropHandler = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                <div className="flex items-center gap-2 text-accent-primary font-bold tracking-widest  text-xs">
                    <Database size={16} />
                    UPLOAD DATA
                </div>
                <div className="flex items-center gap-3 text-[10px]  font-bold text-text-muted">
                    <span className="flex items-center gap-1"><Server size={12}/> Secure Tunnel</span>
                    <span className="flex items-center gap-1 text-status-success"><Activity size={12}/> Connection Active</span>
                </div>
            </div>

            <div className="relative group perspective-1000">
                {step === 'upload' && (
                    <div 
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={dropHandler}
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full h-48 border border-border-subtle rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-500 relative overflow-hidden backdrop-blur-md
                            ${isDragging ? 'bg-accent-primary/20 border-accent-primary/50 shadow-[0_0_30px_rgba(var(--accent-primary-rgb),0.2)]' : 'bg-[#15151e]/80 hover:bg-[#1a1a24]/90 hover:border-accent-secondary/30'}
                        `}
                    >
                        {/* Background Gradients */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className={`absolute inset-0 bg-gradient-to-tr from-accent-primary/10 to-transparent transition-opacity duration-500 ${isDragging ? 'opacity-100' : 'opacity-0'}`}></div>

                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                            type="file" 
                            accept=".csv" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                        />

                        <div className="flex flex-col items-center z-10 transition-transform duration-300 group-hover:-translate-y-1">
                            <div className={`p-4 rounded-full mb-3 transition-colors duration-300 ${isDragging ? 'bg-accent-primary/20 text-accent-primary' : 'bg-surface-alt text-text-muted group-hover:text-accent-secondary group-hover:bg-accent-secondary/10'}`}>
                                <FileSpreadsheet size={32} />
                            </div>
                            <span className=" text-xs font-bold tracking-widest text-[#a1a1aa] drop-shadow-md">
                                Drop CSV Lead List here
                            </span>
                            <span className="text-[10px]  opacity-50 mt-1 flex items-center gap-1 group-hover:text-accent-secondary transition-colors">
                                or click to browse <ArrowUpRight size={10} />
                            </span>
                        </div>
                        
                        {/* Scanning beam effect on hover/drag */}
                        {isDragging && (
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-accent-primary shadow-[0_0_10px_rgba(var(--accent-primary-rgb),1)] animate-[scan_2s_ease-in-out_infinite]"></div>
                        )}
                    </div>
                )}
                
                {step === 'mapping' && (
                    <div className="w-full border border-accent-primary/30 bg-[#15151e]/90 rounded-xl flex flex-col items-center relative overflow-hidden backdrop-blur-md shadow-[0_0_20px_rgba(var(--accent-primary-rgb),0.1)]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-accent-primary"></div>
                        <div className="w-full p-4 border-b border-border-subtle flex items-center justify-between">
                            <div className="flex items-center gap-2 text-white text-sm font-bold tracking-wide">
                                <Link2 size={16} className="text-accent-primary" />
                                SCHEMA MAPPING
                            </div>
                            <div className="text-[10px]  text-text-muted font-mono bg-surface-alt px-2 py-1 rounded border border-border-subtle truncate max-w-[150px]" title={fileName}>
                                {fileName} ({stats.rows} rows)
                            </div>
                        </div>
                        <div className="w-full p-4 grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {SYSTEM_FIELDS.map(sf => (
                                <div key={sf.key} className={`flex flex-col gap-1.5 p-3 rounded-lg border transition-colors ${mapping[sf.key] ? 'bg-accent-primary/5 border-accent-primary/30' : 'bg-surface-alt border-border-subtle hover:border-border-strong'}`}>
                                    <div className="text-[10px]  font-bold flex justify-between items-center group-hover:text-accent-primary transition-colors">
                                        <span className={`flex items-center gap-1 ${mapping[sf.key] ? 'text-accent-primary' : 'text-text-muted'}`}>
                                            {sf.required && <KeyRound size={10} className="text-accent-secondary" />}
                                            {sf.label}
                                        </span>
                                        {sf.required && <span className="text-accent-secondary opacity-70 text-[9px] px-1 bg-accent-secondary/10 rounded">REQUIRED</span>}
                                    </div>
                                    <select 
                                        className="w-full bg-[#0a0a0f] border border-border-subtle rounded text-xs p-1.5 text-white focus:outline-none focus:border-accent-primary/50 transition-colors cursor-pointer"
                                        value={mapping[sf.key] || ""}
                                        onChange={(e) => setMapping(prev => ({ ...prev, [sf.key]: e.target.value }))}
                                        disabled={isUploading}
                                    >
                                        <option value="">-- Ignore Field --</option>
                                        {csvHeaders.map((header, idx) => (
                                            <option key={idx} value={header}>{header}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                        <div className="w-full p-4 border-t border-border-subtle flex justify-end gap-3 bg-black/20">
                            <button 
                                onClick={() => { setStep('upload'); setMapping({}); }}
                                disabled={isUploading}
                                className="px-4 py-2 rounded text-xs  font-bold text-text-muted hover:bg-surface-highlight hover:text-white transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={runDeduplicationEngine}
                                disabled={isUploading}
                                className="px-6 py-2 rounded text-xs  font-bold bg-accent-primary text-white hover:bg-accent-primary/80 disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(var(--accent-primary-rgb),0.3)] transition-all"
                            >
                                {isUploading ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={14} /> Run Intelligence Engine
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {step === 'dedup' && (
                    <div className="w-full border border-accent-secondary/30 bg-[#15151e]/90 rounded-xl flex flex-col items-center relative overflow-hidden backdrop-blur-md shadow-[0_0_20px_rgba(var(--accent-secondary-rgb),0.1)] animate-in slide-in-from-right-4 duration-500">
                        <div className="absolute top-0 left-0 w-full h-1 bg-accent-secondary"></div>
                        <div className="w-full p-4 border-b border-border-subtle flex items-center justify-between">
                            <div className="flex items-center gap-2 text-white text-sm font-bold tracking-wide">
                                <Sparkles size={16} className="text-accent-secondary" />
                                DATA SANITIZATION REPORT
                            </div>
                            <div className="text-[10px]  text-text-muted font-mono">{dupStats.total} Rows Analyzed</div>
                        </div>

                        <div className="w-full p-4 grid gap-3">
                            <div className="flex items-center justify-between p-3 bg-surface-alt/50 border border-border-subtle rounded-lg border-l-2 border-l-emerald-500">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/10 rounded text-status-success"><Merge size={16} /></div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white">Exact Matches</span>
                                        <span className="text-[10px] text-text-muted">Exact Phone/Email matches in CRM</span>
                                    </div>
                                </div>
                                <span className="text-lg font-mono font-bold text-status-success">{dupStats.exact}</span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-surface-alt/50 border border-border-subtle rounded-lg border-l-2 border-l-amber-500">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-500/10 rounded text-status-warning"><Merge size={16} /></div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white">Fuzzy Matches</span>
                                        <span className="text-[10px] text-text-muted">Missing middle initials, misspellings</span>
                                    </div>
                                </div>
                                <span className="text-lg font-mono font-bold text-status-warning">{dupStats.fuzzy}</span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-surface-alt/50 border border-border-subtle rounded-lg border-l-2 border-l-accent-primary">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-accent-primary/10 rounded text-accent-primary"><UserPlus size={16} /></div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white">New Prospects</span>
                                        <span className="text-[10px] text-text-muted">Net new leads for outreach</span>
                                    </div>
                                </div>
                                <span className="text-lg font-mono font-bold text-accent-primary">{dupStats.new}</span>
                            </div>
                            
                            <div className="text-[10px] text-text-muted bg-accent-secondary/5 border border-accent-secondary/20 p-2 rounded text-center">
                                Existing profiles will be presented to agents directly when dialed, keeping sales history intact.
                            </div>
                        </div>

                        <div className="w-full p-4 border-t border-border-subtle flex justify-end gap-3 bg-black/20">
                            <button 
                                onClick={() => setStep('mapping')}
                                disabled={isUploading}
                                className="px-4 py-2 rounded text-xs  font-bold text-text-muted hover:bg-surface-highlight hover:text-white transition-colors disabled:opacity-50"
                            >
                                Back
                            </button>
                            <button 
                                onClick={confirmFinalInjection}
                                disabled={isUploading}
                                className="px-6 py-2 rounded text-xs  font-bold bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
                            >
                                {isUploading ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Finalizing...
                                    </>
                                ) : (
                                    <>
                                        <Database size={14} /> Execute Injection
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {step === 'success' && (
                    <div className="w-full h-48 border border-status-success/30 bg-emerald-500/10 rounded-xl flex flex-col items-center justify-center text-status-success relative overflow-hidden backdrop-blur-md">
                        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent"></div>
                        <div className="p-4 rounded-full bg-emerald-500/20 mb-3 relative z-10 animate-in zoom-in spin-in-12 duration-500">
                            <CheckCircle size={32} />
                        </div>
                        <div className="flex flex-col items-center z-10 animate-in slide-in-from-bottom-2 fade-in duration-500 delay-150">
                            <span className=" text-xs font-bold tracking-widest text-status-success drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">Data Synced Successfully</span>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-[10px]  font-mono px-2 py-1 rounded bg-[#0a0a0f] border border-border-subtle opacity-80">Rows: <span className="text-white">{stats.rows}</span></span>
                                <span className="text-[10px]  font-mono px-2 py-1 rounded bg-[#0a0a0f] border border-border-subtle opacity-80">Size: <span className="text-white">{stats.sizeStr}</span></span>
                            </div>
                        </div>
                        {/* Ripple pulses */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-status-success/30 animate-[ping_2s_ease-out_infinite] opacity-0"></div>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between px-3 py-2 bg-surface-alt/50 border border-border-subtle rounded-lg">
                <div className="flex items-center gap-2 text-[10px]  font-bold text-text-muted tracking-wide">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse"></div>
                    Uploads immediately mirror to Level 10 Data Warehouse
                </div>
                <div className="text-[10px] text-text-muted font-mono opacity-50">.CSV ONLY</div>
            </div>
        </div>
    );
};
