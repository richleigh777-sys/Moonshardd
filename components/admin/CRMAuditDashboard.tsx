import React, { useState, useMemo } from 'react';
import { User, Sale, Note } from '../../types';
import { 
    AlertTriangle, Activity, Database, Link, Check, RefreshCw, Trash2, Filter, 
    Layers, FileSearch, CheckCircle2, BookOpen, Inbox, CalendarRange, Search, 
    Calendar, UserCheck, ChevronDown, ChevronUp, Clock
} from 'lucide-react';
import { Card } from '../ui/Base';
import { useCRM } from '../../hooks/useCRM';
import { useAuth } from '../../hooks/useAuth';

interface CRMAuditDashboardProps {
    users: User[];
    sales: Sale[];
    notes: Note[];
}

export const CRMAuditDashboard: React.FC<CRMAuditDashboardProps> = ({ users, sales, notes }) => {
    const { currentUser } = useAuth();
    const { dataHealthReports, executeDataHealthAction, undoDataHealthAction, executeFullDataHealthReport } = useCRM();
    const [activeTab, setActiveTab] = useState<'data' | 'usage' | 'alignment' | 'reports' | 'callbacks'>('data');
    const [activeAction, setActiveAction] = useState<string | null>(null);

    // Global Callback timeline states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterAgent, setFilterAgent] = useState('');
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const groupedCallbacks = useMemo(() => {
        const groups: Record<string, { customerName: string; phone: string; timeline: Note[] }> = {};
        
        notes.forEach(note => {
            const key = note.phone || note.customerName || 'Unknown Customer';
            if (!groups[key]) {
                groups[key] = {
                    customerName: note.customerName || 'Unknown Customer',
                    phone: note.phone || '',
                    timeline: []
                };
            }
            groups[key].timeline.push(note);
        });

        return Object.values(groups).map(g => {
            const sortedTimeline = [...g.timeline].sort((a,b) => b.timestamp - a.timestamp);
            return {
                ...g,
                timeline: sortedTimeline,
                lastInteraction: sortedTimeline[0]?.timestamp || 0,
                lastAgent: sortedTimeline[0]?.agentName || 'Unknown',
                lastContent: sortedTimeline[0]?.content || '',
                activeCallback: sortedTimeline.find(n => n.type === 'callback' && n.reminderAt && !n.reminderDismissed)
            };
        }).sort((a, b) => b.lastInteraction - a.lastInteraction);
    }, [notes]);

    const filteredGrouped = useMemo(() => {
        return groupedCallbacks.filter(g => {
            const matchesSearch = g.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  g.phone.includes(searchQuery);
            const matchesAgent = filterAgent === '' || g.timeline.some(n => n.agentName.toLowerCase().includes(filterAgent.toLowerCase()));
            return matchesSearch && matchesAgent;
        });
    }, [groupedCallbacks, searchQuery, filterAgent]);

    const missingEmails = sales.filter(s => !s.email || s.email.trim() === '').length;
    const duplicatedCustomers = sales.filter(s => s.customer).length - new Set(sales.map(s => s.customer)).size; // simplistic estimation
    const staleRecords = sales.filter(s => s.status === 'Pending').length; // Simplistic example for stale
    
    const [now] = useState(() => Date.now());
    const activeUsers = users.filter(u => u.active).length;
    const inactiveUsers = users.filter(u => !u.active || (!u.lastActive || now - u.lastActive > 86400000 * 7)).length;

    const unassignedNotes = notes.filter(n => !n.linkedSaleId && !n.customerName).length;

    return (
        <div className="p-4 h-full overflow-y-auto w-full gap-4 flex flex-col">
            <div className="flex justify-between items-center bg-surface-base p-4 border-b border-border-subtle rounded-xl shadow-sm">
                <div>
                    <h1 className="text-lg font-bold tracking-tight text-text-primary">CRM Audit & Health Fixes</h1>
                    <p className="text-text-secondary mt-1">Diagnose structural issues, clean data, and optimize processes.</p>
                </div>
            </div>

            <div className="flex gap-4">
                 <button 
                    onClick={() => setActiveTab('data')}
                    className={`flex-1 p-4 rounded-xl border flex items-center justify-between text-left transition-all ${activeTab === 'data' ? 'bg-accent-primary/5 text-accent-primary border-accent-primary' : 'bg-surface-base border-border-subtle hover:bg-surface-highlight'}`}
                >
                    <div>
                         <h3 className="font-semibold text-lg">Data Quality Management</h3>
                         <p className="text-sm opacity-80 mt-1">Found {missingEmails + duplicatedCustomers > 0 ? (missingEmails + duplicatedCustomers) + ' issues' : 'clean'}</p>
                    </div>
                    <Database size={24} className={activeTab === 'data' ? 'text-accent-primary' : 'text-text-muted'} />
                </button>
                <button 
                    onClick={() => setActiveTab('usage')}
                    className={`flex-1 p-4 rounded-xl border flex items-center justify-between text-left transition-all ${activeTab === 'usage' ? 'bg-status-warning/5 text-status-warning border-status-warning' : 'bg-surface-base border-border-subtle hover:bg-surface-highlight'}`}
                >
                     <div>
                         <h3 className="font-semibold text-lg">System Usage</h3>
                         <p className="text-sm opacity-80 mt-1">{inactiveUsers} flagged users</p>
                    </div>
                    <Activity size={24} className={activeTab === 'usage' ? 'text-status-warning' : 'text-text-muted'} />
                </button>
                <button 
                    onClick={() => setActiveTab('alignment')}
                    className={`flex-1 p-4 rounded-xl border flex items-center justify-between text-left transition-all ${activeTab === 'alignment' ? 'bg-status-success/5 text-status-success border-status-success' : 'bg-surface-base border-border-subtle hover:bg-surface-highlight'}`}
                >
                     <div>
                         <h3 className="font-semibold text-lg">Purpose Alignment</h3>
                         <p className="text-sm opacity-80 mt-1">{unassignedNotes} process gaps</p>
                    </div>
                    <Link size={24} className={activeTab === 'alignment' ? 'text-status-success' : 'text-text-muted'} />
                </button>
                <button 
                    onClick={() => setActiveTab('reports')}
                    className={`flex-1 p-4 rounded-xl border flex items-center justify-between text-left transition-all ${activeTab === 'reports' ? 'bg-accent-secondary/5 text-accent-secondary border-accent-secondary' : 'bg-surface-base border-border-subtle hover:bg-surface-highlight'}`}
                >
                     <div>
                         <h3 className="font-semibold text-lg">Weekly Operations</h3>
                         <p className="text-sm opacity-80 mt-1">{dataHealthReports?.filter(r => r.status === 'pending').length || 0} awaiting review</p>
                    </div>
                    <Inbox size={24} className={activeTab === 'reports' ? 'text-accent-secondary' : 'text-text-muted'} />
                </button>
                {currentUser?.level === 10 && (
                    <button 
                        onClick={() => setActiveTab('callbacks')}
                        className={`flex-1 p-4 rounded-xl border flex items-center justify-between text-left transition-all ${activeTab === 'callbacks' ? 'bg-[#4f46e5]/5 text-[#818cf8] border-[#4f46e5]' : 'bg-surface-base border-border-subtle hover:bg-surface-highlight'}`}
                    >
                         <div>
                             <h3 className="font-semibold text-lg">Global Callback Ledger</h3>
                             <p className="text-sm opacity-80 mt-1">{notes.filter(n => n.type === 'callback').length} pending callbacks</p>
                        </div>
                        <CalendarRange size={24} className={activeTab === 'callbacks' ? 'text-[#818cf8]' : 'text-text-muted'} />
                    </button>
                )}
            </div>

            <div className="flex-1 bg-surface-base border border-border-subtle rounded-xl p-4">
                {activeTab === 'reports' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                         <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
                            <Inbox className="text-accent-secondary" size={20} />
                            <div>
                                <h2 className="text-xl font-bold">Automated Weekly Health Reports</h2>
                                <p className="text-sm text-text-secondary mt-1">Background workers generate weekly scans mapping duplicate data, flagging inactive accounts, and auditing pipeline health. Require Admin Level 10 approval to execute permanently.</p>
                            </div>
                        </div>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto">
                            {dataHealthReports?.length === 0 ? (
                                <div className="p-5 text-center border border-dashed border-border-subtle rounded-xl text-text-secondary">
                                    No reports generated this week. Background worker runs asynchronously.
                                </div>
                            ) : (
                                dataHealthReports?.sort((a,b) => b.timestamp - a.timestamp).map(report => (
                                    <div key={report.id} className={`p-4 rounded-xl border ${report.status === 'pending' ? 'border-accent-secondary/50 bg-accent-secondary/5' : 'border-border-subtle bg-surface-base'}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                                    Health Report {new Date(report.timestamp).toLocaleDateString()}
                                                    {report.status === 'pending' && <span className="text-sm bg-status-warning/20 text-status-warning px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Pending Approval</span>}
                                                    {report.status === 'approved' && <span className="text-sm bg-status-success/20 text-status-success px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Executed</span>}
                                                    {report.status === 'undone' && <span className="text-sm bg-status-error/20 text-status-error px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Reverted</span>}
                                                </h3>
                                                <p className="text-sm text-text-secondary mt-1">Identified {report.actions.length} potential optimizations.</p>
                                            </div>
                                            {report.status === 'pending' && (
                                                <button onClick={() => executeFullDataHealthReport(report.id)} className="px-4 py-2 bg-accent-secondary text-white font-medium rounded-lg hover:bg-accent-secondary/90 transition-colors text-sm shadow-sm flex items-center gap-2">
                                                    <CheckCircle2 size={16}/> Approve All Optimizations
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className="mt-4 space-y-2">
                                            {report.actions.map((action: any) => {
                                                const isExecuted = report.approvedActions?.includes(action.id);
                                                return (
                                                    <div key={action.id} className="flex justify-between items-center p-3 bg-surface-highlight rounded border border-border-subtle">
                                                        <div className="flex items-center gap-3">
                                                            {action.type === 'flag_user' && <Activity size={16} className="text-status-warning" />}
                                                            {action.type === 'merge_contact' && <Layers size={16} className="text-accent-primary" />}
                                                            <div>
                                                                <p className="text-sm font-medium">
                                                                    {action.type === 'flag_user' && `Flag inactive user: ${action.targetName}`}
                                                                    {action.type === 'merge_contact' && `Merge exact duplicate: ${action.targetName}`}
                                                                </p>
                                                                {action.type === 'flag_user' && <p className="text-sm text-text-muted mt-0.5">Inactive since {new Date(action.metadata?.lastActive || Date.now()).toLocaleDateString()}</p>}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {report.status === 'pending' && !isExecuted && (
                                                                <button onClick={() => executeDataHealthAction(report.id, action.id)} className="px-3 py-1.5 text-sm font-semibold border border-status-success/30 bg-status-success/10 text-status-success hover:bg-status-success text-white rounded transition-colors">
                                                                    Approve
                                                                </button>
                                                            )}
                                                            {isExecuted && report.status !== 'undone' && (
                                                                <button onClick={() => undoDataHealthAction(report.id, action.id)} className="px-3 py-1.5 text-sm font-semibold border border-status-error/30 bg-status-error/10 text-status-error hover:bg-status-error hover:text-white rounded transition-colors">
                                                                    Undo Change
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
                {activeTab === 'data' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 bg-[#090707] p-4 rounded-xl border border-border-subtle">
                         <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
                            <Database className="text-accent-primary" size={20} />
                            <h2 className="text-xl font-bold">Data Quality & Health Toolkit</h2>
                        </div>
                        <p className="text-text-secondary max-w-3xl">Comprehensive tools to review, clean, and structure the data in your CRM for optimal performance and accurate decision-making.</p>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                            {/* Remove Unused Data */}
                            <Card className="flex flex-col border border-border-subtle p-4 hover:border-accent-primary transition-colors cursor-pointer" onClick={() => setActiveAction('remove')}>
                                <div className="flex items-start justify-between">
                                    <div className="h-10 w-10 rounded-lg bg-surface-highlight flex items-center justify-center">
                                         <Trash2 className="text-text-secondary" size={20} />
                                    </div>
                                    {staleRecords > 0 && <span className="px-2 py-0.5 text-sm font-semibold bg-status-error/10 text-status-error border border-status-error/20 rounded-full">{staleRecords} stale</span>}
                                </div>
                                <div className="mt-4">
                                     <h3 className="font-semibold">Remove Unused Data</h3>
                                     <p className="text-sm text-text-secondary mt-1">Archive or delete outdated records of former customers to reduce clutter.</p>
                                </div>
                            </Card>

                            {/* Clear Redundant Data */}
                            <Card className="flex flex-col border border-border-subtle p-4 hover:border-accent-primary transition-colors cursor-pointer" onClick={() => setActiveAction('redundant')}>
                                <div className="flex items-start justify-between">
                                    <div className="h-10 w-10 rounded-lg bg-surface-highlight flex items-center justify-center">
                                         <Layers className="text-text-secondary" size={20} />
                                    </div>
                                    {duplicatedCustomers > 0 && <span className="px-2 py-0.5 text-sm font-semibold bg-status-warning/10 text-status-warning border border-status-warning/20 rounded-full">{duplicatedCustomers} dupes</span>}
                                </div>
                                <div className="mt-4">
                                     <h3 className="font-semibold">Clear Redundant Data</h3>
                                     <p className="text-sm text-text-secondary mt-1">Identify and merge duplicate contact entries to avoid reporting errors.</p>
                                </div>
                            </Card>

                             {/* Check Missing Data */}
                             <Card className="flex flex-col border border-border-subtle p-4 hover:border-accent-primary transition-colors cursor-pointer" onClick={() => setActiveAction('missing')}>
                                <div className="flex items-start justify-between">
                                    <div className="h-10 w-10 rounded-lg bg-surface-highlight flex items-center justify-center">
                                         <FileSearch className="text-text-secondary" size={20} />
                                    </div>
                                    {missingEmails > 0 && <span className="px-2 py-0.5 text-sm font-semibold bg-status-error/10 text-status-error border border-status-error/20 rounded-full">{missingEmails} missing</span>}
                                </div>
                                <div className="mt-4">
                                     <h3 className="font-semibold">Check Missing Data</h3>
                                     <p className="text-sm text-text-secondary mt-1">Find incomplete contacts or lead gaps hindering follow-ups.</p>
                                </div>
                            </Card>

                            {/* Ensure Data Up-to-Date */}
                            <Card className="flex flex-col border border-border-subtle p-4 hover:border-accent-primary transition-colors cursor-pointer" onClick={() => setActiveAction('uptodate')}>
                                <div className="flex items-start justify-between">
                                    <div className="h-10 w-10 rounded-lg bg-surface-highlight flex items-center justify-center">
                                         <CheckCircle2 className="text-text-secondary" size={20} />
                                    </div>
                                </div>
                                <div className="mt-4">
                                     <h3 className="font-semibold">Update Invalid Data</h3>
                                     <p className="text-sm text-text-secondary mt-1">Flag bounced emails or changed addresses for manual review.</p>
                                </div>
                            </Card>

                            {/* Examine Segmentation */}
                            <Card className="flex flex-col border border-border-subtle p-4 hover:border-accent-primary transition-colors cursor-pointer" onClick={() => setActiveAction('segmentation')}>
                                <div className="flex items-start justify-between">
                                    <div className="h-10 w-10 rounded-lg bg-surface-highlight flex items-center justify-center">
                                         <Filter className="text-text-secondary" size={20} />
                                    </div>
                                </div>
                                <div className="mt-4">
                                     <h3 className="font-semibold">Examine Segmentation</h3>
                                     <p className="text-sm text-text-secondary mt-1">Ensure filters cover product preferences & engagement, not just location.</p>
                                </div>
                            </Card>

                            {/* Data Management Process */}
                            <Card className="flex flex-col border border-border-subtle p-4 hover:border-accent-primary transition-colors bg-accent-primary/5 cursor-pointer" onClick={() => setActiveAction('process')}>
                                <div className="flex items-start gap-4 h-full flex-col justify-between">
                                    <div className="h-10 w-10 rounded-lg bg-accent-primary/20 flex items-center justify-center">
                                         <BookOpen className="text-accent-primary" size={20} />
                                    </div>
                                    <div>
                                         <h3 className="font-semibold text-accent-primary">Data Management Process</h3>
                                         <p className="text-sm text-text-secondary mt-1">Establish strict routines on when and how data is entered and cleaned.</p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {activeAction === 'remove' && (
                             <div className="mt-6 p-4 border border-border-subtle rounded-lg bg-surface-highlight animate-in fade-in">
                                 <h4 className="font-semibold flex items-center gap-2"><Trash2 size={16}/> Remove Unused & Outdated Data</h4>
                                 <p className="text-sm text-text-secondary mt-2">Running this task will identify records that have had no interaction in the last 2 years.</p>
                                 <button className="mt-4 px-4 py-2 bg-status-error text-white rounded font-medium hover:bg-status-error/90 transition-colors text-sm">Scan for Stale Records</button>
                             </div>
                        )}

                        {activeAction === 'redundant' && (
                             <div className="mt-6 p-4 border border-border-subtle rounded-lg bg-surface-highlight animate-in fade-in">
                                 <h4 className="font-semibold flex items-center gap-2"><Layers size={16}/> Clear Redundant Data</h4>
                                 <p className="text-sm text-text-secondary mt-2">This tool merges duplicate contacts that share the same email or phone network, preventing mixed reporting metrics.</p>
                                 <button className="mt-4 px-4 py-2 bg-status-warning text-white rounded font-medium hover:bg-status-warning/90 transition-colors text-sm">Run Deduplication Worker</button>
                             </div>
                        )}

                       {activeAction === 'missing' && (
                             <div className="mt-6 p-4 border border-border-subtle rounded-lg bg-surface-highlight animate-in fade-in">
                                 <h4 className="font-semibold flex items-center gap-2"><FileSearch size={16}/> Check for Missing Data</h4>
                                 <p className="text-sm text-text-secondary mt-2">Identify contacts lacking key follow-up criteria like communication preference or active pipeline stage.</p>
                                 <div className="mt-4 grid grid-cols-2 gap-4">
                                     <button className="px-4 py-2 bg-surface-base border border-border-subtle text-text-primary rounded font-medium transition-colors text-sm">View Null Emails ({missingEmails})</button>
                                     <button className="px-4 py-2 bg-surface-base border border-border-subtle text-text-primary rounded font-medium transition-colors text-sm">View Unstaged Leads</button>
                                 </div>
                             </div>
                        )}

                        {activeAction === 'uptodate' && (
                             <div className="mt-6 p-4 border border-border-subtle rounded-lg bg-surface-highlight animate-in fade-in">
                                 <h4 className="font-semibold flex items-center gap-2"><CheckCircle2 size={16}/> Ensure Data is Up-to-Date</h4>
                                 <p className="text-sm text-text-secondary mt-2">Verify integrity of current interactions. Run validations on email syntax and flag records needing manual updates from sales reps.</p>
                                 <button className="mt-4 px-4 py-2 bg-accent-primary text-white rounded font-medium hover:bg-accent-hover transition-colors text-sm">Initiate Validation Sequence</button>
                             </div>
                        )}

                        {activeAction === 'segmentation' && (
                             <div className="mt-6 p-4 border border-border-subtle rounded-lg bg-surface-highlight animate-in fade-in">
                                 <h4 className="font-semibold flex items-center gap-2"><Filter size={16}/> Examine Data Segmentation</h4>
                                 <p className="text-sm text-text-secondary mt-2">Expand current filtering capabilities. Your database must support custom fields for engagement level, product interest, and custom tagging beyond geographic blocks.</p>
                                 <button className="mt-4 px-4 py-2 bg-accent-primary text-white rounded font-medium hover:bg-accent-hover transition-colors text-sm">Open Taxonomy Manager</button>
                             </div>
                        )}

                         {activeAction === 'process' && (
                             <div className="mt-6 p-4 border border-border-subtle rounded-lg bg-status-success/10 border-status-success/30 animate-in fade-in">
                                 <h4 className="font-semibold text-status-success flex items-center gap-2"><BookOpen size={16}/> Create CRM Data Management Process</h4>
                                 <p className="text-sm text-text-secondary mt-2">Implement a structured long-term process. Generate mandatory data entry policies and configure automated weekly cleanup reminders for the team.</p>
                                 <button className="mt-4 px-4 py-2 bg-status-success text-white rounded font-medium hover:bg-status-success/90 transition-colors text-sm">Configure Automation Policies</button>
                             </div>
                        )}
                    </div>
                )}
                
                {activeTab === 'usage' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
                            <Activity className="text-status-warning" size={20} />
                            <h2 className="text-xl font-bold">CRM Usage Review</h2>
                        </div>
                        <p className="text-text-secondary max-w-3xl">Evaluates how effectively employees use the system. Identifying inactive accounts or low adoption rates can highlight training gaps or usability issues.</p>
                        
                        <div className="grid grid-cols-3 gap-4">
                            <Card>
                                <div className="p-4">
                                     <p className="text-text-secondary text-sm font-medium">Total Registered</p>
                                     <h4 className="text-xl font-bold mt-1 text-text-primary">{users.length}</h4>
                                </div>
                            </Card>
                            <Card>
                                <div className="p-4">
                                     <p className="text-text-secondary text-sm font-medium">Active Users</p>
                                     <h4 className="text-xl font-bold mt-1 text-status-success">{activeUsers}</h4>
                                </div>
                            </Card>
                            <Card>
                                <div className="p-4">
                                     <p className="text-text-secondary text-sm font-medium">Dormant Accounts</p>
                                     <h4 className="text-xl font-bold mt-1 text-status-error">{inactiveUsers}</h4>
                                </div>
                            </Card>
                        </div>
                        
                        <div className="p-4 bg-status-error/5 border border-status-error/20 rounded-lg mt-6">
                            <div className="flex items-start gap-4">
                                <AlertTriangle className="text-status-error mt-0.5" size={20} />
                                <div>
                                    <h4 className="font-semibold text-status-error">Usage Deficit Detected</h4>
                                    <p className="text-sm text-text-secondary mt-1">Some sales reps are not consistently logging their activities. This leads to missed follow-ups and incomplete interaction records.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'alignment' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                         <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
                            <Link className="text-status-success" size={20} />
                            <h2 className="text-xl font-bold">Purpose Alignment Audit</h2>
                        </div>
                        <p className="text-text-secondary max-w-3xl">Examines whether the CRM system aligns with current business goals and workflows, and evaluates if automations and integrations are serving their intended purpose.</p>
                        
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="space-y-4">
                                <h3 className="font-medium text-lg border-b border-border-subtle pb-2">Sales Process Status</h3>
                                <div className="flex items-start gap-3 p-3 bg-surface-highlight rounded">
                                    <div className="mt-1"><Check className="text-status-success" size={16}/></div>
                                    <div>
                                        <p className="font-medium text-sm">Lead Prioritization</p>
                                        <p className="text-sm text-text-muted">Clear steps assigned to qualified leads</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-status-warning/10 border border-status-warning/20 rounded">
                                    <div className="mt-1"><AlertTriangle className="text-status-warning" size={16}/></div>
                                    <div>
                                        <p className="font-medium text-sm text-status-warning">Marketing Tool Sync Warning</p>
                                        <p className="text-sm text-text-muted mt-1">CRM isn't properly syncing with email marketing tool. Follow-ups delayed.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-surface-highlight rounded">
                                    <div className="mt-1"><Check className="text-status-success" size={16}/></div>
                                    <div>
                                        <p className="font-medium text-sm">Performance Tracking</p>
                                        <p className="text-sm text-text-muted">Sales metrics are guiding strategy accurately</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-surface-highlight rounded-lg flex flex-col items-center justify-center text-center">
                                <RefreshCw className="text-text-secondary opacity-50 mb-4" size={40} />
                                <h4 className="font-semibold text-lg">Automate Your Process</h4>
                                <p className="text-text-muted text-sm mt-2 max-w-xs">A structured and automated sales process creates consistency, improves conversions, and reduces friction throughout the buying journey.</p>
                                <button className="mt-6 px-4 py-2 bg-status-success text-white rounded font-medium hover:bg-status-success/90 transition-colors">
                                    Enable Automated Operations
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'callbacks' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                            <div className="flex items-center gap-3">
                                <CalendarRange className="text-[#818cf8]" size={20} />
                                <div>
                                    <h2 className="text-xl font-bold">Global Customer Callback Timeline</h2>
                                    <p className="text-sm text-text-secondary mt-1">
                                        Overall interactions timeline across all agents. Click customers to expand their interaction events history.
                                    </p>
                                </div>
                            </div>
                            <span className="text-sm uppercase font-bold bg-[#4f46e5]/20 text-[#818cf8] border border-border-subtle rounded-full px-2.5 py-1">
                                Admin Level {currentUser?.level} View
                            </span>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    type="text"
                                    placeholder="Search by customer name or phone..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full bg-surface-alt border border-border-subtle rounded-xl pl-9 pr-4 py-2 text-sm text-text-primary focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div className="relative w-full sm:w-64">
                                <UserCheck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    type="text"
                                    placeholder="Filter by agent..."
                                    value={filterAgent}
                                    onChange={e => setFilterAgent(e.target.value)}
                                    className="w-full bg-surface-alt border border-border-subtle rounded-xl pl-9 pr-4 py-2 text-sm text-text-primary focus:border-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Timeline list */}
                        <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                            {filteredGrouped.length === 0 ? (
                                <div className="p-12 text-center border border-dashed border-border-subtle rounded-xl text-text-muted text-sm">
                                    No records found matching filters.
                                </div>
                            ) : (
                                filteredGrouped.map((item, idx) => {
                                    const isExpanded = expandedId === idx;
                                    return (
                                        <div key={idx} className="bg-surface-alt/25 border border-border-subtle rounded-xl overflow-hidden transition-all duration-150">
                                            {/* Accordion header */}
                                            <div 
                                                onClick={() => setExpandedId(isExpanded ? null : idx)}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface-alt/45 border-b border-border-subtle/30 cursor-pointer hover:bg-surface-alt/70 transition-colors gap-3 select-none"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h4 className="font-bold text-sm text-text-primary">{item.customerName}</h4>
                                                        {item.phone && <span className="text-sm font-mono text-text-muted bg-surface-main px-1.5 py-0.5 rounded border border-border-subtle/50">{item.phone}</span>}
                                                        {item.activeCallback && (
                                                            <span className="text-sm font-bold bg-[#4f46e5]/10 text-[#818cf8] border border-[#4f46e5]/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                                                <Clock size={10} /> Callback Set: {new Date(item.activeCallback.reminderAt!).toLocaleString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-text-secondary mt-1 truncate">
                                                        Last interaction: <span className="text-text-primary font-semibold">{item.lastContent}</span>
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4 self-end sm:self-auto uppercase tracking-wider shrink-0 text-sm font-bold text-text-muted">
                                                    <div>
                                                        Touched <span className="text-[#818cf8]">{item.timeline.length} time(s)</span> (Last touch: {item.lastAgent})
                                                    </div>
                                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </div>
                                            </div>

                                            {/* Details Feed showing vertical timeline */}
                                            {isExpanded && (
                                                <div className="p-4 bg-surface-main/30 border-t border-border-subtle/35 space-y-4 animate-in slide-in-from-top-2 duration-150">
                                                    <div className="relative border-l-2 border-border-subtle ml-3.5 space-y-4 py-1">
                                                        {item.timeline.map((note, noteIdx) => (
                                                            <div key={note.id || noteIdx} className="relative pl-6">
                                                                {/* Dot */}
                                                                <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full border ${
                                                                    note.type === 'callback' ? 'bg-[#818cf8] border-[#4f46e5] shadow shadow-sm/50' : 'bg-text-muted border-border-strong'
                                                                }`} />
                                                                
                                                                <div className="bg-surface-alt/70 border border-border-subtle/40 rounded-xl p-3 max-w-2xl text-sm">
                                                                    <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-extrabold text-[#818cf8]">{note.agentName}</span>
                                                                            <span className="text-sm uppercase tracking-wide font-bold px-1.5 py-0.5 bg-surface-main text-text-muted rounded border border-border-subtle/30">
                                                                                {note.type.toUpperCase()}
                                                                            </span>
                                                                        </div>
                                                                        <span className="text-sm font-mono text-text-muted">
                                                                            {new Date(note.timestamp).toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-text-primary font-medium leading-relaxed">{note.content}</p>
                                                                    {note.reminderAt && (
                                                                        <p className="text-sm font-bold text-[#818cf8] mt-2 flex items-center gap-1.5">
                                                                            <Calendar size={11} /> Scheduled for: {new Date(note.reminderAt).toLocaleString()} {note.reminderDismissed && <span className="opacity-50 font-normal">(dismissed)</span>}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
