
import React from 'react';
import { Database, Sparkles, History, Zap, Share2, TrendingUp } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { ConfigToggle } from '../ConfigToggle';
import { SystemConfig } from '../../../../types';

interface CRMConfigTabProps {
    config: SystemConfig;
    onChange: (field: keyof SystemConfig, value: any) => void;
}

export const CRMConfigTab: React.FC<CRMConfigTabProps> = ({ config, onChange }) => {
    const crm = config.crmFeatures || {
        enableAiBriefing: true,
        enableHistoryTimeline: true,
        enableAutomatedFollowups: false,
        enableGoogleSheetSync: false,
        funnelAnalytics: true
    };

    const updateCrm = (key: keyof Required<SystemConfig>['crmFeatures'], val: boolean) => {
        onChange('crmFeatures', { ...crm, [key]: val });
    };

    return (
        <section className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <SectionHeader 
                icon={Database} 
                title="CRM Intelligence & Automation" 
                sub="Manage your customer relationship capabilities" 
                color="text-emerald-500" 
            />

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ConfigToggle 
                        label="AI Strategic Briefing" 
                        active={crm.enableAiBriefing} 
                        onToggle={() => updateCrm('enableAiBriefing', !crm.enableAiBriefing)}
                        icon={Sparkles}
                        description="Generate strategic summaries and sentiment analysis for leads using Gemini AI."
                    />
                    <ConfigToggle 
                        label="Interaction Timeline" 
                        active={crm.enableHistoryTimeline} 
                        onToggle={() => updateCrm('enableHistoryTimeline', !crm.enableHistoryTimeline)}
                        icon={History}
                        description="Chronological view of all customer touchpoints including notes and call logs."
                    />
                    <ConfigToggle 
                        label="Automated Follow-ups" 
                        active={crm.enableAutomatedFollowups} 
                        onToggle={() => updateCrm('enableAutomatedFollowups', !crm.enableAutomatedFollowups)}
                        icon={Zap}
                        description="Automatically schedule tasks and reminders based on lead status changes."
                    />
                    <ConfigToggle 
                        label="Funnel Analytics" 
                        active={crm.funnelAnalytics} 
                        onToggle={() => updateCrm('funnelAnalytics', !crm.funnelAnalytics)}
                        icon={TrendingUp}
                        description="Advanced pipeline health and conversion tracking for strategic insights."
                    />
                </div>

                <div className="p-6 bg-surface-alt/40 border border-border-subtle rounded-[32px] space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
                        <div className="p-2 bg-text-primary text-surface-main rounded-xl shadow-lg">
                            <Share2 size={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-tight text-text-primary">External Data Sync</h4>
                            <p className="text-[10px] font-medium text-text-muted">Broadcast CRM data to external spreadsheets</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <ConfigToggle 
                            label="Google Sheets Live Export" 
                            active={crm.enableGoogleSheetSync} 
                            onToggle={() => updateCrm('enableGoogleSheetSync', !crm.enableGoogleSheetSync)}
                            icon={Database}
                            description="Automatically push sales and lead updates to your configured Google Sheet."
                        />
                        
                        {crm.enableGoogleSheetSync && (
                            <div className="p-4 bg-surface-main border border-border-subtle rounded-2xl animate-in slide-in-from-top-2">
                                <p className="text-[9px] font-black text-text-muted uppercase mb-3">Sync Parameters</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-text-muted uppercase ml-1">Spreadsheet ID</label>
                                        <input 
                                            type="text" 
                                            placeholder="1x..." 
                                            className="w-full h-10 px-4 bg-surface-alt border border-border-subtle rounded-xl text-xs font-mono"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-text-muted uppercase ml-1">Export Interval</label>
                                        <select className="w-full h-10 px-4 bg-surface-alt border border-border-subtle rounded-xl text-xs font-bold appearance-none">
                                            <option>Real-time</option>
                                            <option>Hourly</option>
                                            <option>Daily</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
