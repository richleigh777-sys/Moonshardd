
import { useState, useEffect, useRef } from 'react';
import { Database, Plus, Shield, Cpu, Trash2, AlertTriangle, Terminal } from 'lucide-react';
import { Button } from '../ui/Base';
import { useSystem } from '../../hooks/useSystem';
import { useAuth } from '../../hooks/useAuth';
import { sfx } from '../../lib/soundService';
import { nexusGateway } from '../../nexus/adapters/DataGateway';
import { ServerCardTelemetry } from './ServerCardTelemetry';
import { ServerConfigModal } from './server-gateway/ServerConfigModal';

export const ServerGateway: React.FC = () => {
    const { serverList, switchServer, createNewServer, setView } = useSystem();
    const { currentUser } = useAuth();
    
    // Modal States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    
    const [targetServer, setTargetServer] = useState<any>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    
    // Purge Sequence State
    const [isPurging, setIsPurging] = useState(false);
    const [purgeLogs, setPurgeLogs] = useState<string[]>([]);
    const purgeLogEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs
    useEffect(() => {
        purgeLogEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [purgeLogs]);

    const handleEnterServer = (serverId: string) => {
        sfx.playSubmit();
        setTimeout(() => {
            switchServer(serverId);
            setView('admin_dashboard');
        }, 500);
    };

    const openCreateModal = () => {
        setIsCreateOpen(true);
        sfx.playClick();
    };

    const openEditModal = (server: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setTargetServer(server);
        setIsEditOpen(true);
        sfx.playClick();
    };

    const openDeleteModal = (server: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setTargetServer(server);
        setDeleteConfirmation('');
        setIsDeleteOpen(true);
        setIsPurging(false);
        setPurgeLogs([]);
        sfx.playAlarm(); 
    };

    const handleConfirmDelete = async () => {
        if (!targetServer || deleteConfirmation !== targetServer.name) return;
        
        setIsPurging(true);
        sfx.playSubmit();
        
        await nexusGateway.deleteServer(targetServer.id);
        
        setIsDeleteOpen(false);
        setTargetServer(null);
        setIsPurging(false);
    };

    const handleSaveCreate = async (name: string, region: string) => {
        sfx.playSuccess();
        await createNewServer(name, region);
        setIsCreateOpen(false);
    };

    const handleSaveEdit = async (name: string, region: string) => {
        if (!targetServer) return;
        sfx.playConfirm();
        await nexusGateway.updateServer(targetServer.id, { name, region });
        setIsEditOpen(false);
        setTargetServer(null);
    };

    const getRegionColor = (region: string) => {
        if (region.includes('East')) return 'text-accent-secondary';
        if (region.includes('West')) return 'text-status-warning';
        if (region.includes('EU')) return 'text-blue-400';
        return 'text-status-success';
    };

    return (
        <div className="h-screen w-full bg-surface-alt text-white flex flex-col items-center justify-center p-8 relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050505] to-[#050505]"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20"></div>

            <div className="max-w-7xl w-full relative z-10 space-y-12 h-full flex flex-col">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end border-b border-border-subtle pb-8 gap-6 shrink-0 mt-8">
                    <div>
                        <h1 className="text-5xl font-[700]  tracking-tighter mb-4 flex items-center gap-4">
                            <div className="p-3 bg-indigo-600/20 rounded-2xl border border-indigo-500/30 text-accent-secondary shadow-neon">
                                <Database size={40} strokeWidth={1.5}/> 
                            </div>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Command Deck</span>
                        </h1>
                        <div className="flex items-center gap-4 text-xs font-mono text-slate-500  tracking-widest pl-2">
                            <span className="flex items-center gap-2"><Cpu size={16} className="text-status-success"/> System Online</span>
                            <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                            <span>Director Uplink • {currentUser?.name}</span>
                            <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                            <span className="text-status-warning flex items-center gap-1"><Shield size={16}/> Security Level 10</span>
                        </div>
                    </div>
                    <Button onClick={openCreateModal} className="h-14 px-8 bg-indigo-600 hover:bg-indigo-500 text-white font-[700]  tracking-widest shadow-lg shadow-indigo-500/20 rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                        <Plus size={18} className="stroke-[3px]"/> Deploy Node
                    </Button>
                </div>

                {/* Server Grid - Scrollable Container */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pr-2">
                        {serverList.map(server => (
                            <ServerCardTelemetry 
                                key={server.id}
                                server={server}
                                isActive={server.status === 'active'}
                                onEnter={handleEnterServer}
                                onEdit={openEditModal}
                                onDelete={openDeleteModal}
                                getRegionColor={getRegionColor}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <ServerConfigModal 
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSave={handleSaveCreate}
                title="Deploy Infrastructure"
                actionLabel="Initialize Server"
            />

            {/* Edit Modal */}
            <ServerConfigModal 
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                initialName={targetServer?.name}
                initialRegion={targetServer?.region}
                onSave={handleSaveEdit}
                title="Reconfigure Node"
                actionLabel="Save Configuration"
            />

            {/* NUCLEAR PURGE MODAL */}
            <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-xl transition-opacity duration-300 ${isDeleteOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className={`w-full max-w-md bg-[#120505] border-2 border-red-900/50 rounded-3xl p-8 shadow-[0_0_100px_rgba(239,68,68,0.2)] transform transition-all duration-300 ${isDeleteOpen ? 'scale-100' : 'scale-95'}`}>
                    
                    {isPurging ? (
                        <div className="flex flex-col items-center justify-center h-[320px]">
                            <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 mb-4 animate-pulse">
                                <Trash2 size={32} className="text-status-error" />
                            </div>
                            <h2 className="text-sm font-bold text-text-primary mb-2">Deleting Server...</h2>
                            <p className="text-xs text-text-muted text-center max-w-[250px]">
                                This server and all of its associated data are being permanently removed.
                            </p>
                        </div>
                    ) : (
                        // CONFIRMATION VIEW
                        <>
                            <div className="flex items-center gap-4 text-status-error mb-6">
                                <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
                                    <AlertTriangle size={32} strokeWidth={2} className="animate-pulse" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-[700]  tracking-widest">Nuclear Protocol</h2>
                                    <p className="text-xs font-bold text-status-error/60  tracking-[0.2em]">Irreversible Action</p>
                                </div>
                            </div>
                            
                            <p className="text-sm font-medium text-slate-300 mb-6 leading-relaxed">
                                You are about to purge <span className="text-white font-[700]">{targetServer?.name}</span>. 
                                This will delete all sales data, user accounts, and audit logs associated with this node. 
                                This cannot be undone.
                            </p>

                            <div className="space-y-2 mb-8">
                                <label className="text-xs font-[700]  text-status-error/60 tracking-widest ml-1">Type server name to confirm</label>
                                <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    placeholder={targetServer?.name}
                                    className="w-full bg-red-500/5 border-2 border-red-900/30 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-red-500 transition-all placeholder:text-white/10"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => { setIsDeleteOpen(false); setDeleteConfirmation(''); }}
                                    className="flex-1 h-14 rounded-xl border border-border-subtle text-slate-400 font-bold  tracking-wider text-xs hover:bg-surface-highlight transition-all"
                                >
                                    Abort
                                </button>
                                <button 
                                    onClick={handleConfirmDelete}
                                    disabled={deleteConfirmation !== targetServer?.name}
                                    className="flex-1 h-14 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-[700]  tracking-widest text-xs shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 group transition-all"
                                >
                                    <Trash2 size={16} className="group-hover:rotate-12 transition-transform" /> Purge Node
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
