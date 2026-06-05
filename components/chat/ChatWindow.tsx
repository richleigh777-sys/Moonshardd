
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ArrowDown, Lock, FileText, X, UploadCloud, Pin, MapPin } from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';
import { Conversation } from '../../services/ChatService';
import { MessageBubble } from './MessageBubble';
import { ChatMessage, User, Attachment, CallState, CallParticipant } from '../../types';
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
import { Modal } from '../ui/Modal';
import { PollCreator } from './PollCreator';
import { CallOverlay } from './CallOverlay';

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
  
  // Real active modules states
  const [showPollModal, setShowPollModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [selectedPresetLocation, setSelectedPresetLocation] = useState('');

  const [callState, setCallState] = useState<CallState>({
      isActive: false,
      isMinimized: false,
      type: null,
      status: 'ended',
      channelId: null,
      participants: []
  });
  
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  // Simulated calling mechanism with true viewport rendering
  const startCall = (type: 'audio' | 'video') => {
      sfx.playClick();
      setToast({ title: 'Secure Uplink', message: `Initializing encrypted ${type} channel...`, type: 'info' });
      onStartCall?.(type);

      const peerAvatar = activeConversation.peerAvatar || 'https://picsum.photos/seed/peer/100/100';
      
      setCallState({
          isActive: true,
          isMinimized: false,
          type,
          status: 'dialing',
          channelId: activeConversation.id,
          channelName: activeConversation.peerName,
          participants: [
              {
                  id: activeConversation.peerId || 'peer',
                  name: activeConversation.peerName,
                  avatar: peerAvatar,
                  isMuted: false,
                  isTalking: false,
                  isVideoOff: type === 'audio'
              }
          ],
          startTime: Date.now(),
          isMuted: false,
          isCameraOff: type === 'audio',
          isScreenSharing: false
      });

      // Simulated answer feedback loop
      setTimeout(() => {
          setCallState(prev => {
              if (prev.isActive && prev.status === 'dialing') {
                  setToast({ title: 'Uplink Established', message: `Connected to secure room: ${prev.channelName}`, type: 'success' });
                  sfx.playSubmit();
                  return {
                      ...prev,
                      status: 'connected',
                      startTime: Date.now()
                  };
              }
              return prev;
          });
      }, 2500);
  };

  const endCall = () => {
      sfx.playDecline();
      setToast({ title: 'Uplink Terminated', message: 'Secure call ended.', type: 'warning' });
      setCallState({
          isActive: false,
          isMinimized: false,
          type: null,
          status: 'ended',
          channelId: null,
          participants: []
      });
  };

  const toggleCallMute = () => {
      sfx.playClick();
      setCallState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const toggleCallVideo = () => {
      sfx.playClick();
      setCallState(prev => ({ ...prev, isCameraOff: !prev.isCameraOff }));
  };

  const toggleCallScreenShare = () => {
      sfx.playClick();
      setCallState(prev => {
          const nextShare = !prev.isScreenSharing;
          setToast({
              title: 'Screen Share',
              message: nextShare ? 'Screen sharing active.' : 'Screen sharing stopped.',
              type: 'info'
          });
          return { ...prev, isScreenSharing: nextShare };
      });
  };

  const toggleCallMinimize = () => {
      sfx.playClick();
      setCallState(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
  };

  const handleLocationSubmit = (addressToShare: string) => {
      if (!addressToShare) {
          setToast({ title: 'Location Error', message: 'Please select or enter an address.', type: 'error' });
          return;
      }
      const locationData: any = {
          address: addressToShare,
          latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
          longitude: -122.4194 + (Math.random() - 0.5) * 0.1
      };
      // Send location directly via onSend
      onSend("", [], undefined, { location: locationData });
      setShowLocationModal(false);
      setCustomLocation('');
      setSelectedPresetLocation('');
      setToast({ title: 'Location Shared', message: `Location shared: ${addressToShare}`, type: 'success' });
  };
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
  const [showPinnedMsgs, setShowPinnedMsgs] = useState(false);
  const dragCounterRef = useRef(0);

  const { setToast } = useSystem();
  const endRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const visibleMessages = useMemo(() => {
      if (!searchQuery) return messages;
      return messages.filter(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [messages, searchQuery]);

  const pinnedMessages = useMemo(() => {
      return messages.filter(m => m.isPinned && !m.isDeleted);
  }, [messages]);

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

  const jumpToMessage = (id: string) => {
      const el = document.getElementById(`msg-${id}`);
      if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-2', 'ring-accent-secondary', 'ring-offset-2', 'rounded-lg');
          setTimeout(() => el.classList.remove('ring-2', 'ring-accent-secondary', 'ring-offset-2', 'rounded-lg'), 2000);
      }
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [activeConversation.id, scrollToBottom]);

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    
    // Automatically scroll down if user was already at the bottom or sent a new message
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

  const handleSend = (text: string, atts: Attachment[], replyMsg?: ChatMessage, extras?: any) => {
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
  };

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
      
      {currentWallpaper && <div className="absolute inset-0 bg-surface-main/30 backdrop-blur-sm -z-10"></div>}

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
            onStartCall={startCall}
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

        {/* PINNED MESSAGES BAR */}
        {pinnedMessages.length > 0 && (
            <div className="bg-surface-alt/80 backdrop-blur-md border-b border-border-subtle p-2 md:px-4 z-20 sticky top-0 flex items-center justify-between">
                 <div className="flex items-center gap-3 w-full overflow-hidden">
                    <Pin size={16} className="text-accent-secondary shrink-0" />
                    <div 
                        className="flex-1 cursor-pointer truncate text-sm font-semibold opacity-90 hover:opacity-100 transition-opacity" 
                        onClick={() => jumpToMessage(pinnedMessages[pinnedMessages.length - 1].id)}
                    >
                        <span className="opacity-60 mr-2">{pinnedMessages[pinnedMessages.length - 1].senderName}:</span>
                        {pinnedMessages[pinnedMessages.length - 1].text}
                    </div>
                 </div>
                 {pinnedMessages.length > 1 && (
                     <button 
                        onClick={() => setShowPinnedMsgs(!showPinnedMsgs)} 
                        className="ml-4 shrink-0 text-xs font-bold text-accent-secondary hover:underline"
                     >
                         {showPinnedMsgs ? 'Hide' : `See all (${pinnedMessages.length})`}
                     </button>
                 )}
            </div>
        )}

        {/* EXPANDED PINNED MESSAGES */}
        {showPinnedMsgs && pinnedMessages.length > 1 && (
            <div className="absolute top-16 left-0 right-0 bg-surface-alt border-b border-border-subtle shadow-lg z-30 max-h-60 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-2">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-sm text-text-primary">Pinned Messages</h3>
                    <button onClick={() => setShowPinnedMsgs(false)}><X size={16}/></button>
                </div>
                {pinnedMessages.map((pm) => (
                    <div key={pm.id} onClick={() => jumpToMessage(pm.id)} className="bg-surface-main p-3 border border-border-subtle rounded-lg cursor-pointer hover:border-accent-secondary/50 transition-colors">
                        <div className="text-xs text-text-muted mb-1 flex justify-between">
                            <span>{pm.senderName}</span>
                            <span>{new Date(pm.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div className="text-sm line-clamp-2">{pm.text}</div>
                    </div>
                ))}
            </div>
        )}

        {/* MESSAGES STREAM */}
        <div className="flex-1 relative z-0">
            <Virtuoso
                className="custom-scrollbar h-full w-full"
                data={visibleMessages}
                initialTopMostItemIndex={visibleMessages.length - 1}
                followOutput={true}
                alignToBottom={true}
                atBottomStateChange={(atBottom) => {
                    setShowScrollButton(!atBottom);
                }}
                components={{
                    Footer: () => (
                        <div className="mx-auto flex flex-col gap-1 pb-[120px]">
                            <TypingBubble users={typingNow} />
                            <div ref={endRef} className="h-4 shrink-0 mt-4" />
                        </div>
                    ),
                    List: React.forwardRef((props, ref) => (
                        <div 
                            {...props} 
                            ref={ref} 
                            className={`mx-auto flex flex-col gap-1 w-full transition-all duration-500 p-3 h-full justify-end ${isMaximized ? 'max-w-full px-8' : 'max-w-3xl'}`} 
                        />
                    ))
                }}
                itemContent={(idx, msg) => {
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
                                onJumpTo={jumpToMessage}
                                onViewImage={(url, name) => setViewingMedia({ src: url, type: 'image', name })}
                            />
                        </React.Fragment>
                    );
                }}
            />
        </div>

        {/* SCROLL TO BOTTOM BUTTON */}
        <div className="absolute bottom-28 right-8 z-40 transition-all duration-300 pointer-events-none">
            {showScrollButton && (
                <button 
                    onClick={() => scrollToBottom('smooth')}
                    className="p-3 bg-accent-secondary hover:bg-accent-secondary/90 text-surface-main rounded-full shadow-float transition-all animate-in zoom-in pointer-events-auto flex items-center justify-center transform active:scale-95"
                >
                    <ArrowDown size={20} strokeWidth={2.5} />
                </button>
            )}
        </div>

        {/* INPUT CAPSULE */}
        <div className="absolute bottom-4 left-0 right-0 z-30 flex flex-col items-center px-4 pointer-events-none">
            <div className={`w-full ${isMaximized ? 'max-w-full px-6' : 'max-w-3xl'} pointer-events-auto flex flex-col gap-2`}>
                
                {/* Pending Attachments Staging Area */}
                {pendingAttachments.length > 0 && (
                    <div className="flex gap-2 p-2 bg-surface-alt/90 backdrop-blur-md border border-border-subtle rounded-xl shadow-float overflow-x-auto max-w-full animate-in slide-in-from-bottom-3">
                        {pendingAttachments.map((att, idx) => (
                            <div key={idx} className="relative group shrink-0">
                                {att.type === 'image' ? (
                                    <div className="relative">
                                        <img src={att.url || 'https://picsum.photos/seed/scan/100/100'} className={`w-16 h-16 object-cover rounded-md border border-border-subtle ${att.isScanning ? 'blur-sm grayscale animate-pulse' : ''}`} alt="preview" />
                                        {att.isScanning && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-5 h-5 border-2 border-accent-secondary border-t-transparent rounded-full animate-spin"></div>
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
                                    className="absolute -top-1.5 -right-1.5 bg-status-error text-surface-main p-0.5 rounded-full shadow-md hover:scale-110 active:scale-95 transition-all z-10"
                                >
                                    <X size={14} strokeWidth={3}/>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeConversation.peerName.startsWith('[INT]') ? (
                    <div className="flex justify-center p-2">
                        <div className="flex items-center gap-2 bg-status-error/10 border border-status-error/20 text-status-error px-4 py-2 rounded-lg text-sm font-bold shadow-inner">
                            <Lock size={16} /> Restricted Internal Channel
                        </div>
                    </div>
                ) : (
                    <div className="w-full">
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
                            onCreatePoll={() => setShowPollModal(true)}
                            onShareLocation={() => setShowLocationModal(true)}
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

      {/* CALL OVERLAY FOR TERMINAL */}
      <CallOverlay 
          callState={callState}
          onEnd={endCall}
          onMute={toggleCallMute}
          onVideo={toggleCallVideo}
          onScreenShare={toggleCallScreenShare}
          onMinimize={toggleCallMinimize}
          localVideoRef={localVideoRef}
      />

      {/* ONLINE POLL CREATOR MODAL */}
      <Modal isOpen={showPollModal} onClose={() => setShowPollModal(false)} title="Create Secure Poll">
          <PollCreator 
              onSubmit={(question, options) => {
                  const pollData = {
                      question,
                      options: options.map((opt, index) => ({
                          id: `opt-${index}`,
                          text: opt,
                          votes: 0,
                          voters: []
                      }))
                  };
                  onSend("", [], undefined, { poll: pollData });
                  setShowPollModal(false);
                  setToast({ title: 'Poll Spawned', message: 'Encrypted poll successfully sent directly on-air.', type: 'success' });
              }}
              onCancel={() => setShowPollModal(false)}
          />
      </Modal>

      {/* ENCRYPTED GEOLOCATION BROADCASTER MODAL */}
      <Modal isOpen={showLocationModal} onClose={() => setShowLocationModal(false)} title="Share Encrypted Location">
          <div className="flex flex-col gap-6">
              <p className="text-sm font-semibold text-text-muted leading-relaxed">
                  Select a predefined high-priority enterprise HQ node, or type a custom address coordinates below to broadcast safely on the secure channel.
              </p>
              
              <div className="grid grid-cols-1 gap-2.5">
                  {[
                      { name: 'Silicon Valley HQ', val: 'Silicon Valley HQ: 1600 Amphitheatre Pkwy, Mountain View, CA' },
                      { name: 'Manila Core Operations', val: 'Manila Core Operations Hub: 32nd St, Bonifacio Global City, Taguig, Manila' },
                      { name: 'London Sales Office', val: 'London Sales Office: 1 Uxbridge Rd, Ealing, London W5 5TL, UK' },
                  ].map((loc) => {
                      const isSelected = selectedPresetLocation === loc.val;
                      return (
                          <button
                              key={loc.name}
                              type="button"
                              onClick={() => { setSelectedPresetLocation(loc.val); setCustomLocation(''); }}
                              className={`p-4 border text-left rounded-2xl flex items-center justify-between transition-all font-semibold ${isSelected ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500' : 'border-border-subtle hover:bg-surface-alt text-text-primary bg-surface-main'}`}
                          >
                              <div className="flex items-center gap-3">
                                  <MapPin className="text-indigo-500" size={18} />
                                  <span>{loc.name}</span>
                              </div>
                              <span className="text-[11px] text-text-muted font-mono">{isSelected ? 'SELECTED' : 'PRESET'}</span>
                          </button>
                      );
                  })}
              </div>

              <div className="flex flex-col gap-2">
                  <label className="text-xs font-[700] tracking-wider text-text-muted">CUSTOM ADDRESS OR DATA LINK</label>
                  <input
                      type="text"
                      placeholder="e.g. Clients Head Office, Tokyo, Japan"
                      value={customLocation}
                      onChange={(e) => { setCustomLocation(e.target.value); setSelectedPresetLocation(''); }}
                      className="w-full px-4 py-3 bg-surface-alt border border-border-subtle rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-accent-secondary/50 text-text-primary transition-all"
                  />
              </div>

              <div className="flex gap-3 justify-end mt-4 border-t border-border-subtle pt-5">
                  <button
                      type="button"
                      onClick={() => setShowLocationModal(false)}
                      className="px-5 py-2.5 rounded-xl border border-border-subtle text-sm font-bold text-text-muted hover:bg-surface-alt transition-colors"
                  >
                      Cancel
                  </button>
                  <button
                      type="button"
                      onClick={() => handleLocationSubmit(customLocation || selectedPresetLocation)}
                      className="px-6 py-2.5 rounded-xl bg-indigo-500 text-surface-main font-bold hover:bg-indigo-600 shadow-sm transition-colors text-sm"
                  >
                      Share Coordinate
                  </button>
              </div>
          </div>
      </Modal>
    </div>
  );
};

