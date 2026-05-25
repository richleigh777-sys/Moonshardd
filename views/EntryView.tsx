
import React, { useState } from 'react';
import { ArrowLeft, Zap, CheckCircle } from 'lucide-react';
import EnrollmentForm from '../components/forms/EnrollmentForm';
import { sfx } from '../lib/soundService';

interface EntryViewProps {
    onBack: () => void;
}

export const EntryView: React.FC<EntryViewProps> = ({ onBack }) => {
    const [successCount, setSuccessCount] = useState(0);

    const handleSuccess = () => {
        sfx.playSuccess();
        setSuccessCount(prev => prev + 1);
        // We stay on the screen for rapid fire
    };

    return (
        <div className="absolute inset-0 z-[100] bg-surface-alt flex flex-col animate-in slide-in-from-bottom-10 duration-500">
            {/* Focus Header */}
            <div className="h-16 border-b border-border-subtle bg-surface-main/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack} 
                        className="p-2 hover:bg-surface-alt rounded-xl text-text-muted hover:text-text-primary transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform"/>
                    </button>
                    <div className="h-8 w-px bg-border-subtle"></div>
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-accent-primary rounded-lg text-white shadow-neon">
                            <Zap size={16} fill="currentColor"/>
                        </div>
                        <h2 className="text-lg font-semibold text-text-primary">New Sale Entry</h2>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                        <CheckCircle size={16} className="text-status-success"/>
                        <span className="text-sm font-semibold text-emerald-600">{successCount} Sales Completed</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative bg-surface-alt/20 p-6 flex justify-center">
                <div className="w-full max-w-7xl h-full flex flex-col relative z-10">
                    <EnrollmentForm 
                        onSuccess={handleSuccess} 
                        onCancel={onBack}
                        initialData={{
                            fullName: '', phone: '', email: '', shippingAddress: '', billingAddress: ''
                        }}
                    />
                </div>
                
                {/* Ambient Focus Elements */}
                <div className="absolute top-1/2 left-10 -translate-y-1/2 w-64 h-64 bg-accent-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>
            </div>
        </div>
    );
};
