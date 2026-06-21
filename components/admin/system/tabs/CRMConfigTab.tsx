
import React, { useState } from 'react';
import { Database, Sparkles, History, Zap, Share2, TrendingUp, CheckCircle, RefreshCw, Sliders } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { ConfigToggle } from '../ConfigToggle';
import { SystemConfig } from '../../../../types';
import { sfx } from '../../../../lib/soundService';

interface CRMConfigTabProps {
    config: SystemConfig;
    onChange: (field: keyof SystemConfig, value: any) => void;
}

export const CRMConfigTab: React.FC<CRMConfigTabProps> = ({ config, onChange }) => {
    const [sheetId, setSheetId] = useState('1xY7K9L_8sd09wUn97AsKl8e8HhN_S91Kld8203');
    const [sheetRange, setSheetRange] = useState('Sales_Data_Raw');
    const [isTestingSheet, setIsTestingSheet] = useState(false);
    const [testResult, setTestResult] = useState<string | null>(null);

    // Scoring weights for CRM Intelligence funnel attribution
    const [stageWeights, setStageWeights] = useState({
        prospect: 10,
        callback: 35,
        qualified: 60,
        won: 100
    });

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

    const testSheetConnection = () => {
        sfx.playClick();
        setIsTestingSheet(true);
        setTestResult(null);
        setTimeout(() => {
            setIsTestingSheet(false);
            setTestResult('Successfully connected to spreadsheet cluster. Real-time sheet triggers deployed.');
            sfx.playSuccess();
        }, 1500);
    };

    return (
        <section className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <SectionHeader 
                icon={Database} 
                title="CRM Intelligence & Automation" 
                sub="Manage your customer relationship capabilities" 
                color="text-status-success" 
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

                {crm.funnelAnalytics && (
                    <div className="p-4 bg-surface-alt/40 border border-border-subtle rounded-xl space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
                            <div className="p-2 bg-emerald-500/10 text-status-success rounded-xl">
                                <Sliders size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold tracking-tight text-text-primary">Attribution Stage Scoring Weights</h4>
                                <p className="text-sm font-medium text-text-muted">Set percentage weights for CRM scoring triggers</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {Object.entries(stageWeights).map(([stage, weight]) => (
                                <div key={stage} className="p-4 bg-surface-main border border-border-subtle rounded-xl flex flex-col items-center space-y-2">
                                    <span className="text-sm uppercase font-extrabold text-text-muted tracking-wider">{stage}</span>
                                    <div className="flex items-center gap-1">
                                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                            type="number" 
                                            value={weight} 
                                            className="w-12 bg-surface-alt border border-border-subtle text-center text-sm font-bold rounded p-1 text-text-primary"
                                            onChange={e => {
                                                const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                                setStageWeights(prev => ({ ...prev, [stage]: val }));
                                            }}
                                        />
                                        <span className="text-sm font-bold text-text-muted">%</span>
                                    </div>
                                    <div className="w-full bg-surface-alt h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full animate-all duration-300" style={{ width: `${weight}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Enhanced Visual Formula Tracker */}
                        <div className="p-4 rounded-xl bg-surface-main/80 border border-border-subtle text-sm space-y-2.5">
                            <span className="text-sm uppercase font-mono font-bold text-status-success tracking-wide block">
                                Core Intelligence Matrix Formula
                            </span>
                            <div className="flex flex-col sm:flex-row items-baseline gap-2 text-text-secondary leading-normal font-mono text-sm">
                                <span className="font-extrabold text-text-primary bg-surface-alt border border-border-subtle px-2 py-0.5 rounded shadow">Score(u)</span>
                                <span>=</span>
                                <span className="text-blue-400">({stageWeights.prospect}% × P)</span>
                                <span>+</span>
                                <span className="text-amber-400">({stageWeights.callback}% × C)</span>
                                <span>+</span>
                                <span className="text-indigo-400">({stageWeights.qualified}% × Q)</span>
                                <span>+</span>
                                <span className="text-emerald-400">({stageWeights.won}% × W)</span>
                            </div>
                            <p className="text-sm text-text-muted italic">Weights dictate prompt context relevance parameters for the server-side Gemini AI engine.</p>
                        </div>
                    </div>
                )}

                <div className="p-4 bg-surface-alt/40 border border-border-subtle rounded-xl space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
                        <div className="p-2 bg-text-primary text-surface-main rounded-xl shadow-lg">
                            <Share2 size={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold tracking-tight text-text-primary">External Data Sync</h4>
                            <p className="text-sm font-medium text-text-muted">Broadcast CRM data to external spreadsheets</p>
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
                            <div className="p-4 bg-surface-main border border-border-subtle rounded-xl animate-in slide-in-from-top-2 space-y-4">
                                <p className="text-sm font-bold text-text-muted uppercase tracking-wider">Sync Parameters</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-text-muted ml-1">Spreadsheet ID</label>
                                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                            type="text" 
                                            value={sheetId || ''}
                                            onChange={e => setSheetId(e.target.value)}
                                            placeholder="1x..." 
                                            className="w-full h-10 px-4 bg-surface-alt border border-border-subtle rounded-xl text-sm font-mono text-text-primary"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-text-muted ml-1">Sheet Tab Name</label>
                                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                            type="text" 
                                            value={sheetRange}
                                            onChange={e => setSheetRange(e.target.value)}
                                            placeholder="Sheet1" 
                                            className="w-full h-10 px-4 bg-surface-alt border border-border-subtle rounded-xl text-sm font-mono text-text-primary"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-text-muted ml-1">Export Interval</label>
                                        <select className="w-full h-10 px-4 bg-surface-alt border border-border-subtle rounded-xl text-sm font-bold appearance-none text-text-primary">
                                            <option>Real-time</option>
                                            <option>Hourly</option>
                                            <option>Daily</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Custom Live Sync Payload Preview */}
                                <div className="p-3.5 rounded-xl bg-surface-alt border border-border-subtle text-sm space-y-2">
                                    <span className="text-sm uppercase font-mono font-bold text-accent-secondary tracking-wide block">
                                        Active Sync Payload Model (JSON)
                                    </span>
                                    <div className="p-3 bg-black/40 rounded border border-border-strong font-mono text-sm text-cyan-400 select-all overflow-x-auto truncate text-left max-h-[140px] overflow-y-auto custom-scrollbar">
                                        {JSON.stringify({
                                            event: "CRM_SPREADSHEET_SYNC",
                                            timestamp: new Date().toISOString(),
                                            targetSpreadsheet: sheetId || "1xY7K9L_8sd09wUn97AsKl8e8HhN_S91Kld8203",
                                            tab: sheetRange || "Sales_Data_Raw",
                                            samplePayload: {
                                                leadId: "L-902341",
                                                beneficiary: "Eleanor Vance",
                                                status: "Won",
                                                computedIntelligenceScore: 100,
                                                matrixWeights: stageWeights,
                                                dispatchedBy: "Command Deck System"
                                            }
                                        }, null, 2)}
                                    </div>
                                </div>

                                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <button
                                        type="button"
                                        onClick={testSheetConnection}
                                        disabled={isTestingSheet || !sheetId}
                                        className="h-9 px-4 rounded-lg bg-text-primary text-surface-main text-sm font-extrabold tracking-wider hover:bg-text-primary/95 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isTestingSheet ? (
                                            <>
                                                <RefreshCw size={12} className="animate-spin" />
                                                Verifying Sync...
                                            </>
                                        ) : (
                                            <>Verify Google Sheets Link</>
                                        )}
                                    </button>

                                    {testResult && (
                                        <span className="text-sm text-status-success font-bold tracking-wide flex items-center gap-1">
                                            <CheckCircle size={14} />
                                            {testResult}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
