
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Sale, User, Note, Task, SystemHealth, ProductConfig, AuditEntry, AttendanceRecord, TacticalDirective, WeeklyStats, Customer, ChatMessage, ChatChannel, ScriptItem, AppNotification, Account, SystemConfig, Presence } from '../types';
import { nexusGateway, sendToGoogleSheet, testGoogleSheetConnection, validateConfig } from '../nexus/adapters/DataGateway';
import { createNotification } from '../lib/notificationService';
import { INITIAL_PRODUCT_CONFIG, VALID_USERS } from '../constants';

export const useCRMData = (currentUser: User | null) => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [users, setUsers] = useState<User[]>([]); 
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [leaderboard, setLeaderboard] = useState<WeeklyStats[]>([]);
    const [productConfig, setProductConfig] = useState<ProductConfig>(INITIAL_PRODUCT_CONFIG);
    const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [directives, setDirectives] = useState<TacticalDirective[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [channels, setChannels] = useState<ChatChannel[]>([]);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [callLogs, setCallLogs] = useState<any[]>([]);
    const [scripts, setScripts] = useState<ScriptItem[]>([]);
    const [customSheets, setCustomSheets] = useState<any[]>([]);
    const [presence, setPresenceList] = useState<Presence[]>([]);
    const [dataHealthReports, setDataHealthReports] = useState<any[]>([]);
    const [dialerLists, setDialerLists] = useState<any[]>([]);
    const [systemConfig, setSystemConfig] = useState<SystemConfig>({ 
        shiftStart: "08:00", shiftEnd: "17:00", cutoffDay1: 15, cutoffDay2: 0,
        baseCommission: 15, breakDurationMinutes: 60, ecoMode: false, telephonyEnabled: false
    });
    
    const [health, setHealth] = useState<SystemHealth>(() => ({
        cloudSync: 'STABLE', encryption: 'AES-256', storageUsage: 0,
        sessionIntegrity: 'SECURE', latency: 42, lastDiagnostic: Date.now()
    }));
    const [serverChangeVersion, setServerChangeVersion] = useState(0);

    const salesRef = useRef(sales);
    const tasksRef = useRef(tasks);
    const usersRef = useRef(users);
    const customersRef = useRef(customers);

    useEffect(() => {
        salesRef.current = sales;
    }, [sales]);

    useEffect(() => {
        tasksRef.current = tasks;
    }, [tasks]);

    useEffect(() => {
        usersRef.current = users;
    }, [users]);
    
    useEffect(() => {
        customersRef.current = customers;
    }, [customers]);

    useEffect(() => {
        const config = validateConfig();
        if (!config.valid) {
            setTimeout(() => {
                setHealth(prev => {
                    if (prev.cloudSync === 'OFFLINE') return prev;
                    return { ...prev, cloudSync: 'OFFLINE' };
                });
            }, 0);
        }
    }, []); // Only run on mount

    useEffect(() => {
        if (!currentUser) {
            // Reset state when user logs out
            // Use a single batch update or wrap in timeout to avoid cascading render warnings
            const reset = () => {
                setSales([]);
                setNotes([]);
                setTasks([]);
                setAuditLogs([]);
                setLeaderboard([]);
                setCustomers([]);
                setAccounts([]);
                setMessages([]);
                setChannels([]);
                setNotifications([]);
                setCallLogs([]);
                setScripts([]);
                setCustomSheets([]);
                setDataHealthReports([]);
                setDialerLists([]);
            };
            
            setTimeout(() => {
                reset();
            }, 0);
        }
    }, [currentUser]);

    useEffect(() => {
        const handleServerChange = () => setServerChangeVersion(v => v + 1);
        window.addEventListener('nexus_server_changed', handleServerChange);
        return () => window.removeEventListener('nexus_server_changed', handleServerChange);
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        const subs = [
            nexusGateway.subscribe('sales', currentUser, (data: Sale[]) => setSales(data)),
            nexusGateway.subscribe('customers', currentUser, (data: Customer[]) => setCustomers(data)),
            nexusGateway.subscribe('users', currentUser, (data: User[]) => setUsers(data.length ? data : VALID_USERS)),
            nexusGateway.subscribe('accounts', currentUser, (data: Account[]) => setAccounts(data)),
            nexusGateway.subscribe('leaderboard', currentUser, (data: WeeklyStats[]) => setLeaderboard(data)),
            nexusGateway.subscribe('notes', currentUser, (data: Note[]) => setNotes(data)),
            nexusGateway.subscribe('tasks', currentUser, (data: Task[]) => setTasks(data)),
            nexusGateway.subscribe('audit', currentUser, (data: AuditEntry[]) => setAuditLogs(data)),
            nexusGateway.subscribe('attendance', currentUser, (data: AttendanceRecord[]) => setAttendance(data)),
            nexusGateway.subscribe('directives', currentUser, (data: TacticalDirective[]) => setDirectives(data)),
            nexusGateway.subscribe('messages', currentUser, (data: ChatMessage[]) => setMessages(data)),
            nexusGateway.subscribe('channels', currentUser, (data: ChatChannel[]) => setChannels(data)),
            nexusGateway.subscribe('notifications', currentUser, (data: AppNotification[]) => setNotifications(data)),
            nexusGateway.subscribe('callLogs', currentUser, (data: any[]) => setCallLogs(data)),
            nexusGateway.subscribe('scripts', currentUser, (data: ScriptItem[]) => setScripts(data)),
            nexusGateway.subscribe('sheets', currentUser, (data: any[]) => setCustomSheets(data)),
            nexusGateway.subscribe('presence', currentUser, (data: Presence[]) => setPresenceList(data)),
            nexusGateway.subscribe('dialer_lists', currentUser, (data: any[]) => setDialerLists(data)),
            nexusGateway.subscribe('systemConfig', currentUser, (data: any) => {
                const configData = Array.isArray(data) ? data[0] : data;
                if (configData) {
                    setSystemConfig(prev => {
                        if (JSON.stringify(prev) === JSON.stringify(configData)) return prev;
                        return configData;
                    });
                    if (configData.ecoMode) document.documentElement.classList.add('eco-mode');
                    else document.documentElement.classList.remove('eco-mode');
                }
            }),
            nexusGateway.subscribe('dataHealthReports', currentUser, (data: any[]) => setDataHealthReports(data)),
            nexusGateway.subscribe('config', currentUser, (data: ProductConfig[]) => {
                if (data && data.length > 0) {
                    setProductConfig(prev => {
                        if (JSON.stringify(prev) === JSON.stringify(data[0])) return prev;
                        return data[0];
                    });
                } else {
                    setProductConfig(INITIAL_PRODUCT_CONFIG);
                }
            })
        ];
        return () => subs.forEach(unsub => unsub());
    }, [currentUser, serverChangeVersion]);

    useEffect(() => {
        if (!currentUser) return;
        
        const checkStagnation = () => {
            const now = Date.now();
            const ONE_DAY = 86400000;
            const STAGNATION_THRESHOLD = 5 * ONE_DAY;

            const currentSales = salesRef.current;
            const currentTasks = tasksRef.current;

            currentSales.forEach(sale => {
                const timeInStage = now - sale.timestamp;
                const isStale = (sale.status === 'Pending' || sale.pipelineStatus === 'Contacted – Interested') && timeInStage > STAGNATION_THRESHOLD;
                
                if (isStale && sale.agentId === currentUser.id) {
                    const existingTask = currentTasks.find(t => t.linkedSaleId === sale.id && t.status === 'pending');
                    if (!existingTask) {
                        nexusGateway.add('tasks', {
                            title: `Stagnation Alert: ${sale.customer} - 5+ Days in Pipeline`,
                            status: 'pending',
                            timestamp: now,
                            targetAgentId: currentUser.id,
                            linkedSaleId: sale.id,
                            autoGenerated: true
                        });
                        createNotification(currentUser.id, 'agent', 'workflow', 'Pipeline Alert', `Deal for ${sale.customer} needs attention.`);
                    }
                }
            });
        };

        const interval = setInterval(checkStagnation, 60000); 
        return () => clearInterval(interval);
    }, [currentUser]);

    const addSale = useCallback(async (saleData: Partial<Sale>) => {
        // Commission Dispute Prevention: Check for recent sales with same phone
        if (saleData.phone) {
            const ONE_MONTH = 30 * 24 * 60 * 60 * 1000; // 30 days
            const recentDuplicate = salesRef.current.find(s => 
                s.phone === saleData.phone && 
                s.status === 'Approved' && 
                (Date.now() - s.timestamp) < ONE_MONTH
            );
            
            if (recentDuplicate) {
                 window.alert(`COMMISSION DISPUTE PREVENTION:\n\nThis lead was already closed by ${recentDuplicate.agent || 'another agent'} within the last 30 days. According to the Rules of Engagement (whoever logs the sale first gets it), you cannot claim this commission.`);
                 return null;
            }
        }

        if (!window.confirm("Confirm Order Submission?")) return null;
        try {
            const payload = {
                 ...saleData,
                 timestamp: saleData.timestamp || Date.now(),
                 team: currentUser?.team || 'Alpha'
            };
            const newSale = await nexusGateway.add('sales', payload) as Sale;
            await sendToGoogleSheet(newSale);
            // Trigger Protocols for new sales (usually pending)
            if (currentUser) {
                const { triggerPostSaleProtocol } = await import('../lib/protocolService');
                await triggerPostSaleProtocol(newSale, currentUser);
                
                await createNotification(
                    'ALL_ADMINS',
                    'admin',
                    'workflow',
                    'New Pending Sale',
                    `Agent ${currentUser.name} submitted a new order for ${newSale.customer || 'a customer'} that requires review.`,
                    { context: 'sale', recordId: newSale.id }
                );
            }
            return newSale;
        } catch (error) {
            console.error("Failed to add sale to database/sync:", error);
            alert("Failed to submit order. Please check your connection.");
            return null;
        }
    }, [currentUser]);
    
    const updateSaleStatus = useCallback(async (id: string, status: Sale['status'], details: Partial<Sale>, expectedUpdatedAt?: number, originalData?: Sale) => {
        if (!window.confirm(`Confirm status update to ${status}?`)) return;
        try {
            await nexusGateway.update('sales', id, { status, ...details }, expectedUpdatedAt, originalData);
            
            const existingSale = salesRef.current.find(s => s.id === id);
            if (existingSale) {
                const updatedSale = { ...existingSale, status, ...details };
                await sendToGoogleSheet(updatedSale);
                
                // Notify Agent
                if (status === 'Approved' || status === 'Declined' || status === 'Cancelled') {
                    await createNotification(
                        updatedSale.agentId, 
                        'agent', 
                        'workflow', 
                        `Deal ${status}`, 
                        `Your deal for ${updatedSale.customer} was ${status === 'Approved' ? 'Approved' : 'Declined'}.${details.declineReason ? ` Reason: ${details.declineReason}` : ''}`,
                        { context: 'sale', recordId: updatedSale.id }
                    );
                }

                // Trigger protocols when status changes (e.g. to Approved or Declined)
                if (currentUser) {
                    const { triggerPostSaleProtocol } = await import('../lib/protocolService');
                    await triggerPostSaleProtocol(updatedSale, currentUser);
                }
            }
        } catch (error) {
            console.error("Sale status update failed", error);
            if (error && (error as any).name === 'ConflictError') {
                throw error; // Let Admin portal handle ConflictError
            }
            alert("Failed to update status. Please log out and back in if this persists.");
        }
    }, [currentUser]);

    const updateSale = useCallback(async (id: string, updates: Partial<Sale>, expectedUpdatedAt?: number, originalData?: Sale) => {
        if (!window.confirm("Save changes to this record?")) return;
        try {
            await nexusGateway.update('sales', id, updates, expectedUpdatedAt, originalData);
        } catch (error) {
            console.error("Sale update failed", error);
            if (error && (error as any).name === 'ConflictError') {
                throw error;
            }
            alert("Failed to save changes. Please try again.");
        }
    }, []);

    const deleteSale = useCallback(async (id: string) => {
        if (!window.confirm("⚠️ PERMANENT DELETE ⚠️\n\nAre you sure you want to purge this record?")) return;
        try {
            await nexusGateway.delete('sales', id);
        } catch (error) {
            console.error("Sale delete failed", error);
            alert("Failed to delete record. Please check your connection.");
        }
    }, []);
    
    const bulkDeleteSales = useCallback(async (ids: string[]) => {
        if (!window.confirm(`⚠️ BULK DELETE ⚠️\n\nAre you sure you want to purge ${ids.length} records?`)) return;
        await nexusGateway.deleteBulk('sales', ids);
    }, []);

    const bulkUpdateSales = useCallback(async (ids: string[], updates: Partial<Sale>) => {
        if (!window.confirm(`Bulk update ${ids.length} records?`)) return;
        await nexusGateway.updateBulk('sales', ids, updates);
    }, []);

    const importSales = useCallback(async (data: Partial<Sale>[]) => {
        if (!window.confirm(`Import ${data.length} records into the ledger?`)) return 0;
        return await nexusGateway.addBulk('sales', data);
    }, []);

    const addNote = useCallback(async (note: Partial<Note>) => {
        const payload = { ...note, timestamp: note.timestamp || Date.now(), createdAt: Date.now(), team: currentUser?.team || 'Alpha' };
        await nexusGateway.add('notes', payload);
        if (note.type === 'callback' && note.priority === 'High' && note.agentId) {
             await createNotification(note.agentId, 'agent', 'workflow', 'Priority Callback Set', `Urgent follow-up for ${note.customerName}.`);
        }
    }, [currentUser]);
    const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
        await nexusGateway.update('notes', id, updates);
    }, []);
    const deleteNote = useCallback(async (id: string) => {
        if (!window.confirm("Delete this note?")) return;
        await nexusGateway.delete('notes', id);
    }, []);

    const addTask = useCallback(async (task: Partial<Task>) => {
        const payload = { ...task, timestamp: task.timestamp || Date.now(), team: currentUser?.team || 'Alpha' };
        await nexusGateway.add('tasks', payload);
    }, [currentUser]);
    const updateTaskStatus = useCallback(async (id: string, status: 'completed') => await nexusGateway.update('tasks', id, { status }), []);

    async function reassignOrphanedLeads(fromAgentId: string, toAgentId: string, _team: string) {
        // Scan for customers that are not closed, and assigned to this agent
        const activeCustomers = customersRef.current.filter(c => c.agentId === fromAgentId && c.status !== 'Client');
        for (const c of activeCustomers) {
            await nexusGateway.update('customers', c.id, { agentId: toAgentId });
        }
        return activeCustomers.length;
    }

    const updateUser = useCallback(async (id: string, data: Partial<User>) => {
        // Confirmation handled in UI (OperativeRoster)
        const userWasActive = usersRef.current.find(u => u.id === id)?.active;
        await nexusGateway.update('users', id, data);
        
        // Orphaned Callback Guard
        if (userWasActive && data.active === false && currentUser) {
            // Re-assign all of their pending/callback leads
            const targetPoolTeam = currentUser.team || 'General';
            const orphanCount = await reassignOrphanedLeads(id, currentUser.id, targetPoolTeam);
            if (orphanCount > 0) {
               window.dispatchEvent(new CustomEvent('SYSTEM_INTEGRATION_LOG', {
                   detail: { action: 'LEAD_REASSIGNMENT', data: `${orphanCount} callbacks ripped from terminated unit ${id} and given to TL ${currentUser.id}` }
               }));
            }
        }
    }, [currentUser]);

    const addUser = useCallback(async (data: Partial<User>) => {
        // Confirmation handled in UI (OperativeRoster)
        await nexusGateway.add('users', { ...data, active: true });
    }, []);
    const updateProductConfig = useCallback(async (config: ProductConfig) => {
        // Confirmation handled in UI (ProductManager)
        await nexusGateway.update('config', 'main', config);
    }, []);

    const updateSystemConfig = useCallback(async (config: any) => {
        // Confirmation handled in UI (SystemConfigPanel)
        await nexusGateway.update('systemConfig', 'CORE_CONFIG', config);
    }, []);

    const sendDirective = useCallback(async (d: Partial<TacticalDirective>) => {
        await nexusGateway.add('directives', { ...d, id: `dir-${Date.now()}`, timestamp: Date.now() });
    }, []);
    const logAttendance = useCallback(async (agentId: string, agentName: string, type: string, reason?: string, duration?: number) => {
        const docData: any = { 
            agentId, 
            agentName, 
            type,
            id: `att-${Date.now()}`, 
            timestamp: Date.now() 
        };
        if (reason !== undefined) docData.reason = reason;
        if (duration !== undefined) docData.duration = duration;
        await nexusGateway.add('attendance', docData);
    }, []);
    const logAudit = useCallback(async (entry: Partial<AuditEntry>) => {
        if (currentUser && currentUser.accessLevel === 10) return; 
        await nexusGateway.add('audit', { ...entry, id: `audit-${Date.now()}`, timestamp: Date.now() });
    }, [currentUser]);

    const runDiagnostic = useCallback(() => setHealth(p => ({ ...p, lastDiagnostic: Date.now(), latency: Math.floor(Math.random() * 40) + 5 })), []);
    const testUplink = useCallback(async () => await testGoogleSheetConnection(), []);
    
    const clearNotification = useCallback(async (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        await nexusGateway.delete('notifications', id);
    }, []);

    const sendMessage = useCallback(async (msg: any) => await nexusGateway.add('messages', msg), []);
    const updateMessage = useCallback(async (id: string, upd: any) => await nexusGateway.update('messages', id, upd), []);
    const deleteMessage = useCallback(async (id: string) => await nexusGateway.update('messages', id, { isDeleted: true, text: 'Message deleted' }), []);
    const markMessageAsSeen = useCallback(async (id: string, uid: string) => {
        const msg = messages.find(m => m.id === id);
        if (msg && !msg.readBy?.includes(uid)) await nexusGateway.update('messages', id, { readBy: [...(msg.readBy || []), uid] });
    }, [messages]);
    const updateChannel = useCallback(async (id: string, d: any) => await nexusGateway.update('channels', id, d), []);
    const createChannel = useCallback(async (name: string, type: any, members: string[] = []) => await nexusGateway.add('channels', { name, type, memberIds: members, timestamp: Date.now() }), []);
    const leaveChannel = useCallback(async (cid: string, uid: string) => {
        const c = channels.find(c => c.id === cid);
        if (c) await nexusGateway.update('channels', cid, { memberIds: c.memberIds.filter((m:string) => m !== uid) });
    }, [channels]);
    const addToChannel = useCallback(async (cid: string, uid: string) => {
        const c = channels.find(c => c.id === cid);
        if (c && !c.memberIds.includes(uid)) await nexusGateway.update('channels', cid, { memberIds: [...c.memberIds, uid] });
    }, [channels]);

    const validateGhostTarget = useCallback(async (id: string) => await nexusGateway.validateGhostTarget(id), []);
    const logScriptUsage = useCallback(async (id: string, outcome: any, amt: number) => await nexusGateway.logScriptUsage(id, outcome, amt), []);
    
    const addScript = useCallback(async (s: any) => await nexusGateway.add('scripts', s), []);
    const updateScript = useCallback(async (id: string, s: any) => await nexusGateway.update('scripts', id, s), []);
    const deleteScript = useCallback(async (id: string) => await nexusGateway.delete('scripts', id), []);

    const addSheet = useCallback(async (type = 'native', url?: string) => {
        const name = type === 'google' ? 'Google Sheet' : type === 'teams' ? 'Teams View' : 'New Sheet';
        await nexusGateway.add('sheets', { name, type, url, data: type === 'native' ? Array(10).fill(0).map(() => Array(10).fill('')) : [] });
    }, []);
    const removeSheet = useCallback(async (id: string) => await nexusGateway.delete('sheets', id), []);
    const updateSheet = useCallback(async (id: string, data: any) => await nexusGateway.update('sheets', id, data), []);
    
    const updateSheetCell = useCallback(async (sheetId: string, row: number, col: number, value: string) => {
        const sheet = customSheets.find(s => s.id === sheetId);
        if (sheet && sheet.data) {
             const newData = sheet.data.map((r: string[]) => [...r]);
             if (newData[row]) {
                 newData[row][col] = value;
                 await nexusGateway.update('sheets', sheetId, { data: newData });
             }
        }
    }, [customSheets]);

    const addCustomer = useCallback(async (customer: Partial<Customer>) => {
        const payload = { ...customer, team: currentUser?.team || 'Alpha', updatedAt: Date.now(), createdAt: customer.createdAt || Date.now() };
        await nexusGateway.add('customers', payload);
    }, [currentUser]);
    const updateCustomer = useCallback(async (id: string, updates: Partial<Customer>, expectedUpdatedAt?: number, originalData?: Customer) => await nexusGateway.update('customers', id, updates, expectedUpdatedAt, originalData), []);
    const deleteCustomer = useCallback(async (id: string) => await nexusGateway.delete('customers', id), []);

    const addDialerList = useCallback(async (data: Partial<any>) => await nexusGateway.add('dialer_lists', data), []);

    const updatePresence = useCallback(async (p: Partial<Presence>) => await nexusGateway.updatePresence(p), []);
    const clearPresence = useCallback(async (uid: string, rid?: string) => await nexusGateway.clearPresence(uid, rid), []);

    const isSuperAdmin = (currentUser?.level || 0) >= 10;
    
    // Core filtering
    const fUsers = useMemo(() => {
        if (!currentUser || isSuperAdmin) return users;
        return users.filter(u => u.id === currentUser.id || u.managerId === currentUser.id || (u.team && currentUser.team && u.team === currentUser.team));
    }, [users, currentUser, isSuperAdmin]);

    const validIds = useMemo(() => new Set(fUsers.map(u => u.id)), [fUsers]);

    const fSales = useMemo(() => isSuperAdmin ? sales : sales.filter(s => validIds.has(s.agentId)), [sales, isSuperAdmin, validIds]);
    const fNotes = useMemo(() => isSuperAdmin ? notes : notes.filter(n => validIds.has(n.agentId || '')), [notes, isSuperAdmin, validIds]);
    const fTasks = useMemo(() => isSuperAdmin ? tasks : tasks.filter(t => validIds.has(t.targetAgentId || '')), [tasks, isSuperAdmin, validIds]);
    const fAuditLogs = useMemo(() => isSuperAdmin ? auditLogs : auditLogs.filter(a => validIds.has(a.agentId || '')), [auditLogs, isSuperAdmin, validIds]);
    const fAttendance = useMemo(() => isSuperAdmin ? attendance : attendance.filter(a => validIds.has(a.agentId || '')), [attendance, isSuperAdmin, validIds]);
    
    const executeDataHealthAction = useCallback(async (reportId: string, actionId: string) => {
        const report = dataHealthReports.find(r => r.id === reportId);
        if (!report) return;
        const action = report.actions.find((a: any) => a.id === actionId);
        if (!action) return;
        
        try {
            if (action.type === 'flag_user') {
                await nexusGateway.update('users', action.targetId, { active: false, status: 'inactive' });
            } else if (action.type === 'merge_contact') {
                const targetCustomer = customers.find(c => c.id === action.targetId);
                const mergeIntoCustomer = customers.find(c => c.id === action.metadata?.mergeIntoId);
                
                if (targetCustomer && mergeIntoCustomer) {
                    await nexusGateway.update('customers', mergeIntoCustomer.id, {
                        ltv: (mergeIntoCustomer.ltv || 0) + (targetCustomer.ltv || 0)
                    });
                    await nexusGateway.delete('customers', targetCustomer.id);
                }
            }

            const updatedApproved = [...(report.approvedActions || []), action.id];
            const newStatus = updatedApproved.length === report.actions.length ? 'approved' : 'partially_approved';
            await nexusGateway.update('dataHealthReports', report.id, { 
                approvedActions: updatedApproved,
                status: newStatus 
            });
        } catch (e) {
            console.error("Action execution failed", e);
        }
    }, [dataHealthReports, customers]);

    const executeFullDataHealthReport = useCallback(async (reportId: string) => {
        const report = dataHealthReports.find(r => r.id === reportId);
        if (!report || report.status === 'approved') return;
        
        // Very basic bulk execution for demo purposes
        for (const action of report.actions) {
            if (!report.approvedActions?.includes(action.id)) {
                if (action.type === 'flag_user') {
                    await nexusGateway.update('users', action.targetId, { active: false, status: 'inactive' });
                } else if (action.type === 'merge_contact') {
                    const targetCustomer = customers.find(c => c.id === action.targetId);
                    const mergeIntoCustomer = customers.find(c => c.id === action.metadata?.mergeIntoId);
                    if (targetCustomer && mergeIntoCustomer) {
                        await nexusGateway.delete('customers', targetCustomer.id);
                    }
                }
            }
        }

        await nexusGateway.update('dataHealthReports', report.id, { 
            approvedActions: report.actions.map((a: any) => a.id),
            status: 'approved',
            executionTime: Date.now()
        });
    }, [dataHealthReports, customers]);

    const undoDataHealthAction = useCallback(async (reportId: string, actionId: string) => {
        const report = dataHealthReports.find(r => r.id === reportId);
        if (!report) return;
        const action = report.actions.find((a: any) => a.id === actionId);
        if (!action) return;
        
        try {
            if (action.type === 'flag_user') {
                await nexusGateway.update('users', action.targetId, { active: true, status: 'active' });
            } 
            // merge_contact cannot be safely undone purely client side without preserving state, keeping simple

            const updatedApproved = report.approvedActions?.filter((id: string) => id !== action.id) || [];
            const newStatus = updatedApproved.length === 0 ? 'undone' : 'partially_approved';
            
            await nexusGateway.update('dataHealthReports', report.id, { 
                approvedActions: updatedApproved,
                status: newStatus 
            });
        } catch (e) {
            console.error("Action undo failed", e);
        }
    }, [dataHealthReports]);

    // Notifications Filtering
    const fNotifications = useMemo(() => {
        if (!currentUser) return [];
        return notifications.filter(n => {
            if (n.recipientId === currentUser.id) return true;
            if (n.roleTarget === 'all') return true;
            if (n.roleTarget === 'admin' && isSuperAdmin) return true;
            if (n.recipientId === 'ALL_ADMINS' && currentUser.level >= 5) return true;
            return false;
        });
    }, [notifications, currentUser, isSuperAdmin]);

    return useMemo(() => ({
        sales: fSales, users: fUsers, customers, accounts, notes: fNotes, tasks: fTasks, leaderboard,
        productConfig, auditLogs: fAuditLogs, attendance: fAttendance, directives, messages, channels,
        notifications: fNotifications, callLogs, scripts, customSheets, health, systemConfig, presence, dataHealthReports, dialerLists,
        
        addSale, updateSaleStatus, updateSale, deleteSale, bulkDeleteSales, bulkUpdateSales, importSales,
        executeDataHealthAction, executeFullDataHealthReport, undoDataHealthAction,
        addCustomer, updateCustomer, deleteCustomer,
        addNote, updateNote, deleteNote, addTask, updateTaskStatus,
        updateUser, addUser, addDialerList, updateProductConfig, updateSystemConfig,
        sendDirective, logAttendance, logAudit, runDiagnostic, testUplink,
        clearNotification, 
        sendMessage, updateMessage, deleteMessage, markMessageAsSeen,
        updateChannel, createChannel, leaveChannel, addToChannel,
        validateGhostTarget, logScriptUsage,
        addScript, updateScript, deleteScript,
        addSheet, removeSheet, updateSheet, updateSheetCell,
        updatePresence, clearPresence
    }), [
        fSales, fUsers, customers, accounts, fNotes, fTasks, leaderboard,
        productConfig, fAuditLogs, fAttendance, directives, messages, channels,
        fNotifications, callLogs, scripts, customSheets, health, systemConfig, presence, dataHealthReports, dialerLists,
        addSale, updateSaleStatus, updateSale, deleteSale, bulkDeleteSales, bulkUpdateSales, importSales,
        executeDataHealthAction, executeFullDataHealthReport, undoDataHealthAction,
        addCustomer, updateCustomer, deleteCustomer,
        addNote, updateNote, deleteNote, addTask, updateTaskStatus,
        updateUser, addUser, addDialerList, updateProductConfig, updateSystemConfig,
        sendDirective, logAttendance, logAudit, runDiagnostic, testUplink,
        clearNotification, sendMessage, updateMessage, deleteMessage, markMessageAsSeen,
        updateChannel, createChannel, leaveChannel, addToChannel,
        validateGhostTarget, logScriptUsage,
        addScript, updateScript, deleteScript,
        addSheet, removeSheet, updateSheet, updateSheetCell,
        updatePresence, clearPresence
    ]);
};
