import { Hexagon } from 'lucide-react';

export const SystemBootSequence: React.FC = () => (
    <div className="fixed inset-0 bg-surface-alt z-[9999] flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-300">
        <div className="relative z-10 flex flex-col items-center">
            <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-2 border-accent-primary/20 rounded-full animate-[spin_3s_linear_infinite]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Hexagon size={40} className="text-accent-primary animate-pulse" strokeWidth={1.5} />
                </div>
            </div>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">Braveheart CRM</h1>
            <p className="text-sm text-text-muted mt-4 animate-pulse">System Initializing...</p>
        </div>
    </div>
);
