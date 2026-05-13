
import React from 'react';
import { ChatWindow } from './ChatWindow';
import { Button } from '../ui/Base';
import { Modal } from '../ui/Modal';
import { ChatEmptyState } from './ChatEmptyState';
import { ChatSidebarLayout } from './ChatSidebarLayout';
import { useMessagingLogic } from './hooks/useMessagingLogic';

import { usePresence } from '../../hooks/usePresence';
import { useSystem } from '../../hooks/useSystem';

export const MessagingLayout: React.FC = () => {
  const { setToast } = useSystem();
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
    <div className="h-full w-full flex overflow-hidden bg-surface-alt relative text-text-primary transition-colors duration-500">
        <ChatSidebarLayout 
            mobileView={mobileView}
            convos={convos}
            activeChannelId={activeChannelId}
            setActiveChannelId={setActiveChannelId}
            setMobileView={setMobileView}
            setShowNewGroup={setShowNewGroup}
        />
        
        <div className={`${mobileView === 'chat' ? 'flex' : 'hidden md:flex'} flex-1 flex-col relative z-10 bg-surface-alt`}>
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
              onCreatePoll={() => setToast({ title: 'Polls', message: 'Poll interface initialized', type: 'info' })}
              onShareLocation={() => setToast({ title: 'Location', message: 'GPS Uplink requested', type: 'info' })}
              onStartCall={(type) => setToast({ title: 'Call Link', message: `Initializing ${type} uplink...`, type: 'info' })} 
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

        <Modal isOpen={showNewGroup} onClose={() => setShowNewGroup(false)} title="Initialize Group Protocol">
            <div className="space-y-6">
                <input placeholder="Group Designation" className="w-full bg-surface-alt border border-border-subtle rounded-2xl p-4 text-sm font-bold outline-none focus:border-accent-primary transition-all" />
                <Button variant="primary" className="w-full h-14 uppercase tracking-widest font-black text-xs" onClick={() => setShowNewGroup(false)}>Establish Channel</Button>
            </div>
        </Modal>
    </div>
  );
};

