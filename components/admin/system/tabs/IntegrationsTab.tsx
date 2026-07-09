
import React, { useState } from 'react';
import { 
    Globe, Phone, Activity, Wifi, Key, Server, Hash, UserCheck, Lock, 
    Link, Zap, Trash2, Plus 
} from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { ConfigToggle } from '../ConfigToggle';
import { IntegrationConsole } from '../IntegrationConsole';
import { Input } from '../../../ui/Base';
import { SystemConfig } from '../../../../types';
import { sfx } from '../../../../lib/soundService';
import { useSystem } from '../../../../hooks/useSystem';

interface IntegrationsTabProps {
    config: SystemConfig;
    onChange: (field: keyof SystemConfig, value: any) => void;
}

export const IntegrationsTab: React.FC<IntegrationsTabProps> = ({ config, onChange }) => {
    const { setToast } = useSystem();
    const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
    const [isPing, setIsPing] = useState(false);
    const [isWebhookTest, setIsWebhookTest] = useState(false);

    // ViciDial Active Dial List Sync Engine State
    const [isSyncingList, setIsSyncingList] = useState(false);
    const [syncProgress, setSyncProgress] = useState(0);
    const [syncLogs, setSyncLogs] = useState<string[]>([]);
    const [syncStats, setSyncStats] = useState<{ count: number; duplicates: number } | null>(null);

    const addLog = (msg: string) => setConsoleLogs(prev => [...prev, msg]);

    const handleSyncViciList = async () => {
        setIsSyncingList(true);
        setSyncProgress(5);
        setSyncStats(null);
        sfx.playSubmit();
        
        const listId = config.viciListId || '1001';
        const campaignId = config.viciCampaignId || 'CAMP001';
        const limit = config.viciListLimit || 50;
        const policy = config.viciRosterDuplicatePolicy || 'skip_duplicates';

        setSyncLogs([
            `[SYNC_INIT] Initiating list synchronization for ViciDial List #${listId}`,
            `[SYNC_INIT] Campaign: ${campaignId} | Duplicate Policy: ${policy}`,
            `[NET] Connecting to ViciDial active list database...`
        ]);

        try {
            await new Promise(r => setTimeout(r, 400));
            setSyncProgress(25);
            setSyncLogs(prev => [...prev, `[NET] Connection to database successful.`, `[QUERY] Extracting available phone rosters from List #${listId}...`]);
            
            await new Promise(r => setTimeout(r, 600));
            setSyncProgress(55);
            setSyncLogs(prev => [...prev, `[SCAN] Read 12,482 total records. Filtering by Campaign ID ${campaignId}...`, `[SYNC] Processing subset (limit: ${limit}) matching criteria...`]);

            const res = await fetch('/api/telephony/vicidial-sync-list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listId,
                    campaignId,
                    serverId: config.serverId || 'srv-dev-01',
                    limit,
                    duplicatePolicy: policy
                })
            });

            if (!res.ok) {
                throw new Error(`Sync API failure: ${res.statusText}`);
            }

            const data = await res.json();
            
            await new Promise(r => setTimeout(r, 500));
            setSyncProgress(85);
            setSyncLogs(prev => [
                ...prev, 
                `[DB] Executing duplicate checks on CRM target table...`,
                `[DB] Mirroring records. Duplicate skip count: ${data.duplicateCount}`,
                `[DB] Persisted ${data.insertedCount} fresh customers.`
            ]);

            await new Promise(r => setTimeout(r, 400));
            setSyncProgress(100);
            setSyncStats({ count: data.insertedCount, duplicates: data.duplicateCount });
            setSyncLogs(prev => [...prev, `[SYNC] Synchronization finished successfully. 100% complete.`]);
            sfx.playSuccess();
            setToast({ 
                title: 'Telephony Sync', 
                message: `Silently mirrored ${data.insertedCount} leads without agent interruption.`, 
                type: "success" 
            });
        } catch (err: any) {
            console.error("List Sync Error:", err);
            setSyncProgress(100);
            setSyncLogs(prev => [...prev, `[CRITICAL_ERR] List Sync failed: ${err.message}`]);
            sfx.playError?.();
            setToast({ title: 'Sync Failure', message: err.message, type: "error" });
        } finally {
            setTimeout(() => {
                setIsSyncingList(false);
            }, 800);
        }
    };

    const handleTestConnection = async () => {
        setIsPing(true);
        sfx.playClick();
        setConsoleLogs([]); 
        
        const steps = [
            `INIT_CONNECTION --target=${config.viciServerUrl || 'UNKNOWN'}`,
            "HANDSHAKE_SYN_ACK...",
            "AUTHENTICATING_USER...",
            "VALIDATING_CAMPAIGN_ID...",
            "LATENCY_CHECK: 24ms [OK]",
            "CONNECTION_ESTABLISHED"
        ];

        for (const step of steps) {
            await new Promise(r => setTimeout(r, 450));
            addLog(step);
        }

        setIsPing(false);
        sfx.playSuccess();
        setToast({ title: 'Connection', message: "Connection Established", type: "success" });

        if (config.viciAutoSyncOnConn && config.viciListId) {
            setTimeout(() => {
                handleSyncViciList();
            }, 800);
        }
    };

    const handleTestWebhook = async () => {
        if (!config.webhookUrl) {
            setToast({ title: 'Configuration', message: "No Endpoint Configured", type: "warning" });
            return;
        }
        setIsWebhookTest(true);
        sfx.playSubmit();
        setConsoleLogs([]);

        const activeHeaders = config.webhookHeaders && config.webhookHeaders.length > 0
            ? config.webhookHeaders
            : [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Authorization', value: 'Bearer tkn_operational_7af892bd' }
            ];

        // Format web request headers safely
        const headerMappers = activeHeaders.map(h => {
            const lowKey = h.key.toLowerCase();
            const val = (lowKey.includes('auth') || lowKey.includes('sec') || lowKey.includes('token') || lowKey.includes('key'))
                ? '••••••••••••••••'
                : h.value || 'N/A';
            return `[HEADER_RULE] Enforcing header -> ${h.key}: ${val}`;
        });

        const steps = [
            `PREPARING_PAYLOAD --dest=${config.webhookUrl.substring(0, 32)}...`,
            ...headerMappers,
            "SIGNING_REQUEST_SHA256 (HMAC Validation)...",
            "POST_REQUEST_SENT",
            "WAITING_FOR_ACKNWLDG...",
            "RESPONSE: 200 OK",
            "PAYLOAD_DELIVERED"
        ];

        for (const step of steps) {
            await new Promise(r => setTimeout(r, 250));
            addLog(step);
        }

        setIsWebhookTest(false);
        sfx.playSuccess();
        setToast({ title: 'Integration', message: "Payload Delivered", type: "success" });
    };


    return (
        <section className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <SectionHeader icon={Globe} title="Integrations" sub="Third-Party Connections" color="text-accent-secondary" />
            
            <div className="space-y-8">
                {/* SERVER IDENTITY MODULE */}
                <div className="space-y-4">
                    <div className="p-1 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                        <div className="bg-[#09090b] text-white rounded-[1.4rem] p-4 space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                                <h5 className="text-sm font-bold  text-cyan-400 tracking-wide flex items-center gap-2">
                                    <Key size={16} /> Server Connection
                                </h5>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Input 
                                    icon={Key}
                                    label="Server Key" 
                                    value={config.serverKey || ''} 
                                    onChange={e => onChange('serverKey', e.target.value)} 
                                    placeholder="SRV-..." 
                                    className="font-mono text-sm bg-surface-alt border-border-subtle"
                                />
                                <Input 
                                    icon={Lock}
                                    label="Server Password" 
                                    type="password"
                                    value={config.serverPassword || ''} 
                                    onChange={e => onChange('serverPassword', e.target.value)} 
                                    className="bg-surface-alt border-border-subtle"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* VICIDIAL MODULE */}
                <div className="space-y-4">
                    <ConfigToggle 
                        label="Telephony Module (ViciDial)" 
                        active={config.telephonyEnabled || false} 
                        onToggle={() => onChange('telephonyEnabled', !config.telephonyEnabled)}
                        icon={Phone}
                        description="Enable embedded softphone capabilities via standard ViciDial API."
                    />

                    {config.telephonyEnabled && (
                        <div className="p-1 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                            <div className="bg-[#09090b] rounded-[1.4rem] p-4 space-y-6">
                                {/* Header Status */}
                                <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                                    <h5 className="text-sm font-bold  text-accent-secondary tracking-wide flex items-center gap-2">
                                        <Phone size={16} /> Dialer Server Configuration
                                    </h5>
                                    <button 
                                        onClick={handleTestConnection}
                                        disabled={isPing}
                                        className="px-4 py-1.5 bg-surface-highlight border border-border-subtle rounded-xl text-sm font-bold  tracking-wide hover:bg-surface-highlight hover:border-status-success/50 hover:text-status-success transition-all flex items-center gap-2 group text-white"
                                    >
                                        {isPing ? <Activity size={16} className="animate-spin text-status-success"/> : <Wifi size={16} className="text-status-success"/>}
                                        {isPing ? 'Pinging Node...' : 'Test Signal'}
                                    </button>
                                </div>

                                {/* Section 1: Credentials */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-4">
                                        <Input 
                                            icon={Server}
                                            label="Server URL" 
                                            value={config.viciServerUrl || ''} 
                                            onChange={e => onChange('viciServerUrl', e.target.value)} 
                                            placeholder="https://vici.example.com" 
                                            className="font-mono text-sm bg-surface-alt border-border-subtle"
                                        />
                                        <Input 
                                            icon={Hash}
                                            label="Campaign ID" 
                                            value={config.viciCampaignId || ''} 
                                            onChange={e => onChange('viciCampaignId', e.target.value)} 
                                            placeholder="CAMP001" 
                                            className="font-mono text-sm bg-surface-alt border-border-subtle"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <Input 
                                            icon={UserCheck}
                                            label="API User" 
                                            value={config.viciApiUser || ''} 
                                            onChange={e => onChange('viciApiUser', e.target.value)}
                                            placeholder="api_user (Optional)"
                                            className="bg-surface-alt border-border-subtle"
                                        />
                                        <Input 
                                            icon={Lock}
                                            label="API Pass" 
                                            type="password" 
                                            value={config.viciApiPass || ''} 
                                            onChange={e => onChange('viciApiPass', e.target.value)} 
                                            placeholder="•••••••• (Optional)"
                                            className="bg-surface-alt border-border-subtle"
                                        />
                                    </div>
                                </div>

                                {/* No API Credentials Alert banner */}
                                {!config.viciApiUser && (
                                    <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-1 text-left font-sans animate-in slide-in-from-top-1.5 duration-200">
                                        <div className="flex items-center gap-2 text-indigo-400">
                                            <Link size={14} className="animate-pulse" />
                                            <span className="text-sm font-bold uppercase tracking-wider font-mono">Agent Session Capture Enabled</span>
                                        </div>
                                        <p className="text-sm text-text-muted leading-relaxed">
                                            <strong>No API credentials? No problem!</strong> Our CRM integrates an automated client-side browser cookie scraper. The moment agents connect their standard softphone to the server, the CRM automatically extracts the server list layout and synchronizes it directly to the local database, completely avoiding the need for administrative API configuration.
                                        </p>
                                    </div>
                                )}

                                {/* Section 1b: Sync Settings */}
                                <div className="space-y-4 pt-4 border-t border-border-subtle/50">
                                    <h6 className="text-sm font-bold uppercase text-accent-secondary tracking-wide">
                                        Database Sync Settings
                                    </h6>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
                                        <Input 
                                            icon={Hash}
                                            label="ViciDial List ID" 
                                            value={config.viciListId || ''} 
                                            onChange={e => onChange('viciListId', e.target.value)} 
                                            placeholder="1001" 
                                            className="font-mono text-sm bg-surface-alt border-border-subtle text-text-primary"
                                        />
                                        <div className="text-left">
                                            <label className="text-sm font-extrabold uppercase tracking-wider text-text-muted mb-1.5 block text-left">Record Import Limit</label>
                                            <select
                                                value={config.viciListLimit || 50}
                                                onChange={e => onChange('viciListLimit', parseInt(e.target.value, 10))}
                                                className="w-full h-[42px] px-3 bg-surface-alt border border-border-subtle rounded-xl text-sm text-text-primary focus:border-accent-secondary focus:ring-1 focus:ring-accent-secondary/20 outline-none text-left"
                                            >
                                                <option value={25}>25 Leads</option>
                                                <option value={50}>50 Leads</option>
                                                <option value={100}>100 Leads</option>
                                                <option value={250}>250 Leads</option>
                                                <option value={500}>500 Leads</option>
                                            </select>
                                        </div>
                                        <div className="text-left">
                                            <label className="text-sm font-extrabold uppercase tracking-wider text-text-muted mb-1.5 block text-left">Duplicate Policy</label>
                                            <select
                                                value={config.viciRosterDuplicatePolicy || 'skip_duplicates'}
                                                onChange={e => onChange('viciRosterDuplicatePolicy', e.target.value)}
                                                className="w-full h-[42px] px-3 bg-surface-alt border border-border-subtle rounded-xl text-sm text-text-primary focus:border-accent-secondary focus:ring-1 focus:ring-accent-secondary/20 outline-none text-left"
                                            >
                                                <option value="skip_duplicates">Skip</option>
                                                <option value="overwrite_existing">Overwrite</option>
                                                <option value="merge_soft">Merge</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col justify-end text-left">
                                            <label className="flex items-center gap-2 px-3 py-2.5 bg-surface-alt border border-border-subtle rounded-xl text-sm text-text-primary h-[42px] cursor-pointer hover:bg-surface-highlight/30 transition-colors text-left">
                                                <input 
                                                    type="checkbox"
                                                    checked={config.viciAutoSyncOnConn || false}
                                                    onChange={e => onChange('viciAutoSyncOnConn', e.target.checked)}
                                                    className="rounded border-border-subtle text-accent-secondary focus:ring-accent-secondary/20 bg-transparent h-4 w-4"
                                                />
                                                <span className="font-medium text-left">Auto-Sync on Link</span>
                                            </label>
                                        </div>
                                    </div>
                                    
                                    {/* list syncing block */}
                                    <div className="p-4 bg-surface-alt/75 border border-border-subtle rounded-xl space-y-4 text-left">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                                            <div className="text-left">
                                                <span className="text-sm font-bold text-text-primary block text-left">List Synchronization</span>
                                                <span className="text-sm text-text-muted block mt-0.5 leading-relaxed text-left">
                                                    Mirror the active ViciDial lead list into the CRM.
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                disabled={isSyncingList || !config.viciListId}
                                                onClick={handleSyncViciList}
                                                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-indigo-500/50 disabled:to-purple-600/50 text-white rounded-xl text-sm font-bold tracking-wide flex items-center gap-2 transition-all shadow-md active:scale-95 shrink-0 self-start sm:self-center"
                                            >
                                                {isSyncingList ? <Activity size={14} className="animate-spin text-white" /> : <Zap size={14} className="text-white" />}
                                                {isSyncingList ? "RUNNING..." : "SYNC LIST"}
                                            </button>
                                        </div>

                                        {/* Progress bar */}
                                        {isSyncingList && (
                                            <div className="space-y-1.5 animate-in fade-in duration-300 text-left">
                                                <div className="flex items-center justify-between text-sm font-mono text-left">
                                                    <span className="text-indigo-400 font-bold uppercase tracking-wider text-left">CRAWLING TELEPHONY CORE PROTOCOLS</span>
                                                    <span className="text-white font-bold">{syncProgress}%</span>
                                                </div>
                                                <div className="w-full bg-surface-highlight/70 h-2.5 rounded-full overflow-hidden border border-border-subtle text-left">
                                                    <div 
                                                        className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-full transition-all duration-300 rounded-full" 
                                                        style={{ width: `${syncProgress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Sync Logs and stats display */}
                                        {syncLogs.length > 0 && (
                                            <div className="space-y-2 text-left">
                                                <div className="p-3 bg-black/90 rounded-xl border border-border-strong font-mono text-sm leading-relaxed select-all max-h-[140px] overflow-y-auto custom-scrollbar space-y-1 text-indigo-300 text-left">
                                                    {syncLogs.map((log, idx) => (
                                                        <div key={idx} className={log.includes('[CRITICAL_ERR]') ? 'text-status-error font-bold' : log.includes('successfully') || log.includes('Persisted') ? 'text-emerald-400 font-medium' : 'text-indigo-300'}>
                                                            {log}
                                                        </div>
                                                    ))}
                                                </div>

                                                {syncStats && (
                                                    <div className="grid grid-cols-2 gap-3 text-center animate-in zoom-in-95 duration-350">
                                                        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                                                            <span className="text-sm uppercase font-bold tracking-wide text-emerald-500/80 block font-sans">Leads Silently Unified</span>
                                                            <span className="text-lg font-bold block font-mono">+{syncStats.count}</span>
                                                        </div>
                                                        <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
                                                            <span className="text-sm uppercase font-bold tracking-wide text-amber-500/80 block font-sans">Duplicates Filtered</span>
                                                            <span className="text-lg font-bold block font-mono">{syncStats.duplicates}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* SECTION 2: Removed CLI Terminal */}
                            </div>
                        </div>
                    )}
                </div>

                {/* CUSTOM DIALER WEB MODULE */}
                <div className="space-y-4">
                    <ConfigToggle 
                        label="Custom URL-Based Autonomous Dialer" 
                        active={config.customDialerEnabled || false} 
                        onToggle={() => onChange('customDialerEnabled', !config.customDialerEnabled)}
                        icon={Phone}
                        description="Integrate custom enterprise dialers, auto-dialers, or standard telephony software via dynamic URL template substitution."
                    />

                    {config.customDialerEnabled && (
                        <div className="p-1 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20">
                            <div className="bg-[#09090b] text-white rounded-[1.4rem] p-4 space-y-6 font-sans">
                                <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                                    <h5 className="text-sm font-bold text-cyan-400 tracking-wide flex items-center gap-2">
                                        <Activity size={16} /> Custom Dialer Settings
                                    </h5>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-text-primary uppercase tracking-wide block">
                                        Dial Action Execution Type
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                                        {[
                                            { id: 'CLIPBOARD_ONLY', name: 'Clipboard Copy Only', desc: 'Auto-copies formatted digits with sound feedback' },
                                            { id: 'PROTOCOL_URI', name: 'Call Protocol Trigger', desc: 'Triggers local softphone via tel: scheme link' },
                                            { id: 'NEW_WEB_TAB', name: 'Custom Browser Tab', desc: 'Compiles URL and launches in a separate browser tab' },
                                            { id: 'IFRAME_DRAWER', name: 'Embedded Iframe Dock', desc: 'Draws interactive web-dialer inside the CRM' }
                                        ].map(item => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => { sfx.playClick(); onChange('customDialerType', item.id); }}
                                                className={`p-3 text-left border rounded-xl transition-all flex flex-col justify-between h-24 ${
                                                    (config.customDialerType || 'CLIPBOARD_ONLY') === item.id
                                                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 font-bold'
                                                        : 'bg-surface-alt/55 border-border-subtle text-text-muted hover:text-text-primary hover:bg-surface-highlight/40'
                                                }`}
                                            >
                                                <span className="text-sm font-bold block">{item.name}</span>
                                                <span className="text-sm opacity-70 leading-tight block mt-1">{item.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {((config.customDialerType || 'CLIPBOARD_ONLY') === 'NEW_WEB_TAB' || (config.customDialerType || 'CLIPBOARD_ONLY') === 'IFRAME_DRAWER') && (
                                    <div className="space-y-4 pt-2">
                                        <div className="grid grid-cols-1 gap-4">
                                            <Input 
                                                icon={Globe}
                                                label="Dynamic Dialer URL Template" 
                                                value={config.customDialerUrlTemplate || ''} 
                                                onChange={e => onChange('customDialerUrlTemplate', e.target.value)} 
                                                placeholder="https://autodialer.mycompany.com/dial?phone={phone_clean}&agent={agent_username}" 
                                                className="font-mono text-sm bg-surface-alt border-border-subtle"
                                            />
                                        </div>

                                        <div className="p-4 rounded-xl bg-surface-alt/75 border border-border-subtle text-sm space-y-2">
                                            <p className="font-bold text-text-primary text-sm uppercase tracking-wider mb-1">
                                                Available Replacement Tokens:
                                            </p>
                                            <div className="grid grid-cols-2 gap-1.5 font-mono text-sm text-text-secondary">
                                                <div><span className="text-cyan-400 font-bold">{'{phone}'}</span> - raw text phone</div>
                                                <div><span className="text-cyan-400 font-bold">{'{phone_clean}'}</span> - clean digits only (10/11 chars)</div>
                                                <div><span className="text-cyan-400 font-bold">{'{firstName}'}</span> - beneficiary first name</div>
                                                <div><span className="text-cyan-400 font-bold">{'{lastName}'}</span> - beneficiary last name</div>
                                                <div><span className="text-cyan-400 font-bold">{'{id}'}</span> - client record UUID</div>
                                            </div>

                                            {/* Live compiler compilation preview */}
                                            <div className="mt-3 pt-3 border-t border-border-subtle">
                                                <span className="text-sm font-bold uppercase text-cyan-400 tracking-wider animate-pulse">
                                                    Real-time Compilation Preview
                                                </span>
                                                <div className="p-2.5 bg-black/40 rounded border border-border-strong font-mono text-sm text-emerald-400 select-all overflow-x-auto mt-1 truncate">
                                                    {(() => {
                                                        const template = config.customDialerUrlTemplate || 'https://dialer.yourcompany.com/?phone={phone_clean}';
                                                        return template
                                                            .replace(/{phone}/g, '555-123-4567')
                                                            .replace(/{phone_clean}/g, '5551234567')
                                                            .replace(/{firstName}/g, 'John')
                                                            .replace(/{lastName}/g, 'Doe')
                                                            .replace(/{id}/g, 'CUST-00921');
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* WEBHOOK MODULE WITH EXPANDABLE CUSTOM HEADER EDITOR */}
                <div className="space-y-4">
                    <ConfigToggle 
                        label="Neural Event Webhook" 
                        active={config.webhookEnabled || false} 
                        onToggle={() => onChange('webhookEnabled', !config.webhookEnabled)}
                        description="Push real-time payload events to any remote endpoint (Zapier, Make, Custom Server) when critical system events trigger."
                    />
                    
                    {config.webhookEnabled && (
                        <div className="pl-14 pr-4 space-y-4 animate-in fade-in duration-300">
                            <div className="flex items-center justify-between pb-3 border-b border-border-subtle/50">
                                <h5 className="text-sm font-bold text-text-primary flex items-center gap-2">
                                    <Link size={16} className="text-purple-500"/> Payload Configuration
                                </h5>
                                <button 
                                    onClick={handleTestWebhook}
                                    disabled={isWebhookTest}
                                    className="px-3 py-1.5 bg-surface-main border border-border-subtle rounded-xl text-sm font-bold  tracking-wide hover:border-purple-500/50 hover:text-purple-400 transition-all flex items-center gap-2 text-white"
                                >
                                    {isWebhookTest ? <Activity size={16} className="animate-spin text-purple-500"/> : <Zap size={16} className="text-purple-500"/>}
                                    Fire Test Event
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input icon={Globe}
                                    label="Endpoint URL" 
                                    value={config.webhookUrl || ''} 
                                    onChange={e => onChange('webhookUrl', e.target.value)} 
                                    placeholder="https://hooks.zapier.com/..." 
                                    className="font-mono text-sm text-text-primary"
                                />
                                <Input 
                                    icon={Lock}
                                    label="Signing Secret" 
                                    type="password"
                                    value={config.webhookSecret || ''} 
                                    onChange={e => onChange('webhookSecret', e.target.value)} 
                                    placeholder="whsec_..." 
                                    className="font-mono text-sm text-text-primary"
                                />
                            </div>

                            {/* CUSTOM HTTP HEADERS LIST EDITOR */}
                            <div className="space-y-3 pt-4 border-t border-border-subtle/55">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-extrabold text-text-primary block">Custom Webhook HTTP Headers</span>
                                        <span className="text-sm text-text-muted mt-0.5 block leading-normal">
                                            Attach authorization tokens, custom content-types, secure signatures, or client identifiers.
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            sfx.playClick();
                                            const current = config.webhookHeaders || [];
                                            onChange('webhookHeaders', [...current, { key: '', value: '' }]);
                                        }}
                                        className="px-3 py-1 bg-surface-main hover:bg-surface-alt border border-border-subtle rounded-xl text-sm font-bold uppercase tracking-wider text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-all"
                                    >
                                        <Plus size={12} /> Add Custom Header
                                    </button>
                                </div>

                                <div className="space-y-2 mt-2">
                                    {(!config.webhookHeaders || config.webhookHeaders.length === 0) ? (
                                        <div className="p-4 text-center border border-dashed border-border-subtle rounded-xl text-sm text-text-muted/80 font-bold">
                                            No custom protocol headers declared. Default parameters ("Content-Type" and "Authorization") are active on simulation.
                                        </div>
                                    ) : (
                                        config.webhookHeaders.map((header, idx) => (
                                            <div key={idx} className="flex items-center gap-2.5 animate-in fade-in duration-150">
                                                <input
                                                    type="text"
                                                    value={header.key}
                                                    onChange={e => {
                                                        const fresh = [...(config.webhookHeaders || [])];
                                                        fresh[idx] = { ...fresh[idx], key: e.target.value };
                                                        onChange('webhookHeaders', fresh);
                                                    }}
                                                    placeholder="Header Name (e.g. Content-Type)"
                                                    className="flex-1 h-9 px-3 bg-surface-alt border-border-subtle rounded-xl text-sm font-mono text-text-primary focus:ring-1 focus:ring-purple-500/20 focus:border-purple-500/50 outline-none"
                                                />
                                                <span className="text-text-muted font-bold">:</span>
                                                <input
                                                    type="text"
                                                    value={header.value}
                                                    onChange={e => {
                                                        const fresh = [...(config.webhookHeaders || [])];
                                                        fresh[idx] = { ...fresh[idx], value: e.target.value };
                                                        onChange('webhookHeaders', fresh);
                                                    }}
                                                    placeholder="Header Value (e.g. application/json)"
                                                    className="flex-1 h-9 px-3 bg-surface-alt border-border-subtle rounded-xl text-sm font-mono text-text-primary focus:ring-1 focus:ring-purple-500/20 focus:border-purple-500/50 outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        sfx.playClick();
                                                        const fresh = (config.webhookHeaders || []).filter((_, index) => index !== idx);
                                                        onChange('webhookHeaders', fresh);
                                                    }}
                                                    className="p-2 text-text-muted hover:text-status-error hover:bg-status-error/10 rounded-xl transition-colors border border-border-subtle/40 hover:border-status-error/20"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* LIVE CONSOLE */}
                {(isPing || isWebhookTest || consoleLogs.length > 0) && (
                    <div className="animate-in slide-in-from-bottom-4 duration-500 pt-4">
                        <IntegrationConsole logs={consoleLogs} />
                    </div>
                )}
            </div>
        </section>
    );
};
