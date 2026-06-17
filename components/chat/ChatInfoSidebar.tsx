
import React, { useMemo, useState } from 'react';
import { Image, FileText, Link, Pin, X, Download, ExternalLink } from 'lucide-react';
import { ChatMessage, Attachment } from '../../types';

interface ChatInfoSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    messages: ChatMessage[];
    onNavigateToMsg: (id: string) => void;
}

type Tab = 'media' | 'files' | 'links' | 'pinned';

export const ChatInfoSidebar: React.FC<ChatInfoSidebarProps> = ({ isOpen, onClose, messages, onNavigateToMsg }) => {
    const [activeTab, setActiveTab] = useState<Tab>('media');

    const data = useMemo(() => {
        const media: { msgId: string, att: Attachment }[] = [];
        const files: { msgId: string, att: Attachment }[] = [];
        const links: { msgId: string, preview: any }[] = [];
        const pinned: ChatMessage[] = [];

        messages.forEach(m => {
            if (m.isPinned) pinned.push(m);
            if (m.linkPreview) links.push({ msgId: m.id, preview: m.linkPreview });
            
            m.attachments?.forEach(att => {
                if (att.type === 'image') media.push({ msgId: m.id, att });
                else if (att.type === 'file' || att.type === 'audio') files.push({ msgId: m.id, att });
            });
        });

        return { media, files, links, pinned: pinned.sort((a,b) => b.timestamp - a.timestamp) };
    }, [messages]);

    if (!isOpen) return null;

    return (
        <div className="w-80 border-l border-border-subtle bg-surface-alt flex flex-col h-full animate-in slide-in-from-right-10 duration-200 shadow-xl relative z-40">
            {/* Header */}
            <div className="h-[60px] px-4 border-b border-border-subtle flex items-center justify-between shrink-0 bg-surface-main">
                <h3 className="text-sm font-semibold text-text-primary">Details</h3>
                <button onClick={onClose} className="p-1.5 hover:bg-surface-highlight rounded-md text-text-muted hover:text-text-primary transition-colors">
                    <X size={16} />
                </button>
            </div>

            {/* Tabs */}
            <div className="p-4 pb-0 shrink-0">
                <div className="flex bg-surface-main p-1 rounded-md">
                    <button onClick={() => setActiveTab('media')} className={`flex-1 py-1.5 text-sm font-semibold rounded-sm transition-all ${activeTab === 'media' ? 'bg-surface-highlight text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`} title="Photos">
                        <Image size={16} className="mx-auto"/>
                    </button>
                    <button onClick={() => setActiveTab('files')} className={`flex-1 py-1.5 text-sm font-semibold rounded-sm transition-all ${activeTab === 'files' ? 'bg-surface-highlight text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`} title="Documents">
                        <FileText size={16} className="mx-auto"/>
                    </button>
                    <button onClick={() => setActiveTab('links')} className={`flex-1 py-1.5 text-sm font-semibold rounded-sm transition-all ${activeTab === 'links' ? 'bg-surface-highlight text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`} title="Links">
                        <Link size={16} className="mx-auto"/>
                    </button>
                    <button onClick={() => setActiveTab('pinned')} className={`flex-1 py-1.5 text-sm font-semibold rounded-sm transition-all ${activeTab === 'pinned' ? 'bg-surface-highlight text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`} title="Pinned">
                        <Pin size={16} className="mx-auto"/>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 relative">
                
                {/* MEDIA GRID */}
                {activeTab === 'media' && (
                    <div className="grid grid-cols-3 gap-2">
                        {data.media.map((item, i) => (
                            <div key={i} onClick={() => onNavigateToMsg(item.msgId)} className="aspect-square overflow-hidden rounded-md border border-border-subtle cursor-pointer bg-surface-main relative group">
                                <img src={item.att.url} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" alt="attachment"/>
                                <div className="absolute inset-0 bg-surface-alt opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <ExternalLink size={16} className="text-text-primary drop-shadow-sm"/>
                                </div>
                            </div>
                        ))}
                        {data.media.length === 0 && (
                            <div className="col-span-3 flex flex-col items-center justify-center py-12 text-text-muted">
                                <Image size={32} className="mb-2 opacity-50"/>
                                <span className="text-sm font-medium">No media found</span>
                            </div>
                        )}
                    </div>
                )}

                {/* FILES LIST */}
                {activeTab === 'files' && (
                    <div className="space-y-2">
                        {data.files.map((item, i) => (
                            <div key={i} onClick={() => onNavigateToMsg(item.msgId)} className="flex items-center gap-3 p-3 rounded-md border border-border-subtle bg-surface-main hover:bg-surface-highlight transition-all cursor-pointer group">
                                <div className="p-2 rounded-md bg-surface-alt text-text-muted group-hover:text-accent-secondary transition-colors">
                                    <FileText size={16}/>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text-primary truncate">{item.att.name}</p>
                                    <p className="text-sm text-text-muted">{item.att.size}</p>
                                </div>
                                <Download size={16} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"/>
                            </div>
                        ))}
                        {data.files.length === 0 && (
                             <div className="flex flex-col items-center justify-center py-12 text-text-muted">
                                <FileText size={32} className="mb-2 opacity-50"/>
                                <span className="text-sm font-medium">No documents</span>
                            </div>
                        )}
                    </div>
                )}

                {/* LINKS LIST */}
                {activeTab === 'links' && (
                    <div className="space-y-2">
                        {data.links.map((item, i) => (
                            <a key={i} href={item.preview.url} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-md border border-border-subtle bg-surface-main hover:bg-surface-highlight transition-all group">
                                <div className="flex items-center gap-2 mb-1.5 text-sm font-semibold text-accent-secondary">
                                    <Link size={14}/> External Link
                                </div>
                                <p className="text-sm font-medium text-text-primary line-clamp-2 leading-snug mb-1 group-hover:text-indigo-300 transition-colors">{item.preview.title}</p>
                                <p className="text-sm text-text-muted truncate">{item.preview.url}</p>
                            </a>
                        ))}
                        {data.links.length === 0 && (
                             <div className="flex flex-col items-center justify-center py-12 text-text-muted">
                                <Link size={32} className="mb-2 opacity-50"/>
                                <span className="text-sm font-medium">No links</span>
                            </div>
                        )}
                    </div>
                )}

                {/* PINNED MESSAGES */}
                {activeTab === 'pinned' && (
                    <div className="space-y-2">
                        {data.pinned.map((msg) => (
                            <div key={msg.id} onClick={() => onNavigateToMsg(msg.id)} className="p-3 rounded-md border border-border-subtle bg-surface-main cursor-pointer hover:bg-surface-highlight transition-colors relative group">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-1.5 text-sm font-semibold text-accent-secondary">
                                        <Pin size={14} fill="currentColor"/> Pinned
                                    </div>
                                    <span className="text-sm text-text-muted">{new Date(msg.timestamp).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-text-primary line-clamp-3 leading-relaxed">"{msg.text}"</p>
                            </div>
                        ))}
                        {data.pinned.length === 0 && (
                             <div className="flex flex-col items-center justify-center py-12 text-text-muted">
                                <Pin size={32} className="mb-2 opacity-50"/>
                                <span className="text-sm font-medium">No pinned messages</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
