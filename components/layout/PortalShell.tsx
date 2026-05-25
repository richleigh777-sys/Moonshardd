import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, LogOut, Bell, Coffee, Play, Server, ChevronDown, Menu, X as CloseIcon, LayoutGrid, Terminal
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
    const { theme, toggleTheme, activeServer, serverList, switchServer, setToast } = useSystem();
    const { attendance, sales } = useCRM();

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
    const [isTimeSheetOpen, setIsTimeSheetOpen] = useState(false);
    const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
    const [isServerSwitcherOpen, setIsServerSwitcherOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleDlpAlert = (e: any) => {
            if ((user?.level || user?.accessLevel || 0) >= 10 && e.detail?.type === 'EXCESSIVE_REVEAL') {
                setToast({
                    title: 'DLP Alert',
                    message: `${e.detail.user} revealed > 20 records in an hour.`,
                    type: 'error'
                });
                sfx.playError();
            }
        };

        window.addEventListener('DLP_ALERT', handleDlpAlert);
        return () => window.removeEventListener('DLP_ALERT', handleDlpAlert);
    }, [user, setToast]);

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
        <div className="h-full w-full flex bg-surface-alt text-text-primary transition-all duration-500 relative font-sans overflow-hidden p-0 lg:p-2 gap-2">
            
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
                            className="fixed inset-0 z-[150] bg-surface-alt backdrop-blur-sm lg:hidden"
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
                                    <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center text-surface-alt">
                                        <LayoutGrid size={16} fill="currentColor" />
                                    </div>
                                    <span className="font-[700]  tracking-tighter">Workspace</span>
                                </div>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-text-muted">
                                    <CloseIcon size={20} />
                                </button>
                            </div>
                            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                                {sidebarContent}
                            </nav>
                            <div className="p-4 border-t border-border-subtle">
                                <button onClick={handleLogout} className="w-full p-4 flex items-center gap-4 text-status-error bg-red-500/5 hover:bg-red-500/10 transition-colors rounded-xl font-bold">
                                    <LogOut size={20} />
                                    <span>Log Out Session</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* DESKTOP SIDEBAR - FLOATING PANEL DESIGN */}
            <aside 
                onMouseEnter={() => setIsSidebarCollapsed(false)}
                onMouseLeave={() => setIsSidebarCollapsed(true)}
                className={`
                    hidden lg:flex z-[100] transition-all duration-300 ease-out flex-col shrink-0
                    bg-surface-main border border-border-subtle rounded-xl shadow-sm relative
                    ${isSidebarCollapsed ? 'w-[72px]' : 'w-[260px]'}
                `}
            >
                <div className="h-20 flex items-center justify-center shrink-0 border-b border-border-subtle relative">
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-accent-primary text-white cursor-pointer hover:scale-[1.05] transition-transform shadow-sm relative z-10" onClick={() => setIsTimeSheetOpen(true)}>
                        <LayoutGrid size={20} strokeWidth={2} />
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar relative z-10">
                    {sidebarContent}
                </nav>

                <div className="p-3 border-t border-border-subtle bg-surface-alt/40 rounded-b-xl">
                    <button onClick={handleLogout} className="w-full p-3 flex items-center justify-center gap-3 text-text-muted hover:text-text-primary transition-all rounded-lg hover:bg-surface-highlight border border-transparent hover:border-border-strong group">
                        <LogOut size={18} className="group-hover:text-status-error transition-colors" />
                        {!isSidebarCollapsed && <span className="text-sm font-semibold">Log Out</span>}
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT WORKSPACE */}
            <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 overflow-hidden bg-surface-main lg:rounded-xl lg:border lg:border-border-subtle shadow-sm relative`}>
                
                {/* HEADER */}
                <header className="h-20 px-8 flex items-center justify-between bg-transparent border-b border-border-subtle shrink-0 z-[50]">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 -ml-2 text-text-muted hover:text-text-primary lg:hidden transition-colors"
                        >
                            <Menu size={24} />
                        </button>

                        <div className="flex items-center gap-3">
                            <LayoutGrid size={20} className="text-accent-secondary hidden sm:block opacity-50" />
                            <h1 className="text-xl font-bold text-text-primary tracking-tight">{title}</h1>
                        </div>
                        
                        {activeServer && (
                            <div className="relative ml-2">
                                <button 
                                    onClick={() => user.accessLevel >= 10 && setIsServerSwitcherOpen(!isServerSwitcherOpen)}
                                    className={`flex items-center gap-2.5 px-3 py-1.5 bg-surface-alt hover:bg-surface-highlight border border-border-strong rounded-lg transition-all ${user.accessLevel >= 10 ? 'cursor-pointer' : 'cursor-default'}`}
                                >
                                    <Server size={14} className="text-accent-primary" />
                                    <span className="text-xs font-bold text-text-primary font-mono tracking-wider hidden sm:inline">{activeServer.name}</span>
                                    {user.accessLevel >= 10 && <ChevronDown size={14} className={`text-text-muted transition-transform duration-200 ${isServerSwitcherOpen ? 'rotate-180' : ''}`} />}
                                    <div className="w-1.5 h-1.5 rounded-full bg-status-success shadow-[0_0_8px_var(--color-status-success)] animate-pulse"></div>
                                </button>

                                <AnimatePresence>
                                    {isServerSwitcherOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsServerSwitcherOpen(false)} />
                                            <motion.div 
                                                initial={{ opacity: 0, y: 5, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 5, scale: 0.98 }}
                                                className="absolute top-full left-0 mt-3 w-64 bg-surface-main border border-border-strong shadow-float rounded-xl z-50 overflow-hidden"
                                            >
                                                <div className="p-3 border-b border-border-subtle bg-surface-alt/50">
                                                    <p className="text-xs font-semibold text-text-muted">Available Servers</p>
                                                </div>
                                                <div className="max-h-64 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
                                                    {serverList.map(server => (
                                                        <button
                                                            key={server.id}
                                                            onClick={() => handleSwitchServer(server.id)}
                                                            className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between hover:bg-surface-highlight transition-all ${activeServer.id === server.id ? 'bg-accent-primary/10 text-accent-primary ring-1 ring-accent-primary/30' : 'text-text-secondary'}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <Server size={14} />
                                                                <span className="text-sm font-bold">{server.name}</span>
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

                    <div className="flex items-center gap-4 md:gap-6">
                        {headerContent}

                        <div className="flex items-center gap-3">
                            {!isClockedIn ? (
                                <button 
                                    onClick={handleClockIn}
                                    className="flex items-center gap-2.5 px-5 py-2 hover:bg-emerald-500/10 text-status-success rounded-lg font-semibold text-sm transition-all border border-emerald-500/20"
                                >
                                    <Play size={16} fill="currentColor" />
                                    <span className="hidden sm:inline">Clock In</span>
                                </button>
                            ) : (
                                <div className="flex items-center gap-1.5 p-1 bg-surface-main border border-border-strong rounded-xl">
                                    <div 
                                        className="px-3 py-1 bg-surface-alt border border-border-subtle rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors flex flex-col justify-center"
                                        onClick={() => setIsTimeSheetOpen(true)}
                                    >
                                        <span className={`text-[10px] font-semibold mb-0.5 opacity-60 ${isOnBreak ? 'text-status-warning' : 'text-text-primary'}`}>Duration</span>
                                        <span className={`text-sm md:text-base font-mono font-bold tracking-tight leading-none ${isOnBreak ? 'text-status-warning' : 'text-text-primary'}`}>
                                            {formatTimer(workTimeSeconds)}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => onToggleBreak()} 
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all border ${isOnBreak ? 'bg-status-success text-surface-alt border-status-success shadow-md shadow-status-success/20 hover:brightness-110' : 'bg-surface-main text-text-primary border-border-subtle hover:bg-surface-highlight'}`}
                                    >
                                        {isOnBreak ? (
                                            <>
                                                <Play size={16} fill="currentColor"/>
                                                <span className="hidden sm:inline">Resume</span>
                                            </>
                                        ) : (
                                            <>
                                                <Coffee size={16}/>
                                                <span className="hidden sm:inline">Break</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <div className="hidden md:block w-px h-8 bg-border-strong mx-2"></div>

                        <div className="flex items-center gap-1">
                            <button onClick={toggleTheme} className="hidden md:flex p-2.5 items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-highlight transition-all rounded-lg border border-transparent hover:border-border-subtle">
                                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                            
                            <button onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)} className="p-2.5 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-highlight transition-all relative rounded-lg border border-transparent hover:border-border-subtle">
                                <Bell size={20} />
                                {notifications.length > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-status-error border-2 border-surface-main rounded-full animate-ping"></span>
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                {/* WORKSPACE (Dataroom) */}
                <div className="flex-1 overflow-hidden relative bg-surface-alt/20">
                    <div className="absolute inset-0 overflow-y-auto overflow-x-hidden custom-scrollbar">
                        <div className="w-full min-h-full flex flex-col p-3 md:p-4 lg:p-6">
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