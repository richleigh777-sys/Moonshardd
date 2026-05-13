import React, { useState, useEffect, useRef } from 'react';
import { 
    Plus, Link, MessageCircle, Users, Bell, Phone, MoreHorizontal, 
    Send, Smile, Video, Bold, Italic, Underline, List, MoreVertical, 
    ChevronDown, ChevronRight, Filter, Quote, Image, FileText, Grid, Calendar
} from 'lucide-react';
import { sfx } from '../../../lib/soundService';

// --- MICROSOFT TEAMS DESKTOP REPLICA ---

interface TeamChannel {
    id: string;
    name: string;
    type: 'general' | 'random' | 'locked';
    unread: number;
}

interface TeamGroup {
    id: string;
    name: string;
    expanded: boolean;
    channels: TeamChannel[];
}

export const TeamsMock = () => {
    // -- STATE --
    const [teams, setTeams] = useState<TeamGroup[]>([
        {
            id: 't1', name: 'Nexus Sales & Ops', expanded: true,
            channels: [
                { id: 'c1', name: 'General', type: 'general', unread: 0 },
                { id: 'c2', name: 'Collaboration', type: 'locked', unread: 5 },
                { id: 'c3', name: 'Lead Handoff', type: 'random', unread: 2 },
            ]
        },
        {
            id: 't2', name: 'Global Logistics', expanded: false,
            channels: [
                { id: 'c4', name: 'General', type: 'general', unread: 0 },
                { id: 'c5', name: 'Shipping Manifests', type: 'random', unread: 0 },
            ]
        },
        {
            id: 't3', name: 'System Admin', expanded: false,
            channels: [
                { id: 'c6', name: 'General', type: 'general', unread: 0 },
                { id: 'c7', name: 'Alerts', type: 'locked', unread: 12 },
            ]
        }
    ]);
    
    const [activeChannelId, setActiveChannelId] = useState('c1');
    const [activeTab, setActiveTab] = useState('Posts');
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Mock Messages Data
    const [messages, setMessages] = useState([
        { id: 1, sender: 'Ops Director Alpha', role: 'Director', text: 'Team, Q3 projections are live in the Files tab. Please review the Alpha line specifics.', time: '10:42 AM', initials: 'OD', avatarColor: 'bg-indigo-600', date: 'Yesterday' },
        { id: 2, sender: 'Sarah Connor', role: 'Agent', text: 'Just finalized the Wayne Enterprise renewal. Uploading the signed manifest now.', time: '10:45 AM', initials: 'SC', avatarColor: 'bg-emerald-600', date: 'Yesterday' },
        { id: 3, sender: 'The Architect', role: 'System Admin', text: 'Excellent work, Sarah. I need everyone to verify their shipping manifest logs before EOD.', time: '10:46 AM', initials: 'TA', avatarColor: 'bg-slate-600', date: 'Yesterday' },
        { id: 4, sender: 'John Wick', role: 'Logistics', text: 'Inventory check complete. We are green on all sectors.', time: '09:15 AM', initials: 'JW', avatarColor: 'bg-amber-600', date: 'Today' },
    ]);

    // Derived active context
    const activeGroup = teams.find(t => t.channels.some(c => c.id === activeChannelId));
    const activeChannel = activeGroup?.channels.find(c => c.id === activeChannelId);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, activeChannelId]);

    const toggleGroup = (groupId: string) => {
        setTeams(prev => prev.map(t => t.id === groupId ? { ...t, expanded: !t.expanded } : t));
    };

    const handleChannelClick = (id: string) => {
        setActiveChannelId(id);
        sfx.playClick();
    };

    const sendMessage = () => {
        if (!input.trim()) return;
        setMessages([...messages, {
            id: Date.now(),
            sender: 'You',
            role: 'Agent',
            text: input,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            initials: 'ME',
            avatarColor: 'bg-purple-600',
            date: 'Today'
        }]);
        setInput('');
        sfx.playSubmit();
    };

    return (
        <div className="flex w-full h-full bg-[#201F1F] text-[#E0E0E0] font-sans overflow-hidden select-none relative">
            
            {/* --- 1. APP RAIL (68px Fixed) --- */}
            <div className="w-[68px] bg-[#2B2B2B] flex flex-col items-center py-3 gap-1 shrink-0 z-20 shadow-[1px_0_0_#1a1a1a]">
                <RailIcon icon={Bell} label="Activity" />
                <RailIcon icon={MessageCircle} label="Chat" />
                <RailIcon icon={Users} label="Teams" active />
                <RailIcon icon={Calendar} label="Calendar" />
                <RailIcon icon={Phone} label="Calls" />
                <RailIcon icon={FileText} label="Files" />
                <div className="mt-auto mb-2 flex flex-col gap-2">
                    <RailIcon icon={MoreHorizontal} label="" />
                    <RailIcon icon={Grid} label="Apps" />
                </div>
            </div>

            {/* --- 2. TEAMS LIST SIDEBAR (320px Fixed) --- */}
            <div className="w-[320px] bg-[#2F2F2F] flex flex-col border-r border-black/20 shrink-0 h-full">
                
                {/* Sidebar Header */}
                <div className="h-14 flex items-center justify-between px-4 shrink-0">
                    <span className="font-bold text-base text-white tracking-tight">Teams</span>
                    <div className="flex items-center gap-1">
                        <button className="p-1.5 hover:bg-[#3B3B3B] rounded text-gray-400 hover:text-white transition-colors" title="Filter">
                            <Filter size={16} />
                        </button>
                        <button className="p-1.5 hover:bg-[#3B3B3B] rounded text-gray-400 hover:text-white transition-colors" title="Create Team">
                            <EditBtn size={16} />
                        </button>
                    </div>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pt-2 pb-4">
                    {teams.map(group => (
                        <div key={group.id} className="mb-1">
                            {/* Group Header */}
                            <div 
                                onClick={() => toggleGroup(group.id)}
                                className="flex items-center gap-1 px-3 py-1.5 cursor-pointer hover:bg-[#3B3B3B] text-gray-300 hover:text-white group transition-colors select-none"
                            >
                                {group.expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                <div className="w-5 h-5 rounded bg-transparent flex items-center justify-center">
                                    <Users size={16} className="text-[#E0E0E0]"/>
                                </div>
                                <span className="text-[13px] font-bold truncate leading-none pt-0.5">{group.name}</span>
                                <MoreHorizontal size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                            </div>

                            {/* Channel List */}
                            {group.expanded && (
                                <div className="flex flex-col mt-0.5">
                                    {group.channels.map(channel => {
                                        const isActive = channel.id === activeChannelId;
                                        return (
                                            <div 
                                                key={channel.id}
                                                onClick={() => handleChannelClick(channel.id)}
                                                className={`
                                                    relative pl-10 pr-4 py-1 flex items-center justify-between cursor-pointer group 
                                                    ${isActive ? 'bg-[#3B3B3B] text-white italic' : 'text-gray-400 hover:text-white hover:bg-[#333333]'}
                                                `}
                                            >
                                                {/* Active Indicator Line */}
                                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#6264A7]"></div>}
                                                
                                                <span className={`text-[13px] truncate ${isActive ? 'font-bold' : 'font-normal'}`}>
                                                    {channel.name}
                                                </span>
                                                {channel.unread > 0 && (
                                                    <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 rounded-full min-w-[18px] text-center">
                                                        {channel.unread}
                                                    </span>
                                                )}
                                                {channel.type === 'locked' && !channel.unread && <span className="text-[10px] opacity-50">🔒</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* --- 3. MAIN STAGE (Flex Grow) --- */}
            <div className="flex-1 flex flex-col bg-[#1F1F1F] min-w-0 relative h-full">
                
                {/* Channel Header */}
                <div className="h-14 border-b border-[#2D2D2D] flex items-center justify-between px-6 shrink-0 bg-[#1F1F1F]">
                    <div className="flex flex-col justify-center h-full">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-[#464775] flex items-center justify-center shadow-sm">
                                <Users size={18} className="text-white" />
                            </div>
                            <div>
                                <div className="font-bold text-base text-white tracking-tight leading-none flex items-center gap-2">
                                    {activeChannel?.name}
                                    <span className="text-[10px] font-normal text-gray-400 bg-[#2D2D2D] px-1.5 rounded border border-[#3E3E3E]">
                                        {activeGroup?.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    <span className="text-[10px] text-gray-400">Last activity: Just now</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center -space-x-2 mr-2">
                             <div className="w-7 h-7 rounded-full border-2 border-[#1F1F1F] bg-indigo-500 flex items-center justify-center text-[9px] font-bold">OD</div>
                             <div className="w-7 h-7 rounded-full border-2 border-[#1F1F1F] bg-emerald-500 flex items-center justify-center text-[9px] font-bold">SC</div>
                             <div className="w-7 h-7 rounded-full border-2 border-[#1F1F1F] bg-[#2D2D2D] flex items-center justify-center text-[9px] font-bold text-gray-300">+4</div>
                        </div>
                        <div className="h-5 w-px bg-[#3E3E3E]"></div>
                        <button className="p-1.5 hover:bg-[#2D2D2D] rounded text-[#6264A7] hover:text-[#7B83EB] transition-colors"><Video size={20} /></button>
                        <button className="p-1.5 hover:bg-[#2D2D2D] rounded text-[#6264A7] hover:text-[#7B83EB] transition-colors"><Phone size={18} /></button>
                        <button className="p-1.5 hover:bg-[#2D2D2D] rounded text-gray-400 hover:text-white transition-colors"><MoreVertical size={18} /></button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center px-6 gap-6 border-b border-[#2D2D2D] text-xs font-bold text-gray-400 shrink-0">
                    {['Posts', 'Files', 'Wiki', 'Dashboard', 'Meeting Notes'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => { setActiveTab(tab); sfx.playClick(); }}
                            className={`py-3 border-b-[3px] transition-colors ${activeTab === tab ? 'text-[#6264A7] border-[#6264A7]' : 'border-transparent hover:text-gray-200'}`}
                        >
                            {tab}
                        </button>
                    ))}
                    <button className="py-3 hover:text-gray-200"><Plus size={14}/></button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#1F1F1F] custom-scrollbar" ref={scrollRef}>
                    <div className="flex flex-col items-center justify-center py-8 opacity-40 select-none">
                        <div className="w-24 h-24 rounded-full bg-[#292929] flex items-center justify-center mb-4">
                            <Users size={48} className="text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Welcome to the team!</h3>
                        <p className="text-gray-400 text-sm mt-1">This is the start of the {activeChannel?.name} channel.</p>
                    </div>

                    {messages.map((msg) => (
                        <div key={msg.id} className="flex gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-md ${msg.avatarColor} flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5 shadow-sm`}>
                                {msg.initials}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-0.5">
                                    <span className="font-bold text-[13px] text-[#E0E0E0]">{msg.sender}</span>
                                    <span className="text-[10px] text-gray-400">{msg.date}, {msg.time}</span>
                                </div>
                                <div className="text-[14px] text-[#E0E0E0] leading-relaxed whitespace-pre-wrap">
                                    {msg.text}
                                </div>
                                
                                {/* Reactions Hover */}
                                <div className="h-6 opacity-0 group-hover:opacity-100 flex items-center gap-2 mt-1 transition-opacity">
                                    <div className="px-2 py-0.5 rounded-md bg-[#2D2D2D] border border-black/30 flex gap-1 cursor-pointer shadow-sm">
                                        <span className="text-xs hover:scale-125 transition-transform">👍</span>
                                        <span className="text-xs hover:scale-125 transition-transform">❤️</span>
                                        <span className="text-xs hover:scale-125 transition-transform">😂</span>
                                    </div>
                                    <div className="text-xs text-gray-500 hover:underline cursor-pointer">Reply</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Compose Box (New Conversation) */}
                <div className="p-6 pt-2 pb-6 bg-[#1F1F1F] shrink-0">
                    <div className="bg-[#201F1F] border border-[#3E3E3E] rounded-lg shadow-sm focus-within:border-[#6264A7] focus-within:ring-1 focus-within:ring-[#6264A7] transition-all flex flex-col">
                       
                       {/* Toolbar Top */}
                       <div className="flex items-center gap-1 p-1.5 border-b border-[#2D2D2D] bg-[#292929]/30">
                           <FormatBtn icon={Bold} />
                           <FormatBtn icon={Italic} />
                           <FormatBtn icon={Underline} />
                           <div className="w-px h-4 bg-[#3E3E3E] mx-1"></div>
                           <FormatBtn icon={List} />
                           <FormatBtn icon={Quote} />
                           <div className="w-px h-4 bg-[#3E3E3E] mx-1"></div>
                           <FormatBtn icon={Link} />
                       </div>

                       {/* Input */}
                       <div className="p-0">
                           <textarea 
                                className="w-full bg-transparent border-none outline-none text-[14px] text-[#E0E0E0] placeholder-gray-500 p-3 resize-none min-h-[50px] max-h-[200px] custom-scrollbar" 
                                placeholder="Start a new conversation. Type @ to mention someone."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                            />
                       </div>

                       {/* Toolbar Bottom */}
                       <div className="flex justify-between items-center px-2 pb-2 pt-1">
                           <div className="flex items-center gap-1 text-gray-400">
                                <ActionBtn icon={FileText} />
                                <ActionBtn icon={Smile} />
                                <ActionBtn icon={Image} />
                                <ActionBtn icon={Video} />
                           </div>
                           <button 
                                onClick={sendMessage} 
                                disabled={!input.trim()}
                                className={`p-1.5 rounded transition-all ${input.trim() ? 'text-[#6264A7] hover:bg-[#2D2D2D]' : 'text-gray-600'}`}
                            >
                                <Send size={18} />
                           </button>
                       </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- HELPER COMPONENTS ---

const RailIcon = ({ icon: Icon, label, active }: any) => (
    <div className="group flex flex-col items-center gap-0.5 cursor-pointer w-full py-1 relative">
        {active && <div className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#6264A7] rounded-r-md"></div>}
        <div className={`p-1.5 rounded-lg transition-all ${active ? 'text-[#6264A7]' : 'text-gray-400 group-hover:text-white'}`}>
            <Icon size={24} strokeWidth={active ? 2 : 1.5} />
        </div>
        <span className={`text-[10px] font-medium ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{label}</span>
    </div>
);

const FormatBtn = ({ icon: Icon }: any) => (
    <button className="p-1 text-gray-400 hover:text-white hover:bg-[#3B3B3B] rounded transition-colors">
        <Icon size={14} />
    </button>
);

const ActionBtn = ({ icon: Icon }: any) => (
    <button className="p-1.5 text-gray-400 hover:text-[#6264A7] hover:bg-[#3B3B3B] rounded-full transition-colors">
        <Icon size={16} />
    </button>
);

const EditBtn = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);
