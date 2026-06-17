const fs = require('fs');
let code = fs.readFileSync('components/admin/UniqueSalesPool.tsx', 'utf8');

const interfaceInsert = `import { Save, Filter, XCircle } from 'lucide-react';

interface SmartList {
    id: string;
    name: string;
    filters: {
        searchQuery: string;
        selectedState: string;
        selectedTag: string;
        selectedPipelineStage: string;
        daysSinceOrderFilter: string;
        selectedStatusFilter: string;
        sortBy: string;
        sortOrder: string;
    };
}`;

if (!code.includes("interface SmartList")) {
    code = code.replace("export const UniqueSalesPool: React.FC = () => {", interfaceInsert + "\n\nexport const UniqueSalesPool: React.FC = () => {");
}

const stateInsertTarget = `    const [selectedTag, setSelectedTag] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'ltv' | 'date'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');`;

const stateInsertReplacement = `    const [selectedTag, setSelectedTag] = useState('');
    const [selectedPipelineStage, setSelectedPipelineStage] = useState('');
    const [daysSinceOrderFilter, setDaysSinceOrderFilter] = useState<'all' | '14' | '30' | '60' | '90' | 'never'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'ltv' | 'date'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    
    // Smart Lists State
    const [smartLists, setSmartLists] = useState<SmartList[]>(() => {
        try {
            return JSON.parse(localStorage.getItem('crm_smart_lists_v1') || '[]');
        } catch { return []; }
    });
    const [activeSmartListId, setActiveSmartListId] = useState<string | null>(null);
    const [isSavingSmartList, setIsSavingSmartList] = useState(false);
    const [newSmartListName, setNewSmartListName] = useState('');

    const saveSmartList = () => {
        if (!newSmartListName.trim()) return;
        const newList: SmartList = {
            id: 'sl_' + Date.now(),
            name: newSmartListName.trim(),
            filters: {
                searchQuery,
                selectedState,
                selectedTag,
                selectedPipelineStage,
                daysSinceOrderFilter,
                selectedStatusFilter,
                sortBy,
                sortOrder
            }
        };
        const updated = [...smartLists, newList];
        setSmartLists(updated);
        localStorage.setItem('crm_smart_lists_v1', JSON.stringify(updated));
        setIsSavingSmartList(false);
        setNewSmartListName('');
        setActiveSmartListId(newList.id);
        playSuccess();
        setToast({ title: 'Smart List Saved', message: \`Saved filter combination as "\${newList.name}"\`, type: 'success' });
    };

    const deleteSmartList = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = smartLists.filter(sl => sl.id !== id);
        setSmartLists(updated);
        localStorage.setItem('crm_smart_lists_v1', JSON.stringify(updated));
        if (activeSmartListId === id) setActiveSmartListId(null);
        playDecline();
    };

    const loadSmartList = (sl: SmartList) => {
        setSearchQuery(sl.filters.searchQuery || '');
        setSelectedState(sl.filters.selectedState || '');
        setSelectedTag(sl.filters.selectedTag || '');
        setSelectedPipelineStage(sl.filters.selectedPipelineStage || '');
        setDaysSinceOrderFilter((sl.filters.daysSinceOrderFilter as any) || 'all');
        setSelectedStatusFilter((sl.filters.selectedStatusFilter as any) || 'all');
        setSortBy((sl.filters.sortBy as any) || 'name');
        setSortOrder((sl.filters.sortOrder as any) || 'asc');
        setActiveSmartListId(sl.id);
        playClick();
    };
    
    const clearFilters = () => {
        setSearchQuery('');
        setSelectedState('');
        setSelectedTag('');
        setSelectedPipelineStage('');
        setDaysSinceOrderFilter('all');
        setSelectedStatusFilter('all');
        setActiveSmartListId(null);
        playClick();
    };`;

if (!code.includes("const [smartLists, setSmartLists]")) {
    code = code.replace(stateInsertTarget, stateInsertReplacement);
}

const filterLogicTarget = `            const matchesTag = !selectedTag || 
                (c.tags && c.tags.includes(selectedTag)) ||
                (c.medicalConditions && c.medicalConditions.includes(selectedTag));

            return matchesSearch && matchesState && matchesTag;`;

const filterLogicReplacement = `            const matchesTag = !selectedTag || 
                (c.tags && c.tags.includes(selectedTag)) ||
                (c.medicalConditions && c.medicalConditions.includes(selectedTag)) ||
                (c.crmTags && c.crmTags.includes(selectedTag)) ||
                (c.leadSources && c.leadSources.includes(selectedTag));
                
            const matchesPipeline = !selectedPipelineStage ||
                (c.pipelineStages && c.pipelineStages.includes(selectedPipelineStage));
                
            let matchesDaysSinceOrder = true;
            if (daysSinceOrderFilter !== 'all') {
                if (daysSinceOrderFilter === 'never') {
                    matchesDaysSinceOrder = ltv === 0 && metrics?.sales.length === 0;
                } else {
                    const daysFilter = parseInt(daysSinceOrderFilter);
                    matchesDaysSinceOrder = daysSinceLastOrder >= daysFilter;
                }
            }

            return matchesSearch && matchesState && matchesTag && matchesPipeline && matchesDaysSinceOrder;`;

code = code.replace(filterLogicTarget, filterLogicReplacement);

const depsTarget = `    }, [uniqueCustomers, customerDynamicMetrics, selectedStatusFilter, searchQuery, selectedState, selectedTag, sortBy, sortOrder]);`;
const depsReplacement = `    }, [uniqueCustomers, customerDynamicMetrics, selectedStatusFilter, searchQuery, selectedState, selectedTag, selectedPipelineStage, daysSinceOrderFilter, sortBy, sortOrder]);`;
code = code.replace(depsTarget, depsReplacement);

fs.writeFileSync('components/admin/UniqueSalesPool.tsx', code);
