import { useSystem } from '../../../hooks/useSystem';

import React, { useState } from 'react';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, Megaphone, History } from 'lucide-react';
import { Card } from '../../ui/Base';
import { Sale, User, Note } from '../../../types';

interface StrategicInsightCardProps {
    sales: Sale[];
    users: User[];
    notes: Note[];
    serverId: string;
}

export const StrategicInsightCard: React.FC<StrategicInsightCardProps> = ({ 
 sales, users, notes, _serverId }) => {
    const { setToast } = useSystem();
    const [insight, setInsight] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const generateInsights = async () => {
        setLoading(true);
        try {
            const leadStats = {
                totalLeads: notes.length,
                resolved: notes.filter(n => n.status === 'Resolved').length,
                avgResponseTime: notes
                    .filter(n => n.contactInitAt && n.createdAt)
                    .reduce((acc, n) => acc + (n.contactInitAt! - n.createdAt!), 0) / Math.max(1, notes.filter(n => n.contactInitAt && n.createdAt).length),
                avgResolutionTime: notes
                    .filter(n => n.resolvedAt && n.createdAt)
                    .reduce((acc, n) => acc + (n.resolvedAt! - n.createdAt!), 0) / Math.max(1, notes.filter(n => n.resolvedAt && n.createdAt).length),
                retentionRate: (sales.filter(s => s.isReorder).length / Math.max(1, sales.length)) * 100
            };

            const dataSummary = {
                totalSales: sales.length,
                approved: sales.filter(s => s.status === 'Approved').length,
                revenue: sales.reduce((acc, s) => acc + (s.status === 'Approved' ? s.amount : 0), 0),
                crm: {
                    retention: `${leadStats.retentionRate.toFixed(1)}%`,
                    avgResponse: `${(leadStats.avgResponseTime / 60000).toFixed(1)} min`,
                    avgResolution: `${(leadStats.avgResolutionTime / 3600000).toFixed(1)} hours`,
                    resolutionRate: `${((leadStats.resolved / leadStats.totalLeads) * 100).toFixed(1)}%`
                },
                objections: sales.filter(s => s.status === 'Declined').map(s => s.objectionType).filter(Boolean),
                topAgents: users.slice(0, 3).map(u => u.name)
            };

            const res = await fetch('/api/gemini/generateContent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: `Act as a Senior CRM Data Scientist. Analyze this high-density snapshot of sales and interaction data.
                    
Data Snapshot:
${JSON.stringify(dataSummary)}

Evaluation Parameters:
1. Health Score (0-100) based on revenue, resolution speed, and retention.
2. 3 Key Findings: Focus on bottlenecks in resolution or retention opportunities.
3. Strategic Pivot: One high-impact move (e.g. "Focus on re-engagement for LTV growth").
4. Risk Factor: Identify the most dangerous trend (e.g. "Response times are exceeding 30 mins").`,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: "OBJECT",
                            properties: {
                                healthScore: { type: "NUMBER" },
                                keyFindings: { type: "ARRAY", items: { type: "STRING" } },
                                strategicPivot: { type: "STRING" },
                                riskFactor: { type: "STRING" }
                            },
                            required: ['healthScore', 'keyFindings', 'strategicPivot', 'riskFactor']
                        }
                    }
                })
            });

            if (!res.ok) throw new Error("API returned " + res.status);
            const data = await res.json();
            if (data.text) {
                setInsight(JSON.parse(data.text.trim()));
            }
        } catch (error) {
            console.error("Insight generation failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const broadcastToWarRoom = async () => {
        if (!insight) return;
        setIsBroadcasting(true);
        try {
            // Replaced Firebase with standard console/toast logic.
            // In a full implementation, this would use the internal WebSocket event bus.
            console.log(`🚀 SYSTEM ALERT: ${insight.strategicPivot}`);
            setToast({ title: "Alert", message: "Strategic Insight Broadcast to War Room", type: "warning" });
        } catch (error) {
            console.error(error);
        } finally {
            setIsBroadcasting(false);
        }
    };


    return (
        <Card variant="panel" className="p-4 md:p-4 space-y-4 md:space-y-6 bg-surface-main/30 backdrop-blur-3xl shadow-panel relative overflow-hidden group border border-border-strong rounded-xl md:rounded-xl hover:border-accent-primary/20 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-0"></div>
            
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="p-2 md:p-3 bg-accent-primary/10 rounded-xl md:rounded-xl text-accent-primary border border-accent-primary/20 shadow-inner group-hover:scale-110 transition-transform">
                        <Sparkles size={20} strokeWidth={2.5}/>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium  tracking-wide text-text-primary drop-shadow-sm">Strategic Intelligence</h3>
                        <p className="text-sm font-medium text-text-muted  tracking-wide mt-0.5">Real-time pipeline analysis</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setShowHistory(!showHistory)}
                        className="p-2 bg-surface-main/80  rounded-xl text-text-muted hover:text-text-primary hover:border-accent-primary/30 border border-border-strong shadow-inner transition-all hover:scale-105"
                        title="View History"
                    >
                        <History size={16} />
                    </button>
                    {!insight && !loading && (
                        <button 
                            onClick={generateInsights}
                            className="px-4 py-2 bg-text-primary text-surface-main rounded-xl text-sm font-medium  tracking-wide hover:brightness-110 shadow-sm transition-all active:scale-95 border border-transparent"
                        >
                            Generate Report
                        </button>
                    )}
                </div>
            </div>

            {loading && (
                <div className="py-12 text-center space-y-4 animate-pulse relative z-10">
                    <div className="w-16 h-16 rounded-full bg-accent-primary/10 flex items-center justify-center mx-auto border border-accent-primary/30 shadow-sm">
                        <TrendingUp size={32} className="text-accent-primary animate-bounce shadow-accent-primary/50" />
                    </div>
                    <p className="text-sm font-medium  tracking-[0.3em] text-text-primary drop-shadow-sm">Scanning Sales Ledger</p>
                </div>
            )}

            {insight && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 relative z-10">
                    <div className="flex items-center justify-between bg-surface-main/60 p-4 md:p-4 rounded-xl border border-border-strong shadow-inner  group-hover:border-accent-primary/20 transition-colors">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-text-muted  tracking-wide">Health Score</p>
                            <p className={`text-lg font-medium font-display tracking-tight drop-shadow-sm ${insight.healthScore > 70 ? 'text-status-success shadow-emerald-500/20' : 'text-status-warning shadow-amber-500/20'}`}>
                                {insight.healthScore}%
                            </p>
                        </div>
                        <div className="w-16 h-16 rounded-full border border-border-strong bg-surface-alt/50 flex items-center justify-center relative shadow-inner">
                            <div 
                                className={`absolute inset-0 rounded-full border-[3px] border-l-transparent border-b-transparent ${insight.healthScore > 70 ? 'border-emerald-500 shadow-sm' : 'border-amber-500 shadow-sm'}`}
                                style={{ transform: `rotate(${insight.healthScore * 3.6}deg)` }}
                            ></div>
                            <CheckCircle2 size={24} strokeWidth={2.5} className={insight.healthScore > 70 ? 'text-status-success' : 'text-status-warning'} />
                        </div>
                    </div>

                    <div className="space-y-3 p-1">
                        <p className="text-sm font-medium text-text-muted  tracking-wide flex items-center gap-2">
                             Key Performance Indicators
                        </p>
                        <div className="space-y-2">
                            {insight.keyFindings.map((f: string, i: number) => (
                                <div key={i} className="flex gap-3 p-3 lg:p-4 bg-surface-main/40 border border-border-strong rounded-xl group-hover:border-accent-primary/20 transition-all hover:bg-surface-main/60 shadow-inner">
                                    <div className="w-1.5 h-1.5 bg-accent-primary shadow-sm rounded-full mt-2 shrink-0"></div>
                                    <p className="text-sm font-medium text-text-primary leading-relaxed opacity-90">{f}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 md:p-4 bg-accent-primary/5 border border-accent-primary/20 rounded-xl shadow-sm ">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-accent-primary shadow-accent-primary/20  tracking-wide">Strategic Pivot</p>
                            <button 
                                onClick={broadcastToWarRoom}
                                disabled={isBroadcasting}
                                className="flex items-center gap-1.5 text-sm bg-accent-primary/10 px-3 py-1.5 rounded-lg border border-accent-primary/30 font-medium  text-accent-primary hover:bg-accent-primary hover:text-surface-main transition-colors disabled:opacity-50"
                            >
                                <Megaphone size={14} />
                                Broadcast
                            </button>
                        </div>
                        <p className="text-sm md:text-sm font-medium text-text-primary italic opacity-90">"{insight.strategicPivot}"</p>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-medium text-rose-500/80  px-4 py-3 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                        <AlertCircle size={16} />
                        Risk: {insight.riskFactor}
                    </div>

                    <button 
                        onClick={() => setInsight(null)}
                        className="w-full py-3 bg-surface-main/80  border border-border-strong shadow-inner hover:border-text-muted hover:text-text-primary rounded-xl text-sm font-medium  text-text-muted transition-all active:scale-[0.98]"
                    >
                        Reset Analysis
                    </button>
                </div>
            )}

            {!insight && !loading && sales.length === 0 && (
                <div className="py-16 text-center opacity-40 relative z-10 flex flex-col items-center">
                    <TrendingUp size={48} className="mb-4 text-text-muted drop-shadow-sm" />
                    <p className="text-sm font-medium  tracking-[0.3em] text-text-muted">Awaiting Transaction Data</p>
                </div>
            )}
        </Card>
    );
};

