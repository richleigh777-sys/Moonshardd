
import React from 'react';
import { Search, ArrowUpDown, UserPlus, LayoutGrid, List, Heart, Filter } from 'lucide-react';
import { Button } from '../../ui/Base';
import { SortMode, ViewMode, RankFilter } from './hooks/useRosterLogic';

interface RosterHeaderProps {
    totalUsers: number;
    onlineCount: number;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filterTeam: string;
    setFilterTeam: (team: string) => void;
    filterRank: RankFilter;
    setFilterRank: (rank: RankFilter) => void;
    uniqueTeams: string[];
    sortMode: SortMode;
    setSortMode: (mode: SortMode) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    onAddUser: () => void;
}

export const RosterHeader: React.FC<RosterHeaderProps> = ({
    totalUsers, onlineCount, searchTerm, setSearchTerm, 
    filterTeam, setFilterTeam, uniqueTeams, 
    sortMode, setSortMode, viewMode, setViewMode, onAddUser
}) => {
    return (
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-surface-main/40  p-3.5 rounded-xl border border-border-subtle shadow-xl shrink-0">
            <div className="flex items-center gap-3.5">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full text-white shadow-lg shadow-indigo-500/20">
                    <Heart size={16} fill="currentColor" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-text-primary tracking-tight leading-none">Partners</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-medium text-text-secondary">{totalUsers} Total</span>
                        <div className="h-1 w-1 rounded-full bg-text-muted/30"></div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-sm font-bold text-emerald-600">{onlineCount} Online</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
                <div className="relative group flex-1 md:min-w-[180px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors" />
                    <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search..." 
                        className="w-full bg-surface-alt/50 border border-border-subtle rounded-full py-1.5 pl-9 pr-4 text-sm font-medium outline-none focus:border-accent-primary focus:bg-surface-main transition-all shadow-inner"
                    />
                </div>
                
                {/* Soft Toggle */}
                <div className="flex items-center p-0.5 bg-surface-alt rounded-full border border-border-subtle">
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-full transition-all ${viewMode === 'grid' ? 'bg-surface-main text-accent-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        <LayoutGrid size={16} />
                    </button>
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-full transition-all ${viewMode === 'list' ? 'bg-surface-main text-accent-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        <List size={16} />
                    </button>
                </div>

                <div className="flex items-center gap-1.5 bg-surface-alt/30 p-1 rounded-xl border border-border-subtle">
                    <div className="relative">
                        <select 
                            value={filterTeam} 
                            onChange={(e) => setFilterTeam(e.target.value)}
                            className="bg-transparent text-sm font-bold text-text-secondary outline-none cursor-pointer hover:text-text-primary transition-all pl-2 pr-6 py-1.5 appearance-none"
                        >
                            <option value="All">All Teams</option>
                            {uniqueTeams.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <Filter size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"/>
                    </div>
                    
                    <div className="w-px h-4 bg-border-subtle"></div>

                    <div className="relative">
                        <select 
                            value={sortMode}
                            onChange={(e) => setSortMode(e.target.value as SortMode)}
                            className="bg-transparent text-sm font-bold text-text-secondary outline-none cursor-pointer hover:text-text-primary transition-all pl-2 pr-6 py-1.5 appearance-none"
                        >
                            <option value="revenue">Contribution</option>
                            <option value="winRate">Rank</option>
                            <option value="status">Status</option>
                            <option value="name">Name</option>
                        </select>
                        <ArrowUpDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"/>
                    </div>
                </div>

                <Button onClick={onAddUser} variant="primary" className="h-8 px-4 rounded-full text-sm font-bold shadow-lg shadow-accent-primary/20 bg-accent-primary hover:brightness-110">
                    <UserPlus size={16} className="mr-1.5"/> Invite
                </Button>
            </div>
        </div>
    );
};
