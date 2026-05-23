
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ArrowDown, Lock, FileText, X, UploadCloud } from 'lucide-react';
import { Conversation } from '../../services/ChatService';
import { MessageBubble } from './MessageBubble';
import { ChatMessage, User, Attachment } from '../../types';
import { sfx } from '../../lib/soundService';
import { ForwardMessageModal } from '../modals/ForwardMessageModal';
import { useSystem } from '../../hooks/useSystem';
import { fileToBase64 } from '../../views/utils/crmLogic';
import { ChatInput } from './ChatInput';
import { DateSeparator } from './DateSeparator';
import { TypingBubble } from './TypingBubble';
import { ChatHeader } from './ChatHeader';
import { ChatInfoSidebar } from './ChatInfoSidebar';
import { MediaViewer } from './MediaViewer';
import { useCRM } from '../../hooks/useCRM';
import { DragOverlay } from './ChatParts';

interface Props {
  currentUser: User;
  activeConversation: Conversation;
  messages: ChatMessage[];
  onTyping: (isTyping: boolean) => void;
  typingNow: string[];
  isOffline: boolean;
  onSend: (text: string, atts: Attachment[], reply?: ChatMessage, extras?: Partial<ChatMessage>) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
  onReaction: (id: string, e: string) => void;
  onVote?: (id: string, optionId: string) => void;
  onCreatePoll?: () => void;
  onShareLocation?: () => void;
  onStartCall: (type: 'audio' | 'video') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isMaximized: boolean;
  toggleMaximize: () => void;
  onCreateGroup?: () => void;
}

