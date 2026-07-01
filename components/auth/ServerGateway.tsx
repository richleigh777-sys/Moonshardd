
import { useState, useEffect, useRef } from 'react';
import { Database, Plus, Shield, Cpu, Trash2, AlertTriangle, Terminal, Building, Key } from 'lucide-react';
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
        if (region.includes('East')) return 'text-accent-primary';
        if (region.includes('West')) return 'text-status-warning';
        if (region.includes('EU')) return 'text-blue-500';
        return 'text-status-success';
    };

    return (
        <div className="min-h-screen w-full bg-surface-main text-text-primary flex flex-col items-center px-6 py-12 relative font-sans">
            
            <div className="max-w-6xl w-full relative z-10 space-y-10 flex flex-col">
                
                {/* Elegant Header */}
                <div className="flex flex-col md:flex-row justify-between items-end pb-8 border-b border-border-subtle gap-4 shrink-0">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight mb-3 flex items-center gap-3 text-text-primary">
                            <div className="p-2.5 bg-accent-primary/10 rounded-xl border border-accent-primary/20 text-accent-primary shadow-sm">
                                <Building size={28} strokeWidth={2}/> 
                            </div>
                            My Workspaces
                        </h1>
                        <div className="flex items-center gap-3 text-sm font-medium text-text-secondary">
                            <span className="flex items-center gap-1.5"><Cpu size={16} className="text-status-success"/> Systems Online</span>
                            <div className="w-1 h-1 bg-border-strong rounded-full"></div>
                            <span>Welcome back, {currentUser?.name || 'Administrator'}</span>
                            <div className="w-1 h-1 bg-border-strong rounded-full"></div>
                            <span className="text-status-warning flex items-center gap-1.5"><Shield size={16}/> Admin Access</span>
                        </div>
                    </div>
                    <Button onClick={openCreateModal} className="h-12 px-6 bg-text-primary hover:bg-black dark:bg-white dark:hover:bg-surface-highlight dark:text-black text-white font-bold tracking-wide rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2">
                        <Plus size={18} strokeWidth={2}/> Create New ✨
                    </Button>
                </div>

                {/* Server Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

            {/* Create Modal */}
            <ServerConfigModal 
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSave={handleSaveCreate}
                title="Create Workspace Instance"
                actionLabel="Let's Go!"
            />

            {/* Edit Modal */}
            <ServerConfigModal 
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                initialName={targetServer?.name}
                initialRegion={targetServer?.region}
                onSave={handleSaveEdit}
                title="Workspace Configuration"
                actionLabel="Save Settings"
            />

            {/* NUCLEAR PURGE MODAL */}
            <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/60  transition-opacity duration-300 ${isDeleteOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className={`w-full max-w-md bg-surface-main border border-border-strong rounded-xl p-6 shadow-2xl transform transition-all duration-300 ${isDeleteOpen ? 'scale-100' : 'scale-95'}`}>
                    
                    {isPurging ? (
                        <div className="flex flex-col items-center justify-center h-[280px]">
                            <div className="p-4 bg-status-error/10 rounded-xl border border-status-error/20 mb-4 animate-pulse">
                                <Trash2 size={32} className="text-status-error" />
                            </div>
                            <h2 className="text-base font-bold text-text-primary mb-2">Purging Workspace...</h2>
                            <p className="text-sm text-text-secondary text-center max-w-[250px]">
                                Destroying data cluster and flushing core records.
                            </p>
                        </div>
                    ) : (
                        // CONFIRMATION VIEW
                        <>
                            <div className="flex items-center gap-4 text-status-error mb-6">
                                <div className="p-3 bg-status-error/10 rounded-xl border border-status-error/20">
                                    <AlertTriangle size={28} strokeWidth={2} className="animate-pulse" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">Delete Workspace?</h2>
                                    <p className="text-xs font-bold text-status-error/80 uppercase tracking-wide">Cannot be undone</p>
                                </div>
                            </div>
                            
                            <p className="text-sm font-medium text-text-secondary mb-6 leading-relaxed">
                                You are about to permanently delete <span className="text-text-primary font-bold">{targetServer?.name}</span>. 
                                This will gently clear out all of its data, settings, and team connections.
                            </p>

                            <div className="space-y-2 mb-8">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Type workspace name</label>
                                <input autoComplete="off" spellCheck={false} 
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    placeholder={targetServer?.name}
                                    className="w-full bg-surface-alt border border-border-strong rounded-xl p-3 text-sm font-bold text-text-primary outline-none focus:border-status-error focus:ring-1 focus:ring-status-error transition-all"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => { setIsDeleteOpen(false); setDeleteConfirmation(''); }}
                                    className="flex-1 h-12 rounded-xl border border-border-strong text-text-secondary font-bold text-sm hover:bg-surface-alt transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleConfirmDelete}
                                    disabled={deleteConfirmation !== targetServer?.name}
                                    className="flex-1 h-12 rounded-xl bg-status-error hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all"
                                >
                                    Delete Workspace
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
