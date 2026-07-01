const fs = require('fs');
const content = `    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-white/60 backdrop-blur-2xl border border-white/60 rounded-[32px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between relative overflow-hidden group transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl transition-transform group-hover:scale-125 duration-700 pointer-events-none"></div>
                <div className="flex items-start justify-between mb-4">
                    <p className="text-sm font-bold text-text-secondary tracking-wide">Today's Awesome Wins</p>
                    <div className="bg-emerald-500/10 p-2.5 rounded-2xl text-emerald-500 shadow-sm">
                        <DollarSign className="w-5 h-5" />
                    </div>
                </div>
                <div className="flex items-baseline gap-2 relative z-10">
                    <h3 className="text-4xl font-extrabold text-text-primary tracking-tight">
                        ${`\${metrics.salesVolume.toLocaleString()}`}
                    </h3>
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full animate-in fade-in zoom-in">So Far!</span>
                </div>
                <p className="text-sm font-medium text-text-muted mt-3">{metrics.salesCount} deals successfully closed. Great job!</p>
            </div>

            <div className="bg-white/60 backdrop-blur-2xl border border-white/60 rounded-[32px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between relative overflow-hidden group transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl transition-transform group-hover:scale-125 duration-700 pointer-events-none"></div>
                <div className="flex items-start justify-between mb-4">
                    <p className="text-sm font-bold text-text-secondary tracking-wide">People We're Helping</p>
                    <div className="bg-blue-500/10 p-2.5 rounded-2xl text-blue-500 shadow-sm">
                        <Users className="w-5 h-5" />
                    </div>
                </div>
                <div className="flex items-baseline gap-2 relative z-10">
                    <h3 className="text-4xl font-extrabold text-text-primary tracking-tight">
                        {metrics.activeLeads.toLocaleString()}
                    </h3>
                    <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full">Active</span>
                </div>
                <p className="text-sm font-medium text-text-muted mt-3">Live connection to the database. Always fresh.</p>
            </div>

            <div className="bg-white/60 backdrop-blur-2xl border border-white/60 rounded-[32px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between relative overflow-hidden group transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 sm:col-span-2 lg:col-span-2">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl transition-transform group-hover:scale-125 duration-700 pointer-events-none"></div>
                <div className="flex items-start justify-between mb-4">
                    <p className="text-sm font-bold text-text-secondary tracking-wide">Journey Snapshot</p>
                    <div className="bg-purple-500/10 px-3 py-2 rounded-2xl text-purple-500 shadow-sm flex items-center gap-2 font-bold text-xs">
                        <Target className="w-4 h-4" /> Live Stages
                    </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-end relative z-10 mt-2">
                    <div className="flex w-full h-4 bg-surface-alt rounded-full overflow-hidden shadow-inner border border-border-subtle">
                        <div 
                            className="bg-blue-400 h-full transition-all duration-1000 ease-out" 
                            style={{ width: \`\${(metrics.pipeline.prospecting / (metrics.pipeline.prospecting + metrics.pipeline.negotiation + metrics.pipeline.closed + 0.1)) * 100}%\` }}
                            title={\`Prospecting: \${metrics.pipeline.prospecting}\`}
                        />
                        <div 
                            className="bg-purple-400 h-full transition-all duration-1000 ease-out" 
                            style={{ width: \`\${(metrics.pipeline.negotiation / (metrics.pipeline.prospecting + metrics.pipeline.negotiation + metrics.pipeline.closed + 0.1)) * 100}%\` }}
                            title={\`Negotiation: \${metrics.pipeline.negotiation}\`}
                        />
                        <div 
                            className="bg-emerald-400 h-full transition-all duration-1000 ease-out relative" 
                            style={{ width: \`\${(metrics.pipeline.closed / (metrics.pipeline.prospecting + metrics.pipeline.negotiation + metrics.pipeline.closed + 0.1)) * 100}%\` }}
                            title={\`Closed: \${metrics.pipeline.closed}\`}
                        >
                             <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/30 to-transparent animate-pulse"></div>
                        </div>
                    </div>
                    
                    <div className="flex justify-between mt-3 text-xs font-bold text-text-muted">
                        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div> Say Hello ({metrics.pipeline.prospecting})</span>
                        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-purple-400"></div> In Talks ({metrics.pipeline.negotiation})</span>
                        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div> Celebrations ({metrics.pipeline.closed})</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
`;

fs.appendFileSync('components/admin/dashboard/DashboardLiveMetrics.tsx', content);
