
import React, { useState } from 'react';
import { 
    Plus, Trash2, Grid, FileSpreadsheet, Link, 
    MessageCircle, Download, Eraser
} from 'lucide-react';
import { Card, Button, Input } from '../ui/Base';
import { useCRM } from '../../hooks/useCRM';
import { Modal } from '../ui/Modal';
import { TeamsMock } from './sheets/TeamsMock';

// --- MAIN WRAPPER ---

export const CustomSheets = () => {
    const { customSheets, addSheet, removeSheet, updateSheetCell, updateSheet } = useCRM();
    const [activeSheetId, setActiveSheetId] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newSheetType, setNewSheetType] = useState<'native' | 'google' | 'teams'>('native');
    const [googleUrl, setGoogleUrl] = useState('');
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameVal, setRenameVal] = useState('');

    React.useEffect(() => {
        if (!activeSheetId && customSheets.length > 0) {
            setActiveSheetId(customSheets[0].id);
        }
    }, [customSheets, activeSheetId]);

    const handleCreateSheet = () => {
        if (newSheetType === 'google' && !googleUrl) return;
        addSheet(newSheetType, googleUrl);
        setIsAddModalOpen(false);
        setGoogleUrl('');
        setNewSheetType('native');
    };

    const activeSheet = customSheets.find(s => s.id === activeSheetId);

    const handleAddRow = () => {
        if (!activeSheet) return;
        const newRow = Array(10).fill('');
        const newData = [...(activeSheet.data || []), newRow];
        updateSheet(activeSheet.id, { data: newData });
    };

    const handleClearSheet = () => {
        if (!activeSheet || !confirm('Clear all data in this sheet?')) return;
        const emptyData = Array(20).fill(0).map(() => Array(10).fill(''));
        updateSheet(activeSheet.id, { data: emptyData });
    };

    const handleRename = () => {
        if (!activeSheet) return;
        updateSheet(activeSheet.id, { name: renameVal });
        setIsRenaming(false);
    };

    const handleExport = () => {
        if (!activeSheet) return;
        const csvContent = activeSheet.data.map((row: string[]) => row.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `${activeSheet.name}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex justify-between items-center bg-surface-main p-4 rounded-xl border border-border-subtle shadow-sm">
                <div className="flex items-center gap-2 overflow-x-auto max-w-[70%] custom-scrollbar pb-1">
                    <FileSpreadsheet size={20} className="text-accent-primary mr-2 flex-shrink-0" />
                    {customSheets.map(sheet => (
                        <button
                            key={sheet.id}
                            onClick={() => setActiveSheetId(sheet.id)}
                            className={`px-4 py-2 text-xs font-bold uppercase rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
                                activeSheetId === sheet.id 
                                ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/30' 
                                : 'bg-surface-alt text-text-muted hover:text-text-primary'
                            }`}
                        >
                            {sheet.type === 'google' ? <Link size={12} className={activeSheetId === sheet.id ? 'text-white' : 'text-accent-primary'}/> : 
                             sheet.type === 'teams' ? <MessageCircle size={12} className={activeSheetId === sheet.id ? 'text-white' : 'text-[#6264A7]'}/> : null}
                            {sheet.name}
                        </button>
                    ))}
                    {customSheets.length === 0 && <span className="text-xs text-text-muted italic">No active sheets</span>}
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} variant="secondary" className="h-8 text-[10px] uppercase font-bold">
                    <Plus size={14} className="mr-1"/> New Sheet
                </Button>
            </div>

            {activeSheet ? (
                <Card className="flex-1 p-0 overflow-hidden border border-border-subtle flex flex-col relative h-full min-h-0">
                    {/* Header bar only for non-teams/google sheets or if specific controls needed */}
                    {activeSheet.type === 'native' && (
                        <div className="p-3 border-b border-border-subtle bg-surface-alt/50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Grid size={16} className="text-text-muted"/>
                                {isRenaming ? (
                                    <input 
                                        autoFocus
                                        value={renameVal}
                                        onChange={(e) => setRenameVal(e.target.value)}
                                        onBlur={handleRename}
                                        onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                                        className="bg-surface-main border border-accent-primary rounded px-2 py-1 text-sm font-bold w-32 outline-none"
                                    />
                                ) : (
                                    <h3 
                                        onDoubleClick={() => { setRenameVal(activeSheet.name); setIsRenaming(true); }}
                                        className="font-black text-sm text-text-primary uppercase tracking-wide ml-1 cursor-pointer hover:text-accent-primary transition-colors select-none"
                                        title="Double click to rename"
                                    >
                                        {activeSheet.name}
                                    </h3>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" onClick={handleAddRow} className="h-8 w-8 p-0" title="Add Row"><Plus size={14}/></Button>
                                <Button variant="ghost" onClick={handleExport} className="h-8 w-8 p-0" title="Download CSV"><Download size={14}/></Button>
                                <Button variant="ghost" onClick={handleClearSheet} className="h-8 w-8 p-0 hover:text-status-error" title="Clear Data"><Eraser size={14}/></Button>
                                <div className="w-px h-4 bg-border-subtle mx-1"></div>
                                <Button variant="danger" className="h-8 w-8 p-0" onClick={() => { removeSheet(activeSheet.id); setActiveSheetId(null); }}><Trash2 size={14}/></Button>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex-1 overflow-hidden relative h-full">
                        {activeSheet.type === 'google' ? (
                            <div className="w-full h-full relative group flex flex-col">
                                <div className="p-2 bg-[#202124] border-b border-[#3c4043] flex justify-between items-center">
                                    <span className="text-xs text-white font-bold px-2">{activeSheet.name}</span>
                                    <Button variant="danger" className="h-6 w-6 p-0" onClick={() => { removeSheet(activeSheet.id); setActiveSheetId(null); }}><Trash2 size={12}/></Button>
                                </div>
                                <iframe 
                                    src={activeSheet.url} 
                                    className="w-full h-full border-none" 
                                    title="Google Sheet Embed"
                                    allowFullScreen
                                />
                            </div>
                        ) : activeSheet.type === 'teams' ? (
                            <TeamsMock />
                        ) : (
                            <div className="w-full h-full overflow-auto custom-scrollbar bg-surface-main">
                                <table className="w-full text-left border-collapse spreadsheet-grid">
                                    <thead>
                                        <tr>
                                            <th className="w-10 text-center p-2 bg-surface-alt/50 border-r border-b border-border-subtle text-[10px] font-mono text-text-muted">#</th>
                                            {Array.from({ length: 10 }).map((_, i) => (
                                                <th key={i} className="min-w-[120px] p-2 text-[10px] font-black text-text-muted uppercase tracking-wider text-center">
                                                    {String.fromCharCode(65 + i)}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeSheet.data.map((row: string[], rIndex: number) => (
                                            <tr key={rIndex}>
                                                <td className="text-center bg-surface-alt/30 text-[10px] font-mono text-text-muted border-r border-border-subtle font-bold">
                                                    {rIndex + 1}
                                                </td>
                                                {row.map((cell: string, cIndex: number) => (
                                                    <td key={cIndex} className="p-0 border-r border-b border-border-subtle relative group">
                                                        <input
                                                            className="w-full h-full p-2 bg-transparent text-xs font-medium text-text-primary outline-none focus:bg-accent-primary/5 focus:shadow-[inset_0_0_0_2px_var(--color-accent-primary)] transition-all"
                                                            value={cell || ''}
                                                            onChange={(e) => updateSheetCell(activeSheet.id, rIndex, cIndex, e.target.value)}
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </Card>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-text-muted opacity-50 border-2 border-dashed border-border-subtle rounded-3xl m-4">
                    <Grid size={48} className="mb-4"/>
                    <p className="text-sm font-bold uppercase tracking-widest">Select or create a sheet</p>
                </div>
            )}

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Tracker" footer={
                <div className="flex justify-end gap-2 w-full">
                    <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleCreateSheet}>Create Sheet</Button>
                </div>
            }>
                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <button 
                            onClick={() => setNewSheetType('native')}
                            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${newSheetType === 'native' ? 'bg-accent-primary/10 border-accent-primary text-accent-primary ring-1 ring-accent-primary' : 'bg-surface-alt border-border-subtle text-text-muted hover:border-accent-primary/50'}`}
                        >
                            <Grid size={24}/>
                            <span className="text-xs font-black uppercase tracking-widest text-center">Native Grid</span>
                        </button>
                        <button 
                            onClick={() => setNewSheetType('google')}
                            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${newSheetType === 'google' ? 'bg-accent-primary/10 border-accent-primary text-accent-primary ring-1 ring-accent-primary' : 'bg-surface-alt border-border-subtle text-text-muted hover:border-accent-primary/50'}`}
                        >
                            <Link size={24}/>
                            <span className="text-xs font-black uppercase tracking-widest text-center">Google Sheet</span>
                        </button>
                        <button 
                            onClick={() => setNewSheetType('teams')}
                            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${newSheetType === 'teams' ? 'bg-accent-primary/10 border-accent-primary text-accent-primary ring-1 ring-accent-primary' : 'bg-surface-alt border-border-subtle text-text-muted hover:border-accent-primary/50'}`}
                        >
                            <MessageCircle size={24}/>
                            <span className="text-xs font-black uppercase tracking-widest text-center">Teams View</span>
                        </button>
                    </div>

                    {newSheetType === 'google' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <label className="text-xs font-black uppercase text-text-muted tracking-wide">Google Sheet Embed URL</label>
                            <Input 
                                placeholder="e.g. https://docs.google.com/spreadsheets/d/.../edit" 
                                value={googleUrl} 
                                onChange={e => setGoogleUrl(e.target.value)}
                                autoFocus
                            />
                            <p className="text-[10px] text-text-secondary bg-surface-alt p-3 rounded-lg border border-border-subtle leading-relaxed">
                                <strong className="text-accent-primary">Instructions:</strong> Open your Google Sheet, go to <strong>File {'>'} Share {'>'} Publish to Web</strong>. Select "Embed" and copy the link (or just paste the browser URL here, and we will try to format it).
                            </p>
                        </div>
                    )}
                    
                    {newSheetType === 'teams' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <p className="text-[10px] text-text-secondary bg-surface-alt p-3 rounded-lg border border-border-subtle leading-relaxed flex items-center gap-2">
                                <MessageCircle size={16} className="text-[#6264A7] shrink-0"/>
                                <span>This creates a <strong>simulated Microsoft Teams environment</strong> for communication drills or visual consistency. It is not a live connection to Microsoft servers.</span>
                            </p>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};
