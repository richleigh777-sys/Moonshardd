const fs = require('fs');
const content = `    return (
    <div className="bg-white/60 backdrop-blur-2xl rounded-[32px] border border-white/60 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] relative flex flex-col min-h-[400px]">
      {/* Internal Toast Overlay */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500/90 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2">
          <Send size={14} />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 relative overflow-hidden shrink-0">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2 bg-white/20 rounded-2xl">
              <AlertTriangle className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Team Needs You</h3>
            <p className="text-sm text-white/80 font-medium">{agentsNeedingSupport.length} {agentsNeedingSupport.length === 1 ? 'teammate needs' : 'teammates need'} a little boost</p>
          </div>
        </div>
      </div>

      {/* Agents List */}
      <div className="divide-y divide-border-subtle flex-1 overflow-y-auto">
        {agentsNeedingSupport.map(({ agent, todaysSales, totalCount, pendingCount, declinedCount, deficit, revenue, performance }) => (
          <div key={agent.id} className="p-4 flex flex-col gap-3 hover:bg-surface-main/80 transition-colors group/item">
            {/* Header Row */}
            <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpandedAgentId(expandedAgentId === agent.id ? null : agent.id)}>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-text-primary">{agent.name}</p>
                  <span className={\`w-2 h-2 rounded-full \${agent.currentStatus === 'online' ? 'bg-status-success animate-pulse' : 'bg-text-muted'}\`}></span>
                </div>
                <p className="text-sm font-medium text-text-muted mt-0.5 flex items-center gap-2">
                  <span>{todaysSales}/5 sales</span>
                  <span className="opacity-30">•</span>
                  <span className="text-emerald-500 font-bold">\${revenue.toLocaleString()} rev</span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-amber-500 leading-none">{deficit}</div>
                <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold mt-1">Short</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-surface-alt rounded-full h-2 overflow-hidden border border-border-subtle shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000 ease-out"
                style={{ width: \`\${Math.min(100, performance)}%\` }}
              />
            </div>

            {/* Suggestion */}
            <div className="bg-surface-main border border-border-subtle rounded-xl p-3 shadow-sm group-hover/item:border-amber-500/30 transition-colors">
              <p className="text-sm font-medium text-text-secondary flex items-start gap-2">
                <Activity size={16} className="text-amber-500 shrink-0 mt-0.5" />
                {getSuggestion(agent, deficit, revenue)}
              </p>
            </div>

            {/* Expanded Stats Section */}
            {expandedAgentId === agent.id && (
              <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-surface-alt rounded-xl p-3 text-center border border-border-subtle">
                    <p className="text-xs font-bold text-text-muted mb-1">Attempts</p>
                    <p className="text-text-primary font-black text-lg">{totalCount}</p>
                  </div>
                  <div className="bg-status-warning/10 rounded-xl p-3 text-center border border-status-warning/20">
                     <p className="text-xs font-bold text-status-warning mb-1">Waiting</p>
                     <p className="text-status-warning font-black text-lg">{pendingCount}</p>
                  </div>
                  <div className="bg-status-error/10 rounded-xl p-3 text-center border border-status-error/20">
                     <p className="text-xs font-bold text-status-error mb-1">Dropped</p>
                     <p className="text-status-error font-black text-lg">{declinedCount}</p>
                  </div>
                </div>
                {declinedCount > pendingCount && (
                  <p className="text-sm font-medium text-status-error bg-status-error/10 p-3 rounded-xl mb-3 border border-status-error/20 flex gap-2 items-start">
                     <AlertTriangle size={16} className="shrink-0 mt-0.5"/>
                     High drop rate detected today. Check recent script compliance.
                  </p>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2 mt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendMessage(
                    agent.id,
                    \`Hey \${agent.name}! You're \${deficit} sales away from quota. Let's push hard! 💪\`
                  );
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2.5 px-3 rounded-xl font-bold transition-all active:scale-95 shadow-md"
              >
                <Send size={16} />
                Send Vibes
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedAgentId(expandedAgentId === agent.id ? null : agent.id);
                }}
                className={\`flex-1 flex items-center justify-center gap-2 text-sm py-2.5 px-3 rounded-xl font-bold transition-all active:scale-95 border \${
                  expandedAgentId === agent.id 
                    ? 'bg-surface-alt text-text-primary border-border-strong' 
                    : 'bg-surface-main text-text-muted border-border-subtle hover:bg-surface-alt hover:text-text-primary'
                }\`}
              >
                <BarChart3 size={16} />
                {expandedAgentId === agent.id ? 'Hide Details' : 'See Details'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
`;

const file = fs.readFileSync('components/admin/dashboard/DashboardAgentSupportPanel.tsx', 'utf8');
fs.writeFileSync('components/admin/dashboard/DashboardAgentSupportPanel.tsx', file.substring(0, file.indexOf('return (')) + content);
