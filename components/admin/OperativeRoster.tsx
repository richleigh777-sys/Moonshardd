
import React, { useState } from 'react';
import { Activity, HeartHandshake } from 'lucide-react';
import { User, Sale } from '../../types';
import { Card } from '../ui/Base';
import { sfx } from '../../lib/soundService';
import { useCRM } from '../../hooks/useCRM';
import { useSystem } from '../../hooks/useSystem';
import { AgentTimeSheet } from '../modals/AgentTimeSheet';
import { getDmChannelId } from '../../lib/config';
import { EditUserModal } from './operative-roster/EditUserModal';
import { RosterHeader } from './operative-roster/RosterHeader';
import { RosterGrid } from './operative-roster/RosterGrid';
import { useRosterLogic } from './operative-roster/hooks/useRosterLogic';

interface OperativeRosterProps {
    users: User[];
    sales: Sale[];
    onUpdateUser: (id: string, data: Partial<User>) => Promise<void>;
    onAddUser: (data: Partial<User>) => Promise<void>;
    onGhostLogin: (userId: string) => void;
}

export const OperativeRoster: React.FC<OperativeRosterProps> = ({ 
    users, sales, onUpdateUser, onAddUser, onGhostLogin 
}) => {
    const { attendance, currentUser } = useCRM();
    const { setToast, openSystemChat } = useSystem();
    
    // Logic Hook
    const {
        searchTerm, setSearchTerm,
        filterTeam, setFilterTeam,
        filterRank, setFilterRank,
        sortMode, setSortMode,
        viewMode, setViewMode,
        uniqueTeams,
        agentAnalytics,
        globalMaxRevenue,
        filteredUsers
    } = useRosterLogic(users, sales);

    // Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
    const [ledgerTarget, setLedgerTarget] = useState<User | null>(null);

    const handleOpenEdit = (user: User | null = null) => {
        sfx.playClick();
        setEditingUser(user ? { ...user } : { id: '', name: '', pass: '', role: 'agent', level: 1, accessLevel: 1, active: true, team: 'General', commissionRate: 15 });
        setIsEditModalOpen(true);
    };

    const handleSaveUser = async (data: Partial<User>) => {
        if (!data.id || !data.name) {
            setToast({ title: 'Validation Error', message: "ID and Name required", type: "error" });
            return;
        }

        const confirmed = window.confirm(`Confirm changes for ${data.name}? This will update the personnel database.`);
        if (!confirmed) return;

        try {
            const isNew = !users.some(u => u.id === data.id);
            if (isNew) {
                await onAddUser(data);
                setToast({ title: 'Onboarding', message: "Welcome to the team!", type: "success" });
            } else {
                await onUpdateUser(data.id!, data);
                setToast({ title: 'Profile Update', message: "Profile Updated", type: "success" });
            }
            sfx.playConfirm();
            setIsEditModalOpen(false);
        } catch {
            sfx.playError();
        }
    };

    const jumpToChat = (targetUserId: string) => {
        if (!currentUser) return;
        sfx.playClick();
        const channelId = getDmChannelId(currentUser.id, targetUserId);
        openSystemChat(channelId);
    };

    return (
        <div className="space-y-3 h-full flex flex-col w-full max-w-full overflow-hidden animate-in fade-in duration-700">
            {/* TOOLBAR */}
            <RosterHeader 
                totalUsers={users.length}
                onlineCount={users.filter(u => u.currentStatus === 'online').length}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterTeam={filterTeam}
                setFilterTeam={setFilterTeam}
                filterRank={filterRank}
                setFilterRank={setFilterRank}
                uniqueTeams={uniqueTeams}
                sortMode={sortMode}
                setSortMode={setSortMode}
                viewMode={viewMode}
                setViewMode={setViewMode}
                onAddUser={() => handleOpenEdit()}
            />

            {/* DATA GRID */}
            <Card variant="panel" className="flex-1 p-0 overflow-hidden rounded-2xl flex flex-col w-full max-w-full relative border-white/5 bg-surface-main shadow-2xl">
                
                <RosterGrid 
                    users={filteredUsers}
                    agentAnalytics={agentAnalytics}
                    globalMaxRevenue={globalMaxRevenue}
                    attendance={attendance}
                    currentUser={currentUser}
                    viewMode={viewMode}
                    onOpenLedger={(u) => { setLedgerTarget(u); sfx.playClick(); }}
                    onChat={jumpToChat}
                    onGhost={onGhostLogin}
                    onEdit={handleOpenEdit}
                />

                {/* FOOTER */}
                <div className="p-2.5 border-t border-border-subtle bg-surface-alt/30 shrink-0 backdrop-blur-md relative z-10 flex justify-between items-center px-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <HeartHandshake size={12} className="text-emerald-500" />
                            <span className="text-[9px] font-bold uppercase text-text-muted tracking-widest">Community</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Activity size={12} className="text-accent-primary" />
                            <span className="text-[9px] font-bold uppercase text-text-muted tracking-widest">Wellness: 98%</span>
                        </div>
                    </div>
                    <span className="text-[8px] font-medium text-text-muted/60">Braveheart v6.0</span>
                </div>
            </Card>

            {/* EDIT MODAL */}
            <EditUserModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={editingUser}
                onSave={handleSaveUser}
                existingIds={users.map(u => u.id)}
            />

            {/* LEDGER MODAL */}
            {ledgerTarget && (
                <AgentTimeSheet 
                    isOpen={true} 
                    onClose={() => setLedgerTarget(null)} 
                    currentUser={ledgerTarget} 
                    attendance={attendance} 
                    sales={sales} 
                />
            )}
        </div>
    );
};
