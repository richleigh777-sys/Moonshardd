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
    <div className="bg-surface-main w-full max-w-2xl mx-auto rounded-3xl border border-border-subtle shadow-2xl h-[80vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500 backdrop-blur-3xl">
        <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-surface-alt/20">
            <Button variant="secondary" onClick={() => { setMode('order'); sfx.playClick(); }} className="h-9 px-4 text-[9px] font-black uppercase tracking-widest">
                <ArrowLeft size={12} className="mr-2"/> Return
            </Button>
            <h3 className="text-xs font-black uppercase text-text-primary tracking-[0.3em] flex items-center gap-2">
                <History size={14} className="text-amber-500"/> Recovery Protocol
            </h3>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <CallbackForm 
                onAddNote={async (n) => { await addNote(n); onCancel(); }} 
                currentUser={currentUser} 
                initialData={{
                    name: formData.fullName,
                    phone: formData.phone,
                    address: formData.shippingAddress,
                    medicalConditions: selectedConditions
                }}
            />
        </div>
    </div>
);
