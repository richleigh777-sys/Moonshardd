
import React, { useEffect } from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface MediaViewerProps {
    src: string;
    type: 'image' | 'video';
    name?: string;
    onClose: () => void;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({ src, type, name, onClose }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = src;
        link.download = name || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
            {/* Toolbar */}
            <div className="flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent z-10">
                <div className="text-text-primary text-sm font-mono opacity-80 truncate max-w-md">
                    {name || 'Media Preview'}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleDownload} className="p-2 hover:bg-surface-alt/80 rounded-full text-text-primary/80 hover:text-text-primary transition-colors" title="Download">
                        <Download size={20} />
                    </button>
                    <button onClick={() => window.open(src, '_blank')} className="p-2 hover:bg-surface-alt/80 rounded-full text-text-primary/80 hover:text-text-primary transition-colors" title="Open Original">
                        <ExternalLink size={20} />
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-red-500/20 rounded-full text-text-primary/80 hover:text-status-error transition-colors ml-2">
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative" onClick={onClose}>
                <div className="relative group max-w-full max-h-full" onClick={e => e.stopPropagation()}>
                    {type === 'video' && src ? (
                        <video 
                            src={src} 
                            controls 
                            autoPlay 
                            className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
                        />
                    ) : type === 'image' && src ? (
                        <img 
                            src={src} 
                            alt={name} 
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300 select-none"
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
};
