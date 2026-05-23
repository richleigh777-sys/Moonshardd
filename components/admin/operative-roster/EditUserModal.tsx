
import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord, Sale } from '../../../types';
import { Modal } from '../../ui/Modal';
import { Button, Input } from '../../ui/Base';
import { Save, User as UserIcon, Lock, Percent, AlertTriangle, Activity, Eye, ShieldAlert, FileText, History } from 'lucide-react';
import { sfx } from '../../../lib/soundService';
import { useAuth } from '../../../hooks/useAuth';
import { AgentTimeSheet } from '../../modals/AgentTimeSheet';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: Partial<User> | null;
    onSave: (user: Partial<User>) => Promise<void>;
    existingIds: string[];
    onGhostLogin?: (userId: string) => void;
    sales?: Sale[];
    attendance?: AttendanceRecord[];
}

type TabType = 'profile' | 'audit' | 'assist';

export const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, onSave, existingIds, onGhostLogin, sales = [], attendance = [] }) => {
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState<Partial<User>>({});
    const [activeTab, setActiveTab] = useState<TabType>('profile');

    const isSuperAdmin = (currentUser?.level || 0) >= 10;
    const maxAssignableLevel = isSuperAdmin ? 9 : 5; 

    useEffect(() => {
        if (isOpen) {
            const timeout = setTimeout(() => setActiveTab('profile'), 0);
            return () => clearTimeout(timeout);
        }
    }, [isOpen]);

    useEffect(() => {
        if (user) {
            const t = setTimeout(() => {
                setFormData(prev => {
                    if (prev.id === user.id && prev.name === user.name && prev.role === user.role) return prev;
                    return { ...user };
                });
            }, 0);
            return () => clearTimeout(t);
        }
    }, [user]);

    const handleRoleChange = (newRole: 'admin' | 'agent') => {
        sfx.playClick();
        setFormData(prev => {
            const next = { ...prev, role: newRole };
            if (newRole === 'admin') {
                const targetLevel = Math.min(5, maxAssignableLevel);
                next.level = targetLevel;
                next.accessLevel = targetLevel;
            } else {
                next.level = 1;
                next.accessLevel = 1;
            }
            return next;
        });
    };

    const handleSubmit = () => {
        const originalLevel = user?.level || user?.accessLevel || 1;
        let finalLevel = formData.level || formData.accessLevel || 1;
        
        if (originalLevel === 10) {
            finalLevel = 10;
        } else {
            finalLevel = Math.min(finalLevel, maxAssignableLevel);
        }

        const finalData = { 
            ...formData, 
            level: finalLevel,
            accessLevel: finalLevel
        };
        
        if (!isSuperAdmin && !finalData.managerId && currentUser) {
            finalData.managerId = currentUser.id;
        }
        
        onSave(finalData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={formData.id ? "Agent Profile & Management" : "Onboard New Unit"} size="xl">
            <div className="flex flex-col h-[70vh] animate-in zoom-in-95 duration-300">
                {/* TABS */}
                {formData.id && (
                    <div className="flex items-center gap-2 border-b border-border-subtle pb-4 mb-6">
                        <button 
                            onClick={() => setActiveTab('profile')} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-[700]  tracking-wider transition-all ${activeTab === 'profile' ? 'bg-surface-main text-text-primary border border-border-subtle shadow-sm' : 'text-text-muted hover:bg-surface-alt'}`}
                        >
                            <UserIcon size={14}/> Unit Profile
                        </button>
                        <button 
                            onClick={() => setActiveTab('audit')} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-[700]  tracking-wider transition-all ${activeTab === 'audit' ? 'bg-surface-main text-text-primary border border-border-subtle shadow-sm' : 'text-text-muted hover:bg-surface-alt'}`}
                        >
                            <History size={14}/> History & Audit
                        </button>
                        <button 
                            onClick={() => setActiveTab('assist')} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-[700]  tracking-wider transition-all ${activeTab === 'assist' ? 'bg-amber-500/10 text-status-warning border border-amber-500/20 shadow-sm' : 'text-text-muted hover:bg-surface-alt'}`}
                        >
                            <Eye size={14}/> Assist Mode
                        </button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {/* PROFILE TAB */}
                    {(activeTab === 'profile' || !formData.id) && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-surface-alt/50 rounded-3xl border border-border-subtle shadow-inner">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-[700]  text-text-muted tracking-widest flex items-center gap-2 mb-2">
                                        <UserIcon size={16} className="text-accent-primary"/> Biological Handle
                                    </h4>
                                    <Input 
                                        label="Unit Name" 
                                        value={formData.name || ''} 
                                        onChange={e => setFormData({...formData, name: e.target.value})} 
                                        placeholder="Full Operative Name"
                                    />
                                    <Input 
                                        label="Sector/Team" 
                                        value={formData.team || ''} 
                                        onChange={e => setFormData({...formData, team: e.target.value})} 
                                        placeholder="e.g. ALPHA, BRAVO"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-xs font-[700]  text-text-muted tracking-widest flex items-center gap-2 mb-2">
                                        <Lock size={16} className="text-status-warning"/> System Credentials
                                    </h4>
                                    <Input 
                                        label="System ID (Static)" 
                                        value={formData.id || ''} 
                                        disabled={existingIds.includes(formData.id || '') && !!user?.id}
                                        onChange={e => setFormData({...formData, id: e.target.value})} 
                                        placeholder="UID_0000"
                                        className="font-mono bg-surface-main"
                                    />
                                    <Input 
                                        label="Access Key" 
                                        type="password"
                                        value={formData.pass || ''} 
                                        onChange={e => setFormData({...formData, pass: e.target.value})} 
                                        placeholder="Secure Cipher"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-[700] text-text-muted  tracking-widest ml-1 flex justify-between">
                                            <span>Role Assignment</span>
                                            <span className={formData.role === 'admin' ? 'text-accent-secondary' : 'text-slate-500'}>
                                                {formData.role === 'admin' ? 'Director Privileges' : 'Operative Level'}
                                            </span>
                                        </label>
                                        <div className="grid grid-cols-2 gap-2 bg-surface-alt p-1 rounded-2xl border border-border-subtle">
                                            <button 
                                                onClick={() => handleRoleChange('agent')}
                                                className={`py-2 text-xs font-[700]  rounded-xl transition-all ${formData.role === 'agent' ? 'bg-surface-main text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                                            >
                                                Agent
                                            </button>
                                            <button 
                                                onClick={() => handleRoleChange('admin')}
                                                className={`py-2 text-xs font-[700]  rounded-xl transition-all ${formData.role === 'admin' ? 'bg-indigo-500 text-white shadow-lg' : 'text-text-muted hover:text-text-primary'}`}
                                            >
                                                Admin
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-[700] text-text-muted  tracking-widest ml-1 flex justify-between">
                                            <span>Access Clearance</span>
                                            <span className={(formData.level || formData.accessLevel) === 10 ? 'text-status-warning animate-pulse' : 'text-accent-primary'}>
                                                Level {formData.level || formData.accessLevel} {(formData.level || formData.accessLevel) === 10 ? '(GOD MODE)' : ''}
                                            </span>
                                        </label>
                                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                            type="range" min="1" max={maxAssignableLevel} step="1" 
                                            value={formData.level || formData.accessLevel || 1} 
                                            onChange={e => {
                                                const val = parseInt(e.target.value);
                                                setFormData({...formData, level: val, accessLevel: val});
                                            }}
                                            className="w-full h-2 bg-surface-alt rounded-lg appearance-none cursor-pointer accent-accent-primary"
                                        />
                                        <div className="flex justify-between text-sm font-bold text-text-muted  px-1">
                                            <span>Operative (1)</span>
                                            <span>{isSuperAdmin ? 'Director (9)' : 'Manager (5)'}</span>
                                        </div>
                                        {!isSuperAdmin && (
                                            <div className="text-xs text-status-warning flex items-center gap-1.5 mt-2 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                                                <AlertTriangle size={16} /> 
                                                <span className="font-bold">Clearance capped by your rank.</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-[700] text-text-muted  tracking-widest ml-1 flex justify-between">
                                                <span>Yield Commission</span>
                                                <span className="text-status-success">{formData.commissionRate || 15}% Override</span>
                                            </label>
                                            <div className="relative group">
                                                <Percent size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-status-success" />
                                                <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                                    type="number" 
                                                    value={formData.commissionRate || 15} 
                                                    onChange={e => setFormData({...formData, commissionRate: parseInt(e.target.value)})}
                                                    className="w-full bg-surface-alt border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm font-[700] num-font outline-none focus:border-emerald-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-[700] text-text-muted  tracking-widest ml-1">Daily Target ($)</label>
                                                <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                                    type="number" 
                                                    value={formData.dailyQuota || ''} 
                                                    placeholder="Auto"
                                                    onChange={e => setFormData({...formData, dailyQuota: parseInt(e.target.value) || undefined})}
                                                    className="w-full bg-surface-alt border border-border-subtle rounded-xl py-2 px-3 text-sm font-[700] num-font outline-none focus:border-emerald-500 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-[700] text-text-muted  tracking-widest ml-1">Monthly Target ($)</label>
                                                <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                                    type="number" 
                                                    value={formData.monthlyQuota || ''} 
                                                    placeholder="Auto"
                                                    onChange={e => setFormData({...formData, monthlyQuota: parseInt(e.target.value) || undefined})}
                                                    className="w-full bg-surface-alt border border-border-subtle rounded-xl py-2 px-3 text-sm font-[700] num-font outline-none focus:border-emerald-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-surface-alt/30 rounded-2xl border border-border-subtle group hover:border-accent-primary/30 transition-all cursor-pointer" onClick={() => setFormData({...formData, active: !formData.active})}>
                                        <div>
                                            <p className="text-xs font-[700] text-text-primary  tracking-wider">System Authorization</p>
                                            <p className="text-xs text-text-muted font-bold mt-0.5">Allow login and dashboard access</p>
                                        </div>
                                        <div className={`relative w-12 h-6 rounded-full transition-all duration-500 ${formData.active ? 'bg-emerald-500' : 'bg-surface-main border border-border-subtle'}`}>
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${formData.active ? 'right-1' : 'left-1 bg-text-muted'}`}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AUDIT TAB */}
                    {activeTab === 'audit' && formData.id && (
                        <div className="space-y-6">
                            <div className="bg-surface-alt p-6 rounded-3xl border border-border-subtle mb-4">
                                <h3 className="text-sm font-[700] text-white  tracking-widest flex items-center gap-2 mb-4">
                                    <ShieldAlert size={16} className="text-status-warning" />
                                    Security & Activity Audit
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 bg-surface-main rounded-2xl border border-border-subtle">
                                        <div className="text-[10px] text-text-muted  font-[700] tracking-widest mb-1">Status</div>
                                        <div className={`text-sm font-bold  ${formData.currentStatus === 'online' ? 'text-status-success' : 'text-text-muted'}`}>
                                            {formData.currentStatus || 'Offline'}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-surface-main rounded-2xl border border-border-subtle">
                                        <div className="text-[10px] text-text-muted  font-[700] tracking-widest mb-1">Lifetime Deals</div>
                                        <div className="text-sm font-bold font-mono text-status-success">
                                            {sales.filter(s => s.agentId === formData.id).length}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-surface-main rounded-2xl border border-border-subtle">
                                        <div className="text-[10px] text-text-muted  font-[700] tracking-widest mb-1">Last Active</div>
                                        <div className="text-sm font-bold font-mono text-text-primary">
                                            {formData.lastActive ? new Date(formData.lastActive).toLocaleTimeString() : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-surface-main rounded-3xl border border-border-subtle p-6 min-h-[300px]">
                                <h4 className="text-xs font-[700] text-text-muted  tracking-widest mb-4">Historical Record (Read-Only)</h4>
                                <div className="h-[400px]">
                                    {/* We reuse the core logic but visually embed it or show raw stats */}
                                    <AgentTimeSheet
                                        isOpen={true} // Embedded
                                        onClose={() => {}}
                                        currentUser={formData as User}
                                        attendance={attendance}
                                        sales={sales}
                                        embedded={true}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ASSIST MODE TAB */}
                    {activeTab === 'assist' && formData.id && (
                        <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh]">
                            <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center border-4 border-amber-500/20 mb-6">
                                <Eye size={48} className="text-status-warning" />
                            </div>
                            <h3 className="text-2xl font-[700] text-white  tracking-widest mb-2">Shadow Operative</h3>
                            <p className="text-sm text-text-muted max-w-md mx-auto mb-8">
                                Assist Mode allows you to temporarily assume direct control of {formData.name}'s console. You will see their active pipeline, leads, and interface identically to them. Actions taken are logged under this user.
                            </p>
                            <Button 
                                onClick={() => onGhostLogin?.(formData.id!)} 
                                className="h-14 px-8 text-sm font-[700]  tracking-[0.2em] bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_20px_rgba(217,119,6,0.4)]"
                            >
                                Initiate Assist Session
                            </Button>
                        </div>
                    )}
                </div>

                {/* ACTIONS */}
                {activeTab === 'profile' && (
                    <div className="pt-6 mt-4 border-t border-border-subtle flex flex-col sm:flex-row gap-4 shrink-0">
                        <Button variant="secondary" onClick={onClose} className="flex-1 h-14 text-xs font-[700]  tracking-[0.2em]">Abort Sync</Button>
                        <Button onClick={handleSubmit} variant="primary" className="flex-[2] h-14 text-xs font-[700]  tracking-[0.3em] shadow-lg shadow-accent-primary/20 bg-gradient-to-r from-accent-primary to-indigo-600 border border-border-subtle relative overflow-hidden group">
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                                <Save size={18} className="mr-3 group-hover:rotate-12 transition-transform" /> Commit Unit Profile
                        </Button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

