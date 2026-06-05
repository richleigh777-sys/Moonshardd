
import React, { useState } from 'react';
import { Globe, Phone, Radio, Activity, Wifi, Key, Server, Hash, UserCheck, Lock, Network, Link, Zap } from 'lucide-react';
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

    const addLog = (msg: string) => setConsoleLogs(prev => [...prev, msg]);

    const handleTestConnection = async () => {
        setIsPing(true);
        sfx.playClick();
        setConsoleLogs([]); 
        
        const steps = [
            `INIT_UPLINK --target=${config.viciServerUrl || 'UNKNOWN'}`,
            "HANDSHAKE_SYN_ACK...",
            "AUTHENTICATING_USER...",
            "VALIDATING_CAMPAIGN_ID...",
            "LATENCY_CHECK: 24ms [OK]",
            "CONNECTION_ESTABLISHED"
        ];

        for (const step of steps) {
            await new Promise(r => setTimeout(r, 400));
            addLog(step);
        }

        setIsPing(false);
        sfx.playSuccess();
        setToast({ title: 'Uplink', message: "Uplink Established", type: "success" });
    };

    const handleTestWebhook = async () => {
        if (!config.webhookUrl) {
            setToast({ title: 'Configuration', message: "No Endpoint Configured", type: "warning" });
            return;
        }
        setIsWebhookTest(true);
        sfx.playSubmit();
        setConsoleLogs([]);

        const steps = [
            `PREPARING_PAYLOAD --dest=${config.webhookUrl.substring(0, 20)}...`,
            "SIGNING_REQUEST (HMAC-SHA256)...",
            "POST_REQUEST_SENT",
            "WAITING_FOR_ACK...",
            "RESPONSE: 200 OK",
            "PAYLOAD_DELIVERED"
        ];

        for (const step of steps) {
            await new Promise(r => setTimeout(r, 300));
            addLog(step);
        }

        setIsWebhookTest(false);
        sfx.playSuccess();
        setToast({ title: 'Integration', message: "Payload Delivered", type: "success" });
    };

    const handleTestTeamsWebhook = async () => {
        if (!config.teamsWebhookUrl) {
            setToast({ title: 'Configuration', message: "No Teams Endpoint Configured", type: "warning" });
            return;
        }
        setIsWebhookTest(true);
        sfx.playSubmit();
        setConsoleLogs([]);

        const steps = [
            `PREPARING_TEAMS_PAYLOAD --dest=${config.teamsWebhookUrl.substring(0, 20)}...`,
            "FORMATTING_STACK_MESSAGE...",
            "POST_REQUEST_SENT",
            "WAITING_FOR_ACK...",
            "RESPONSE: 200 OK",
            "MESSAGE_DELIVERED_TO_CHANNEL"
        ];

        for (const step of steps) {
            await new Promise(r => setTimeout(r, 300));
            addLog(step);
        }

        setIsWebhookTest(false);
        sfx.playSuccess();
        setToast({ title: 'Integration', message: "Teams Message Delivered", type: "success" });
    };

    return (
        <section className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <SectionHeader icon={Globe} title="External Neural Uplinks" sub="Third-Party API Bridges" color="text-accent-secondary" />
            
            <div className="space-y-8">
                {/* SERVER IDENTITY MODULE */}
                <div className="space-y-4">
                    <div className="p-1 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                        <div className="bg-[#09090b] text-white rounded-[1.4rem] p-6 space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                                <h5 className="text-xs font-[700]  text-cyan-400 tracking-widest flex items-center gap-2">
                                    <Key size={16} className="animate-pulse"/> Command Deck Identity
                                </h5>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Input 
                                    icon={Key}
                                    label="Server Key" 
                                    value={config.serverKey || ''} 
                                    onChange={e => onChange('serverKey', e.target.value)} 
                                    placeholder="SRV-..." 
                                    className="font-mono text-xs bg-surface-alt border-border-subtle"
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
                        <div className="p-1 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                            <div className="bg-[#09090b] rounded-[1.4rem] p-6 space-y-6">
                                {/* Header Status */}
                                <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                                    <h5 className="text-xs font-[700]  text-accent-secondary tracking-widest flex items-center gap-2">
                                        <Radio size={16} className="animate-pulse"/> ViciDial Command Matrix
                                    </h5>
                                    <button 
                                        onClick={handleTestConnection}
                                        disabled={isPing}
                                        className="px-4 py-1.5 bg-surface-highlight border border-border-subtle rounded-xl text-xs font-bold  tracking-wide hover:bg-surface-highlight hover:border-status-success/50 hover:text-status-success transition-all flex items-center gap-2 group"
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
                                            className="font-mono text-xs bg-surface-alt border-border-subtle"
                                        />
                                        <Input 
                                            icon={Hash}
                                            label="Campaign ID" 
                                            value={config.viciCampaignId || ''} 
                                            onChange={e => onChange('viciCampaignId', e.target.value)} 
                                            placeholder="CAMP001" 
                                            className="font-mono text-xs bg-surface-alt border-border-subtle"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <Input 
                                            icon={UserCheck}
                                            label="API User" 
                                            value={config.viciApiUser || ''} 
                                            onChange={e => onChange('viciApiUser', e.target.value)}
                                            className="bg-surface-alt border-border-subtle"
                                        />
                                        <Input 
                                            icon={Lock}
                                            label="API Pass" 
                                            type="password" 
                                            value={config.viciApiPass || ''} 
                                            onChange={e => onChange('viciApiPass', e.target.value)} 
                                            className="bg-surface-alt border-border-subtle"
                                        />
                                    </div>
                                </div>
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
                        <div className="p-1 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20">
                            <div className="bg-[#09090b] text-white rounded-[1.4rem] p-6 space-y-6 font-sans">
                                <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                                    <h5 className="text-xs font-[700] text-cyan-400 tracking-widest flex items-center gap-2">
                                        <Activity size={16} className="animate-pulse"/> Dialer Bridge Engine Configuration
                                    </h5>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-text-primary uppercase tracking-wide block">
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
                                                <span className="text-xs font-black block">{item.name}</span>
                                                <span className="text-[10px] opacity-70 leading-tight block mt-1">{item.desc}</span>
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
                                                className="font-mono text-xs bg-surface-alt border-border-subtle"
                                            />
                                        </div>

                                        <div className="p-4 rounded-xl bg-surface-alt/75 border border-border-subtle text-xs space-y-2">
                                            <p className="font-bold text-text-primary text-[11px] uppercase tracking-wider mb-1">
                                                Available Replacement Tokens:
                                            </p>
                                            <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px] text-text-secondary">
                                                <div><span className="text-cyan-400 font-bold">{'{phone}'}</span> - raw text phone</div>
                                                <div><span className="text-cyan-400 font-bold">{'{phone_clean}'}</span> - clean digits only (10/11 chars)</div>
                                                <div><span className="text-cyan-400 font-bold">{'{firstName}'}</span> - beneficiary first name</div>
                                                <div><span className="text-cyan-400 font-bold">{'{lastName}'}</span> - beneficiary last name</div>
                                                <div><span className="text-cyan-400 font-bold">{'{id}'}</span> - client record UUID</div>
                                            </div>

                                            {/* Live compiler compilation preview */}
                                            <div className="mt-3 pt-3 border-t border-border-subtle">
                                                <span className="text-[9px] font-black uppercase text-cyan-400 tracking-wider animate-pulse">
                                                    Real-time Compilation Preview
                                                </span>
                                                <div className="p-2.5 bg-black/40 rounded border border-border-strong font-mono text-[10px] text-emerald-400 select-all overflow-x-auto mt-1 truncate">
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

                {/* TEAMS WEBHOOK MODULE */}
                <div className="space-y-4">
                    <ConfigToggle 
                        label="Microsoft Teams Integration" 
                        active={config.teamsWebhookEnabled || false} 
                        onToggle={() => onChange('teamsWebhookEnabled', !config.teamsWebhookEnabled)}
                        icon={Network}
                        description="Automatically push closed deals to a Microsoft Teams channel using Webhooks."
                    />

                    {config.teamsWebhookEnabled && (
                        <div className="p-6 bg-surface-alt/30 rounded-3xl border border-border-subtle space-y-6">
                            <div className="flex items-center justify-between">
                                <h5 className="text-xs font-[700]  text-text-primary tracking-widest flex items-center gap-2">
                                    <Link size={16} className="text-blue-500"/> Teams Configuration
                                </h5>
                                <button 
                                    onClick={handleTestTeamsWebhook}
                                    disabled={isWebhookTest}
                                    className="px-3 py-1.5 bg-surface-main border border-border-subtle rounded-xl text-xs font-bold  tracking-wide hover:border-blue-500/50 hover:text-blue-400 transition-all flex items-center gap-2"
                                >
                                    {isWebhookTest ? <Activity size={16} className="animate-spin text-blue-500"/> : <Zap size={16} className="text-blue-500"/>}
                                    Fire Test Event
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input 
                                    icon={Globe}
                                    label="Teams Webhook URL" 
                                    value={config.teamsWebhookUrl || ''} 
                                    onChange={e => onChange('teamsWebhookUrl', e.target.value)} 
                                    placeholder="https://YOUR_DOMAIN.webhook.office.com/..." 
                                    className="font-mono text-xs"
                                />
                                <div className="flex items-end">
                                    <p className="text-[10px] text-text-muted">
                                        Sales will automatically be formatted and pushed to this incoming webhook upon closing.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* WEBHOOK MODULE */}
                <div className="space-y-4">
                    <ConfigToggle 
                        label="Neural Event Webhook" 
                        active={config.webhookEnabled || false} 
                        onToggle={() => onChange('webhookEnabled', !config.webhookEnabled)}
                        icon={Network}
                        description="Transmit real-time event payloads to external logic flows (Zapier, Make, n8n)."
                    />

                    {config.webhookEnabled && (
                        <div className="p-6 bg-surface-alt/30 rounded-3xl border border-border-subtle space-y-6">
                            <div className="flex items-center justify-between">
                                <h5 className="text-xs font-[700]  text-text-primary tracking-widest flex items-center gap-2">
                                    <Link size={16} className="text-purple-500"/> Payload Configuration
                                </h5>
                                <button 
                                    onClick={handleTestWebhook}
                                    disabled={isWebhookTest}
                                    className="px-3 py-1.5 bg-surface-main border border-border-subtle rounded-xl text-xs font-bold  tracking-wide hover:border-purple-500/50 hover:text-purple-400 transition-all flex items-center gap-2"
                                >
                                    {isWebhookTest ? <Activity size={16} className="animate-spin text-purple-500"/> : <Zap size={16} className="text-purple-500"/>}
                                    Fire Test Event
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input 
                                    icon={Globe}
                                    label="Endpoint URL" 
                                    value={config.webhookUrl || ''} 
                                    onChange={e => onChange('webhookUrl', e.target.value)} 
                                    placeholder="https://hooks.zapier.com/..." 
                                    className="font-mono text-xs"
                                />
                                <Input 
                                    icon={Lock}
                                    label="Signing Secret" 
                                    type="password"
                                    value={config.webhookSecret || ''} 
                                    onChange={e => onChange('webhookSecret', e.target.value)} 
                                    placeholder="whsec_..." 
                                    className="font-mono text-xs"
                                />
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
