
import React, { useState } from 'react';
import { Terminal, Shield, Key, Save, RefreshCw, AlertTriangle, Building2 } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { Server } from '../../../../types';
import { nexusGateway } from '../../../../nexus/adapters/DataGateway';
import { sfx } from '../../../../lib/soundService';
import { useSystem } from '../../../../hooks/useSystem';
import { Button } from '../../../ui/Base';

export const CommandDeckTab = () => {
    const { setToast } = useSystem();
    const [servers, setServers] = useState<Server[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingServer, setEditingServer] = useState<string | null>(null);
    const [formData, setFormData] = useState({ id: '', accessKey: '' });

    // Since nexusGateway doesn't have a direct "getAllServers" that is public and reactive in a simple way here, 
    // we'll use a subscription or just access memoryStore if we were internal, but we are external.
    // Let's assume we can get them from the gateway.
    
    React.useEffect(() => {
        const unsub = nexusGateway.subscribe('servers', null, (data) => {
            setServers(data);
        });
        return unsub;
    }, []);

    const handleEdit = (server: Server) => {
        setEditingServer(server.id);
        setFormData({ id: server.id, accessKey: server.accessKey });
        sfx.playClick();
    };

    const handleSave = async (originalId: string) => {
        const confirmed = window.confirm(`⚠️ CRITICAL ACTION ⚠️\n\nAre you sure you want to reconfigure this server?\n\nChanging the Organizational ID will migrate all associated records (Users, Sales, Customers) to the new ID.\n\nProceed?`);
        
        if (!confirmed) return;

        setLoading(true);
        try {
            const success = await nexusGateway.updateServerConfig(originalId, formData.id, formData.accessKey);
            if (success) {
                setToast({ title: 'Command Deck', message: 'Server Reconfiguration Successful', type: 'success' });
                setEditingServer(null);
                sfx.playConfirm();
            } else {
                throw new Error('Update failed');
            }
        } catch {
            setToast({ title: 'System Error', message: 'Reconfiguration Failed', type: 'error' });
            sfx.playError();
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionHeader 
                icon={Terminal} 
                title="Command Deck" 
                sub="Root-Level Infrastructure Management" 
                color="text-red-500" 
            />

            <div className="grid grid-cols-1 gap-6">
                {servers.map((server) => (
                    <div 
                        key={server.id} 
                        className={`p-6 rounded-[2rem] border transition-all duration-500 ${editingServer === server.id ? 'bg-surface-alt/60 border-red-500/30 shadow-2xl shadow-red-500/10' : 'bg-surface-alt/20 border-white/5 hover:border-white/10'}`}
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className={`p-4 rounded-2xl ${editingServer === server.id ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-text-muted'} transition-colors`}>
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-text-primary italic tracking-tight uppercase">
                                        {server.name}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10 text-text-muted tracking-widest">
                                            Region: {server.region}
                                        </span>
                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 tracking-widest">
                                            {server.userCount} Agents
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {editingServer === server.id ? (
                                <div className="flex flex-col md:flex-row items-end md:items-center gap-4 animate-in zoom-in-95 duration-300">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-text-muted ml-1 tracking-widest">Organizational ID</label>
                                        <div className="relative">
                                            <Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
                                            <input 
                                                type="text"
                                                value={formData.id}
                                                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                                className="h-10 pl-10 pr-4 bg-surface-main border border-white/10 rounded-xl text-xs font-bold focus:border-red-500/50 outline-none transition-all w-48"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-text-muted ml-1 tracking-widest">Access Key</label>
                                        <div className="relative">
                                            <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                                            <input 
                                                type="text"
                                                value={formData.accessKey}
                                                onChange={(e) => setFormData({ ...formData, accessKey: e.target.value })}
                                                className="h-10 pl-10 pr-4 bg-surface-main border border-white/10 rounded-xl text-xs font-bold focus:border-amber-500/50 outline-none transition-all w-48"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 pt-4 md:pt-0">
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => setEditingServer(null)}
                                            className="h-10 px-4 text-[10px] font-black uppercase"
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            variant="primary" 
                                            onClick={() => handleSave(server.id)}
                                            isLoading={loading}
                                            className="h-10 px-6 text-[10px] font-black uppercase bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/20"
                                        >
                                            <Save size={14} className="mr-2" /> Deploy
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Button 
                                    variant="ghost" 
                                    onClick={() => handleEdit(server)}
                                    className="h-12 px-6 rounded-2xl border border-white/5 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest group"
                                >
                                    <RefreshCw size={14} className="mr-2 group-hover:rotate-180 transition-transform duration-500" /> 
                                    Configure Node
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem] flex gap-5 items-start">
                <div className="p-3 bg-red-500/20 rounded-2xl text-red-500">
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <h5 className="text-sm font-black text-red-500 uppercase tracking-widest mb-2 italic">Root Protocol Warning</h5>
                    <p className="text-xs text-text-muted leading-relaxed">
                        The Command Deck allows direct manipulation of infrastructure identifiers. 
                        Changing an <span className="text-text-primary font-bold italic">Organizational ID</span> triggers a cascading database migration for all associated tenant data. 
                        This action is non-reversible via standard UI controls.
                    </p>
                </div>
            </div>
        </section>
    );
};
