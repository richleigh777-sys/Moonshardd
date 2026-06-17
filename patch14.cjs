const fs = require('fs');
let code = fs.readFileSync('components/admin/UniqueSalesPool.tsx', 'utf8');

const optionsTarget = `    const allTags = useMemo(() => {
        const tags = new Set<string>();
        uniqueCustomers.forEach(c => {
            if (c.tags) c.tags.forEach(t => tags.add(t));
            if (c.medicalConditions) c.medicalConditions.forEach(m => tags.add(m));
            if (c.crmTags) c.crmTags.forEach(m => tags.add(m));
            if (c.leadSources) c.leadSources.forEach(m => tags.add(m));
            if (c.pipelineStages) c.pipelineStages.forEach(m => tags.add(m));
        });
        return Array.from(tags).sort();
    }, [uniqueCustomers]);`;

const optionsReplacement = `    const allTags = useMemo(() => {
        const tags = new Set<string>();
        uniqueCustomers.forEach(c => {
            if (c.tags) c.tags.forEach(t => tags.add(t));
            if (c.medicalConditions) c.medicalConditions.forEach(m => tags.add(m));
            if (c.crmTags) c.crmTags.forEach(m => tags.add(m));
            if (c.leadSources) c.leadSources.forEach(m => tags.add(m));
        });
        return Array.from(tags).sort();
    }, [uniqueCustomers]);

    const allPipelineStages = useMemo(() => {
        const stages = new Set<string>();
        uniqueCustomers.forEach(c => {
            if (c.pipelineStages) c.pipelineStages.forEach(m => stages.add(m));
        });
        return Array.from(stages).sort();
    }, [uniqueCustomers]);`;

code = code.replace(optionsTarget, optionsReplacement);

const uiPillsTarget = `            {/* Realtime Outcome Quick-Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-surface-main/40 border border-border-subtle p-1.5 rounded-xl">`;

const smartListUI = `            {/* SMART LISTS NAV BAR */}
            {smartLists.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-1 ml-1 mr-2"><Filter size={12}/> SMART LISTS:</span>
                    {smartLists.map(sl => (
                        <div key={sl.id} className="relative group">
                            <button
                                onClick={() => loadSmartList(sl)}
                                className={\`pl-3 pr-8 py-1.25 rounded-lg text-sm font-bold tracking-wider transition-all \${activeSmartListId === sl.id ? 'bg-accent-primary text-white shadow-md' : 'bg-surface-main border border-border-subtle text-text-secondary hover:bg-surface-alt hover:text-text-primary'}\`}
                            >
                                {sl.name}
                            </button>
                            <button 
                                onClick={(e) => deleteSmartList(sl.id, e)}
                                className={\`absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full transition-opacity \${activeSmartListId === sl.id ? 'text-white/70 hover:text-white hover:bg-black/20' : 'text-text-muted hover:text-status-danger hover:bg-status-danger/10 opacity-0 group-hover:opacity-100'}\`}
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                    {activeSmartListId && (
                        <button onClick={clearFilters} className="text-xs font-bold uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors ml-2 underline decoration-text-muted/30 underline-offset-4">
                            Clear View
                        </button>
                    )}
                </div>
            )}

            {/* Realtime Outcome Quick-Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-surface-main/40 border border-border-subtle p-1.5 rounded-xl">
                <div className="flex flex-wrap items-center gap-1.5">`;

const uiPillsReplacement = uiPillsTarget.replace(uiPillsTarget, smartListUI);
code = code.replace(uiPillsTarget, uiPillsReplacement);

const closeDivPillsTarget = `                    <Heart size={13} />
                    Winback
                </button>
            </div>`;

