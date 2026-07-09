
import React, { useState } from 'react';
import { ChatWindow } from './ChatWindow';
import { Modal } from '../ui/Modal';
import { ChatEmptyState } from './ChatEmptyState';
import { ChatSidebarLayout } from './ChatSidebarLayout';
import { useMessagingLogic } from './hooks/useMessagingLogic';
import { Search } from 'lucide-react';

import { usePresence } from '../../hooks/usePresence';
import { useSystem } from '../../hooks/useSystem';
import { useCRM } from '../../hooks/useCRM';

export const MessagingLayout: React.FC = () => {
    const { setToast } = useSystem();
    const { users } = useCRM();
    const [agentSearch, setAgentSearch] = useState('');
    const {
        currentUser, messages, activeChannelId, setActiveChannelId, setTyping,
        sendMessage, editMessage, deleteMessage, togglePin, addReaction, votePoll,
        isOffline, convos, showNewGroup, setShowNewGroup, isMaximized, setIsMaximized,
        searchQuery, setSearchQuery, mobileView, setMobileView, activeConversation, activeTypingUsers
    } = useMessagingLogic();

    // Track presence in the specific chat channel
    usePresence(activeChannelId || 'chat-lobby', 'chat', 'viewing');

    if (!currentUser) return null;

    return (
        <div className="h-full w-full flex overflow-hidden bg-surface-main relative text-text-primary transition-colors duration-500">
            <ChatSidebarLayout 
                mobileView={mobileView}
                convos={convos}
                activeChannelId={activeChannelId}
                setActiveChannelId={setActiveChannelId}
                setMobileView={setMobileView}
                setShowNewGroup={setShowNewGroup}
            />
            
            <div className={`${mobileView === 'chat' ? 'flex' : 'hidden md:flex'} flex-1 flex-col relative z-10 bg-surface-main min-w-0`}>
                {activeConversation ? (
                    <ChatWindow 
                        currentUser={currentUser} 
                        activeConversation={activeConversation} 
                        messages={messages} 
                        onTyping={setTyping}
                        typingNow={activeTypingUsers}
                        isOffline={isOffline}
                        onSend={sendMessage}
                        onEdit={editMessage}
                        onDelete={deleteMessage}
                        onPin={togglePin}
                        onReaction={addReaction}
                        onVote={votePoll}
                        onCreatePoll={() => setToast({ title: 'Polls', message: 'Poll interface opened.', type: 'info' })}
                        onShareLocation={() => setToast({ title: 'Location', message: 'Location sharing requested.', type: 'info' })}
                        onStartCall={(type) => setToast({ title: 'Call Link', message: `Initializing ${type} call...`, type: 'info' })} 
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        isMaximized={isMaximized}
                        toggleMaximize={() => setIsMaximized(!isMaximized)}
                        onCreateGroup={() => setShowNewGroup(true)}
                    />
                ) : (
                    <ChatEmptyState />
                )}
            </div>

            <Modal isOpen={showNewGroup} onClose={() => setShowNewGroup(false)} title="New Message">
                <div className="space-y-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted transition-colors" />
                        <input 
                            autoComplete="off" 
                            data-lpignore="true" 
                            data-prevent-autofill="true" 
                            spellCheck={false} 
                            placeholder="Search agents..." 
                            value={agentSearch}
                            onChange={(e) => setAgentSearch(e.target.value)}
                            className="w-full bg-surface-main text-text-primary border border-border-subtle rounded-lg pl-9 pr-3 py-2 text-sm font-semibold outline-none focus:border-indigo-500 transition-all placeholder:text-text-muted" 
                        />
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto space-y-1 custom-scrollbar">
                        {users.filter(u => u.id !== currentUser?.id && u.name.toLowerCase().includes(agentSearch.toLowerCase())).map(u => {
                            const channelId = [currentUser?.id, u.id].sort().join('_');
                            return (
                                <button 
                                    key={u.id}
                                    onClick={() => {
                                        setActiveChannelId(channelId);
                                        setShowNewGroup(false);
                                        setMobileView('chat');
                                    }}
                                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-surface-alt transition-colors text-left"
                                >
                                    <div className="h-8 w-8 rounded-full bg-surface-main border border-border-subtle flex items-center justify-center font-bold text-sm text-text-muted overflow-hidden">
                                        {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : (u.name || 'U').charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-text-primary flex items-center gap-2">
                                            {u.name}
                                            <div className={`w-2 h-2 rounded-full ${u.currentStatus === 'online' ? 'bg-emerald-500' : 'bg-gray-400'}`} title={u.currentStatus || 'offline'} />
                                        </div>
                                        <div className="text-sm text-text-muted">{u.role}</div>
                                    </div>
                                </button>
                            );
                        })}
                        {users.filter(u => u.id !== currentUser?.id && u.name.toLowerCase().includes(agentSearch.toLowerCase())).length === 0 && (
                            <div className="text-center text-text-muted text-sm py-4">No agents found</div>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

