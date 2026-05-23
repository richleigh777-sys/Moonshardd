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
    currentUserLevel?: number;
}

export const TeamLeaderboard: React.FC<TeamLeaderboardProps> = ({ currentUserName, currentUserRole, currentUserTeam, currentUserLevel = 1 }) => {
    const { sales, users, systemConfig, attendance } = useCRM();

    const [viewDate, setViewDate] = useState(new Date());
    const isSuperAdmin = currentUserLevel >= 10;
    const [selectedTeam, setSelectedTeam] = useState<string>(
        isSuperAdmin ? 'All' : (currentUserTeam || 'Alpha')
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
        <Card variant="panel" className="flex flex-col h-full overflow-hidden p-0 relative border border-border-subtle shadow-panel bg-surface-main/30 backdrop-blur-3xl rounded-2xl md:rounded-3xl hover:border-accent-primary/20 transition-all group">
            {/* Header */}
            <div className="px-4 py-4 md:py-6 border-b border-border-subtle bg-surface-main/60 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 relative z-10 backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-status-success shadow-inner group-hover:scale-110 transition-transform">
                        <BarChart3 size={24} strokeWidth={2.5}/>
                    </div>
                    <div>
                        <h2 className="text-sm font-[700] text-text-primary  tracking-[0.2em] flex items-center gap-2">
                            Team Leaderboard
                        </h2>
                        <div className="flex items-center gap-3 mt-1.5 p-1.5 px-3 bg-surface-alt/80 backdrop-blur-md rounded-lg border border-border-strong w-fit">
                            <span className="text-[10px] font-[700] text-text-muted  tracking-widest">{monthName}</span>
                            <span className="text-[10px] font-medium text-text-muted/40">|</span>
                            <span className="text-[10px] font-[700] text-status-success  tracking-widest flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                <Activity size={14}/> VOL: ${periodTotal.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
                    {/* Search Input */}
                    <div className="relative group flex-1 md:min-w-[180px]">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-status-success transition-colors z-10"/>
                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                            placeholder="SEARCH AGENT..." 
                            className="w-full bg-surface-main/80 backdrop-blur-md border border-border-strong rounded-xl py-2 pl-9 pr-3 text-[10px] font-[700]  text-text-primary tracking-widest outline-none focus:border-status-success/50 shadow-inner transition-all placeholder:text-text-muted/40" 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Date Controls */}
                    <div className="flex items-center bg-surface-main/80 backdrop-blur-md rounded-xl border border-border-strong p-1 shadow-inner">
                        <button onClick={prevMonth} className="p-1 hover:bg-surface-alt rounded-lg text-text-muted hover:text-text-primary transition-colors"><ChevronLeft size={16} /></button>
                        <button onClick={jumpToToday} className="px-3 text-[10px] font-[700] text-text-primary  hover:text-status-success transition-colors min-w-[80px] text-center tracking-widest">
                            {monthName.substring(0, 3)} {selectedYear}
                        </button>
                        <button onClick={nextMonth} className="p-1 hover:bg-surface-alt rounded-lg text-text-muted hover:text-text-primary transition-colors"><ChevronRight size={16} /></button>
                    </div>

                    {/* Team Select */}
                    {isSuperAdmin && (
                        <div className="relative">
                            <select 
                                value={selectedTeam} 
                                onChange={(e) => setSelectedTeam(e.target.value)}
                                className="appearance-none bg-surface-main/80 backdrop-blur-md border border-border-strong text-text-primary text-[10px] font-[700]  tracking-widest rounded-xl pl-3 pr-8 py-2.5 outline-none cursor-pointer hover:border-status-success/30 transition-all font-mono shadow-inner"
                            >
                                <option value="All">ALL TEAMS</option>
                                {uniqueTeams.map(t => <option key={t} value={t}>{t} UNIT</option>)}
                            </select>
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                                <ChevronRight size={16} className="rotate-90" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Tabs defaultValue="total" className="flex-1 flex flex-col min-h-0 relative z-10 w-full overflow-hidden">
                <div className="px-4 lg:px-6 py-2 border-b border-border-subtle bg-surface-main/40 backdrop-blur-sm flex justify-start shrink-0 overflow-x-auto custom-scrollbar">
                    <TabList className="flex gap-2 min-w-max">
                        <TabTrigger 
                            value="total" 
                            className="px-4 py-2 text-[10px] font-[700]  tracking-[0.2em] border border-transparent data-[state=active]:bg-emerald-500/10 data-[state=active]:text-status-success data-[state=active]:border-emerald-500/20 data-[state=active]:shadow-inner rounded-xl transition-all text-text-muted hover:text-text-primary whitespace-nowrap" 
                            icon={<BarChart3 size={16} strokeWidth={2.5}/>}
                        >
                            Rankings
                        </TabTrigger>
                        <TabTrigger 
                            value="breakdown" 
                            className="px-4 py-2 text-[10px] font-[700]  tracking-[0.2em] border border-transparent data-[state=active]:bg-emerald-500/10 data-[state=active]:text-status-success data-[state=active]:border-emerald-500/20 data-[state=active]:shadow-inner rounded-xl transition-all text-text-muted hover:text-text-primary whitespace-nowrap" 
                            icon={<List size={16} strokeWidth={2.5}/>}
                        >
                            Cycle Data
                        </TabTrigger>
                        <TabTrigger 
                            value="manifest" 
                            className="px-4 py-2 text-[10px] font-[700]  tracking-[0.2em] border border-transparent data-[state=active]:bg-emerald-500/10 data-[state=active]:text-status-success data-[state=active]:border-emerald-500/20 data-[state=active]:shadow-inner rounded-xl transition-all text-text-muted hover:text-text-primary whitespace-nowrap" 
                            icon={<FileText size={16} strokeWidth={2.5}/>}
                        >
                            Ledger Log
                        </TabTrigger>
                    </TabList>
                </div>

                <div className="flex-1 overflow-hidden relative">
                    <TabContent value="total" className="h-full flex flex-col lg:flex-row p-2 lg:p-4 gap-4 relative z-10 overflow-hidden w-full">
                        <div className="w-full lg:w-[45%] h-[280px] lg:h-full shrink-0">
                            <Podium top3={leaderData.slice(0, 3)} />
                        </div>
                        <div className="w-full lg:w-[55%] h-full min-h-0 flex flex-col">
                            <RankingsList data={leaderData} currentUserName={currentUserName} />
                        </div>
                    </TabContent>
                    
                    <TabContent value="breakdown" className="h-full relative z-10 w-full overflow-hidden">
                        <CycleBreakdown data={leaderData} currentUserName={currentUserName} />
                    </TabContent>
                    
                    <TabContent value="manifest" className="h-full relative z-10 w-full overflow-hidden flex flex-col">
                        <LedgerManifest data={leaderData} currentUserName={currentUserName} />
                    </TabContent>
                </div>
            </Tabs>
        </Card>
    );
};
