
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
        <div className="w-80 border-l border-border-subtle bg-surface-main/95 backdrop-blur-xl flex flex-col h-full animate-in slide-in-from-right-10 duration-300 shadow-2xl relative z-40">
            {/* Header */}
            <div className="h-20 px-6 border-b border-border-subtle flex items-center justify-between shrink-0 bg-surface-alt/20">
                <h3 className="text-xs font-black uppercase tracking-widest text-text-primary">Chat Dossier</h3>
                <button onClick={onClose} className="p-2 hover:bg-surface-alt text-text-muted hover:text-text-primary transition-colors">
                    <X size={16} />
                </button>
            </div>

            {/* Tabs */}
            <div className="p-4 pb-0 shrink-0">
                <div className="flex bg-surface-alt/50 p-1 border border-border-subtle">
                    <button onClick={() => setActiveTab('media')} className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider transition-all ${activeTab === 'media' ? 'bg-surface-main text-accent-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`} title="Photos">
                        <Image size={14} className="mx-auto"/>
                    </button>
                    <button onClick={() => setActiveTab('files')} className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider transition-all ${activeTab === 'files' ? 'bg-surface-main text-accent-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`} title="Documents">
                        <FileText size={14} className="mx-auto"/>
                    </button>
                    <button onClick={() => setActiveTab('links')} className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider transition-all ${activeTab === 'links' ? 'bg-surface-main text-accent-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`} title="Links">
                        <Link size={14} className="mx-auto"/>
                    </button>
                    <button onClick={() => setActiveTab('pinned')} className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider transition-all ${activeTab === 'pinned' ? 'bg-surface-main text-accent-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`} title="Pinned">
                        <Pin size={14} className="mx-auto"/>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 relative">
                
                {/* MEDIA GRID */}
                {activeTab === 'media' && (
                    <div className="grid grid-cols-3 gap-2">
                        {data.media.map((item, i) => (
                            <div key={i} onClick={() => onNavigateToMsg(item.msgId)} className="aspect-square overflow-hidden border border-border-subtle cursor-pointer bg-surface-alt relative group">
                                <img src={item.att.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="attachment"/>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                    <ExternalLink size={16} className="text-white drop-shadow-md"/>
                                </div>
                            </div>
                        ))}
                        {data.media.length === 0 && (
                            <div className="col-span-3 flex flex-col items-center justify-center py-12 text-text-muted opacity-40">
                                <Image size={32} strokeWidth={1} className="mb-2"/>
                                <span className="text-[10px] font-black uppercase tracking-widest">No Media Found</span>
                            </div>
                        )}
                    </div>
                )}

                {/* FILES LIST */}
                {activeTab === 'files' && (
                    <div className="space-y-2">
                        {data.files.map((item, i) => (
                            <div key={i} onClick={() => onNavigateToMsg(item.msgId)} className="flex items-center gap-3 p-3 border border-border-subtle bg-surface-main hover:bg-surface-alt transition-all cursor-pointer group hover:border-accent-primary/20 hover:shadow-md">
                                <div className="p-2.5 bg-surface-alt text-text-secondary border border-border-subtle group-hover:bg-accent-primary/10 group-hover:text-accent-primary transition-colors">
                                    <FileText size={18}/>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-text-primary truncate">{item.att.name}</p>
                                    <p className="text-[9px] text-text-muted uppercase tracking-wider">{item.att.size}</p>
                                </div>
                                <Download size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"/>
                            </div>
                        ))}
                        {data.files.length === 0 && (
                             <div className="flex flex-col items-center justify-center py-12 text-text-muted opacity-40">
                                <FileText size={32} strokeWidth={1} className="mb-2"/>
                                <span className="text-[10px] font-black uppercase tracking-widest">No Documents</span>
                            </div>
                        )}
                    </div>
                )}

                {/* LINKS LIST */}
                {activeTab === 'links' && (
                    <div className="space-y-3">
                        {data.links.map((item, i) => (
                            <a key={i} href={item.preview.url} target="_blank" rel="noopener noreferrer" className="block p-3 border border-border-subtle bg-surface-main hover:bg-surface-alt/50 transition-all group hover:border-accent-primary/20">
                                <div className="flex items-center gap-2 mb-2 text-[9px] font-bold text-accent-primary uppercase tracking-wider">
                                    <Link size={10}/> External Source
                                </div>
                                <p className="text-xs font-bold text-text-primary line-clamp-2 leading-snug mb-1 group-hover:text-accent-primary transition-colors">{item.preview.title}</p>
                                <p className="text-[9px] text-text-muted truncate font-mono opacity-70">{item.preview.url}</p>
                            </a>
                        ))}
                        {data.links.length === 0 && (
                             <div className="flex flex-col items-center justify-center py-12 text-text-muted opacity-40">
                                <Link size={32} strokeWidth={1} className="mb-2"/>
                                <span className="text-[10px] font-black uppercase tracking-widest">No Links</span>
                            </div>
                        )}
                    </div>
                )}

                {/* PINNED MESSAGES */}
                {activeTab === 'pinned' && (
                    <div className="space-y-3">
                        {data.pinned.map((msg) => (
                            <div key={msg.id} onClick={() => onNavigateToMsg(msg.id)} className="p-4 border border-accent-primary/20 bg-accent-primary/5 cursor-pointer hover:bg-accent-primary/10 transition-colors relative group">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-[9px] font-black uppercase text-accent-primary tracking-widest">
                                        <Pin size={10} fill="currentColor"/> Pinned
                                    </div>
                                    <span className="text-[8px] text-text-muted font-mono">{new Date(msg.timestamp).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs font-medium text-text-primary line-clamp-3 leading-relaxed italic opacity-90">"{msg.text}"</p>
                            </div>
                        ))}
                        {data.pinned.length === 0 && (
                             <div className="flex flex-col items-center justify-center py-12 text-text-muted opacity-40">
                                <Pin size={32} strokeWidth={1} className="mb-2"/>
                                <span className="text-[10px] font-black uppercase tracking-widest">No Pins</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
