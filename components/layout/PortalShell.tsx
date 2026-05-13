import React, { useState } from 'react';
import { 
  Sun, Moon, LogOut, Bell, Coffee, Play, Shield, Server, ChevronDown, Menu, X as CloseIcon
} from 'lucide-react';
import { User, AppNotification } from '../../types';
import { useAuth, useTimer } from '../../hooks/useAuth';
import { usePerformance } from '../../hooks/usePerformance';
import { useSystem } from '../../hooks/useSystem';
import { useCRM } from '../../hooks/useCRM';
import { sfx } from '../../lib/soundService';
import { formatTimer } from '../../views/utils/crmLogic';
import { NotificationPanel } from '../widgets/NotificationPanel';
import { ShiftOverlay } from './ShiftOverlay';
import { BreakOverlay } from './BreakOverlay';
import { AgentTimeSheet } from '../modals/AgentTimeSheet';
import { BreakControlModal } from '../modals/BreakControlModal';
import { motion, AnimatePresence } from 'motion/react';

interface PortalShellProps {
    user: User;
    title: string;
    sidebarContent: React.ReactNode;
    headerContent?: React.ReactNode;
    children: React.ReactNode;
    notifications?: AppNotification[]; 
    clearNotification?: (id: string) => void;
}

export const PortalShell: React.FC<PortalShellProps> = ({
    title, sidebarContent, headerContent, children,
    notifications = [], clearNotification
}) => {
    const { currentUser: user, logout } = useAuth();
    const { isOnBreak, onToggleBreak, workTimeSeconds } = useTimer();
    const { isClockedIn, clockIn, clockOut } = usePerformance();
    const { theme, toggleTheme, activeServer, serverList, switchServer } = useSystem();
    const { attendance, sales } = useCRM();

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
    const [isTimeSheetOpen, setIsTimeSheetOpen] = useState(false);
    const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
    const [isServerSwitcherOpen, setIsServerSwitcherOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleClockIn = () => {
        clockIn();
    };

    const handleLogout = () => {
        if (isClockedIn) {
            clockOut();
        }
        logout();
    };

    const handleSwitchServer = (serverId: string) => {
        sfx.playSubmit();
        switchServer(serverId);
        setIsServerSwitcherOpen(false);
    };

    if (!user) return null;

    return (
        <div className="h-full w-full flex bg-surface-alt text-text-primary transition-all duration-500 relative font-sans overflow-hidden">
            
            {/* OVERLAYS */}
            {!isClockedIn && user.role === 'agent' && <ShiftOverlay />}
            {isOnBreak && <BreakOverlay />}
            
            <AgentTimeSheet 
                isOpen={isTimeSheetOpen}
                onClose={() => setIsTimeSheetOpen(false)}
                currentUser={user}
                attendance={attendance}
                sales={sales}
            />

            <BreakControlModal 
                isOpen={isBreakModalOpen}
                onClose={() => setIsBreakModalOpen(false)}
            />

            {/* MOBILE SIDEBAR OVERLAY */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm lg:hidden"
                        />
                        <motion.aside 
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 z-[160] w-72 bg-surface-main border-r border-border-subtle flex flex-col lg:hidden"
                        >
                            <div className="h-20 flex items-center justify-between px-6 border-b border-border-subtle">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center text-white">
                                        <Shield size={16} fill="currentColor" />
                                    </div>
                                    <span className="font-black uppercase tracking-tighter">Nexus OS</span>
                                </div>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-text-muted">
                                    <CloseIcon size={20} />
                                </button>
                            </div>
                            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                                {sidebarContent}
                            </nav>
                            <div className="p-4 border-t border-border-subtle">
                                <button onClick={handleLogout} className="w-full p-4 flex items-center gap-4 text-rose-500 bg-rose-500/5 rounded-xl font-bold">
                                    <LogOut size={20} />
                                    <span>Log Out</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* DESKTOP SIDEBAR */}
            <aside 
                onMouseEnter={() => setIsSidebarCollapsed(false)}
                onMouseLeave={() => setIsSidebarCollapsed(true)}
                className={`
                    hidden lg:flex fixed inset-y-0 left-0 z-[100] transition-all duration-300 ease-out flex-col shrink-0
                    bg-slate-950 border-r border-white/5 text-white
                    ${isSidebarCollapsed ? 'w-12' : 'w-52 shadow-xl'}
                `}
            >
                <div className="h-12 flex items-center justify-center shrink-0 border-b border-white/5">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-accent-primary text-white cursor-pointer hover:scale-105 transition-transform shadow-lg shadow-accent-primary/20" onClick={() => setIsTimeSheetOpen(true)}>
                        <Shield size={16} fill="currentColor" />
                    </div>
                </div>

                <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto custom-scrollbar text-white/80">
                    {sidebarContent}
                </nav>

                <div className="p-2 border-t border-white/5 bg-black/20">
                    <button onClick={handleLogout} className="w-full p-2.5 flex items-center gap-3 text-white/70 hover:text-white transition-all rounded-lg">
                        <LogOut size={18} />
                        {!isSidebarCollapsed && <span className="text-xs font-bold">Log Out</span>}
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-12' : 'lg:ml-52'} h-full overflow-hidden bg-surface-alt`}>
                
                {/* HEADER */}
                <header className="h-12 px-4 md:px-5 flex items-center justify-between bg-surface-main border-b border-border-subtle shrink-0 z-[50] shadow-sm">
                    <div className="flex items-center gap-3 md:gap-4">
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-1.5 -ml-1 text-text-muted hover:text-text-primary lg:hidden"
                        >
                            <Menu size={20} />
                        </button>

                        <h1 className="text-sm md:text-base font-black text-text-primary truncate max-w-[120px] md:max-w-none uppercase tracking-tight">{title}</h1>
                        
                        {activeServer && (
                            <div className="relative">
                                <button 
                                    onClick={() => user.accessLevel >= 10 && setIsServerSwitcherOpen(!isServerSwitcherOpen)}
                                    className={`flex items-center gap-2 px-3 py-1.5 bg-surface-highlight border border-border-subtle rounded-lg transition-all ${user.accessLevel >= 10 ? 'hover:border-accent-primary cursor-pointer' : 'cursor-default'}`}
                                >
                                    <Server size={12} className="text-text-muted" />
                                    <span className="text-[10px] font-black uppercase text-text-secondary hidden sm:inline">{activeServer.name}</span>
                                    {user.accessLevel >= 10 && <ChevronDown size={10} className={`text-text-muted transition-transform ${isServerSwitcherOpen ? 'rotate-180' : ''}`} />}
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                </button>

                                <AnimatePresence>
                                    {isServerSwitcherOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsServerSwitcherOpen(false)} />
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute top-full left-0 mt-2 w-56 bg-surface-main border border-border-strong shadow-float rounded-2xl z-50 overflow-hidden"
                                            >
                                                <div className="p-3 border-b border-border-subtle bg-surface-alt/30">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Switch Node</p>
                                                </div>
                                                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                                    {serverList.map(server => (
                                                        <button
                                                            key={server.id}
                                                            onClick={() => handleSwitchServer(server.id)}
                                                            className={`w-full px-4 py-3 flex items-center justify-between hover:bg-surface-highlight transition-colors ${activeServer.id === server.id ? 'bg-accent-primary/5 text-accent-primary' : 'text-text-secondary'}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <Server size={14} />
                                                                <span className="text-xs font-bold">{server.name}</span>
                                                            </div>
                                                            {activeServer.id === server.id && <div className="w-1.5 h-1.5 rounded-full bg-accent-primary" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        {headerContent}

                        <div className="flex items-center gap-2">
                            {!isClockedIn ? (
                                <button 
                                    onClick={handleClockIn}
                                    className="flex items-center gap-2 px-3 md:px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                                >
                                    <Play size={14} fill="currentColor" />
                                    <span className="hidden sm:inline">Clock In</span>
                                </button>
                            ) : (
                                <div className="flex items-center gap-1 md:gap-2 p-1 bg-surface-highlight border border-border-subtle rounded-xl">
                                    <div 
                                        className="px-2 md:px-3 py-1.5 bg-surface-main border border-border-subtle rounded-lg cursor-pointer hover:bg-surface-alt transition-colors"
                                        onClick={() => setIsTimeSheetOpen(true)}
                                    >
                                        <span className={`text-xs font-mono font-bold ${isOnBreak ? 'text-amber-500' : 'text-emerald-500'}`}>
                                            {formatTimer(workTimeSeconds)}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => onToggleBreak()} 
                                        className={`flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all ${isOnBreak ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600'}`}
                                    >
                                        {isOnBreak ? (
                                            <>
                                                <Play size={12} fill="currentColor"/>
                                                <span className="hidden sm:inline">Resume</span>
                                            </>
                                        ) : (
                                            <>
                                                <Coffee size={12}/>
                                                <span className="hidden sm:inline">Break</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <div className="hidden md:block w-px h-6 bg-border-subtle mx-1"></div>

                        <button onClick={toggleTheme} className="hidden md:flex p-2.5 text-text-muted hover:text-text-primary hover:bg-surface-highlight transition-all rounded-lg">
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        
                        <button onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)} className="p-2.5 text-text-muted hover:text-text-primary relative rounded-lg">
                            <Bell size={20} />
                            {notifications.length > 0 && (
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 border-2 border-surface-main rounded-full"></span>
                            )}
                        </button>
                    </div>
                </header>

                {/* WORKSPACE */}
                <div className="flex-1 overflow-hidden relative bg-surface-alt">
                    <div className="absolute inset-0 overflow-y-auto overflow-x-hidden custom-scrollbar">
                        <div className="max-w-[1800px] mx-auto w-full flex flex-col min-h-full p-2 md:p-3">
                            {children}
                        </div>
                    </div>
                </div>
            </main>

            <NotificationPanel 
                isOpen={isNotificationPanelOpen}
                onClose={() => setIsNotificationPanelOpen(false)}
                notifications={notifications}
                onClear={clearNotification!}
            />
        </div>
    );
};