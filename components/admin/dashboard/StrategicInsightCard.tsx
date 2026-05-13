
import React, { useState } from 'react';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, Megaphone, History } from 'lucide-react';
import { Card } from '../../ui/Base';
import { db } from '../../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../../lib/firebaseUtils';
import { Sale, User, Note } from '../../../types';
import { GoogleGenAI, Type } from "@google/genai";
import { addDoc, collection } from 'firebase/firestore';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface StrategicInsightCardProps {
    sales: Sale[];
    users: User[];
    notes: Note[];
    serverId: string;
}

export const StrategicInsightCard: React.FC<StrategicInsightCardProps> = ({ sales, users, notes, serverId }) => {
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

            const response = await ai.models.generateContent({
                model: "gemini-1.5-flash",
                contents: `
                    Act as a Senior CRM Data Scientist. Analyze this high-density snapshot of sales and interaction data.
                    
                    Data Snapshot:
                    ${JSON.stringify(dataSummary)}
                    
                    Evaluation Parameters:
                    1. Health Score (0-100) based on revenue, resolution speed, and retention.
                    2. 3 Key Findings: Focus on bottlenecks in resolution or retention opportunities.
                    3. Strategic Pivot: One high-impact move (e.g. "Focus on re-engagement for LTV growth").
                    4. Risk Factor: Identify the most dangerous trend (e.g. "Response times are exceeding 30 mins").
                `,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            healthScore: { type: Type.NUMBER },
                            keyFindings: { type: Type.ARRAY, items: { type: Type.STRING } },
                            strategicPivot: { type: Type.STRING },
                            riskFactor: { type: Type.STRING }
                        },
                        required: ['healthScore', 'keyFindings', 'strategicPivot', 'riskFactor']
                    }
                }
            });

            if (response.text) {
                setInsight(JSON.parse(response.text.trim()));
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
        const path = `servers/${serverId}/channels/war-room/messages`;
        try {
            await addDoc(collection(db, path), {
                senderId: 'SYSTEM_INTEL',
                senderName: 'STRATEGIC INTEL',
                text: `🚀 SYSTEM ALERT: ${insight.strategicPivot}\n\nKey Findings:\n${insight.keyFindings.map((f: string) => `• ${f}`).join('\n')}`,
                createdAt: Date.now(),
                type: 'alert'
            });
            alert("Strategic Insight Broadcast to War Room");
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, path);
        } finally {
            setIsBroadcasting(false);
        }
    };


    return (
        <Card variant="panel" className="p-4 space-y-4 bg-gradient-to-br from-surface-main to-surface-alt border-border-subtle shadow-xl relative overflow-hidden group">
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-accent-primary/10 rounded-xl text-accent-primary">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-text-primary">Strategic Intelligence</h3>
                        <p className="text-[9px] font-bold text-text-muted uppercase">Real-time pipeline analysis</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setShowHistory(!showHistory)}
                        className="p-1.5 text-text-muted hover:text-text-primary transition-colors"
                        title="View History"
                    >
                        <History size={14} />
                    </button>
                    {!insight && !loading && (
                        <button 
                            onClick={generateInsights}
                            className="px-3 py-1.5 bg-text-primary text-surface-main rounded-lg text-[9px] font-black uppercase tracking-widest hover:brightness-110 transition-all active:scale-95"
                        >
                            Generate Report
                        </button>
                    )}
                </div>
            </div>

            {loading && (
                <div className="py-8 text-center space-y-3 animate-pulse">
                    <TrendingUp size={32} className="mx-auto text-accent-primary animate-bounce" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary">Scanning Sales Ledger...</p>
                </div>
            )}

            {insight && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 relative z-10">
                    <div className="flex items-center justify-between bg-surface-main/50 p-4 rounded-2xl border border-border-subtle">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-wider">Health Score</p>
                            <p className={`text-3xl font-black ${insight.healthScore > 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {insight.healthScore}%
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-full border-4 border-surface-highlight flex items-center justify-center relative">
                            <div 
                                className={`absolute inset-0 rounded-full border-4 border-t-transparent ${insight.healthScore > 70 ? 'border-emerald-500' : 'border-amber-500'}`}
                                style={{ transform: `rotate(${insight.healthScore * 3.6}deg)` }}
                            ></div>
                            <CheckCircle2 size={16} className={insight.healthScore > 70 ? 'text-emerald-500' : 'text-amber-500'} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                             Key Performance Indicators
                        </p>
                        <div className="space-y-2">
                            {insight.keyFindings.map((f: string, i: number) => (
                                <div key={i} className="flex gap-2 p-2.5 bg-surface-main/30 border border-border-subtle/50 rounded-xl group-hover:border-accent-primary/20 transition-colors">
                                    <div className="w-1 h-1 bg-accent-primary rounded-full mt-1.5 shrink-0"></div>
                                    <p className="text-[10px] font-medium text-text-secondary leading-relaxed">{f}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-3.5 bg-accent-primary/5 border border-accent-primary/10 rounded-2xl">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-[9px] font-black text-accent-primary uppercase tracking-widest">Strategic Pivot</p>
                            <button 
                                onClick={broadcastToWarRoom}
                                disabled={isBroadcasting}
                                className="flex items-center gap-1.5 text-[8px] font-black uppercase text-accent-primary hover:brightness-110 disabled:opacity-50"
                            >
                                <Megaphone size={10} />
                                Broadcast
                            </button>
                        </div>
                        <p className="text-[10px] font-bold text-text-primary italic">"{insight.strategicPivot}"</p>
                    </div>

                    <div className="flex items-center gap-2 text-[9px] font-black text-red-500/60 uppercase group-hover:text-red-500 transition-colors">
                        <AlertCircle size={12} />
                        Risk: {insight.riskFactor}
                    </div>

                    <button 
                        onClick={() => setInsight(null)}
                        className="w-full py-2 border border-border-subtle rounded-xl text-[8px] font-black uppercase text-text-muted hover:text-text-primary transition-all"
                    >
                        Reset Analysis
                    </button>
                </div>
            )}

            {!insight && !loading && sales.length === 0 && (
                <div className="py-12 text-center opacity-30">
                    <TrendingUp size={48} className="mx-auto mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest">Awaiting Transaction Data</p>
                </div>
            )}
        </Card>
    );
};

