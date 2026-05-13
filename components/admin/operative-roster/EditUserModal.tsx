
import React, { useState, useEffect } from 'react';
import { User } from '../../../types';
import { Modal } from '../../ui/Modal';
import { Button, Input } from '../../ui/Base';
import { Save, User as UserIcon, Lock, Percent, AlertTriangle } from 'lucide-react';
import { sfx } from '../../../lib/soundService';
import { useAuth } from '../../../hooks/useAuth';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: Partial<User> | null;
    onSave: (user: Partial<User>) => Promise<void>;
    existingIds: string[];
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, onSave, existingIds }) => {
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState<Partial<User>>({});

    const isSuperAdmin = (currentUser?.level || 0) >= 10;
    const maxAssignableLevel = isSuperAdmin ? 10 : 5; // Managers can only create up to Level 5

    useEffect(() => {
        if (user) {
            const t = setTimeout(() => {
                setFormData(prev => {
                    // Prevent update if ID matches to avoid loops if user object reference changes but content is same
                    if (prev.id === user.id && prev.name === user.name && prev.role === user.role) return prev;
                    return { ...user };
                });
            }, 0);
            return () => clearTimeout(t);
        }
    }, [user, isOpen]);

    const handleRoleChange = (newRole: 'admin' | 'agent') => {
        sfx.playClick();
        setFormData(prev => {
            const next = { ...prev, role: newRole };
            // Auto-adjust level logic
            if (newRole === 'admin') {
                // If current is Agent, bump to 5, but cap at user's max allowance
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
        // Final safety check
        const finalLevel = Math.min(formData.level || formData.accessLevel || 1, maxAssignableLevel);
        const finalData = { 
            ...formData, 
            level: finalLevel,
            accessLevel: finalLevel
        };
        onSave(finalData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={formData.id ? "Update Unit Profile" : "Onboard New Unit"} size="lg">
            <div className="space-y-8 animate-in zoom-in-95 duration-300">
                
                {/* 1. Identity Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-surface-alt/50 rounded-3xl border border-border-subtle shadow-inner">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase text-text-muted tracking-widest flex items-center gap-2 mb-2">
                            <UserIcon size={12} className="text-accent-primary"/> Biological Handle
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
                        <h4 className="text-[10px] font-black uppercase text-text-muted tracking-widest flex items-center gap-2 mb-2">
                            <Lock size={12} className="text-amber-500"/> System Credentials
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

                {/* 2. Role & Clearance Control */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 flex justify-between">
                                <span>Role Assignment</span>
                                <span className={formData.role === 'admin' ? 'text-indigo-500' : 'text-slate-500'}>
                                    {formData.role === 'admin' ? 'Director Privileges' : 'Operative Level'}
                                </span>
                            </label>
                            <div className="grid grid-cols-2 gap-2 bg-surface-alt p-1 rounded-2xl border border-border-subtle">
                                <button 
                                    onClick={() => handleRoleChange('agent')}
                                    className={`py-2 text-[10px] font-black uppercase rounded-xl transition-all ${formData.role === 'agent' ? 'bg-surface-main text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                                >
                                    Agent
                                </button>
                                <button 
                                    onClick={() => handleRoleChange('admin')}
                                    className={`py-2 text-[10px] font-black uppercase rounded-xl transition-all ${formData.role === 'admin' ? 'bg-indigo-500 text-white shadow-lg' : 'text-text-muted hover:text-text-primary'}`}
                                >
                                    Admin
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 flex justify-between">
                                <span>Access Clearance</span>
                                <span className={(formData.level || formData.accessLevel) === 10 ? 'text-amber-500 animate-pulse' : 'text-accent-primary'}>
                                    Level {formData.level || formData.accessLevel} {(formData.level || formData.accessLevel) === 10 ? '(GOD MODE)' : ''}
                                </span>
                            </label>
                            <input 
                                type="range" min="1" max={maxAssignableLevel} step="1" 
                                value={formData.level || formData.accessLevel || 1} 
                                onChange={e => {
                                    const val = parseInt(e.target.value);
                                    setFormData({...formData, level: val, accessLevel: val});
                                }}
                                className="w-full h-2 bg-surface-alt rounded-lg appearance-none cursor-pointer accent-accent-primary"
                            />
                            <div className="flex justify-between text-[8px] font-bold text-text-muted uppercase px-1">
                                <span>Operative (1)</span>
                                <span>{isSuperAdmin ? 'Director (10)' : 'Manager (5)'}</span>
                            </div>
                            {!isSuperAdmin && (
                                <div className="text-[9px] text-amber-500 flex items-center gap-1.5 mt-2 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                                    <AlertTriangle size={10} /> 
                                    <span className="font-bold">Clearance capped by your rank.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 flex justify-between">
                                <span>Yield Commission</span>
                                <span className="text-emerald-500">{formData.commissionRate}% Override</span>
                            </label>
                            <div className="relative group">
                                <Percent size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                                <input 
                                    type="number" 
                                    value={formData.commissionRate || 15} 
                                    onChange={e => setFormData({...formData, commissionRate: parseInt(e.target.value)})}
                                    className="w-full bg-surface-alt border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm font-black num-font outline-none focus:border-emerald-500 transition-all"
                                />
                            </div>
                            <p className="text-[8px] text-text-muted font-bold uppercase italic ml-1">Standard rate: 15%</p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-surface-alt/30 rounded-2xl border border-border-subtle group hover:border-accent-primary/30 transition-all cursor-pointer" onClick={() => setFormData({...formData, active: !formData.active})}>
                            <div>
                                <p className="text-[10px] font-black text-text-primary uppercase tracking-wider">System Authorization</p>
                                <p className="text-[9px] text-text-muted font-bold mt-0.5">Allow login and dashboard access</p>
                            </div>
                            <div className={`relative w-12 h-6 rounded-full transition-all duration-500 ${formData.active ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${formData.active ? 'right-1' : 'left-1'}`}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="pt-6 border-t border-border-subtle flex flex-col sm:flex-row gap-4">
                    <Button variant="secondary" onClick={onClose} className="flex-1 h-14 text-xs font-black uppercase tracking-[0.2em]">Abort Sync</Button>
                    <Button onClick={handleSubmit} variant="primary" className="flex-[2] h-14 text-xs font-black uppercase tracking-[0.3em] shadow-lg shadow-accent-primary/20 bg-gradient-to-r from-accent-primary to-indigo-600 border border-white/10 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                            <Save size={18} className="mr-3 group-hover:rotate-12 transition-transform" /> Commit Unit Configuration
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
