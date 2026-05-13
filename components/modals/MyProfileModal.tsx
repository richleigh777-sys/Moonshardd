
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
        password: user.pass || ''
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
            password: user.pass || ''
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
                pass: formData.password, // In a real app, handle password separately
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

                    <div className="absolute bottom-0 left-0 w-full p-6 flex items-end justify-between z-10">
                        <div className="flex items-end gap-6">
                            {/* Avatar */}
                            <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-surface-main shadow-2xl bg-surface-alt relative">
                                    {avatar ? (
                                        <img src={avatar} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Profile" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-surface-highlight text-text-muted">
                                            <UserIcon size={48} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                                        <Camera className="text-white drop-shadow-md" size={24} />
                                    </div>
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-accent-primary text-white p-1.5 rounded-xl border-4 border-surface-main shadow-lg">
                                    <UploadCloud size={14} />
                                </div>
                                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>

                            {/* Identity Text */}
                            <div className="mb-2">
                                <h3 className="text-2xl font-black text-text-primary uppercase tracking-tight flex items-center gap-2">
                                    {formData.name || 'Unknown Agent'}
                                    <span className="px-2 py-0.5 rounded text-[10px] bg-accent-primary/10 text-accent-primary border border-accent-primary/20 tracking-wider">
                                        {stats.rank}
                                    </span>
                                </h3>
                                <p className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                                    <Shield size={12} className="text-emerald-500" /> Clearance Level {user.accessLevel}
                                </p>
                            </div>
                        </div>

                        {/* Stats Summary (Desktop) */}
                        <div className="hidden md:flex gap-4 mb-2">
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase text-text-muted tracking-widest">Revenue</p>
                                <p className="text-xl font-black text-text-primary num-font tracking-tight">${stats.revenue.toLocaleString()}</p>
                            </div>
                            <div className="w-px h-8 bg-border-subtle"></div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase text-text-muted tracking-widest">Win Rate</p>
                                <p className="text-xl font-black text-emerald-500 num-font tracking-tight">{stats.winRate}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. TAB NAVIGATION */}
                <div className="px-6 border-b border-border-subtle bg-surface-main flex items-center gap-6 shrink-0">
                    <button 
                        onClick={() => setActiveTab('identity')}
                        className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'identity' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-muted hover:text-text-primary'}`}
                    >
                        Identity
                    </button>
                    <button 
                        onClick={() => setActiveTab('financials')}
                        className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'financials' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-muted hover:text-text-primary'}`}
                    >
                        Financials
                    </button>
                    <button 
                        onClick={() => setActiveTab('security')}
                        className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'security' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-muted hover:text-text-primary'}`}
                    >
                        Security
                    </button>
                </div>

                {/* 3. CONTENT AREA */}
                <div className="p-8 flex-1 overflow-y-auto custom-scrollbar bg-surface-alt/20">
                    
                    {activeTab === 'identity' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase text-text-muted tracking-widest flex items-center gap-2 mb-2">
                                        <UserIcon size={14} className="text-accent-primary"/> Personal Details
                                    </h4>
                                    <Input label="Display Name" name="name" value={formData.name} onChange={handleChange} />
                                    {/* Fix: Remove unsupported icon prop */}
                                    <Input label="Email Address" name="email" value={formData.email} onChange={handleChange} />
                                    {/* Fix: Remove unsupported icon prop */}
                                    <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase text-text-muted tracking-widest flex items-center gap-2 mb-2">
                                        <MapPin size={14} className="text-accent-primary"/> Location
                                    </h4>
                                    <Input label="Physical Address" name="address" value={formData.address} onChange={handleChange} />
                                    
                                    <div className="p-4 bg-surface-main rounded-2xl border border-border-subtle mt-6">
                                        <h5 className="text-[10px] font-bold uppercase text-text-muted tracking-widest mb-3">Performance Snapshot</h5>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg"><Trophy size={16}/></div>
                                                <div>
                                                    <p className="text-[9px] text-text-muted uppercase font-bold">Total Deals</p>
                                                    <p className="text-sm font-black text-text-primary num-font">{stats.deals}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><Activity size={16}/></div>
                                                <div>
                                                    <p className="text-[9px] text-text-muted uppercase font-bold">Active Rank</p>
                                                    <p className="text-sm font-black text-text-primary">{stats.rank}</p>
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
                            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-start gap-3 mb-6">
                                <Briefcase size={18} className="text-blue-500 mt-0.5 shrink-0" />
                                <div>
                                    <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wide">Payout Configuration</h4>
                                    <p className="text-[10px] text-blue-400/80 leading-relaxed mt-1">
                                        Ensure these details are accurate to avoid delays in commission payouts. Data is encrypted at rest.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange} placeholder="e.g. Chase, Wells Fargo" />
                                <Input label="Account Number" name="bankAccount" value={formData.bankAccount} onChange={handleChange} placeholder="************" />
                                <Input label="GCash / Mobile Wallet" name="gcash" value={formData.gcash} onChange={handleChange} placeholder="09XXXXXXXXX" />
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="max-w-md">
                                <h4 className="text-xs font-black uppercase text-text-muted tracking-widest flex items-center gap-2 mb-4">
                                    <Lock size={14} className="text-accent-primary"/> Account Access
                                </h4>
                                <div className="space-y-4">
                                    <Input label="User ID (Immutable)" value={user.id} disabled className="bg-surface-alt/50 font-mono text-text-muted" />
                                    <Input label="New Password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" />
                                    <p className="text-[10px] text-text-muted flex items-center gap-1.5 bg-surface-alt p-2 rounded-lg border border-border-subtle">
                                        <Shield size={10} /> Password changes take effect on next login.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* 4. FOOTER ACTIONS */}
                <div className="p-6 border-t border-border-subtle bg-surface-main flex justify-end gap-3 shrink-0">
                    <Button variant="secondary" onClick={onClose} className="h-12 px-6">Cancel</Button>
                    <Button variant="primary" onClick={handleSave} disabled={isSaving} className="h-12 px-8 shadow-lg shadow-accent-primary/20">
                        {isSaving ? 'Saving Profile...' : 'Save Changes'}
                    </Button>
                </div>

            </div>
        </Modal>
    );
};
