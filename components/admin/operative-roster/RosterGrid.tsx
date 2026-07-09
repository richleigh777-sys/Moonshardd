
import React from 'react';
import { User, AttendanceRecord } from '../../../types';
import { Heart } from 'lucide-react';
import { OperativeItem } from './OperativeItem';
import { ViewMode } from './hooks/useRosterLogic';

interface RosterGridProps {
    users: User[];
    agentAnalytics: Record<string, { revenue: number, dailyRevenue: number, count: number, winRate: number, trend: number[], rank: string }>;
    globalMaxRevenue: number;
    attendance: AttendanceRecord[];
    currentUser: User | null;
    viewMode: ViewMode;
    onOpenLedger: (user: User) => void;
    onChat: (userId: string) => void;
    onGhost: (userId: string) => void;
    onEdit: (user: User) => void;
    onToggleActive: (userId: string, active: boolean) => void;
}

export const RosterGrid: React.FC<RosterGridProps> = ({ 
    users, agentAnalytics, globalMaxRevenue, attendance, currentUser, viewMode,
    onOpenLedger, onChat, onGhost, onEdit, onToggleActive 
}) => {
    
    if (users.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                <div className="w-20 h-20 bg-surface-alt rounded-full flex items-center justify-center mb-6">
                    <Heart size={32} className="text-text-muted" />
                </div>
                <h3 className="text-lg font-bold text-text-primary">No Partners Found</h3>
                <p className="text-sm text-text-muted mt-1">Try adjusting your search criteria.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar relative px-2">
             {viewMode === 'list' && (
                 <div className="sticky top-0 z-20 flex justify-between px-4 py-2 bg-surface-main/95  text-sm font-bold text-text-muted  tracking-wider border-b border-border-subtle mb-1">
                    <div className="w-1/3">Partner Profile</div>
                    <div className="flex-1 text-center">Performance</div>
                    <div className="w-[140px] text-right">Actions</div>
                </div>
             )}
            
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 p-2" : "space-y-1 pb-2"}>
                {users.map((user) => (
                    <OperativeItem
                        key={user.id}
                        user={user}
                        analytics={agentAnalytics[user.id] || { revenue: 0, dailyRevenue: 0, count: 0, winRate: 0, trend: [], rank: 'Emerging' }}
                        globalMaxRevenue={globalMaxRevenue}
                        attendance={attendance}
                        currentUser={currentUser}
                        viewMode={viewMode}
                        onOpenLedger={onOpenLedger}
                        onChat={onChat}
                        onGhost={onGhost}
                        onEdit={onEdit}
                        onToggleActive={onToggleActive}
                    />
                ))}
            </div>
        </div>
    );
};
