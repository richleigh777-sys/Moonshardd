
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

    return (
        <section className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <SectionHeader icon={Globe} title="External Neural Uplinks" sub="Third-Party API Bridges" color="text-indigo-500" />
            
            <div className="space-y-8">
                {/* SERVER IDENTITY MODULE */}
                <div className="space-y-4">
                    <div className="p-1 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                        <div className="bg-[#09090b] text-white rounded-[1.4rem] p-6 space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-white/10">
                                <h5 className="text-[10px] font-black uppercase text-cyan-400 tracking-widest flex items-center gap-2">
                                    <Key size={14} className="animate-pulse"/> Command Deck Identity
                                </h5>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Input 
                                    icon={Key}
                                    label="Server Key" 
                                    value={config.serverKey || ''} 
                                    onChange={e => onChange('serverKey', e.target.value)} 
                                    placeholder="SRV-..." 
                                    className="font-mono text-xs bg-black/40 border-white/10"
                                />
                                <Input 
                                    icon={Lock}
                                    label="Server Password" 
                                    type="password"
                                    value={config.serverPassword || ''} 
                                    onChange={e => onChange('serverPassword', e.target.value)} 
                                    className="bg-black/40 border-white/10"
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
                                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                                    <h5 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-2">
                                        <Radio size={14} className="animate-pulse"/> ViciDial Command Matrix
                                    </h5>
                                    <button 
                                        onClick={handleTestConnection}
                                        disabled={isPing}
                                        className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-bold uppercase tracking-wide hover:bg-white/10 hover:border-emerald-500/50 hover:text-emerald-400 transition-all flex items-center gap-2 group"
                                    >
                                        {isPing ? <Activity size={10} className="animate-spin text-emerald-500"/> : <Wifi size={12} className="text-emerald-500"/>}
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
                                            className="font-mono text-xs bg-black/40 border-white/10"
                                        />
                                        <Input 
                                            icon={Hash}
                                            label="Campaign ID" 
                                            value={config.viciCampaignId || ''} 
                                            onChange={e => onChange('viciCampaignId', e.target.value)} 
                                            placeholder="CAMP001" 
                                            className="font-mono text-xs bg-black/40 border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <Input 
                                            icon={UserCheck}
                                            label="API User" 
                                            value={config.viciApiUser || ''} 
                                            onChange={e => onChange('viciApiUser', e.target.value)}
                                            className="bg-black/40 border-white/10"
                                        />
                                        <Input 
                                            icon={Lock}
                                            label="API Pass" 
                                            type="password" 
                                            value={config.viciApiPass || ''} 
                                            onChange={e => onChange('viciApiPass', e.target.value)} 
                                            className="bg-black/40 border-white/10"
                                        />
                                    </div>
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
                                <h5 className="text-[10px] font-black uppercase text-text-primary tracking-widest flex items-center gap-2">
                                    <Link size={14} className="text-purple-500"/> Payload Configuration
                                </h5>
                                <button 
                                    onClick={handleTestWebhook}
                                    disabled={isWebhookTest}
                                    className="px-3 py-1.5 bg-surface-main border border-border-subtle rounded-xl text-[9px] font-bold uppercase tracking-wide hover:border-purple-500/50 hover:text-purple-400 transition-all flex items-center gap-2"
                                >
                                    {isWebhookTest ? <Activity size={10} className="animate-spin text-purple-500"/> : <Zap size={12} className="text-purple-500"/>}
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
