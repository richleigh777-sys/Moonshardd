import React, { useState } from 'react';
import { Plus, MessageSquare, Mail, Smartphone, Hash, Settings2, Globe, Search, Pin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Base';
import { ChatList } from './ChatList';
import { Conversation } from '../../services/ChatService';
import { Modal } from '../ui/Modal';
import { useSystem } from '../../hooks/useSystem';

interface ChatSidebarLayoutProps {
    mobileView: 'list' | 'chat';
    convos: Conversation[];
    activeChannelId: string;
    setActiveChannelId: (id: string) => void;
    setMobileView: (view: 'list' | 'chat') => void;
    setShowNewGroup: (show: boolean) => void;
}

type ChannelType = 'internal' | 'sms' | 'email' | 'social';

export const ChatSidebarLayout: React.FC<ChatSidebarLayoutProps> = ({
    mobileView, convos, activeChannelId, setActiveChannelId, setMobileView, setShowNewGroup
}) => {
    const { isMobile } = useSystem();
    const [activeChannel, setActiveChannel] = useState<ChannelType>('internal');
    const [showSettings, setShowSettings] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={`
            ${mobileView === 'list' ? 'flex' : 'hidden md:flex'} 
            ${isCollapsed ? 'w-[80px]' : 'w-full md:w-[320px] lg:w-[360px]'} 
            shrink-0 flex-col h-full border-r border-border-subtle bg-surface-main relative z-20 transition-all duration-300 ease-in-out
        `}>
            
            {/* Header */}
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-4 shrink-0 border-b border-border-subtle/50`}>
                {!isCollapsed && (
                    <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
                        <MessageSquare size={20} className="text-accent-secondary" />
                        Messages
                    </h1>
                )}
                {isCollapsed ? (
                    <Button onClick={() => setShowNewGroup(true)} variant="ghost" className="h-10 w-10 p-0 rounded-full bg-accent-secondary/10 text-accent-secondary hover:bg-indigo-500/20 transition-all">
                        <Plus size={20} />
                    </Button>
                ) : (
                    <Button onClick={() => setShowNewGroup(true)} variant="ghost" className="h-8 w-8 p-0 rounded-full bg-accent-secondary/10 text-accent-secondary hover:bg-indigo-500/20 transition-all">
                        <Plus size={18} />
                    </Button>
                )}
            </div>

            {/* Collapse Toggle (Desktop only) */}
            {!isMobile && (
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-6 bg-surface-main border border-border-subtle rounded-full p-1 text-text-muted hover:text-text-primary hover:bg-surface-alt shadow-sm z-50 transition-transform"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            )}

            {/* Unified Inbox Channel Selector */}
            {!isCollapsed && (
                <div className="px-4 py-3 shrink-0 border-b border-border-subtle/50">
                    <div className="flex bg-surface-alt rounded-lg p-1 gap-1">
                        <button 
                            onClick={() => setActiveChannel('internal')}
                            className={`flex justify-center items-center py-1.5 px-2 rounded-md flex-1 text-xs font-semibold transition-all ${activeChannel === 'internal' ? 'bg-surface-main text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                        >
                            <Hash size={14} className="mr-1 opacity-70" /> Team
                        </button>
                        <button 
                            onClick={() => setActiveChannel('sms')}
                            className={`flex justify-center items-center py-1.5 px-2 rounded-md flex-1 text-xs font-semibold transition-all ${activeChannel === 'sms' ? 'bg-surface-main text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                        >
                            <Smartphone size={14} className="mr-1 opacity-70" /> SMS
                        </button>
                        <button 
                            onClick={() => setActiveChannel('email')}
                            className={`flex justify-center items-center py-1.5 px-2 rounded-md flex-1 text-xs font-semibold transition-all ${activeChannel === 'email' ? 'bg-surface-main text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                        >
                            <Mail size={14} className="mr-1 opacity-70" /> Email
                        </button>
                    </div>
                </div>
            )}

            {activeChannel === 'internal' ? (
                <ChatList 
                    conversations={convos} 
                    onSelectChat={(c) => { setActiveChannelId(c.id); setMobileView('chat'); }} 
                    activeConvoId={activeChannelId} 
                    isCollapsed={isCollapsed}
                />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-text-muted">
                    {activeChannel === 'sms' && <Smartphone size={32} className="mb-3 text-status-success/50" />}
                    {activeChannel === 'email' && <Mail size={32} className="mb-3 text-status-warning/50" />}
                    {activeChannel === 'social' && <Globe size={32} className="mb-3 text-blue-500/50" />}
                    
                    {!isCollapsed && (
                        <>
                            <h3 className="text-sm font-bold text-text-primary mb-1">{activeChannel.toUpperCase()} Routing Offline</h3>
                            <p className="text-xs leading-relaxed max-w-[200px] mb-4">
                                Connect external channels to enable {activeChannel} routing.
                            </p>
                            <Button onClick={() => setShowSettings(true)} variant="secondary" className="h-8 px-4 text-xs font-semibold border-border-subtle text-text-primary hover:bg-surface-alt">
                                Configure Settings
                            </Button>
                        </>
                    )}
                </div>
            )}

            <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title={`${activeChannel.toUpperCase()} Configuration`}>
                <div className="space-y-4 text-text-primary">
                    <div className="p-4 bg-surface-main border border-border-subtle rounded-lg shadow-panel">
                        <div className="flex items-center gap-3 mb-2">
                            <Settings2 className="text-accent-secondary" size={20} />
                            <h4 className="font-semibold text-sm">Provider API Configuration</h4>
                        </div>
                        <p className="text-xs text-text-muted mb-4">Enter your API keys to enable outbound routing for this channel.</p>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1">API Key</label>
                                <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} type="password" placeholder="sk_test_..." className="w-full bg-surface-alt border border-border-subtle rounded-md p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1">Webhook Secret</label>
                                <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} type="password" placeholder="whsec_..." className="w-full bg-surface-alt border border-border-subtle rounded-md p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2">
                        <Button onClick={() => setShowSettings(false)} variant="ghost" className="text-text-muted">Cancel</Button>
                        <Button onClick={() => setShowSettings(false)} variant="primary" className="bg-indigo-500 hover:bg-indigo-600 text-text-primary border-none">Save Settings</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

