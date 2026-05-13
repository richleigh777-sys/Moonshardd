
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

    useEffect(() => {
        salesRef.current = sales;
    }, [sales]);

    useEffect(() => {
        tasksRef.current = tasks;
    }, [tasks]);

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
        if (!window.confirm("Confirm Order Submission?")) return null;
        const newSale = await nexusGateway.add('sales', saleData) as Sale;
        
        try {
            await sendToGoogleSheet(newSale);
            // Trigger Protocols for new sales (usually pending)
            if (currentUser) {
                const { triggerPostSaleProtocol } = await import('../lib/protocolService');
                await triggerPostSaleProtocol(newSale, currentUser);
            }
        } catch (error) {
            console.error("Failed to sync sale to Google Sheet/Protocol:", error);
        }
        return newSale;
    }, [currentUser]);
    
    const updateSaleStatus = useCallback(async (id: string, status: Sale['status'], details: Partial<Sale>, expectedUpdatedAt?: number, originalData?: Sale) => {
        if (!window.confirm(`Confirm status update to ${status}?`)) return;
        await nexusGateway.update('sales', id, { status, ...details }, expectedUpdatedAt, originalData);
        
        const existingSale = salesRef.current.find(s => s.id === id);
        if (existingSale) {
            const updatedSale = { ...existingSale, status, ...details };
            await sendToGoogleSheet(updatedSale);
            
            // Trigger protocols when status changes (e.g. to Approved or Declined)
            if (currentUser) {
                const { triggerPostSaleProtocol } = await import('../lib/protocolService');
                await triggerPostSaleProtocol(updatedSale, currentUser);
            }
        }
    }, [currentUser]);

    const updateSale = useCallback(async (id: string, updates: Partial<Sale>, expectedUpdatedAt?: number, originalData?: Sale) => {
        if (!window.confirm("Save changes to this record?")) return;
        await nexusGateway.update('sales', id, updates, expectedUpdatedAt, originalData);
    }, []);

    const deleteSale = useCallback(async (id: string) => {
        if (!window.confirm("⚠️ PERMANENT DELETE ⚠️\n\nAre you sure you want to purge this record?")) return;
        await nexusGateway.delete('sales', id);
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
        await nexusGateway.add('notes', { ...note, createdAt: Date.now() });
        if (note.type === 'callback' && note.priority === 'High' && note.agentId) {
             await createNotification(note.agentId, 'agent', 'workflow', 'Priority Callback Set', `Urgent follow-up for ${note.customerName}.`);
        }
    }, []);
    const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
        await nexusGateway.update('notes', id, updates);
    }, []);
    const deleteNote = useCallback(async (id: string) => {
        if (!window.confirm("Delete this note?")) return;
        await nexusGateway.delete('notes', id);
    }, []);

    const addTask = useCallback(async (task: Partial<Task>) => await nexusGateway.add('tasks', task), []);
    const updateTaskStatus = useCallback(async (id: string, status: 'completed') => await nexusGateway.update('tasks', id, { status }), []);

    const updateUser = useCallback(async (id: string, data: Partial<User>) => {
        // Confirmation handled in UI (OperativeRoster)
        await nexusGateway.update('users', id, data);
    }, []);
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
        if (!window.confirm("Broadcast this directive to all active terminals?")) return;
        await nexusGateway.add('directives', { ...d, id: `dir-${Date.now()}`, timestamp: Date.now() });
    }, []);
    const logAttendance = useCallback(async (agentId: string, agentName: string, type: string, reason?: string) => {
        const docData: any = { 
            agentId, 
            agentName, 
            type,
            id: `att-${Date.now()}`, 
            timestamp: Date.now() 
        };
        if (reason !== undefined) {
            docData.reason = reason;
        }
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

    const addCustomer = useCallback(async (customer: Partial<Customer>) => await nexusGateway.add('customers', customer), []);
    const updateCustomer = useCallback(async (id: string, updates: Partial<Customer>, expectedUpdatedAt?: number, originalData?: Customer) => await nexusGateway.update('customers', id, updates, expectedUpdatedAt, originalData), []);
    const deleteCustomer = useCallback(async (id: string) => await nexusGateway.delete('customers', id), []);

    const updatePresence = useCallback(async (p: Partial<Presence>) => await nexusGateway.updatePresence(p), []);
    const clearPresence = useCallback(async (uid: string, rid?: string) => await nexusGateway.clearPresence(uid, rid), []);

    return useMemo(() => ({
        sales, users, customers, accounts, notes, tasks, leaderboard,
        productConfig, auditLogs, attendance, directives, messages, channels,
        notifications, callLogs, scripts, customSheets, health, systemConfig, presence,
        
        addSale, updateSaleStatus, updateSale, deleteSale, bulkDeleteSales, bulkUpdateSales, importSales,
        addCustomer, updateCustomer, deleteCustomer,
        addNote, updateNote, deleteNote, addTask, updateTaskStatus,
        updateUser, addUser, updateProductConfig, updateSystemConfig,
        sendDirective, logAttendance, logAudit, runDiagnostic, testUplink,
        clearNotification, 
        sendMessage, updateMessage, deleteMessage, markMessageAsSeen,
        updateChannel, createChannel, leaveChannel, addToChannel,
        validateGhostTarget, logScriptUsage,
        addScript, updateScript, deleteScript,
        addSheet, removeSheet, updateSheet, updateSheetCell,
        updatePresence, clearPresence
    }), [
        sales, users, customers, accounts, notes, tasks, leaderboard,
        productConfig, auditLogs, attendance, directives, messages, channels,
        notifications, callLogs, scripts, customSheets, health, systemConfig, presence,
        addSale, updateSaleStatus, updateSale, deleteSale, bulkDeleteSales, bulkUpdateSales, importSales,
        addCustomer, updateCustomer, deleteCustomer,
        addNote, updateNote, deleteNote, addTask, updateTaskStatus,
        updateUser, addUser, updateProductConfig, updateSystemConfig,
        sendDirective, logAttendance, logAudit, runDiagnostic, testUplink,
        clearNotification, sendMessage, updateMessage, deleteMessage, markMessageAsSeen,
        updateChannel, createChannel, leaveChannel, addToChannel,
        validateGhostTarget, logScriptUsage,
        addScript, updateScript, deleteScript,
        addSheet, removeSheet, updateSheet, updateSheetCell,
        updatePresence, clearPresence
    ]);
};
