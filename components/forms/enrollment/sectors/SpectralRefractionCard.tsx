import React, { useMemo } from 'react';
import { Wifi, EyeOff, Eye, Fingerprint, ShieldCheck } from 'lucide-react';

interface Props {
    financials: any;
    cardStatus: 'neutral' | 'valid' | 'invalid';
    handleCardInput: (val: string) => void;
    setFinancials: (data: any) => void;
    formatExpiry: (val: string) => string;
    cardHolderName?: string;
    showNumbers: boolean;
    setShowNumbers: (val: boolean) => void;
}

export const SpectralRefractionCard: React.FC<Props> = ({ 
    financials, cardStatus, handleCardInput, setFinancials, 
    formatExpiry, cardHolderName, showNumbers, setShowNumbers 
}) => {
    
    const spectralMeta = useMemo(() => {
        const clean = financials.cardNumber.replace(/\D/g, '');
        if (clean.startsWith('4')) return { scheme: 'VISA', color: 'from-blue-900 to-indigo-950', border: 'border-blue-400/30' };
        if (clean.startsWith('5')) return { scheme: 'MASTERCARD', color: 'from-slate-900 via-orange-900/40 to-slate-900', border: 'border-orange-400/30' };
        if (clean.startsWith('3')) return { scheme: 'AMEX', color: 'from-emerald-900 to-cyan-950', border: 'border-emerald-400/30' };
        if (clean.startsWith('6')) return { scheme: 'DISCOVER', color: 'from-purple-900 to-pink-950', border: 'border-purple-400/30' };
        return { scheme: 'SECURE', color: 'from-gray-900 to-black', border: 'border-white/10' };
    }, [financials.cardNumber]);

    return (
        <div className="relative group perspective-1000 w-full max-w-md mx-auto">
            {/* Ambient Glow */}
            <div className={`absolute -inset-0.5 rounded-[1.7rem] bg-gradient-to-r ${spectralMeta.color} blur-xl opacity-40 transition-all duration-1000 group-hover:opacity-60`}></div>
            
            <div className={`
                relative w-full aspect-[1.586/1] rounded-[1.5rem] p-6 flex flex-col justify-between overflow-hidden transition-all duration-700
                bg-gradient-to-br ${spectralMeta.color} border ${spectralMeta.border} shadow-2xl backdrop-blur-3xl
                group-hover:scale-[1.02] group-hover:-translate-y-1
            `}>
                
                {/* Texture Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0,rgba(255,255,255,0.1),transparent_70%)] pointer-events-none"></div>
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.03)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.03)_50%,rgba(255,255,255,0.03)_75%,transparent_75%,transparent)] bg-[size:4px_4px] opacity-20 pointer-events-none"></div>

                {/* Header Row: Chip & Contactless */}
                <div className="flex justify-between items-start relative z-10">
                    <div className="flex flex-col gap-4">
                        {/* EMV Chip Simulation */}
                        <div className="w-11 h-8 rounded-md bg-gradient-to-tr from-amber-200 via-yellow-400 to-amber-600 shadow-md relative overflow-hidden border border-yellow-600/30">
                            <div className="absolute inset-0 opacity-50 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#000_2px,#000_3px)]" style={{ backgroundSize: '10px 100%' }}></div>
                            <div className="absolute top-1/2 left-0 right-0 h-px bg-black/20"></div>
                            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-black/20"></div>
                            {/* Inner Shine */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>
                        </div>
                    </div>
                    
                    <div className="text-right">
                         <div className="flex items-center justify-end gap-2 text-white/50 mb-1">
                             <Wifi size={20} className="rotate-90 opacity-80" strokeWidth={2} />
                         </div>
                         <div className="font-black italic text-white/20 text-lg tracking-tighter">
                            {spectralMeta.scheme}
                         </div>
                    </div>
                </div>

                {/* Number Row */}
                <div className="relative z-10 mt-2">
                    <div className="flex items-center gap-2">
                        <input 
                            name="cardNumber"
                            value={financials.cardNumber}
                            onChange={(e) => handleCardInput(e.target.value)}
                            type={showNumbers ? 'text' : 'password'}
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            className="w-full bg-transparent border-none text-xl md:text-2xl font-mono font-black text-white/90 placeholder:text-white/10 tracking-[0.15em] outline-none focus:ring-0 p-0 drop-shadow-md text-shadow"
                            autoComplete="off"
                        />
                        <button 
                            onClick={() => setShowNumbers(!showNumbers)} 
                            className="p-1.5 rounded-full hover:bg-white/10 text-white/30 hover:text-white transition-all"
                            tabIndex={-1}
                        >
                            {showNumbers ? <EyeOff size={14}/> : <Eye size={14}/>}
                        </button>
                    </div>
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mt-2"></div>
                </div>

                {/* Footer: Details */}
                <div className="flex justify-between items-end relative z-10">
                    <div className="space-y-3 flex-1">
                        <div className="flex gap-6">
                            <div className="flex flex-col">
                                <label className="text-[6px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5">Expires</label>
                                <input 
                                    name="cardExpiry" value={financials.cardExpiry} 
                                    onChange={(e) => setFinancials((p: any) => ({...p, cardExpiry: formatExpiry(e.target.value)}))} 
                                    placeholder="MM/YY" maxLength={5} 
                                    className="w-12 bg-transparent border-none text-xs font-mono font-bold text-white/90 placeholder:text-white/10 p-0 focus:ring-0"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-[6px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5">CVC</label>
                                <input 
                                    name="cardCvv" value={financials.cardCvv} 
                                    onChange={(e) => setFinancials((p: any) => ({...p, cardCvv: e.target.value}))} 
                                    type="password" placeholder="***" maxLength={4} 
                                    className="w-8 bg-transparent border-none text-xs font-mono font-bold text-white/90 placeholder:text-white/10 p-0 focus:ring-0"
                                />
                            </div>
                        </div>
                        <div className="font-bold uppercase tracking-widest text-[10px] text-white/70 truncate max-w-[200px] shadow-black drop-shadow-sm">
                            {cardHolderName || 'AUTHORIZED MEMBER'}
                        </div>
                    </div>

                    <div className={`
                        w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500
                        ${cardStatus === 'valid' ? 'border-emerald-400 bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)]' : 'border-white/10 bg-white/5 text-white/10'}
                    `}>
                        {cardStatus === 'valid' ? <ShieldCheck size={20} strokeWidth={2.5} /> : <Fingerprint size={24} strokeWidth={1} />}
                    </div>
                </div>
            </div>
        </div>
    );
};