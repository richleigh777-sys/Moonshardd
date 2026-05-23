
import React, { useState } from 'react';
import { 
    Crown, ShieldCheck, Zap, Star, Target, Package,
    ChevronDown, Truck
} from 'lucide-react';

// --- PODIUM COMPONENT ---
export const Podium = React.memo(({ top3 }: { top3: any[] }) => {
    // Ensure 3 slots for visual layout
    const slots = [top3[1], top3[0], top3[2]]; 

    return (
        <div className="relative w-full flex justify-center items-end h-[280px] lg:h-full pt-8 pb-4 border-b border-border-strong bg-surface-main/30 backdrop-blur-xl rounded-3xl overflow-hidden shadow-panel">
            {/* Holographic Floor */}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 via-transparent to-transparent pointer-events-none z-0"></div>
            <div className="absolute bottom-0 w-full h-px bg-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.8)] z-10"></div>
            
            <div className="flex items-end justify-center gap-2 md:gap-6 w-full max-w-3xl relative z-10 px-2">
                {/* 2nd Place */}
                <PodiumStep rank={2} agent={slots[0]} color="cyan" delay={100} height="h-24 md:h-28" />
                {/* 1st Place */}
                <PodiumStep rank={1} agent={slots[1]} color="emerald" delay={0} height="h-32 md:h-36" isWinner />
                {/* 3rd Place */}
                <PodiumStep rank={3} agent={slots[2]} color="amber" delay={200} height="h-16 md:h-20" />
            </div>
        </div>
    );
});

const PodiumStep = ({ rank, agent, color, delay, height, isWinner }: any) => {
    if (!agent) {
        return <div className={`${height} w-1/3 max-w-[200px] bg-surface-highlight border border-border-subtle rounded-t-2xl mt-auto opacity-20 flex items-center justify-center font-mono text-4xl text-text-muted`}>{rank}</div>;
    }

    const textColors: Record<string, string> = { cyan: 'text-cyan-500', emerald: 'text-status-success', amber: 'text-status-warning' };
    const borderColors: Record<string, string> = { cyan: 'border-cyan-500/50', emerald: 'border-status-success/50', amber: 'border-amber-500/50' };
    const bgColors: Record<string, string> = { cyan: 'bg-cyan-500/10', emerald: 'bg-emerald-500/10', amber: 'bg-amber-500/10' };
    const glowColors: Record<string, string> = { cyan: 'shadow-[0_0_30px_rgba(6,182,212,0.3)]', emerald: 'shadow-[0_0_30px_rgba(16,185,129,0.3)]', amber: 'shadow-[0_0_30px_rgba(245,158,11,0.3)]' };

    return (
        <div className={`flex flex-col items-center w-1/3 max-w-[160px] animate-in slide-in-from-bottom-8 duration-700 fill-mode-backwards group relative ${isWinner ? 'z-20 -mx-2' : 'z-10'}`} style={{ animationDelay: `${delay}ms` }}>
            {isWinner && <div className="absolute -top-12 text-status-success drop-shadow-[0_0_20px_rgba(16,185,129,1)] animate-bounce"><Crown size={36} fill="currentColor"/></div>}
            
            <div className="relative mb-3 transform scale-90 md:scale-100 transition-transform group-hover:scale-105">
                <div className={`relative w-12 h-12 md:w-16 md:h-16 rounded-2xl border ${borderColors[color]} ${bgColors[color]} p-1 ${glowColors[color]} backdrop-blur-md`}>
                    <img src={agent.avatar} className="w-full h-full rounded-xl object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="" />
                    {/* Corner Accents */}
                    <div className={`absolute -top-1.5 -left-1.5 w-2 h-2 border-t-2 border-l-2 ${borderColors[color]}`}></div>
                    <div className={`absolute -top-1.5 -right-1.5 w-2 h-2 border-t-2 border-r-2 ${borderColors[color]}`}></div>
                    <div className={`absolute -bottom-1.5 -left-1.5 w-2 h-2 border-b-2 border-l-2 ${borderColors[color]}`}></div>
                    <div className={`absolute -bottom-1.5 -right-1.5 w-2 h-2 border-b-2 border-r-2 ${borderColors[color]}`}></div>
                </div>
                
                <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 bg-surface-main text-text-primary w-6 h-6 rounded-lg flex items-center justify-center font-mono font-[700] text-xs border border-border-strong shadow-lg ring-1 ring-white/10`}>
                    {rank}
                </div>
            </div>
            
            <div className="flex flex-col items-center text-center w-full relative z-20 mb-2">
                <p className={`text-[9px] md:text-[10px] font-[700]  font-mono ${textColors[color]} mb-0.5 truncate w-full tracking-widest px-1`}>{agent.agentName}</p>
                <div className={`bg-surface-main/80 backdrop-blur-md border border-border-strong px-2 py-1 rounded-lg shadow-lg ring-1 ring-white/5`}>
                    <p className={`text-[10px] md:text-xs font-[700] font-display tracking-tight ${textColors[color]}`}>${(agent.totalRevenue / 1000).toFixed(1)}k</p>
                </div>
            </div>
            
            {/* Pillar */}
            <div className={`${height} w-full ${bgColors[color]} mt-auto rounded-t-3xl border-x border-t ${borderColors[color]} relative overflow-hidden backdrop-blur-md group-hover:opacity-100 opacity-80 transition-opacity ring-1 ring-white/5`}>
                <div className="absolute inset-0 bg-[linear-gradient(transparent_2px,rgba(0,0,0,0.5)_2px)] bg-[size:100%_4px]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 text-5xl font-[700] font-display opacity-30 ${textColors[color]}`}>{rank}</div>
            </div>
        </div>
    );
};

