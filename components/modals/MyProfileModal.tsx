 

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User as UserIcon, Camera, UploadCloud, Shield, Lock, Activity, Trophy, MapPin, Briefcase } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button, Input } from '../ui/Base';
import { fileToBase64 } from '../../views/utils/crmLogic';
import { User } from '../../types';
import { sfx } from '../../lib/soundService';
import { useCRM } from '../../hooks/useCRM';

interface MyProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onUpdateProfile: (updates: Partial<User>) => Promise<void>;
}

type Tab = 'identity' | 'financials' | 'security';

export const MyProfileModal: React.FC<MyProfileModalProps> = ({ isOpen, onClose, user, onUpdateProfile }) => {
    const { sales } = useCRM();
    const [activeTab, setActiveTab] = useState<Tab>('identity');
    
    // Form State
    const [avatar, setAvatar] = useState(user.avatar);
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bankName: user.bankName || '',
        bankAccount: user.bankAccount || '',
        gcash: user.gcash || '',
        password: user.passwordHash || ''
    });
    
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync state when user prop changes
    useEffect(() => {
        setAvatar(user.avatar);
        setFormData({
            name: user.name,
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            bankName: user.bankName || '',
            bankAccount: user.bankAccount || '',
            gcash: user.gcash || '',
            password: user.passwordHash || ''
        });
    }, [user, isOpen]);

    // Calculate Agent Stats
    const stats = useMemo(() => {
        const mySales = sales.filter(s => s.agentId === user.id);
        const approved = mySales.filter(s => s.status === 'Approved');
        const revenue = approved.reduce((acc, s) => acc + Number(s.amount), 0);
        const winRate = mySales.length > 0 ? Math.round((approved.length / mySales.length) * 100) : 0;
        
        return {
            revenue: revenue,
            deals: approved.length,
            winRate: winRate,
            rank: revenue > 50000 ? 'Elite' : revenue > 10000 ? 'Veteran' : 'Operative'
        };
    }, [sales, user.id]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const base64 = await fileToBase64(file);
                setAvatar(base64);
                sfx.playConfirm();
            } catch {
                sfx.playError();
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdateProfile({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                bankName: formData.bankName,
                bankAccount: formData.bankAccount,
                gcash: formData.gcash,
                passwordHash: formData.password, // In a real app, handle password separately
                avatar
            });
            sfx.playSuccess();
            onClose();
        } catch {
            sfx.playError();
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
            <div className="flex flex-col h-full -m-8 relative overflow-hidden">
                
                {/* 1. HERO HEADER WITH BLURRED BACKDROP */}
                <div className="relative h-48 w-full overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-surface-alt">
                        {avatar ? (
                            <img src={avatar} className="w-full h-full object-cover opacity-30 blur-xl scale-110" alt="Background" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-slate-900 opacity-50"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-surface-main via-surface-main/60 to-transparent"></div>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full p-4 flex items-end justify-between z-10">
                        <div className="flex items-end gap-4">
                            {/* Avatar */}
                            <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-28 h-28 rounded-xl overflow-hidden border-4 border-surface-main shadow-2xl bg-surface-alt relative">
                                    {avatar ? (
                                        <img src={avatar} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Profile" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-surface-highlight text-text-muted">
                                            <UserIcon size={48} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-surface-alt flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                                        <Camera className="text-white drop-shadow-md" size={24} />
                                    </div>
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-accent-primary text-white p-1.5 rounded-xl border-4 border-surface-main shadow-lg">
                                    <UploadCloud size={16} />
                                </div>
                                <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>

                            {/* Identity Text */}
                            <div className="mb-2">
                                <h3 className="text-lg font-medium text-text-primary  tracking-tight flex items-center gap-2">
                                    {formData.name || 'Unknown Agent'}
                                    <span className="px-2.5 py-1 rounded text-xs bg-accent-primary/10 text-accent-primary border border-accent-primary/20 tracking-wider">
                                        {stats.rank}
                                    </span>
                                </h3>
                                <p className="text-xs font-bold text-text-muted  tracking-wide flex items-center gap-2">
                                    <Shield size={16} className="text-status-success" /> Clearance Level {user.accessLevel}
                                </p>
                            </div>
                        </div>

                        {/* Stats Summary (Desktop) */}
                        <div className="hidden md:flex gap-4 mb-2">
                            <div className="text-right">
                                <p className="text-xs font-medium  text-text-muted tracking-wide">Revenue</p>
                                <p className="text-xl font-medium text-text-primary num-font tracking-tight">${stats.revenue.toLocaleString()}</p>
                            </div>
                            <div className="w-px h-8 bg-border-subtle"></div>
                            <div className="text-right">
                                <p className="text-xs font-medium  text-text-muted tracking-wide">Win Rate</p>
                                <p className="text-xl font-medium text-status-success num-font tracking-tight">{stats.winRate}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. TAB NAVIGATION */}
                <div className="px-4 border-b border-border-subtle bg-surface-main flex items-center gap-4 shrink-0">
                    <button 
                        onClick={() => setActiveTab('identity')}
                        className={`py-4 text-xs font-bold  tracking-wider border-b-2 transition-all ${activeTab === 'identity' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-muted hover:text-text-primary'}`}
                    >
                        Identity
                    </button>
                    <button 
                        onClick={() => setActiveTab('financials')}
                        className={`py-4 text-xs font-bold  tracking-wider border-b-2 transition-all ${activeTab === 'financials' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-muted hover:text-text-primary'}`}
                    >
                        Financials
                    </button>
                    <button 
                        onClick={() => setActiveTab('security')}
                        className={`py-4 text-xs font-bold  tracking-wider border-b-2 transition-all ${activeTab === 'security' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-muted hover:text-text-primary'}`}
                    >
                        Security
                    </button>
                </div>

                {/* 3. CONTENT AREA */}
                <div className="p-5 flex-1 overflow-y-auto custom-scrollbar bg-surface-alt/20">
                    
                    {activeTab === 'identity' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-medium  text-text-muted tracking-wide flex items-center gap-2 mb-2">
                                        <UserIcon size={16} className="text-accent-primary"/> Personal Details
                                    </h4>
                                    <Input label="Display Name" name="name" value={formData.name} onChange={handleChange} />
                                    {/* Fix: Remove unsupported icon prop */}
                                    <Input label="Email Address" name="email" value={formData.email} onChange={handleChange} />
                                    {/* Fix: Remove unsupported icon prop */}
                                    <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-xs font-medium  text-text-muted tracking-wide flex items-center gap-2 mb-2">
                                        <MapPin size={16} className="text-accent-primary"/> Location
                                    </h4>
                                    <Input label="Physical Address" name="address" value={formData.address} onChange={handleChange} />
                                    
                                    <div className="p-4 bg-surface-main rounded-xl border border-border-subtle mt-6">
                                        <h5 className="text-xs font-bold  text-text-muted tracking-wide mb-3">Performance Snapshot</h5>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-accent-secondary/10 text-accent-secondary rounded-lg"><Trophy size={16}/></div>
                                                <div>
                                                    <p className="text-xs text-text-muted  font-bold">Total Deals</p>
                                                    <p className="text-sm font-medium text-text-primary num-font">{stats.deals}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-500/10 text-status-success rounded-lg"><Activity size={16}/></div>
                                                <div>
                                                    <p className="text-xs text-text-muted  font-bold">Active Rank</p>
                                                    <p className="text-sm font-medium text-text-primary">{stats.rank}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'financials' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl flex items-start gap-3 mb-6">
                                <Briefcase size={18} className="text-blue-500 mt-0.5 shrink-0" />
                                <div>
                                    <h4 className="text-xs font-bold text-blue-500  tracking-wide">Payout Configuration</h4>
                                    <p className="text-xs text-blue-400/80 leading-relaxed mt-1">
                                        Ensure these details are accurate to avoid delays in commission payouts. Data is encrypted at rest.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange} placeholder="e.g. Chase, Wells Fargo" />
                                <Input label="Account Number" name="bankAccount" value={formData.bankAccount} onChange={handleChange} placeholder="************" />
                                <Input label="GCash / Mobile Wallet" name="gcash" value={formData.gcash} onChange={handleChange} placeholder="09XXXXXXXXX" />
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="max-w-md">
                                <h4 className="text-xs font-medium  text-text-muted tracking-wide flex items-center gap-2 mb-4">
                                    <Lock size={16} className="text-accent-primary"/> Account Access
                                </h4>
                                <div className="space-y-4">
                                    <Input label="User ID (Immutable)" value={user.id} disabled className="bg-surface-alt/50 font-mono text-text-muted" />
                                    <Input label="New Password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" />
                                    <p className="text-xs text-text-muted flex items-center gap-1.5 bg-surface-alt p-2 rounded-lg border border-border-subtle">
                                        <Shield size={16} /> Password changes take effect on next login.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* 4. FOOTER ACTIONS */}
                <div className="p-4 border-t border-border-subtle bg-surface-main flex justify-end gap-3 shrink-0">
                    <Button variant="secondary" onClick={onClose} className="h-12 px-4">Cancel</Button>
                    <Button variant="primary" onClick={handleSave} disabled={isSaving} className="h-12 px-8 shadow-lg shadow-accent-primary/20">
                        {isSaving ? 'Saving Profile...' : 'Save Changes'}
                    </Button>
                </div>

            </div>
        </Modal>
    );
};
