import React, { useState } from 'react';
import { 
    Search, ChevronLeft, ChevronRight, Activity, BarChart3, List, FileText
} from 'lucide-react';
import { useCRM } from '../../hooks/useCRM';
import { Card } from '../ui/Base';
import { Tabs, TabList, TabTrigger, TabContent } from '../ui/Tabs';
import { useLeaderboard } from './leaderboard/useLeaderboard';
import { 
    Podium, RankingsList, CycleBreakdown, LedgerManifest 
} from './leaderboard/LeaderboardParts';

interface TeamLeaderboardProps {
    currentUserName: string;
    currentUserRole?: string;
    currentUserTeam?: string;
}

export const TeamLeaderboard: React.FC<TeamLeaderboardProps> = ({ currentUserName, currentUserRole, currentUserTeam }) => {
    const { sales, users, systemConfig, attendance } = useCRM();

    const [viewDate, setViewDate] = useState(new Date());
    const [selectedTeam, setSelectedTeam] = useState<string>(
        currentUserRole === 'agent' ? (currentUserTeam || 'Alpha') : 'All'
    );
    const [searchQuery, setSearchQuery] = useState('');

    // --- DATA HOOK ---
    const { leaderData, periodTotal, uniqueTeams, monthName, selectedYear } = useLeaderboard(
        sales, users, attendance, systemConfig, viewDate, selectedTeam, searchQuery, false
    );

    // --- DATE CONTROLS ---
    const prevMonth = () => {
        const d = new Date(viewDate);
        d.setMonth(d.getMonth() - 1);
        setViewDate(d);
    };
    const nextMonth = () => {
        const d = new Date(viewDate);
        d.setMonth(d.getMonth() + 1);
        setViewDate(d);
    };
    const jumpToToday = () => setViewDate(new Date());

    return (
        <Card variant="panel" className="flex flex-col h-full overflow-hidden p-0 relative border-border-subtle shadow-sm bg-surface-main">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border-subtle bg-surface-alt/40 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 relative z-10 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                        <BarChart3 size={20} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide flex items-center gap-2">
                            Team Leaderboard
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs font-medium text-text-muted">Period: {monthName}</span>
                            <span className="text-xs font-medium text-text-muted/40">|</span>
                            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                                <Activity size={12}/> Vol: ${periodTotal.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
                    {/* Search Input */}
                    <div className="relative group flex-1 md:min-w-[180px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-emerald-500 transition-colors"/>
                        <input 
                            placeholder="Search agent..." 
                            className="w-full bg-surface-alt border border-border-subtle rounded-md py-2 pl-9 pr-3 text-xs font-medium text-text-primary outline-none focus:border-emerald-500/50 focus:bg-surface-main transition-all placeholder:text-text-muted/60" 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Date Controls */}
                    <div className="flex items-center bg-surface-alt rounded-md border border-border-subtle p-0.5">
                        <button onClick={prevMonth} className="p-1.5 hover:bg-surface-highlight rounded text-text-muted hover:text-text-primary transition-colors"><ChevronLeft size={14} /></button>
                        <button onClick={jumpToToday} className="px-3 text-xs font-bold text-text-primary uppercase hover:text-emerald-500 transition-colors min-w-[80px] text-center">
                            {monthName.substring(0, 3)} {selectedYear}
                        </button>
                        <button onClick={nextMonth} className="p-1.5 hover:bg-surface-highlight rounded text-text-muted hover:text-text-primary transition-colors"><ChevronRight size={14} /></button>
                    </div>

                    {/* Team Select */}
                    <div className="relative">
                        <select 
                            value={selectedTeam} 
                            onChange={(e) => setSelectedTeam(e.target.value)}
                            className="appearance-none bg-surface-alt border border-border-subtle text-text-primary text-xs font-bold rounded-md pl-3 pr-8 py-2 outline-none cursor-pointer hover:border-emerald-500/30 transition-all font-mono"
                        >
                            <option value="All">All Teams</option>
                            {uniqueTeams.map(t => <option key={t} value={t}>{t} Unit</option>)}
                        </select>
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                            <ChevronRight size={12} className="rotate-90" />
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="total" className="flex-1 flex flex-col min-h-0 relative z-10">
                <div className="px-4 py-2 border-b border-border-subtle bg-surface-alt/20 flex justify-start shrink-0">
                    <TabList className="flex gap-1">
                        <TabTrigger 
                            value="total" 
                            className="px-4 py-1.5 text-xs font-bold uppercase tracking-wide border border-transparent data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-500 data-[state=active]:border-emerald-500/20 rounded-md transition-all text-text-muted hover:text-text-primary" 
                            icon={<BarChart3 size={14}/>}
                        >
                            Rankings
                        </TabTrigger>
                        <TabTrigger 
                            value="breakdown" 
                            className="px-4 py-1.5 text-xs font-bold uppercase tracking-wide border border-transparent data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-500 data-[state=active]:border-emerald-500/20 rounded-md transition-all text-text-muted hover:text-text-primary" 
                            icon={<List size={14}/>}
                        >
                            Cycle Data
                        </TabTrigger>
                        <TabTrigger 
                            value="manifest" 
                            className="px-4 py-1.5 text-xs font-bold uppercase tracking-wide border border-transparent data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-500 data-[state=active]:border-emerald-500/20 rounded-md transition-all text-text-muted hover:text-text-primary" 
                            icon={<FileText size={14}/>}
                        >
                            Ledger Log
                        </TabTrigger>
                    </TabList>
                </div>

                <div className="flex-1 overflow-hidden relative bg-surface-main">
                    <TabContent value="total" className="h-full flex flex-col p-6 gap-6 relative z-10 overflow-y-auto custom-scrollbar">
                        <Podium top3={leaderData.slice(0, 3)} />
                        <RankingsList data={leaderData} currentUserName={currentUserName} />
                    </TabContent>
                    
                    <TabContent value="breakdown" className="h-full relative z-10">
                        <CycleBreakdown data={leaderData} currentUserName={currentUserName} />
                    </TabContent>
                    
                    <TabContent value="manifest" className="h-full relative z-10">
                        <LedgerManifest data={leaderData} currentUserName={currentUserName} />
                    </TabContent>
                </div>
            </Tabs>
        </Card>
    );
};