// --- RANKINGS LIST COMPONENT ---
export const RankingsList = React.memo(({ data, currentUserName }: { data: any[], currentUserName: string, onChat?: (id: string) => void }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface-alt/40 rounded-lg border border-border-subtle p-2 shadow-inner h-full">
            <div className="space-y-1">
                {data.slice(3).map((item, idx) => {
                    const isMe = item.agentName === currentUserName;
                    const rank = idx + 4;
                    const isExpanded = expandedId === item.agentId;
                    
                    return (
                        <div key={item.agentId} className="flex flex-col transition-all duration-300">
                            <div 
                                onClick={() => setExpandedId(isExpanded ? null : item.agentId)}
                                className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-all group ${isMe ? 'bg-accent-primary/5 border-accent-primary/20' : isExpanded ? 'bg-surface-highlight border-border-subtle' : 'bg-surface-main border-border-subtle hover:border-accent-primary/30 hover:bg-surface-highlight'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 flex items-center justify-center font-mono font-bold text-xs rounded bg-surface-alt text-text-muted border border-border-subtle">
                                        #{rank.toString().padStart(2, '0')}
                                    </div>
                                    <div className="relative">
                                        <img src={item.avatar} alt="" className="w-8 h-8 rounded bg-surface-alt object-cover border border-border-subtle grayscale-[0.5] group-hover:grayscale-0 transition-all"/>
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-surface-main ${item.status === 'online' ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]' : 'bg-text-muted/40'}`}></div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-xs font-bold font-mono tracking-wide ${isMe ? 'text-status-success' : 'text-text-primary'}`}>{item.agentName}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-text-muted  tracking-wider font-bold font-mono flex items-center gap-1"><ShieldCheck size={16}/> {item.team}</span>
                                            {item.totalRevenue > 10000 && (
                                                <span className="px-1 py-0.5 bg-amber-500/10 text-status-warning rounded-[2px] text-sm font-bold  tracking-wider border border-amber-500/20 flex items-center gap-1">
                                                    <Star size={16} fill="currentColor"/> ELITE
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-6 pr-2">
                                    <div className="text-right min-w-[100px]">
                                        <p className="text-sm font-bold text-text-muted  tracking-widest mb-0.5 font-mono">YIELD</p>
                                        <p className="text-sm font-bold font-mono text-text-primary group-hover:text-accent-primary transition-colors">${item.totalRevenue.toLocaleString()}</p>
                                    </div>
                                    <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                        <ChevronDown size={16} className="text-text-muted group-hover:text-text-primary" />
                                    </div>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="mx-2 bg-surface-alt/60 border-x border-b border-border-subtle rounded-b p-3 animate-in slide-in-from-top-2">
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-surface-main p-2 rounded border border-border-subtle">
                                            <p className="text-sm font-bold  text-text-muted mb-2 font-mono tracking-wider">METRICS</p>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs font-mono font-bold text-text-secondary"><span>DEALS</span> <span>{item.dealCount}</span></div>
                                                <div className="flex justify-between text-xs font-mono font-bold text-text-secondary"><span>WIN_RATE</span> <span className="text-status-warning">{item.winRate}%</span></div>
                                            </div>
                                        </div>
                                        <div className="bg-surface-main p-2 rounded border border-border-subtle">
                                            <p className="text-sm font-bold  text-text-muted mb-2 font-mono tracking-wider">TOP_PRODUCTS</p>
                                            <div className="flex flex-wrap gap-1">
                                                {Object.entries(item.approvedSales.reduce((acc: any, curr: any) => {
                                                    const p = curr.product.split('+')[0].trim();
                                                    acc[p] = (acc[p] || 0) + 1;
                                                    return acc;
                                                }, {})).slice(0, 3).map(([prod]: any) => (
                                                    <span key={prod} className="px-3 py-1.5 bg-surface-alt rounded-[2px] text-sm font-mono text-text-muted border border-border-subtle flex items-center gap-1">
                                                        <Package size={16}/> {prod}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-surface-main p-2 rounded border border-border-subtle flex flex-col justify-center items-center">
                                            <p className="text-sm font-bold  text-text-muted mb-1 font-mono tracking-wider">COMMISSION</p>
                                            <p className="text-sm font-bold text-status-success font-mono">${item.totalEarnings.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

// --- BREAKDOWN TABLE COMPONENT ---
export const CycleBreakdown = React.memo(({ data, currentUserName }: { data: any[], currentUserName: string }) => {
    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar h-full p-4 relative">
            <div className="w-full grid gap-2">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-bold  text-text-muted tracking-widest sticky top-0 bg-surface-main/95 backdrop-blur-xl border-b border-border-subtle z-20 font-mono">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-3">OPERATIVE</div>
                    <div className="col-span-3">CYCLE_PERF</div>
                    <div className="col-span-2 text-right">THROUGHPUT</div>
                    <div className="col-span-1 text-right">YIELD</div>
                    <div className="col-span-2 text-right">PAYOUT</div>
                </div>
                
                {data.map((item, idx) => {
                    const isMe = item.agentName === currentUserName;
                    const rank = idx + 1;
                    
                    return (
                        <div key={item.agentId} className={`grid grid-cols-12 gap-2 items-center p-3 rounded border transition-all duration-300 group hover:bg-surface-highlight ${isMe ? 'bg-accent-primary/5 border-accent-primary/20' : 'bg-surface-main border-border-subtle hover:border-accent-primary/30'}`}>
                            <div className="col-span-1 text-center">
                                <span className={`font-bold text-xs font-mono ${rank <= 3 ? 'text-status-success' : 'text-text-muted'}`}>#{rank.toString().padStart(2, '0')}</span>
                            </div>
                            
                            <div className="col-span-3 flex items-center gap-3">
                                <div className="relative shrink-0">
                                    <img src={item.avatar} alt="" className="w-8 h-8 rounded bg-surface-alt object-cover border border-border-subtle grayscale-[0.5] group-hover:grayscale-0 transition-all"/>
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold truncate font-mono  ${isMe ? 'text-status-success' : 'text-text-primary'}`}>{item.agentName}</span>
                                        {rank === 1 && <Crown size={16} className="text-status-warning fill-current animate-pulse"/>}
                                    </div>
                                    <span className="text-sm text-text-muted  tracking-wider font-bold font-mono flex items-center gap-1">
                                        <ShieldCheck size={16}/> {item.team}
                                    </span>
                                </div>
                            </div>

                            <div className="col-span-3 flex flex-col justify-center gap-1.5">
                                <div className="flex justify-between text-sm font-bold text-text-muted  tracking-wider font-mono">
                                    <span>C1:${(item.revenue1st/1000).toFixed(1)}k</span>
                                    <span>C2:${(item.revenue2nd/1000).toFixed(1)}k</span>
                                </div>
                                <div className="flex h-1.5 w-full bg-surface-alt rounded-sm overflow-hidden gap-px border border-border-subtle">
                                    <div className="h-full bg-blue-500/80" style={{ width: `${(item.revenue1st / (item.totalRevenue || 1)) * 100}%` }}></div>
                                    <div className="h-full bg-indigo-500/80" style={{ width: `${(item.revenue2nd / (item.totalRevenue || 1)) * 100}%` }}></div>
                                </div>
                            </div>

                            <div className="col-span-2 text-right">
                                <div className="text-xs font-bold font-mono text-text-secondary">{item.dealCount} DEALS</div>
                                <div className="text-sm font-mono text-text-muted flex items-center justify-end gap-1"><Target size={16}/> {item.winRate}% WIN</div>
                            </div>

                            <div className="col-span-1 text-right">
                                <span className={`font-bold text-xs font-mono tracking-tight ${rank <= 3 ? 'text-status-success' : 'text-text-secondary'}`}>${(item.totalRevenue / 1000).toFixed(1)}k</span>
                            </div>

                            <div className="col-span-2 text-right pr-2">
                                <span className={`font-bold text-xs font-mono tracking-tight ${isMe ? 'text-status-success' : 'text-text-primary'}`}>
                                    ${item.totalEarnings.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

// --- MANIFEST TABLE COMPONENT ---
export const LedgerManifest = React.memo(({ data, currentUserName }: { data: any[], currentUserName: string }) => {
    // Flatten all sales from all agents into a single list for the ledger view
    const manifestRows = React.useMemo(() => {
        const rows: any[] = [];
        data.forEach(agent => {
            if (agent.manifest) {
                rows.push(...agent.manifest.map((m: any) => ({ ...m, agentName: agent.agentName, agentAvatar: agent.avatar })));
            }
        });
        return rows.sort((a, b) => b.timestamp - a.timestamp);
    }, [data]);

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar h-full p-4 relative">
            <div className="min-w-full inline-block align-middle">
                <div className="border border-border-subtle rounded-lg overflow-hidden relative bg-surface-main">
                    <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                        <table className="min-w-full divide-y divide-border-subtle relative">
                            <thead className="bg-surface-alt/90 backdrop-blur-md sticky top-0 z-20">
                                <tr>
                                    <th scope="col" className="py-3 pl-4 pr-2 text-left text-xs font-bold  tracking-widest text-text-muted font-mono">TIMESTAMP</th>
                                    <th scope="col" className="px-2 py-3 text-left text-xs font-bold  tracking-widest text-text-muted font-mono">AGENT</th>
                                    <th scope="col" className="px-2 py-3 text-left text-xs font-bold  tracking-widest text-text-muted font-mono">CLIENT_REF</th>
                                    <th scope="col" className="px-2 py-3 text-center text-xs font-bold  tracking-widest text-text-muted font-mono">SHIFT</th>
                                    <th scope="col" className="px-2 py-3 text-right text-xs font-bold  tracking-widest text-text-muted font-mono">BASE</th>
                                    <th scope="col" className="px-2 py-3 text-right text-xs font-bold  tracking-widest text-text-muted font-mono">BONUS</th>
                                    <th scope="col" className="py-3 pl-2 pr-4 text-right text-xs font-bold  tracking-widest text-text-muted font-mono">CREDIT</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle/50 bg-surface-main">
                                {manifestRows.length === 0 ? (
                                    <tr><td colSpan={7} className="p-12 text-center text-text-muted font-mono text-xs  tracking-widest">Awaiting Data Stream...</td></tr>
                                ) : manifestRows.map(row => {
                                    const isMe = row.agentName === currentUserName;
                                    return (
                                        <tr key={row.id} className={`hover:bg-surface-highlight transition-colors ${isMe ? 'bg-accent-primary/5' : ''}`}>
                                            <td className="whitespace-nowrap py-3 pl-4 pr-2 text-xs font-mono text-text-muted">
                                                <span className="block text-text-secondary font-bold">{new Date(row.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                                <span className="text-sm opacity-50">{new Date(row.timestamp).toLocaleDateString()}</span>
                                            </td>
                                            <td className="whitespace-nowrap px-2 py-3 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <img src={row.agentAvatar} className="w-5 h-5 rounded bg-surface-alt object-cover border border-border-subtle grayscale-[0.5]" alt=""/>
                                                    <span className={`font-bold font-mono  ${isMe ? 'text-status-success' : 'text-text-muted'}`}>{row.agentName}</span>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-2 py-3 text-xs">
                                                <div className="font-bold text-text-secondary  tracking-tight font-mono">{row.customer}</div>
                                                <div className="text-sm text-text-muted font-bold  mt-0.5 flex items-center gap-1 font-mono">
                                                    <Truck size={16} className="text-text-muted/60"/> {row.trackingId ? 'SHIPPED' : 'PENDING'}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-2 py-3 text-xs text-center">
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-[2px] text-xs font-mono font-bold bg-surface-alt border border-border-subtle text-text-muted">
                                                    {row.hours.toFixed(1)}H
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-2 py-3 text-xs text-right font-mono font-bold text-text-muted">
                                                ${Number(row.amount).toLocaleString()}
                                            </td>
                                            <td className="whitespace-nowrap px-2 py-3 text-xs text-right">
                                                {row.payout.spiff > 0 ? (
                                                    <span className="text-status-warning font-bold font-mono flex items-center justify-end gap-1"><Zap size={16} fill="currentColor"/> +${row.payout.spiff}</span>
                                                ) : <span className="text-text-muted/20">-</span>}
                                            </td>
                                            <td className="whitespace-nowrap py-3 pl-2 pr-4 text-xs text-right font-bold font-mono text-status-success">
                                                ${row.payout.net.toFixed(2)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
});
