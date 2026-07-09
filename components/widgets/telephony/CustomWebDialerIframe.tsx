import React, { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { sfx } from '../../../lib/soundService';

export const CustomWebDialerIframe = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [url, setUrl] = useState('');
    
    useEffect(() => {
        const handleOpen = (e: any) => {
            setUrl(e.detail.url);
            setIsOpen(true);
            sfx.playClick();
        };
        
        window.addEventListener('OPEN_DIALER_IFRAME', handleOpen);
        return () => window.removeEventListener('OPEN_DIALER_IFRAME', handleOpen);
    }, []);
    
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-y-0 right-0 w-[400px] z-[9999] flex flex-col shadow-2xl border-l border-border-strong bg-surface-main">
            <div className="h-12 border-b border-border-subtle bg-surface-alt flex items-center justify-between px-4 shrink-0">
                <span className="text-sm font-bold tracking-widest uppercase">Web Dialer Active</span>
                <div className="flex items-center gap-2">
                    <button onClick={() => window.open(url, '_blank')} className="p-1.5 text-text-muted hover:text-text-primary rounded hover:bg-surface-main transition-colors">
                        <ExternalLink size={14} />
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-1.5 text-status-error hover:text-white rounded hover:bg-status-error transition-colors">
                        <X size={14} />
                    </button>
                </div>
            </div>
            <div className="flex-1 w-full relative">
                <iframe src={url} className="w-full h-full border-none" allow="microphone; camera" />
            </div>
        </div>
    );
};
