import React, { useMemo, useState, useEffect } from 'react';
import { User, Phone, Mail, Calendar, Activity, RefreshCw, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { FormInput, FormLabel } from '../shared/FormComponents';
import { useSystem } from '../../../../hooks/useSystem';
import { useCRM } from '../../../../hooks/useCRM';
import { getTimeInfoForPhone } from '../../../../utils/phoneUtils';

interface Props {
    formData: any;
    handleIdentityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDobChange: (val: string) => void;
    handleAgeChange: (val: string) => void;
    autoFillFromCustomer: (customer: any) => void;
}

export const BiographicalSector: React.FC<Props> = ({ formData, handleIdentityChange, handleDobChange, handleAgeChange, autoFillFromCustomer }) => {
    const { initiateCall } = useSystem();
    const { systemConfig, customers, sales } = useCRM();
    const [timeInfo, setTimeInfo] = useState<{time: string, cityState: string} | null>(null);

    useEffect(() => {
        const updateTimer = () => {
             setTimeInfo(getTimeInfoForPhone(formData.phone));
        };
        updateTimer();
        const interval = setInterval(updateTimer, 60000); // update every minute
        return () => clearInterval(interval);
    }, [formData.phone]);

    const matchedCustomer = useMemo(() => {

        const cleanPhone = formData.phone?.replace(/\D/g, '');
        if (cleanPhone?.length >= 10) {
            return customers.find(c => c.phone?.replace(/\D/g, '') === cleanPhone);
        }
        return null;
    }, [formData.phone, customers]);

    const recentPurchase = useMemo(() => {
        if (!matchedCustomer) return null;
        const recentDateLimit = Date.now() - (14 * 24 * 60 * 60 * 1000); // 14 days
        return sales.find(s => 
            s.phone?.replace(/\D/g, '') === matchedCustomer.phone?.replace(/\D/g, '') &&
            s.timestamp > recentDateLimit
        );
    }, [matchedCustomer, sales]);

    const handlePhonePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pastedText = e.clipboardData.getData('text');
        const cleanPhone = pastedText.replace(/\D/g, '');
        if (cleanPhone.length >= 10) {
            const customer = customers.find(c => c.phone?.replace(/\D/g, '') === cleanPhone);
            if (customer) {
                // We use setTimeout to ensure it happens after the paste event's default onChange
                setTimeout(() => {
                    autoFillFromCustomer({ 
                        ...customer, 
                        firstName: customer.firstName || (customer.name || '').split(' ')[0], 
                        lastName: customer.lastName || (customer.name || '').split(' ').slice(1).join(' '),
                        phone: cleanPhone // ensure it populates
                    });
                }, 10);
            }
        }
    };

    return (
        <div className="space-y-4">
            {recentPurchase && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl flex items-start gap-2 animate-in slide-in-from-top-2">
                    <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                    <div>
                        <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">Duplicate Order Warning</p>
                        <p className="text-[10px] text-amber-500/80 mt-0.5 font-medium">Customer purchased a package {Math.floor((Date.now() - recentPurchase.timestamp) / (24 * 60 * 60 * 1000))} days ago. Verify intentional reorder.</p>
                    </div>
                </div>
            )}
            
            {matchedCustomer && (
                <div className="bg-indigo-500/10 border border-indigo-500/30 p-3 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                            <User size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] text-indigo-300/70 font-black tracking-widest uppercase mb-0.5">CRM Record Found</p>
                            <p className="text-sm font-bold text-indigo-300">{matchedCustomer.fullName || matchedCustomer.name}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => autoFillFromCustomer({ ...matchedCustomer, firstName: matchedCustomer.firstName || (matchedCustomer.name || '').split(' ')[0], lastName: matchedCustomer.lastName || (matchedCustomer.name || '').split(' ').slice(1).join(' ') })}
                        className="flex items-center justify-center gap-1.5 bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg transition-transform active:scale-95 font-bold shadow-md shadow-indigo-500/20 w-full md:w-auto"
                    >
                        <RefreshCw size={12} />
                        Auto-Fill
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-6 relative">
                    <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10 pointer-events-none flex items-center gap-1"><User size={10}/> First Name</div>
                    <input 
                        name="firstName" 
                        value={formData.firstName || ''} 
                        onChange={(e) => {
                            const val = e.target.value;
                            e.target.value = val.charAt(0).toUpperCase() + val.slice(1);
                            handleIdentityChange(e);
                        }} 
                        placeholder="John" 
                        className={`w-full bg-surface-alt border rounded-lg px-3 pt-6 pb-2 text-sm outline-none transition-all font-medium ${formData.firstName?.length >= 2 ? 'border-status-success/50 focus:border-status-success text-status-success' : 'border-border-strong focus:border-accent-primary text-text-primary'}`}
                        autoComplete="given-name"
                    />
                    {formData.firstName?.length >= 2 && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-status-success"><CheckCircle size={14}/></div>}
                </div>

                <div className="md:col-span-6 relative">
                    <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10 pointer-events-none flex items-center gap-1"><User size={10}/> Last Name</div>
                    <input 
                        name="lastName" 
                        value={formData.lastName || ''} 
                        onChange={(e) => {
                            const val = e.target.value;
                            e.target.value = val.charAt(0).toUpperCase() + val.slice(1);
                            handleIdentityChange(e);
                        }} 
                        placeholder="Doe" 
                        className={`w-full bg-surface-alt border rounded-lg px-3 pt-6 pb-2 text-sm outline-none transition-all font-medium ${formData.lastName?.length >= 2 ? 'border-status-success/50 focus:border-status-success text-status-success' : 'border-border-strong focus:border-accent-primary text-text-primary'}`}
                        autoComplete="family-name"
                    />
                    {formData.lastName?.length >= 2 && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-status-success"><CheckCircle size={14}/></div>}
                </div>

                <div className="md:col-span-12 relative flex">
                    <div className="flex-1 relative flex">
                        <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10 pointer-events-none flex items-center gap-1">
                            <Mail size={10}/> Email Address
                        </div>
                        <input 
                            name="email" 
                            type="email"
                            value={formData.email || ''} 
                            onChange={handleIdentityChange} 
                            placeholder="john.doe@example.com"
                            className={`w-full bg-surface-alt border rounded-lg px-3 pt-6 pb-2 text-sm outline-none transition-all font-medium ${formData.email?.includes('@') ? 'border-status-success/50 focus:border-status-success' : 'border-border-strong focus:border-accent-primary text-text-primary'}`}
                            autoComplete="email"
                        />
                    </div>
                </div>

                <div className="md:col-span-8 relative">
                    <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10 pointer-events-none flex items-center justify-between w-[calc(100%-24px)]">
                        <div className="flex items-center gap-1"><Phone size={10}/> Phone Number</div>
                        {timeInfo && (
                            <div className="flex items-center gap-1 text-[8px] font-bold text-accent-primary bg-accent-primary/10 px-1.5 py-0.5 rounded animate-in fade-in">
                                <Clock size={8} /> {timeInfo.time} <span className="opacity-60 hidden sm:inline">{timeInfo.cityState}</span>
                            </div>
                        )}
                    </div>
                    <input 
                        name="phone" 
                        value={formData.phone || ''} 
                        onChange={(e) => {
                            // Smart format 000-000-0000 -> (000) 000-0000
                            let val = e.target.value.replace(/\D/g, '');
                            if (val.length > 0) {
                                if (val.length <= 3) val = `(${val}`;
                                else if (val.length <= 6) val = `(${val.slice(0,3)}) ${val.slice(3)}`;
                                else val = `(${val.slice(0,3)}) ${val.slice(3,6)}-${val.slice(6,10)}`;
                            }
                            e.target.value = val;
                            handleIdentityChange(e);
                        }} 
                        onPaste={handlePhonePaste}
                        placeholder="(000) 000-0000" 
                        maxLength={14}
                        className={`w-full bg-surface-alt border rounded-lg px-3 pt-6 pb-2 text-sm outline-none transition-all font-mono font-bold tracking-tight ${formData.phone?.replace(/\D/g, '').length === 10 ? 'border-status-success/50 focus:border-status-success text-status-success' : 'border-border-strong focus:border-accent-primary text-text-primary'}`}
                        autoComplete="tel"
                    />
                    {systemConfig.telephonyEnabled && formData.phone?.length >= 10 && (
                        <button 
                            onClick={() => initiateCall(formData.phone)}
                            className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-emerald-500/10 text-emerald-500 font-bold text-[10px] tracking-widest rounded-md border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-colors"
                        >
                            DIAL
                        </button>
                    )}
                </div>

                <div className="md:col-span-4 relative group">
                    <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10 pointer-events-none flex items-center gap-1 transition-colors group-focus-within:text-accent-primary">
                        <Calendar size={10}/> Date of Birth
                    </div>
                    <input 
                        type="date" 
                        name="dob" 
                        value={formData.dob || ''} 
                        onChange={(e) => handleDobChange(e.target.value)} 
                        className={`w-full bg-surface-alt border rounded-lg px-3 pt-6 pb-2 text-sm outline-none transition-all font-mono font-bold cursor-pointer ${formData.dob ? 'border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.1)] text-text-primary' : 'border-border-strong text-text-muted/60'}`}
                        autoComplete="bday"
                    />
                    {formData.dob && (
                        <div className="absolute top-2 right-2 text-[9px] font-black tracking-widest text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-sm border border-indigo-500/20">
                            VERIFIED
                        </div>
                    )}
                </div>

                <div className="md:col-span-4 relative">
                    <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10 pointer-events-none flex items-center gap-1"><Activity size={10}/> Age (Smart)</div>
                    <input 
                        name="age" 
                        value={formData.age || ''} 
                        onChange={(e) => handleAgeChange(e.target.value)} 
                        className={`w-full bg-surface-alt border rounded-lg px-3 pt-6 pb-2 text-sm outline-none transition-all font-black text-center ${formData.age ? (parseInt(formData.age) < 18 ? 'border-status-warning/50 text-status-warning' : 'border-indigo-500/50 text-indigo-400') : 'border-border-strong text-text-primary'}`}
                        placeholder="--" 
                    />
                    {formData.age && parseInt(formData.age) < 18 && (
                        <div className="absolute -bottom-5 left-0 text-[9px] font-bold text-status-warning flex items-center gap-1">
                            <AlertTriangle size={10}/> Underage
                        </div>
                    )}
                </div>

                <div className="md:col-span-4 relative">
                    <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10 pointer-events-none flex items-center gap-1"><Activity size={10}/> Height</div>
                    <select
                        name="height"
                        value={formData.height || ''}
                        onChange={(e) => handleIdentityChange(e as any)}
                        className={`w-full bg-surface-alt border rounded-lg px-3 pt-6 pb-2 text-sm outline-none transition-all font-bold cursor-pointer appearance-none ${formData.height ? 'border-status-success/50 focus:border-status-success text-status-success' : 'border-border-strong focus:border-accent-primary text-text-primary'} bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.2em_1.2em] bg-no-repeat bg-[currentColor]`}
                        style={{ backgroundPosition: 'right 0.75rem center' }}
                    >
                        <option value="" className="text-text-muted/40">Select Height</option>
                        {Array.from({ length: 42 }).map((_, i) => {
                            const feet = Math.floor((i + 48) / 12);
                            const inches = (i + 48) % 12;
                            const val = `${feet}'${inches}"`;
                            return <option key={val} value={val}>{val}</option>;
                        })}
                    </select>
                </div>

                <div className="md:col-span-4 relative">
                    <div className="absolute top-2 left-3 text-[9px] font-black tracking-widest text-text-muted uppercase z-10 pointer-events-none flex items-center gap-1"><Activity size={10}/> Weight (lbs)</div>
                    <input 
                        name="weight" 
                        type="text"
                        value={formData.weight || ''} 
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            e.target.value = val;
                            handleIdentityChange(e as any);
                        }}
                        className={`w-full bg-surface-alt border rounded-lg px-3 pt-6 pb-2 text-sm outline-none transition-all font-mono font-bold text-center ${formData.weight ? 'border-status-success/50 focus:border-status-success text-status-success' : 'border-border-strong focus:border-accent-primary text-text-primary'}`}
                        placeholder="--"
                        maxLength={3}
                    />
                </div>
            </div>
        </div>
    );
};