const closeDivPillsReplacement = `                    <Heart size={13} />
                    Winback
                </button>
                </div>
                
                <div className="relative pr-1">
                    {isSavingSmartList ? (
                        <div className="flex items-center gap-1 bg-surface-main p-1 rounded-lg border border-accent-primary/30">
                            <input 
                                autoFocus
                                type="text" 
                                value={newSmartListName}
                                onChange={e => setNewSmartListName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && saveSmartList()}
                                placeholder="Name this view..."
                                className="bg-transparent border-none outline-none text-sm font-bold w-[140px] px-2 text-text-primary placeholder:text-text-muted/50"
                            />
                            <button onClick={saveSmartList} className="p-1 bg-accent-primary text-white rounded hover:bg-accent-secondary"><Save size={14}/></button>
                            <button onClick={() => setIsSavingSmartList(false)} className="p-1 text-text-muted hover:text-status-danger"><X size={14}/></button>
                        </div>
                    ) : (
                        <button onClick={() => { playClick(); setIsSavingSmartList(true); }} className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-primary hover:bg-accent-primary/10 rounded-lg transition-colors flex items-center gap-1.5 border border-accent-primary/20">
                            <Save size={12}/> Save View
                        </button>
                    )}
                </div>
            </div>`;

code = code.replace(closeDivPillsTarget, closeDivPillsReplacement);


const dropDownsTarget = `                    <div className="relative">
                        <select
                            value={selectedTag}
                            onChange={(e) => setSelectedTag(e.target.value)}
                            className="bg-surface-alt border border-border-subtle rounded-lg px-2 py-1.5 text-sm font-semibold text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20 transition-all cursor-pointer appearance-none min-w-[120px]"
                        >
                            <option value="">All Tags/Medications</option>
                            {allTags.map(tg => <option key={tg} value={tg}>{tg}</option>)}
                        </select>
                    </div>`;

const dropDownsReplacement = `                    <div className="relative">
                        <select
                            value={selectedTag}
                            onChange={(e) => { setSelectedTag(e.target.value); setActiveSmartListId(null); }}
                            className="bg-surface-alt border border-border-subtle rounded-lg px-2 py-1.5 text-sm font-semibold text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20 transition-all cursor-pointer appearance-none min-w-[120px]"
                        >
                            <option value="">All Tags/Medications</option>
                            {allTags.map(tg => <option key={tg} value={tg}>{tg}</option>)}
                        </select>
                    </div>

                    <div className="relative">
                        <select
                            value={selectedPipelineStage}
                            onChange={(e) => { setSelectedPipelineStage(e.target.value); setActiveSmartListId(null); }}
                            className="bg-surface-alt border border-border-subtle rounded-lg px-2 py-1.5 text-sm font-semibold text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20 transition-all cursor-pointer appearance-none min-w-[120px]"
                        >
                            <option value="">All Pipeline Stages</option>
                            {allPipelineStages.map(ps => <option key={ps} value={ps}>{ps}</option>)}
                        </select>
                    </div>

                    <div className="relative">
                        <select
                            value={daysSinceOrderFilter}
                            onChange={(e) => { setDaysSinceOrderFilter(e.target.value as any); setActiveSmartListId(null); }}
                            className="bg-surface-alt border border-border-subtle rounded-lg px-2 py-1.5 text-sm font-semibold text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20 transition-all cursor-pointer appearance-none min-w-[120px]"
                        >
                            <option value="all">Any Order Age</option>
                            <option value="14">&gt; 14 days ago</option>
                            <option value="30">&gt; 30 days ago</option>
                            <option value="60">&gt; 60 days ago</option>
                            <option value="90">&gt; 90 days ago</option>
                            <option value="never">Never ordered</option>
                        </select>
                    </div>`;

code = code.replace(dropDownsTarget, dropDownsReplacement);

// reset setActiveSmartListId on other changes

code = code.replace(/setSearchQuery\(e.target.value\)/g, "setSearchQuery(e.target.value); setActiveSmartListId(null);");
code = code.replace(/setSelectedState\(e.target.value\)/g, "setSelectedState(e.target.value); setActiveSmartListId(null);");
code = code.replace(/setSelectedStatusFilter\(/g, "setActiveSmartListId(null); setSelectedStatusFilter(");

fs.writeFileSync('components/admin/UniqueSalesPool.tsx', code);
