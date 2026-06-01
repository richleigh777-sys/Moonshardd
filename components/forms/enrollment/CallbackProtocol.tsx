import React from 'react';
import { ArrowLeft, History } from 'lucide-react';
import { Button } from '../../ui/Base';
import { CallbackForm } from '../CallbackForm';
import { sfx } from '../../../lib/soundService';
import { User, SalesFormData } from '../../../types';

interface CallbackProtocolProps {
    setMode: (mode: 'order' | 'callback') => void;
    addNote: (note: any) => Promise<void>;
    onCancel: () => void;
    currentUser: User;
    formData: SalesFormData;
    selectedConditions: string[];
}

export const CallbackProtocol: React.FC<CallbackProtocolProps> = ({
    setMode, addNote, onCancel, currentUser, formData, selectedConditions
}) => (
    <div className="bg-surface-main/60 w-full max-w-2xl mx-auto rounded-3xl border border-border-subtle shadow-float h-[80vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500 backdrop-blur-[40px] relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none -mr-32 -mt-32 z-0"></div>
        <div className="p-5 border-b border-border-subtle flex justify-between items-center bg-transparent relative z-10">
            <Button variant="secondary" onClick={() => { setMode('order'); sfx.playClick(); }} className="h-10 px-5 text-[10px] font-[700]  tracking-widest bg-surface-alt/50 border-border-subtle hover:bg-surface-highlight hover:text-text-primary">
                <ArrowLeft size={16} className="mr-2"/> Return
            </Button>
            <h3 className="text-xs font-[700]  text-text-primary tracking-[0.3em] flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20 rounded-xl">
                    <History size={16} className="text-status-warning drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"/>
                </div>
                Recovery Protocol
            </h3>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative z-10">
            <CallbackForm 
                onAddNote={async (n) => { await addNote(n); onCancel(); }} 
                currentUser={currentUser} 
                initialData={{
                    name: formData.firstName ? `${formData.firstName} ${formData.lastName}`.trim() : '',
                    phone: formData.phone,
                    address: formData.shippingAddress,
                    medicalConditions: selectedConditions
                }}
            />
        </div>
    </div>
);
