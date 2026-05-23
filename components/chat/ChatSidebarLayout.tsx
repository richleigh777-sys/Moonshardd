import React, { useState } from 'react';
import { Plus, MessageSquare, Mail, Smartphone, Globe, Hash, Settings2 } from 'lucide-react';
import { Button } from '../ui/Base';
import { ChatList } from './ChatList';
import { Conversation } from '../../services/ChatService';
import { Modal } from '../ui/Modal';

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
    const [activeChannel, setActiveChannel] = useState<ChannelType>('internal');
    const [showSettings, setShowSettings] = useState(false);

    return (
        <div className={`${mobileView === 'list' ? 'flex' : 'hidden md:flex'} w-full md:w-[320px] lg:w-[360px] shrink-0 flex-col h-full border-r border-border-subtle bg-surface-main relative z-20`}>
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 shrink-0 border-b border-border-subtle/50">
                <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
                    <MessageSquare size={20} className="text-accent-secondary" />
                    Messages
                </h1>
                <Button onClick={() => setShowNewGroup(true)} variant="ghost" className="h-8 w-8 p-0 rounded-full bg-accent-secondary/10 text-accent-secondary hover:bg-indigo-500/20 transition-all">
                    <Plus size={18} />
                </Button>
            </div>

            {/* Unified Inbox Channel Selector */}
            <div className="px-4 py-3 shrink-0 border-b border-border-subtle/50">
                <div className="flex bg-surface-main rounded-lg p-1">
                    <button 
                        onClick={() => setActiveChannel('internal')}
                        className={`flex items-center justify-center py-1.5 px-3 rounded-md flex-1 text-xs font-semibold transition-all ${activeChannel === 'internal' ? 'bg-surface-highlight text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        <Hash size={14} className="mr-1.5 opacity-70" /> Team
                    </button>
                    <button 
                        onClick={() => setActiveChannel('sms')}
                        className={`flex items-center justify-center py-1.5 px-3 rounded-md flex-1 text-xs font-semibold transition-all ${activeChannel === 'sms' ? 'bg-surface-highlight text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        <Smartphone size={14} className="mr-1.5 opacity-70" /> SMS
                    </button>
                    <button 
                        onClick={() => setActiveChannel('email')}
                        className={`flex items-center justify-center py-1.5 px-3 rounded-md flex-1 text-xs font-semibold transition-all ${activeChannel === 'email' ? 'bg-surface-highlight text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        <Mail size={14} className="mr-1.5 opacity-70" /> Email
                    </button>
                </div>
            </div>

            {activeChannel === 'internal' ? (
                <ChatList 
                    conversations={convos} 
                    onSelectChat={(c) => { setActiveChannelId(c.id); setMobileView('chat'); }} 
                    activeConvoId={activeChannelId} 
                />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-text-muted">
                    {activeChannel === 'sms' && <Smartphone size={32} className="mb-3 text-status-success/50" />}
                    {activeChannel === 'email' && <Mail size={32} className="mb-3 text-status-warning/50" />}
                    {activeChannel === 'social' && <Globe size={32} className="mb-3 text-blue-500/50" />}
                    
                    <h3 className="text-sm font-bold text-text-primary mb-1">{activeChannel.toUpperCase()} Routing Offline</h3>
                    <p className="text-xs leading-relaxed max-w-[200px] mb-4">
                        Connect your API integrations to enable {activeChannel} routing.
                    </p>
                    <Button onClick={() => setShowSettings(true)} variant="secondary" className="h-8 px-4 text-xs font-semibold border-border-subtle text-text-primary hover:bg-surface-alt">
                        Configure Settings
                    </Button>
                </div>
            )}

            <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title={`${activeChannel.toUpperCase()} Configuration`}>
                <div className="space-y-4 text-text-primary">
                    <div className="p-4 bg-surface-main border border-border-subtle rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <Settings2 className="text-accent-secondary" size={20} />
                            <h4 className="font-semibold text-sm">Provider API Configuration</h4>
                        </div>
                        <p className="text-xs text-text-muted mb-4">Enter your API keys to enable outbound routing for this channel.</p>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1">API Key</label>
                                <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} type="password" placeholder="sk_test_..." className="w-full bg-surface-main border border-border-subtle rounded-md p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1">Webhook Secret</label>
                                <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} type="password" placeholder="whsec_..." className="w-full bg-surface-main border border-border-subtle rounded-md p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
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
