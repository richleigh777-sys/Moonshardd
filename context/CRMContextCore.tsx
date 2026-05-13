import { createContext } from 'react';
import { 
    Sale, User, Note, Task, SystemHealth, ProductConfig, 
    AuditEntry, AttendanceRecord, TacticalDirective, 
    AppNotification, SystemConfig, ChatMessage, ScriptItem, 
    ChatChannel, Customer, Account, Presence 
} from '../types';

export type CRMContextType = {
    sales: Sale[];
    users: User[];
    customers: Customer[];
    accounts: Account[];
    notes: Note[];
    tasks: Task[];
    productConfig: ProductConfig;
    systemConfig: SystemConfig;
    auditLogs: AuditEntry[];
    attendance: AttendanceRecord[];
    directives: TacticalDirective[];
    messages: ChatMessage[];
    channels: ChatChannel[];
    notifications: AppNotification[];
    callLogs: any[];
    scripts: ScriptItem[];
    customSheets: any[];
    presence: Presence[];
    health: SystemHealth;
    addSale: (saleData: Partial<Sale>) => Promise<Sale>;
    updateSaleStatus: (id: string, status: Sale['status'], details: Partial<Sale>, expectedUpdatedAt?: number, originalData?: Sale) => Promise<void>;
    updateSale: (id: string, updates: Partial<Sale>, expectedUpdatedAt?: number, originalData?: Sale) => Promise<void>;
    deleteSale: (id: string) => Promise<void>;
    bulkDeleteSales: (ids: string[]) => Promise<void>;
    bulkUpdateSales: (ids: string[], updates: Partial<Sale>) => Promise<void>;
    importSales: (data: Partial<Sale>[]) => Promise<number>;
    addCustomer: (customer: Partial<Customer>) => Promise<void>;
    updateCustomer: (id: string, updates: Partial<Customer>, expectedUpdatedAt?: number, originalData?: Customer) => Promise<void>;
    deleteCustomer: (id: string) => Promise<void>;
    addNote: (note: Partial<Note>) => Promise<void>;
    updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
    deleteNote: (id: string) => Promise<void>;
    addTask: (task: Partial<Task>) => Promise<void>;
    updateTaskStatus: (id: string, status: 'completed') => Promise<void>;
    updateUser: (id: string, data: Partial<User>) => Promise<void>;
    addUser: (data: Partial<User>) => Promise<void>;
    updateProductConfig: (config: ProductConfig) => Promise<void>;
    updateSystemConfig: (config: any) => Promise<void>;
    sendDirective: (d: Partial<TacticalDirective>) => Promise<void>;
    logAttendance: (type: string, reason?: string) => Promise<void>;
    logAudit: (entry: Partial<AuditEntry>) => Promise<void>;
    runDiagnostic: () => void;
    testUplink: () => Promise<any>;
    clearNotification: (id: string) => Promise<void>;
    sendMessage: (msg: any) => Promise<void>;
    updateMessage: (id: string, upd: any) => Promise<void>;
    deleteMessage: (id: string) => Promise<void>;
    markMessageAsSeen: (id: string, uid: string) => Promise<void>;
    updateChannel: (id: string, d: any) => Promise<void>;
    createChannel: (name: string, type: any, members?: string[]) => Promise<void>;
    leaveChannel: (cid: string, uid: string) => Promise<void>;
    addToChannel: (cid: string, uid: string) => Promise<void>;
    validateGhostTarget: (id: string) => Promise<any>;
    logScriptUsage: (id: string, outcome: any, amt: number) => Promise<void>;
    addScript: (s: any) => Promise<void>;
    updateScript: (id: string, s: any) => Promise<void>;
    deleteScript: (id: string) => Promise<void>;
    addSheet: (type?: 'native' | 'google' | 'teams', url?: string) => Promise<void>;
    removeSheet: (id: string) => Promise<void>;
    updateSheet: (id: string, data: any) => Promise<void>;
    updateSheetCell: (sheetId: string, row: number, col: number, value: string) => Promise<void>;
    updatePresence: (p: Partial<Presence>) => Promise<void>;
    clearPresence: (uid: string, rid?: string) => Promise<void>;
    currentUser: User | null;
    drafts: Record<string, any>;
    updateDraft: (key: string, data: any) => void;
    clearDraft: (key: string) => void;
};

export const CRMContext = createContext<CRMContextType | undefined>(undefined);
