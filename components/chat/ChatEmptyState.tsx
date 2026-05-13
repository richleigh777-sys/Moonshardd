import { MessageSquare, Shield } from 'lucide-react';
import { TerminalBoot } from './TerminalBoot';

export const ChatEmptyState: React.FC = () => (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
        <div className="relative z-10 animate-in zoom-in duration-700 w-full max-w-lg">
            <div className="flex flex-col items-center mb-12">
                <div className="w-20 h-20 bg-accent-primary/5 border border-accent-primary/20 flex items-center justify-center mb-6 shadow-[0_0_60px_rgba(99,102,241,0.1)] animate-pulse-slow rounded-2xl">
                    <MessageSquare size={40} className="text-accent-primary opacity-50" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Secure Uplink <span className="text-accent-primary">v6.0</span></h3>
                <p className="text-slate-500 text-[10px] font-bold mt-2 uppercase tracking-[0.3em]">
                    Neural Frequency: <span className="text-emerald-500">STABLE</span>
                </p>
            </div>

            <TerminalBoot />

            <div className="mt-12 flex items-center justify-center gap-3 text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] opacity-60">
                <Shield size={12} /> System Ready
            </div>
        </div>
    </div>
);