export const ChatWindow: React.FC<Props> = ({ 
    currentUser, activeConversation, messages, onTyping, typingNow, 
    isOffline, onSend, onEdit, onDelete, onPin, onReaction, onVote, 
    onCreatePoll, onShareLocation,
    onStartCall, searchQuery, onSearchChange,
    isMaximized, toggleMaximize, onCreateGroup
}) => {
  const { users } = useCRM();
  const [input, setInput] = useState(activeConversation.draft || "");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editingMsg, setEditingMsg] = useState<ChatMessage | null>(null);
  const [forwardingMsg, setForwardingMsg] = useState<ChatMessage | null>(null);
  const [showMediaSidebar, setShowMediaSidebar] = useState(false);
  const [viewingMedia, setViewingMedia] = useState<{ src: string, type: 'image' | 'video', name: string } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [currentWallpaper, setCurrentWallpaper] = useState(activeConversation.wallpaper);
  
  // New: Pending Attachments State
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);

  const [isDragging, setIsDragging] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const dragCounterRef = useRef(0);

  const { setToast } = useSystem();
  const endRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const visibleMessages = useMemo(() => {
      if (!searchQuery) return messages;
      return messages.filter(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [messages, searchQuery]);

  // Fix: Calculate last received message for Smart Chips
  const lastReceivedMessage = useMemo(() => {
      for (let i = messages.length - 1; i >= 0; i--) {
          if (messages[i].senderId !== currentUser.id) return messages[i];
      }
      return null;
  }, [messages, currentUser.id]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
      if (endRef.current) {
          endRef.current.scrollIntoView({ behavior, block: 'end' });
      }
  }, []);

  useEffect(() => {
    scrollToBottom('auto');
  }, [activeConversation.id, scrollToBottom]);

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
    const lastMsg = visibleMessages[visibleMessages.length - 1];
    const isMine = lastMsg?.senderId === currentUser.id;

    if (isNearBottom || isMine) {
        scrollToBottom('smooth');
    }
  }, [visibleMessages, currentUser.id, scrollToBottom]);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 300;
    setShowScrollButton(!isNearBottom);
  }, []);

  const handleSend = useCallback((text: string, atts: Attachment[], replyMsg?: ChatMessage, extras?: any) => {
    // Combine ChatInput's immediate attachments (e.g. voice) with Staged Attachments
    const allAttachments = [...pendingAttachments, ...atts];

    if (editingMsg) {
      onEdit(editingMsg.id, text);
      setEditingMsg(null);
    } else {
      onSend(text, allAttachments, replyMsg, extras);
    }
    
    setInput("");
    setPendingAttachments([]); // Clear staging
    setReplyTo(null);
    onTyping(false);
    sfx.playSubmit();
  }, [editingMsg, onEdit, onSend, onTyping, pendingAttachments]);

  // Fix: Actual File Processing Logic
  const handleAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      sfx.playClick();
      setToast({ title: 'Payload Detected', message: 'Initializing security scan...', type: 'info' });

      for (let i = 0; i < files.length; i++) {
          const file = files[i];
          
          // Add to staging with scanning state
          const initialAtt: Attachment = {
              type: file.type.startsWith('image') ? 'image' : 'file',
              name: file.name,
              url: '', // Will be filled
              size: `${(file.size / 1024).toFixed(0)}KB`,
              isScanning: true,
              md5: 'CALCULATING...'
          };
          
          setPendingAttachments(prev => [...prev, initialAtt]);

          try {
              const base64 = await fileToBase64(file);
              // Simulate Scan Delay
              await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
              
              const mockMd5 = Math.random().toString(16).substr(2, 8).toUpperCase() + 
                              Math.random().toString(16).substr(2, 8).toUpperCase();

              setPendingAttachments(prev => prev.map(a => 
                  a.name === file.name && a.isScanning ? {
                      ...a,
                      url: base64,
                      isScanning: false,
                      isEncrypted: true,
                      md5: mockMd5
                  } : a
              ));
          } catch {
              setToast({ title: 'Upload Error', message: `Failed to load ${file.name}`, type: 'error' });
              setPendingAttachments(prev => prev.filter(a => a.name !== file.name));
          }
      }
  };

  const removeAttachment = (index: number) => {
      setPendingAttachments(prev => prev.filter((_, i) => i !== index));
      sfx.playDecline();
  };

  return (
    <div className="flex h-full w-full relative overflow-hidden" 
         style={{ background: currentWallpaper ? `url(${currentWallpaper}) center/cover` : 'transparent' }}>
      
      {currentWallpaper && <div className="absolute inset-0 bg-surface-alt backdrop-blur-[2px]"></div>}

      <div 
        className="flex flex-col h-full flex-1 relative z-10"
        onDragEnter={() => { dragCounterRef.current++; setIsDragging(true); }}
        onDragLeave={() => { dragCounterRef.current--; if (dragCounterRef.current === 0) setIsDragging(false); }}
        onDrop={() => { dragCounterRef.current = 0; setIsDragging(false); }}
      >
        {isDragging && <DragOverlay />}
        
        <ChatHeader 
            conversation={activeConversation}
            typingNow={typingNow}
            isMaximized={isMaximized}
            toggleMaximize={toggleMaximize}
            onStartCall={onStartCall}
            showMediaSidebar={showMediaSidebar}
            toggleMediaSidebar={() => setShowMediaSidebar(!showMediaSidebar)}
            onViewProfileImage={() => { if(activeConversation.peerAvatar) setViewingMedia({ src: activeConversation.peerAvatar, type: 'image', name: activeConversation.peerName }); }}
            onSearch={onSearchChange}
            searchQuery={searchQuery}
            onTogglePin={() => onPin(activeConversation.id)}
            onChangeWallpaper={(bg) => setCurrentWallpaper(bg)}
            onCreateGroup={onCreateGroup || (() => {})}
            onMute={() => setIsMuted(!isMuted)}
            isMuted={isMuted}
        />

        {/* MESSAGES STREAM */}
        <div 
            ref={scrollContainerRef} 
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 relative z-0 pt-20 pb-20"
        >
            <div className={`mx-auto flex flex-col gap-1 min-h-full justify-end transition-all duration-500 ${isMaximized ? 'max-w-full px-8' : 'max-w-3xl'}`}>
                {visibleMessages.map((msg, idx) => {
                    const prevMsg = visibleMessages[idx - 1];
                    const isStacked = prevMsg?.senderId === msg.senderId && (msg.timestamp - prevMsg.timestamp < 300000);
                    const showDate = !prevMsg || new Date(msg.timestamp).toDateString() !== new Date(prevMsg.timestamp).toDateString();

                    return (
                        <React.Fragment key={msg.id}>
                            {showDate && <DateSeparator date={new Date(msg.timestamp)} />}
                            <MessageBubble 
                                msg={msg} 
                                isMe={msg.senderId === currentUser.id} 
                                isStacked={isStacked}
                                currentUser={currentUser} 
                                onReply={setReplyTo} 
                                onEdit={(m) => { setEditingMsg(m); setInput(m.text); }} 
                                onDelete={onDelete} 
                                onPin={onPin} 
                                onReaction={onReaction} 
                                onForward={setForwardingMsg}
                                onVote={onVote}
                                onViewImage={(url, name) => setViewingMedia({ src: url, type: 'image', name })}
                            />
                        </React.Fragment>
                    );
                })}
                
                <TypingBubble users={typingNow} />
                <div ref={endRef} className="h-2 shrink-0" />
            </div>
        </div>

        {/* INPUT CAPSULE */}
        <div className="absolute bottom-4 left-0 right-0 z-30 flex flex-col items-center px-4 pointer-events-none">
            <div className={`w-full ${isMaximized ? 'max-w-full px-6' : 'max-w-3xl'} pointer-events-auto flex flex-col gap-2`}>
                
                {/* Pending Attachments Staging Area */}
                {pendingAttachments.length > 0 && (
                    <div className="flex gap-2 p-2 bg-surface-alt border border-border-subtle rounded-lg mx-1 shadow-lg overflow-x-auto">
                        {pendingAttachments.map((att, idx) => (
                            <div key={idx} className="relative group shrink-0">
                                {att.type === 'image' ? (
                                    <div className="relative">
                                        <img src={att.url || 'https://picsum.photos/seed/scan/100/100'} className={`w-16 h-16 object-cover rounded-md border border-border-subtle ${att.isScanning ? 'blur-sm grayscale animate-pulse' : ''}`} alt="preview" />
                                        {att.isScanning && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className={`w-16 h-16 flex flex-col items-center justify-center bg-surface-main border border-border-subtle rounded-md ${att.isScanning ? 'animate-pulse' : ''}`}>
                                        {att.isScanning ? <UploadCloud size={16} className="text-accent-secondary animate-bounce" /> : <FileText size={16} className="text-text-muted mb-1"/>}
                                        <span className="text-[10px] font-semibold text-text-muted ">{att.isScanning ? 'Scan...' : att.size}</span>
                                    </div>
                                )}
                                <button 
                                    onClick={() => removeAttachment(idx)}
                                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-text-primary p-0.5 rounded-full shadow-md hover:scale-110 active:scale-95 transition-all z-10"
                                >
                                    <X size={14} strokeWidth={3}/>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeConversation.peerName.startsWith('[INT]') ? (
                    <div className="flex justify-center p-2">
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-status-error px-4 py-2 rounded-lg text-sm font-semibold shadow-inner">
                            <Lock size={16} /> Restricted Internal Channel
                        </div>
                    </div>
                ) : (
                    <div className="bg-surface-alt rounded-lg shadow-sm border border-transparent hover:border-border-subtle transition-colors focus-within:ring-1 focus-within:ring-indigo-500/50">
                        <ChatInput 
                            input={input}
                            setInput={setInput}
                            onSend={handleSend}
                            onTyping={(e) => { setInput(e.target.value); onTyping(e.target.value.length > 0); }}
                            isRecording={false}
                            isBlocked={isOffline}
                            onStartRecording={() => {}}
                            onStopRecording={() => {}}
                            onAttach={handleAttach}
                            onCreatePoll={onCreatePoll || (() => {})}
                            onShareLocation={onShareLocation || (() => {})}
                            placeholder={`Message...`}
                            replyTo={replyTo}
                            editingMsg={editingMsg}
                            onCancelContext={() => { setReplyTo(null); setEditingMsg(null); }}
                            users={users.filter(u => u.id !== currentUser.id)}
                            lastReceivedMessage={lastReceivedMessage}
                        />
                    </div>
                )}
            </div>
        </div>

        {showScrollButton && (
            <button 
                onClick={() => scrollToBottom()}
                className="absolute bottom-28 right-10 z-50 p-2.5 bg-surface-alt hover:bg-surface-highlight text-text-primary rounded-full shadow-lg transition-all"
            >
                <ArrowDown size={18} strokeWidth={2.5} />
            </button>
        )}
      </div>

      {showMediaSidebar && (
          <ChatInfoSidebar 
              isOpen={showMediaSidebar} 
              onClose={() => setShowMediaSidebar(false)} 
              messages={messages}
              onNavigateToMsg={(id) => {
                  const el = document.getElementById(`msg-${id}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
          />
      )}

      {viewingMedia && (
          <MediaViewer 
              src={viewingMedia.src} 
              type={viewingMedia.type} 
              name={viewingMedia.name} 
              onClose={() => setViewingMedia(null)} 
          />
      )}
      
      <ForwardMessageModal 
        isOpen={!!forwardingMsg} 
        onClose={() => setForwardingMsg(null)} 
        messageToForward={forwardingMsg} 
        currentUser={currentUser}
      />
    </div>
  );
};
