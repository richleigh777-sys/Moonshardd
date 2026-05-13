
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
import { SystemConsole } from './SystemConsole';

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
  const [consoleEvents, setConsoleEvents] = useState<any[]>([]);
  
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

  useEffect(() => {
    if (typingNow.length > 0) {
        setTimeout(() => {
            setConsoleEvents(prev => [...prev, { text: `${typingNow[0]} is transmitting...`, type: 'info' }]);
        }, 0);
    }
  }, [typingNow]);

  useEffect(() => {
    if (messages.length > 0) {
        const last = messages[messages.length - 1];
        if (last.senderId !== currentUser.id) {
            setTimeout(() => {
                setConsoleEvents(prev => [...prev, { text: `Incoming packet from ${last.senderName}`, type: 'success' }]);
            }, 0);
        }
    }
  }, [messages, currentUser.id]);

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
              
              setConsoleEvents(prev => [...prev, { text: `SCAN COMPLETE: ${file.name} [SECURE]`, type: 'success' }]);
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
      
      {currentWallpaper && <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>}

      <div 
        className="flex flex-col h-full flex-1 relative z-10"
        onDragEnter={() => { dragCounterRef.current++; setIsDragging(true); }}
        onDragLeave={() => { dragCounterRef.current--; if (dragCounterRef.current === 0) setIsDragging(false); }}
        onDrop={() => { dragCounterRef.current = 0; setIsDragging(false); }}
      >
        {isDragging && <DragOverlay />}
        
        <SystemConsole events={consoleEvents} />

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
            className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 relative z-0 pt-16 pb-20"
        >
            <div className={`mx-auto flex flex-col gap-1 min-h-full justify-end transition-all duration-500 ${isMaximized ? 'max-w-full px-8' : 'max-w-3xl'}`}>
                {visibleMessages.length === 0 && !searchQuery && (
                    <div className="flex flex-col items-center justify-center py-8 opacity-30 select-none">
                        <Lock size={32} strokeWidth={1} className="mb-4 text-indigo-500" />
                        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Encrypted Tunnel</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-1.5">Messages are end-to-end secured.</p>
                    </div>
                )}

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
            <div className={`w-full ${isMaximized ? 'max-w-full px-6' : 'max-w-2xl'} pointer-events-auto flex flex-col gap-2`}>
                
                {/* Pending Attachments Staging Area */}
                {pendingAttachments.length > 0 && (
                    <div className="flex gap-2.5 overflow-x-auto p-2.5 bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-[20px] mx-3 mb-1.5 animate-in slide-in-from-bottom-4 shadow-2xl">
                        {pendingAttachments.map((att, idx) => (
                            <div key={idx} className="relative group shrink-0">
                                {att.type === 'image' ? (
                                    <div className="relative">
                                        <img src={att.url || 'https://picsum.photos/seed/scan/100/100'} className={`w-16 h-16 object-cover rounded-xl border border-white/10 shadow-lg ${att.isScanning ? 'blur-sm grayscale animate-pulse' : ''}`} alt="preview" />
                                        {att.isScanning && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className={`w-16 h-16 flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-xl shadow-lg ${att.isScanning ? 'animate-pulse' : ''}`}>
                                        {att.isScanning ? <UploadCloud size={20} className="text-indigo-400 animate-bounce" /> : <FileText size={20} className="text-slate-400 mb-1"/>}
                                        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{att.isScanning ? 'SCANNING' : att.size}</span>
                                    </div>
                                )}
                                <button 
                                    onClick={() => removeAttachment(idx)}
                                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white p-1 rounded-full shadow-xl hover:scale-125 active:scale-90 transition-all z-10"
                                >
                                    <X size={10} strokeWidth={4}/>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="bg-slate-950/40 backdrop-blur-3xl border border-white/10 rounded-[24px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500 hover:border-white/20">
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
                        placeholder={`Transmit to ${activeConversation.peerName}...`}
                        replyTo={replyTo}
                        editingMsg={editingMsg}
                        onCancelContext={() => { setReplyTo(null); setEditingMsg(null); }}
                        users={users.filter(u => u.id !== currentUser.id)}
                        lastReceivedMessage={lastReceivedMessage}
                    />
                </div>
            </div>
        </div>

        {showScrollButton && (
            <button 
                onClick={() => scrollToBottom()}
                className="absolute bottom-28 right-10 z-50 p-2.5 bg-accent-primary text-white shadow-lg shadow-accent-primary/40 hover:scale-110 active:scale-95 transition-all animate-in fade-in zoom-in"
            >
                <ArrowDown size={16} strokeWidth={3} />
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
