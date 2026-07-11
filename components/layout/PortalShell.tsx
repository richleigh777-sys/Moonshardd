import { getStorageItem, setStorageItem } from '../../lib/storage';
import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, LogOut, Bell, Coffee, Play, Server, ChevronDown, Menu, X as CloseIcon, LayoutGrid, Palette, Check
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
import { UserSettingsModal } from './UserSettingsModal';
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
    const { theme, toggleTheme, activeServer, serverList, switchServer, setToast, uiZoom, setUiZoom } = useSystem();
    const { attendance, sales } = useCRM();

    const [_isSidebarCollapsed, _setIsSidebarCollapsed] = useState(true);
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
    const [isTimeSheetOpen, setIsTimeSheetOpen] = useState(false);
    const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
    const [isServerSwitcherOpen, setIsServerSwitcherOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // User Settings Modal state
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [settingsInitialTab, setSettingsInitialTab] = useState<'profile' | 'preferences' | 'support'>('profile');

    const _openSettings = (tab: 'profile' | 'preferences' | 'support') => {
        setSettingsInitialTab(tab);
        setIsSettingsModalOpen(true);
    };
    
    // Zoom-like Theme Selector
    const [appThemePalette, setAppThemePalette] = useState(() => getStorageItem('appThemePalette') || 'Classic');
    const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);

    useEffect(() => {
        setStorageItem('appThemePalette', appThemePalette);
    }, [appThemePalette]);

    const themeVars: Record<string, React.CSSProperties> = {
        Classic: {},
        Bloom: (theme === 'dark' ? {
            '--sidebar-accent': 'hsl(220 85% 65%)',
            '--sidebar-border': 'hsl(220 85% 65% / 0.15)',
            '--sidebar-bg': 'hsl(220 35% 12%)',
            '--sidebar-text': 'hsl(220 10% 95%)',
            '--sidebar-text-muted': 'hsl(220 15% 70%)',
            '--header-accent': 'hsl(220 80% 55%)',
            '--header-border': 'hsl(220 80% 55% / 0.15)',
            '--header-bg': 'hsl(220 35% 15%)',
            '--header-text': 'hsl(220 10% 95%)',
        } : {
            '--sidebar-accent': 'hsl(220 85% 55%)',
            '--sidebar-border': 'hsl(220 40% 88%)',
            '--sidebar-bg': 'hsl(220 40% 95%)',
            '--sidebar-text': 'hsl(220 50% 20%)',
            '--sidebar-text-muted': 'hsl(220 30% 50%)',
            '--header-accent': 'hsl(220 85% 55%)',
            '--header-border': 'hsl(220 40% 90%)',
            '--header-bg': 'hsl(220 40% 97%)',
            '--header-text': 'hsl(220 50% 15%)',
        }) as React.CSSProperties,
        Agave: (theme === 'dark' ? {
            '--sidebar-accent': 'hsl(170 80% 55%)',
            '--sidebar-border': 'hsl(170 80% 55% / 0.15)',
            '--sidebar-bg': 'hsl(170 30% 10%)',
            '--sidebar-text': 'hsl(170 10% 95%)',
            '--sidebar-text-muted': 'hsl(170 15% 70%)',
            '--header-accent': 'hsl(170 75% 45%)',
            '--header-border': 'hsl(170 75% 45% / 0.15)',
            '--header-bg': 'hsl(170 30% 13%)',
            '--header-text': 'hsl(170 10% 95%)',
        } : {
            '--sidebar-accent': 'hsl(170 80% 45%)',
            '--sidebar-border': 'hsl(170 35% 88%)',
            '--sidebar-bg': 'hsl(170 30% 95%)',
            '--sidebar-text': 'hsl(170 50% 20%)',
            '--sidebar-text-muted': 'hsl(170 30% 50%)',
            '--header-accent': 'hsl(170 80% 45%)',
            '--header-border': 'hsl(170 35% 90%)',
            '--header-bg': 'hsl(170 30% 97%)',
            '--header-text': 'hsl(170 50% 15%)',
        }) as React.CSSProperties,
        Rose: (theme === 'dark' ? {
            '--sidebar-accent': 'hsl(345 80% 65%)',
            '--sidebar-border': 'hsl(345 80% 65% / 0.15)',
            '--sidebar-bg': 'hsl(345 30% 11%)',
            '--sidebar-text': 'hsl(345 10% 95%)',
            '--sidebar-text-muted': 'hsl(345 15% 70%)',
            '--header-accent': 'hsl(345 75% 55%)',
            '--header-border': 'hsl(345 75% 55% / 0.15)',
            '--header-bg': 'hsl(345 30% 14%)',
            '--header-text': 'hsl(345 10% 95%)',
        } : {
            '--sidebar-accent': 'hsl(345 80% 55%)',
            '--sidebar-border': 'hsl(345 35% 90%)',
            '--sidebar-bg': 'hsl(345 30% 96%)',
            '--sidebar-text': 'hsl(345 50% 20%)',
            '--sidebar-text-muted': 'hsl(345 30% 50%)',
            '--header-accent': 'hsl(345 80% 55%)',
            '--header-border': 'hsl(345 35% 92%)',
            '--header-bg': 'hsl(345 30% 97%)',
            '--header-text': 'hsl(345 50% 15%)',
        }) as React.CSSProperties
    };

    const currentThemeStyle = themeVars[appThemePalette] || themeVars.Classic;

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
        <div 
            className="h-full w-full flex bg-surface-canvas text-text-primary transition-all duration-500 relative font-sans overflow-hidden p-0 gap-0"
        >
            
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
                            className="fixed inset-0 z-[150] bg-surface-alt  lg:hidden"
                        />
                        <motion.aside 
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className={`fixed inset-y-0 left-0 z-[160] w-72 bg-sidebar-bg border-r border-sidebar-border text-sidebar-text flex flex-col lg:hidden`}
                            style={currentThemeStyle}
                        >
                            <div className="h-[60px] flex items-center justify-between px-4 border-b border-sidebar-border bg-transparent">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center text-sidebar-bg">
                                        <LayoutGrid size={16} fill="currentColor" />
                                    </div>
                                    <span className="font-medium tracking-tighter text-sidebar-text">Workspace</span>
                                </div>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-sidebar-text-muted hover:text-sidebar-text transition-colors">
                                    <CloseIcon size={20} />
                                </button>
                            </div>
                            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar bg-transparent">
                                {sidebarContent}
                            </nav>
                            <div className="p-4 border-t border-sidebar-border flex flex-col gap-2 bg-transparent">
                                <div className="flex items-center gap-3 px-2 py-3 mb-2 border-b border-sidebar-border bg-sidebar-accent/10 rounded-lg">
                                    <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                        {(user.name || user.id || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-bold text-sidebar-text truncate">{user.name || user.id}</span>
                                        <span className="text-xs text-sidebar-text-muted capitalize truncate">{user.role}</span>
                                    </div>
                                </div>
                                <button onClick={handleLogout} className="w-full p-3 flex items-center gap-4 text-status-error bg-status-error/10 hover:bg-status-error/20 transition-colors rounded-xl font-bold mt-2">
                                    <LogOut size={20} />
                                    <span>Log Out Session</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* DESKTOP SIDEBAR - SAAS DESIGN */}
            <aside 
                className={`
                    hidden lg:flex z-50 transition-all duration-300 ease-out flex-col
                    bg-sidebar-bg border-r border-sidebar-border text-sidebar-text
                    w-[94px]
                `}
                style={currentThemeStyle}
            >
                <div className="h-[60px] flex items-center justify-center shrink-0 border-b border-sidebar-border relative bg-transparent overflow-hidden">
                    <div className="w-8 h-8 flex items-center justify-center rounded-md bg-sidebar-accent text-sidebar-bg cursor-pointer hover:opacity-90 transition-all shadow-sm relative z-10" onClick={() => setIsTimeSheetOpen(true)}>
                        <LayoutGrid size={18} strokeWidth={2} />
                    </div>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar relative z-10 bg-transparent">
                    {sidebarContent}
                </nav>

                <div className="p-3 border-t border-sidebar-border bg-transparent flex flex-col gap-1">
                    <div className="flex flex-col items-center gap-1 px-1 py-2 mb-2 border-b border-sidebar-border text-center">
                        <div className="w-8 h-8 rounded-full bg-sidebar-accent/20 flex items-center justify-center text-sidebar-accent font-bold">
                            {(user.name || user.id || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0 w-full">
                            <span className="text-sm font-bold text-sidebar-text truncate">{user.name || user.id}</span>
                            <span className="text-xs text-sidebar-text-muted capitalize truncate">{user.role}</span>
                        </div>
                    </div>
                    
                    <button onClick={handleLogout} className="w-full p-2 flex items-center justify-center gap-2 text-sidebar-text-muted hover:text-sidebar-text transition-all rounded-md hover:bg-sidebar-accent/10 group">
                        <LogOut size={18} className="group-hover:text-status-error transition-colors shrink-0" />
                        <span className="text-sm font-medium truncate text-left">Log Out</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT WORKSPACE */}
            <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 overflow-hidden bg-surface-canvas relative`}>
                
                {/* HEADER */}
                <header 
                    className="h-[60px] px-8 flex items-center justify-between bg-header-bg border-b border-header-border text-header-text shrink-0 z-[50] transition-all duration-500"
                    style={currentThemeStyle}
                >
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 -ml-2 text-header-text/70 hover:text-header-text lg:hidden transition-colors"
                        >
                            <Menu size={24} />
                        </button>

                        <div className="flex items-center gap-3">
                            <LayoutGrid size={20} className="text-header-accent hidden sm:block opacity-75 animate-pulse" />
                            <h1 className="text-xl font-bold text-header-text tracking-tight">{title}</h1>
                        </div>
                        
                        {activeServer && (
                            <div className="relative ml-2">
                                <button 
                                    onClick={() => user.accessLevel >= 10 && setIsServerSwitcherOpen(!isServerSwitcherOpen)}
                                    className={`flex items-center gap-2.5 px-3 py-1.5 bg-header-text/5 hover:bg-header-text/10 border border-header-border rounded-lg transition-all ${user.accessLevel >= 10 ? 'cursor-pointer' : 'cursor-default'}`}
                                >
                                    <Server size={14} className="text-header-accent" />
                                    <span className="text-sm font-bold text-header-text font-mono tracking-wider hidden sm:inline">{activeServer.name}</span>
                                    {user.accessLevel >= 10 && <ChevronDown size={14} className={`text-header-text/60 transition-transform duration-200 ${isServerSwitcherOpen ? 'rotate-180' : ''}`} />}
                                    <div className="w-1.5 h-1.5 rounded-full bg-status-success shadow-sm animate-pulse"></div>
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
                                                    <p className="text-sm font-semibold text-text-muted">Available Servers</p>
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

                    <div className="flex items-center gap-4 md:gap-4">
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
                                        <span className={`text-sm font-semibold mb-0.5 opacity-60 ${isOnBreak ? 'text-status-warning' : 'text-text-primary'}`}>Duration</span>
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

                        <div className="flex items-center gap-1 relative">
                            {/* Color Theme Selector */}
                            <div className="relative">
                                <button 
                                    onClick={() => setIsThemeSelectorOpen(!isThemeSelectorOpen)} 
                                    className={`hidden md:flex p-2.5 items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-highlight transition-all rounded-lg border border-transparent hover:border-border-subtle ${isThemeSelectorOpen ? 'bg-surface-highlight border-border-subtle text-text-primary' : ''}`}
                                >
                                    <Palette size={18} />
                                </button>
                                
                                {isThemeSelectorOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsThemeSelectorOpen(false)} />
                                        <div className="absolute top-full right-0 mt-3 w-56 bg-surface-main border border-border-strong shadow-float rounded-xl z-50 overflow-hidden isolate">
                                            <div className="p-3 border-b border-border-subtle bg-surface-alt flex flex-col gap-1">
                                                <span className="text-sm font-bold text-text-primary uppercase tracking-wide">Workspace Properties</span>
                                                <span className="text-sm text-text-muted">Personalize your panel layout</span>
                                            </div>
                                            <div className="p-3 border-b border-border-subtle bg-surface-main">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-semibold text-text-secondary">UI Scale</span>
                                                    <span className="text-sm font-bold text-accent-primary font-mono">{Math.round((uiZoom || 1) * 100)}%</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => setUiZoom(Math.max(0.6, (uiZoom || 1) - 0.1))}
                                                        className="w-8 h-8 rounded bg-surface-alt hover:bg-surface-highlight border border-border-strong text-text-primary flex items-center justify-center font-bold"
                                                    >-</button>
                                                    <input 
                                                        type="range" 
                                                        min="0.6" max="2.0" step="0.1" 
                                                        value={uiZoom || 1}
                                                        onChange={e => setUiZoom(parseFloat(e.target.value))}
                                                        className="flex-1 cursor-pointer accent-accent-primary"
                                                    />
                                                    <button 
                                                        onClick={() => setUiZoom(Math.min(2.0, (uiZoom || 1) + 0.1))}
                                                        className="w-8 h-8 rounded bg-surface-alt hover:bg-surface-highlight border border-border-strong text-text-primary flex items-center justify-center font-bold"
                                                    >+</button>
                                                </div>
                                            </div>
                                            <div className="p-2 flex flex-col gap-1 bg-surface-main">
                                                {Object.keys(themeVars).map(t => {
                                                    const previewColors: Record<string, string> = {
                                                        Classic: 'bg-white border-border-strong dark:bg-black',
                                                        Bloom: 'bg-[#173b82] border-[#173b82]',
                                                        Agave: 'bg-[#1a634e] border-[#1a634e]',
                                                        Rose: 'bg-[#8f233a] border-[#8f233a]'
                                                    };
                                                    return (
                                                    <button
                                                        key={t}
                                                        onClick={() => {
                                                            setAppThemePalette(t);
                                                            setIsThemeSelectorOpen(false);
                                                        }}
                                                        className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm font-semibold transition-all hover:bg-surface-highlight group ${appThemePalette === t ? 'bg-surface-highlight text-accent-primary ring-1 ring-accent-primary/20 shadow-sm' : 'text-text-secondary'}`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-3.5 h-3.5 rounded-full border ${previewColors[t]}`}></div>
                                                            <span>{t}</span>
                                                        </div>
                                                        {appThemePalette === t && <Check size={16} className="text-accent-primary" />}
                                                    </button>
                                                )})}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

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
                <div className="flex-1 flex flex-col min-h-0 relative bg-surface-main">
                    {children}
                </div>
            </main>

            <UserSettingsModal 
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                initialTab={settingsInitialTab}
                user={user}
            />

            <NotificationPanel 
                isOpen={isNotificationPanelOpen}
                onClose={() => setIsNotificationPanelOpen(false)}
                notifications={notifications}
                onClear={clearNotification!}
            />
        </div>
    );
};