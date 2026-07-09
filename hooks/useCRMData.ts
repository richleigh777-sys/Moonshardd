import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Sale, User, Note, Task, SystemHealth, ProductConfig, AuditEntry, AttendanceRecord, TacticalDirective, Customer, ChatMessage, ChatChannel, ScriptItem, AppNotification, Account, SystemConfig, Presence } from '../types';
import { nexusGateway, testGoogleSheetConnection, validateConfig } from '../nexus/adapters/DataGateway';
import { createNotification } from '../lib/notificationService';
import { INITIAL_PRODUCT_CONFIG, VALID_USERS } from '../constants';
import { generateLeaderboard } from '../views/utils/crmLogic';

// Sub-services and hooks
import { useCrmSales } from './crm/useCrmSales';
import { useCrmChat } from './crm/useCrmChat';
import { useCrmSheets } from './crm/useCrmSheets';
import { useCrmDataHealth } from './crm/useCrmDataHealth';
import { useCrmScripts } from './crm/useCrmScripts';
import { useCrmNotesTasks } from './crm/useCrmNotesTasks';

export const useCRMData = (currentUser: User | null) => {
    // ----------------------------------------------
    // 1. STATE INITIALIZATION
    // ----------------------------------------------
    const [sales, setSales] = useState<Sale[]>([]);
    const [users, setUsers] = useState<User[]>([]); 
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
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
        rbacMatrix: {
            admin: { viewLeads: true, editLeads: true, deleteLeads: true, exportLeads: true, processSales: true, viewReports: true },
            agent: { viewLeads: true, editLeads: true, deleteLeads: false, exportLeads: false, processSales: true, viewReports: false }
        },
        customFieldsConfig: [
            { id: 'supp_primaryFocus', label: 'Primary Health Focus', type: 'select', options: ['Weight Loss', 'Muscle Gain', 'Joint Health', 'General Wellness', 'Heart Health', 'Brain Health'] },
            { id: 'supp_currentMeds', label: 'Taking Other Medications', type: 'boolean' },
            { id: 'supp_allergies', label: 'Allergies', type: 'text' },
            { id: 'supp_preferredForm', label: 'Preferred Supplement Form', type: 'select', options: ['Capsules', 'Gummies', 'Powders', 'Liquid'] },
            { id: 'supp_activityLevel', label: 'Activity Level', type: 'select', options: ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active'] },
            { id: 'supp_reorderCycleDays', label: 'Reorder Cycle (Days)', type: 'number' },
        ],
        baseCommission: 15, breakDurationMinutes: 60, ecoMode: false, telephonyEnabled: false,
        customDialerEnabled: false, customDialerType: 'PROTOCOL_URI', customDialerUrlTemplate: 'https://dialer.yourcompany.com/?phone={phone_clean}'
    });
    
    const [health, setHealth] = useState<SystemHealth>(() => ({
        cloudSync: 'STABLE', encryption: 'AES-256', storageUsage: 0,
        sessionIntegrity: 'SECURE', latency: 42, lastDiagnostic: Date.now()
    }));
    const [serverChangeVersion, setServerChangeVersion] = useState(0);

    // ----------------------------------------------
    // 2. REFERENCES FOR REALTIME EVALUATION
    // ----------------------------------------------
    const salesRef = useRef(sales);
    const tasksRef = useRef(tasks);
    const usersRef = useRef(users);
    const customersRef = useRef(customers);
    const systemConfigRef = useRef(systemConfig);

    useEffect(() => { salesRef.current = sales; }, [sales]);
    useEffect(() => { tasksRef.current = tasks; }, [tasks]);
    useEffect(() => { usersRef.current = users; }, [users]);
    useEffect(() => { customersRef.current = customers; }, [customers]);
    useEffect(() => { systemConfigRef.current = systemConfig; }, [systemConfig]);

    // ----------------------------------------------
    // 3. LEADERBOARD COMPUTATION
    // ----------------------------------------------
    const leaderboard = useMemo(() => {
        if (!currentUser || currentUser.level < 10) return [];
        return generateLeaderboard(sales, users, attendance, systemConfig);
    }, [sales, users, attendance, systemConfig, currentUser]);

    // ----------------------------------------------
    // 4. SYNCHRONIZATION EFFECTS
    // ----------------------------------------------
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
    }, []);

    useEffect(() => {
        if (!currentUser) {
            const reset = () => {
                setSales([]); setNotes([]); setTasks([]); setAuditLogs([]);
                setCustomers([]); setAccounts([]); setMessages([]); setChannels([]);
                setNotifications([]); setCallLogs([]); setScripts([]); setCustomSheets([]);
                setDataHealthReports([]); setDialerLists([]);
            };
            setTimeout(reset, 0);
        }
    }, [currentUser]);

    useEffect(() => {
        const handleServerChange = () => setServerChangeVersion(v => v + 1);
        window.addEventListener('nexus_server_changed', handleServerChange);
        return () => window.removeEventListener('nexus_server_changed', handleServerChange);
    }, []);

    useEffect(() => {
        if (!currentUser) return;

                const level = currentUser.level || 0;
        const isSuperAdmin = level >= 10;
        const isManager = level >= 5 && level < 10;
        const isAgent = level < 5;

        const filterData = <T>(data: T[], agentIdField: keyof T, teamField?: keyof T): T[] => {
            if (isSuperAdmin) return data;
            if (isManager && teamField) {
                return data.filter(item => item[teamField] === currentUser.team || item[agentIdField] === currentUser.id);
            }
            return data.filter(item => item[agentIdField] === currentUser.id);
        };

        const subs = [
            nexusGateway.subscribe('sales', currentUser, (data: Sale[]) => setSales(filterData(data, 'agentId', 'team'))),
            nexusGateway.subscribe('customers', currentUser, (data: Customer[]) => {
                let filtered = data;
                if (!isSuperAdmin) {
                    filtered = filtered.filter(c => !c.isBackgroundViciLead);
                    if (isManager) {
                        filtered = filtered.filter(c => c.team === currentUser.team || c.assignedTo === currentUser.id);
                    } else {
                        filtered = filtered.filter(c => c.assignedTo === currentUser.id);
                    }
                }
                setCustomers(filtered);
            }),
            nexusGateway.subscribe('users', currentUser, (data: User[]) => {
                let filtered = data.length ? data : VALID_USERS;
                if (isAgent) {
                    filtered = filtered.filter(u => u.id === currentUser.id);
                } else if (isManager) {
                    filtered = filtered.filter(u => u.team === currentUser.team);
                }
                setUsers(filtered);
            }),
            nexusGateway.subscribe('accounts', currentUser, (data: Account[]) => setAccounts(data)),
            nexusGateway.subscribe('notes', currentUser, (data: Note[]) => setNotes(filterData(data, 'agentId'))),
            nexusGateway.subscribe('tasks', currentUser, (data: Task[]) => setTasks(filterData(data, 'targetAgentId'))),
            nexusGateway.subscribe('audit', currentUser, (data: AuditEntry[]) => setAuditLogs(filterData(data, 'agentId'))),
            nexusGateway.subscribe('attendance', currentUser, (data: AttendanceRecord[]) => setAttendance(filterData(data, 'agentId'))),
            nexusGateway.subscribe('directives', currentUser, (data: TacticalDirective[]) => setDirectives(data)),
            nexusGateway.subscribe('messages', currentUser, (data: ChatMessage[]) => setMessages(data)),
            nexusGateway.subscribe('channels', currentUser, (data: ChatChannel[]) => setChannels(data)),
            nexusGateway.subscribe('notifications', currentUser, (data: AppNotification[]) => setNotifications(data.filter(n => n.recipientId === currentUser.id || n.recipientId === 'all' || (n.roleTarget === 'agent' && isAgent) || (n.roleTarget === 'admin' && !isAgent)))),
            nexusGateway.subscribe('callLogs', currentUser, (data: any[]) => setCallLogs(filterData(data, 'agentId'))),
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
        
        let unsub = () => {};
        import('../lib/realtimeClient').then(({ realtimeClient }) => {
            unsub = realtimeClient.subscribe((event: any) => {
                if (event?.type === 'COLLECTION_MUTATED' && event.collectionName) {
                    console.log(`[Global Data Hook] Optimistic Re-fetch triggered for ${event.collectionName}`);
                    nexusGateway.enqueueBatchFetch(event.collectionName);
                }
            });
        });

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
        return () => {
            clearInterval(interval);
            unsub();
        };
    }, [currentUser]);

    // ----------------------------------------------
    // 5. INNER SHARED CALLBACKS
    // ----------------------------------------------
    const logAudit = useCallback(async (entry: Partial<AuditEntry>) => {
        const isLevel10 = currentUser && (currentUser.accessLevel === 10 || (currentUser.level || 0) >= 10);
        const finalEntry = {
            ...entry,
            id: `audit-${Date.now()}`,
            timestamp: Date.now(),
            ...(isLevel10 ? { clearance: 'LEVEL_10_HIGH_CLEARANCE', classification: 'SECURE_ROOT_AUDIT' } : {})
        };
        await nexusGateway.add('audit', finalEntry);
    }, [currentUser]);

    
    const clearAuditLogs = useCallback(async () => {
        if (!currentUser || (currentUser.level || 0) < 10) return;
        const allLogs = await nexusGateway.get('audit');
        for (const log of allLogs) {
            await nexusGateway.delete('audit', log.id);
        }
    }, [currentUser]);

    const isSuperAdmin = (currentUser?.level || 0) >= 10;

    // Users and records re-allocation
    async function reassignOrphanedLeads(fromAgentId: string, toAgentId: string, _team: string) {
        const activeCustomers = customersRef.current.filter(c => c.agentId === fromAgentId && c.status !== 'Client');
        for (const c of activeCustomers) {
            await nexusGateway.update('customers', c.id, { agentId: toAgentId });
        }
        return activeCustomers.length;
    }

    const updateUser = useCallback(async (id: string, data: Partial<User>) => {
        const userWasActive = usersRef.current.find(u => u.id === id)?.active;
        await nexusGateway.update('users', id, data);
        
        if (userWasActive && data.active === false && currentUser) {
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
        if (data.passwordHash) {
            try {
                const response = await fetch('/api/auth/provision', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: data.id,
                        password: data.passwordHash,
                        role: data.role,
                        clearance_level: data.level,
                        team: data.team,
                        name: data.name
                    })
                });
                if (!response.ok) {
                    const errText = await response.text(); let err = { error: errText }; try { err = JSON.parse(errText); } catch(e){ /* ignore */ }
                    throw new Error(err.error || 'Provisioning failed');
                }
            } catch (err) {
                console.error('Auth Provisioning failed:', err);
                throw err;
            }
        }
        const safeData = { ...data, active: true };
        delete safeData.passwordHash;
        await nexusGateway.add('users', safeData);
    }, []);

    const updateProductConfig = useCallback(async (config: ProductConfig) => {
        await nexusGateway.update('config', 'main', config);
    }, []);

    const updateSystemConfig = useCallback(async (config: any) => {
        await nexusGateway.update('systemConfig', 'CORE_CONFIG', config);
    }, []);

    const sendDirective = useCallback(async (d: Partial<TacticalDirective>) => {
        await nexusGateway.add('directives', { ...d, id: `dir-${Date.now()}`, timestamp: Date.now() });
        if (d.urgency === 'Flash') {
            import('../lib/realtimeClient').then(({ realtimeClient }) => {
                realtimeClient.send('FLASH_DIRECTIVE', d);
            });
        }
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

    const runDiagnostic = useCallback(() => setHealth(p => ({ ...p, lastDiagnostic: Date.now(), latency: Math.floor(Math.random() * 40) + 5 })), []);
    const testUplink = useCallback(async () => await testGoogleSheetConnection(), []);
    
    const clearNotification = useCallback(async (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        await nexusGateway.delete('notifications', id);
    }, []);

    const bulkAddCustomers = useCallback(async (customers: Partial<Customer>[]) => {
        const payload = customers.map(customer => {
            let normalizedPhone = customer.phone;
            if (normalizedPhone) {
                normalizedPhone = normalizedPhone.replace(/[\s\-()+]/g, '');
            }
            return { ...customer, phone: normalizedPhone, team: currentUser?.team || 'Alpha', updatedAt: Date.now(), createdAt: customer.createdAt || Date.now() };
        });
        await nexusGateway.addBulk('customers', payload);
    }, [currentUser]);

    const addCustomer = useCallback(async (customer: Partial<Customer>) => {
        let normalizedPhone = customer.phone;
        if (normalizedPhone) {
            normalizedPhone = normalizedPhone.replace(/[\s\-()+]/g, '');
        }
        const payload = { ...customer, phone: normalizedPhone, team: currentUser?.team || 'Alpha', updatedAt: Date.now(), createdAt: customer.createdAt || Date.now() };
        await nexusGateway.add('customers', payload);
    }, [currentUser]);

    const updateCustomer = useCallback(async (id: string, updates: Partial<Customer>, expectedUpdatedAt?: number, originalData?: Customer) => {
        let normalizedPhone = updates.phone;
        if (normalizedPhone) {
            normalizedPhone = normalizedPhone.replace(/[\s\-()+]/g, '');
        }
        const finalUpdates = updates.phone ? { ...updates, phone: normalizedPhone } : updates;

        const prevCustomer = originalData || customersRef.current.find(c => c.id === id);

        await nexusGateway.update('customers', id, finalUpdates, expectedUpdatedAt, originalData);

        if (currentUser && prevCustomer) {
            const changedFields = Object.keys(finalUpdates).filter(k => 
                (finalUpdates as any)[k] !== (prevCustomer as any)[k] && k !== 'updatedAt'
            );
            if (changedFields.length > 0) {
                const details = changedFields.map(k => `${k}: ${(prevCustomer as any)[k]} -> ${(finalUpdates as any)[k]}`).join(', ').substring(0, 500); // Truncate if too long
                void logAudit({
                    action: 'CUSTOMER_PROFILE_UPDATED',
                    details: `Updated ${prevCustomer.firstName} ${prevCustomer.lastName}: ${details}`,
                    module: 'SYSTEM'
                });
            }
        }
    }, [currentUser, logAudit]);

    const deleteCustomer = useCallback(async (id: string) => await nexusGateway.delete('customers', id), []);

    const addDialerList = useCallback(async (data: Partial<any>) => await nexusGateway.add('dialer_lists', data), []);

    const updatePresence = useCallback(async (p: Partial<Presence>) => await nexusGateway.updatePresence(p), []);
    const clearPresence = useCallback(async (uid: string, rid?: string) => await nexusGateway.clearPresence(uid, rid), []);

    // ----------------------------------------------
    // 6. ADAPTERS CALLS (DELEGATED CAPABILITIES)
    // ----------------------------------------------
    const salesOps = useCrmSales(currentUser, salesRef, customersRef, systemConfigRef, logAudit);
    const chatOps = useCrmChat(messages, channels);
    const sheetOps = useCrmSheets(customSheets);
    const dataHealthOps = useCrmDataHealth(dataHealthReports, customers);
    const scriptOps = useCrmScripts();
    const notesTasksOps = useCrmNotesTasks(currentUser);

    // ----------------------------------------------
    // 7. ROLES FILTERING & PIPELINE VIEWS OUTCOMES
    // ----------------------------------------------
    const fUsers = useMemo(() => {
        if (!currentUser || isSuperAdmin) return users;
        return users.filter(u => u.id === currentUser.id || u.managerId === currentUser.id || (u.team && currentUser.team && u.team === currentUser.team));
    }, [users, currentUser, isSuperAdmin]);

    const validIds = useMemo(() => {
        const ids = new Set(fUsers.map(u => u.id));
        if (currentUser?.id) {
            ids.add(currentUser.id);
            if (currentUser.email) ids.add(currentUser.email);
        }
        return ids;
    }, [fUsers, currentUser]);

    const fSales = useMemo(() => isSuperAdmin ? sales : sales.filter(s => s.agentId === currentUser?.id || validIds.has(s.agentId)), [sales, isSuperAdmin, validIds, currentUser?.id]);
    const fNotes = useMemo(() => isSuperAdmin ? notes : notes.filter(n => n.agentId === currentUser?.id || validIds.has(n.agentId || '')), [notes, isSuperAdmin, validIds, currentUser?.id]);
    const fTasks = useMemo(() => isSuperAdmin ? tasks : tasks.filter(t => t.targetAgentId === currentUser?.id || validIds.has(t.targetAgentId || '')), [tasks, isSuperAdmin, validIds, currentUser?.id]);
    const fAuditLogs = useMemo(() => isSuperAdmin ? auditLogs : auditLogs.filter(a => a.agentId === currentUser?.id || validIds.has(a.agentId || '')), [auditLogs, isSuperAdmin, validIds, currentUser?.id]);
    const fAttendance = useMemo(() => isSuperAdmin ? attendance : attendance.filter(a => a.agentId === currentUser?.id || validIds.has(a.agentId || '')), [attendance, isSuperAdmin, validIds, currentUser?.id]);
    
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

    // ----------------------------------------------
    // 8. UNIFIED SYSTEM RETRIEVAL OVERVIEW
    // ----------------------------------------------
    return useMemo(() => ({
        sales: fSales, users: fUsers, customers, accounts, notes: fNotes, tasks: fTasks, leaderboard,
        productConfig, auditLogs: fAuditLogs, attendance: fAttendance, directives, messages, channels,
        notifications: fNotifications, callLogs, scripts, customSheets, health, systemConfig, presence, dataHealthReports, dialerLists,
        
        ...salesOps,
        ...chatOps,
        ...sheetOps,
        ...dataHealthOps,
        ...scriptOps,
        ...notesTasksOps,
        bulkAddCustomers,

        addCustomer, updateCustomer, deleteCustomer,
        updateUser, addUser, addDialerList, updateProductConfig, updateSystemConfig,
        sendDirective, logAttendance, logAudit,
        clearAuditLogs, runDiagnostic, testUplink,
        clearNotification,
        updatePresence, clearPresence
    }), [
        fSales, fUsers, customers, accounts, fNotes, fTasks, leaderboard,
        productConfig, fAuditLogs, fAttendance, directives, messages, channels,
        fNotifications, callLogs, scripts, customSheets, health, systemConfig, presence, dataHealthReports, dialerLists,
        salesOps, chatOps, sheetOps, dataHealthOps, scriptOps, notesTasksOps,
        bulkAddCustomers,
        addCustomer, updateCustomer, deleteCustomer,
        updateUser, addUser, addDialerList, updateProductConfig, updateSystemConfig,
        sendDirective, logAttendance, logAudit, runDiagnostic, testUplink,
        clearAuditLogs,
        clearNotification,
        updatePresence, clearPresence
    ]);
};
