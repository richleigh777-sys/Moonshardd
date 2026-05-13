
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
        <div className="relative w-full flex justify-center items-end h-[480px] pt-12 pb-4 border-b border-border-subtle bg-surface-alt/40">
            {/* Holographic Floor */}
            <div className="absolute bottom-0 w-full h-24 bg-[linear-gradient(to_top,rgba(16,185,129,0.1)_0%,transparent_100%)] pointer-events-none"></div>
            <div className="absolute bottom-0 w-full h-px bg-accent-primary/30 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
            
            <div className="flex items-end justify-center gap-4 md:gap-8 w-full max-w-4xl relative z-10 px-4">
                {/* 2nd Place */}
                <PodiumStep rank={2} agent={slots[0]} color="cyan" delay={100} height="h-32 md:h-40" />
                {/* 1st Place */}
                <PodiumStep rank={1} agent={slots[1]} color="emerald" delay={0} height="h-40 md:h-52" isWinner />
                {/* 3rd Place */}
                <PodiumStep rank={3} agent={slots[2]} color="amber" delay={200} height="h-24 md:h-32" />
            </div>
        </div>
    );
});

const PodiumStep = ({ rank, agent, color, delay, height, isWinner }: any) => {
    if (!agent) {
        return <div className={`${height} w-1/3 max-w-[200px] bg-surface-highlight border border-border-subtle rounded-t-lg mt-auto opacity-20 flex items-center justify-center font-mono text-4xl text-text-muted`}>{rank}</div>;
    }

    const textColors: Record<string, string> = { cyan: 'text-cyan-500', emerald: 'text-emerald-500', amber: 'text-amber-500' };
    const borderColors: Record<string, string> = { cyan: 'border-cyan-500/50', emerald: 'border-emerald-500/50', amber: 'border-amber-500/50' };
    const bgColors: Record<string, string> = { cyan: 'bg-cyan-500/10', emerald: 'bg-emerald-500/10', amber: 'bg-amber-500/10' };
    const glowColors: Record<string, string> = { cyan: 'shadow-cyan-500/20', emerald: 'shadow-emerald-500/20', amber: 'shadow-amber-500/20' };

    return (
        <div className={`flex flex-col items-center w-1/3 max-w-[200px] animate-in slide-in-from-bottom-8 duration-700 fill-mode-backwards group relative ${isWinner ? 'z-20 -mx-2' : 'z-10'}`} style={{ animationDelay: `${delay}ms` }}>
            {isWinner && <div className="absolute -top-20 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-bounce"><Crown size={40} fill="currentColor"/></div>}
            
            <div className="relative mb-4 transform scale-90 md:scale-100 transition-transform group-hover:scale-105">
                <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 ${borderColors[color]} ${bgColors[color]} p-0.5 shadow-[0_0_20px_rgba(0,0,0,0.5)] ${glowColors[color]}`}>
                    <img src={agent.avatar} className="w-full h-full rounded-md object-cover opacity-90 hover:opacity-100 transition-opacity" alt="" />
                    {/* Corner Accents */}
                    <div className={`absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 ${borderColors[color]}`}></div>
                    <div className={`absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 ${borderColors[color]}`}></div>
                    <div className={`absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 ${borderColors[color]}`}></div>
                    <div className={`absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 ${borderColors[color]}`}></div>
                </div>
                
                <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 bg-surface-main text-text-primary w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-xs border border-border-subtle shadow-lg`}>
                    {rank}
                </div>
            </div>
            
            <div className="flex flex-col items-center text-center w-full relative z-20 mb-2">
                <p className={`text-[10px] md:text-xs font-bold uppercase font-mono ${textColors[color]} mb-1 truncate w-full tracking-wider px-1`}>{agent.agentName}</p>
                <div className={`bg-surface-main/80 backdrop-blur border border-border-subtle px-2 py-0.5 rounded shadow-lg`}>
                    <p className={`text-xs md:text-sm font-bold font-mono ${textColors[color]}`}>${(agent.totalRevenue / 1000).toFixed(1)}k</p>
                </div>
            </div>
            
            {/* Pillar */}
            <div className={`${height} w-full ${bgColors[color]} mt-auto rounded-t-lg border-x border-t ${borderColors[color]} relative overflow-hidden backdrop-blur-sm group-hover:opacity-100 opacity-80 transition-opacity`}>
                <div className="absolute inset-0 bg-[linear-gradient(transparent_2px,rgba(0,0,0,0.3)_2px)] bg-[size:100%_4px]"></div>
                <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-4xl font-black font-mono opacity-20 ${textColors[color]}`}>{rank}</div>
            </div>
        </div>
    );
};

// --- RANKINGS LIST COMPONENT ---
export const RankingsList = React.memo(({ data, currentUserName }: { data: any[], currentUserName: string, onChat?: (id: string) => void }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface-alt/40 rounded-lg border border-border-subtle p-2 shadow-inner">
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
                                        <span className={`text-xs font-bold font-mono tracking-wide ${isMe ? 'text-emerald-500' : 'text-text-primary'}`}>{item.agentName}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] text-text-muted uppercase tracking-wider font-bold font-mono flex items-center gap-1"><ShieldCheck size={8}/> {item.team}</span>
                                            {item.totalRevenue > 10000 && (
                                                <span className="px-1 py-0.5 bg-amber-500/10 text-amber-500 rounded-[2px] text-[8px] font-bold uppercase tracking-wider border border-amber-500/20 flex items-center gap-1">
                                                    <Star size={8} fill="currentColor"/> ELITE
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-6 pr-2">
                                    <div className="text-right min-w-[100px]">
                                        <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest mb-0.5 font-mono">YIELD</p>
                                        <p className="text-sm font-bold font-mono text-text-primary group-hover:text-accent-primary transition-colors">${item.totalRevenue.toLocaleString()}</p>
                                    </div>
                                    <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                        <ChevronDown size={14} className="text-text-muted group-hover:text-text-primary" />
                                    </div>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="mx-2 bg-surface-alt/60 border-x border-b border-border-subtle rounded-b p-3 animate-in slide-in-from-top-2">
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-surface-main p-2 rounded border border-border-subtle">
                                            <p className="text-[8px] font-bold uppercase text-text-muted mb-2 font-mono tracking-wider">METRICS</p>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px] font-mono font-bold text-text-secondary"><span>DEALS</span> <span>{item.dealCount}</span></div>
                                                <div className="flex justify-between text-[10px] font-mono font-bold text-text-secondary"><span>WIN_RATE</span> <span className="text-amber-500">{item.winRate}%</span></div>
                                            </div>
                                        </div>
                                        <div className="bg-surface-main p-2 rounded border border-border-subtle">
                                            <p className="text-[8px] font-bold uppercase text-text-muted mb-2 font-mono tracking-wider">TOP_PRODUCTS</p>
                                            <div className="flex flex-wrap gap-1">
                                                {Object.entries(item.approvedSales.reduce((acc: any, curr: any) => {
                                                    const p = curr.product.split('+')[0].trim();
                                                    acc[p] = (acc[p] || 0) + 1;
                                                    return acc;
                                                }, {})).slice(0, 3).map(([prod]: any) => (
                                                    <span key={prod} className="px-1.5 py-0.5 bg-surface-alt rounded-[2px] text-[8px] font-mono text-text-muted border border-border-subtle flex items-center gap-1">
                                                        <Package size={8}/> {prod}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-surface-main p-2 rounded border border-border-subtle flex flex-col justify-center items-center">
                                            <p className="text-[8px] font-bold uppercase text-text-muted mb-1 font-mono tracking-wider">COMMISSION</p>
                                            <p className="text-sm font-bold text-emerald-500 font-mono">${item.totalEarnings.toLocaleString()}</p>
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
                <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[9px] font-bold uppercase text-text-muted tracking-widest sticky top-0 bg-surface-main/95 backdrop-blur-xl border-b border-border-subtle z-20 font-mono">
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
                                <span className={`font-bold text-xs font-mono ${rank <= 3 ? 'text-emerald-500' : 'text-text-muted'}`}>#{rank.toString().padStart(2, '0')}</span>
                            </div>
                            
                            <div className="col-span-3 flex items-center gap-3">
                                <div className="relative shrink-0">
                                    <img src={item.avatar} alt="" className="w-8 h-8 rounded bg-surface-alt object-cover border border-border-subtle grayscale-[0.5] group-hover:grayscale-0 transition-all"/>
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold truncate font-mono uppercase ${isMe ? 'text-emerald-500' : 'text-text-primary'}`}>{item.agentName}</span>
                                        {rank === 1 && <Crown size={10} className="text-amber-500 fill-current animate-pulse"/>}
                                    </div>
                                    <span className="text-[8px] text-text-muted uppercase tracking-wider font-bold font-mono flex items-center gap-1">
                                        <ShieldCheck size={8}/> {item.team}
                                    </span>
                                </div>
                            </div>

                            <div className="col-span-3 flex flex-col justify-center gap-1.5">
                                <div className="flex justify-between text-[8px] font-bold text-text-muted uppercase tracking-wider font-mono">
                                    <span>C1:${(item.revenue1st/1000).toFixed(1)}k</span>
                                    <span>C2:${(item.revenue2nd/1000).toFixed(1)}k</span>
                                </div>
                                <div className="flex h-1.5 w-full bg-surface-alt rounded-sm overflow-hidden gap-px border border-border-subtle">
                                    <div className="h-full bg-blue-500/80" style={{ width: `${(item.revenue1st / (item.totalRevenue || 1)) * 100}%` }}></div>
                                    <div className="h-full bg-indigo-500/80" style={{ width: `${(item.revenue2nd / (item.totalRevenue || 1)) * 100}%` }}></div>
                                </div>
                            </div>

                            <div className="col-span-2 text-right">
                                <div className="text-[10px] font-bold font-mono text-text-secondary">{item.dealCount} DEALS</div>
                                <div className="text-[8px] font-mono text-text-muted flex items-center justify-end gap-1"><Target size={8}/> {item.winRate}% WIN</div>
                            </div>

                            <div className="col-span-1 text-right">
                                <span className={`font-bold text-[10px] font-mono tracking-tight ${rank <= 3 ? 'text-emerald-500' : 'text-text-secondary'}`}>${(item.totalRevenue / 1000).toFixed(1)}k</span>
                            </div>

                            <div className="col-span-2 text-right pr-2">
                                <span className={`font-bold text-xs font-mono tracking-tight ${isMe ? 'text-emerald-500' : 'text-text-primary'}`}>
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
                                    <th scope="col" className="py-3 pl-4 pr-2 text-left text-[9px] font-bold uppercase tracking-widest text-text-muted font-mono">TIMESTAMP</th>
                                    <th scope="col" className="px-2 py-3 text-left text-[9px] font-bold uppercase tracking-widest text-text-muted font-mono">AGENT</th>
                                    <th scope="col" className="px-2 py-3 text-left text-[9px] font-bold uppercase tracking-widest text-text-muted font-mono">CLIENT_REF</th>
                                    <th scope="col" className="px-2 py-3 text-center text-[9px] font-bold uppercase tracking-widest text-text-muted font-mono">SHIFT</th>
                                    <th scope="col" className="px-2 py-3 text-right text-[9px] font-bold uppercase tracking-widest text-text-muted font-mono">BASE</th>
                                    <th scope="col" className="px-2 py-3 text-right text-[9px] font-bold uppercase tracking-widest text-text-muted font-mono">BONUS</th>
                                    <th scope="col" className="py-3 pl-2 pr-4 text-right text-[9px] font-bold uppercase tracking-widest text-text-muted font-mono">CREDIT</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle/50 bg-surface-main">
                                {manifestRows.length === 0 ? (
                                    <tr><td colSpan={7} className="p-12 text-center text-text-muted font-mono text-xs uppercase tracking-widest">Awaiting Data Stream...</td></tr>
                                ) : manifestRows.map(row => {
                                    const isMe = row.agentName === currentUserName;
                                    return (
                                        <tr key={row.id} className={`hover:bg-surface-highlight transition-colors ${isMe ? 'bg-accent-primary/5' : ''}`}>
                                            <td className="whitespace-nowrap py-3 pl-4 pr-2 text-[10px] font-mono text-text-muted">
                                                <span className="block text-text-secondary font-bold">{new Date(row.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                                <span className="text-[8px] opacity-50">{new Date(row.timestamp).toLocaleDateString()}</span>
                                            </td>
                                            <td className="whitespace-nowrap px-2 py-3 text-[10px]">
                                                <div className="flex items-center gap-2">
                                                    <img src={row.agentAvatar} className="w-5 h-5 rounded bg-surface-alt object-cover border border-border-subtle grayscale-[0.5]" alt=""/>
                                                    <span className={`font-bold font-mono uppercase ${isMe ? 'text-emerald-500' : 'text-text-muted'}`}>{row.agentName}</span>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-2 py-3 text-[10px]">
                                                <div className="font-bold text-text-secondary uppercase tracking-tight font-mono">{row.customer}</div>
                                                <div className="text-[8px] text-text-muted font-bold uppercase mt-0.5 flex items-center gap-1 font-mono">
                                                    <Truck size={8} className="text-text-muted/60"/> {row.trackingId ? 'SHIPPED' : 'PENDING'}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-2 py-3 text-[10px] text-center">
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-[2px] text-[9px] font-mono font-bold bg-surface-alt border border-border-subtle text-text-muted">
                                                    {row.hours.toFixed(1)}H
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-2 py-3 text-[10px] text-right font-mono font-bold text-text-muted">
                                                ${Number(row.amount).toLocaleString()}
                                            </td>
                                            <td className="whitespace-nowrap px-2 py-3 text-[10px] text-right">
                                                {row.payout.spiff > 0 ? (
                                                    <span className="text-amber-500 font-bold font-mono flex items-center justify-end gap-1"><Zap size={8} fill="currentColor"/> +${row.payout.spiff}</span>
                                                ) : <span className="text-text-muted/20">-</span>}
                                            </td>
                                            <td className="whitespace-nowrap py-3 pl-2 pr-4 text-[10px] text-right font-bold font-mono text-emerald-500">
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
