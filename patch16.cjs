const fs = require('fs');
let code = fs.readFileSync('components/admin/UniqueSalesPool.tsx', 'utf8');

code = code.replace(
    "onChange={(e) => setSelectedState(e.target.value); setActiveSmartListId(null);}", 
    "onChange={(e) => { setSelectedState(e.target.value); setActiveSmartListId(null); }}"
);

code = code.replace(
    "onClick={() => { playClick(); setActiveSmartListId(null); setSelectedStatusFilter('all'); }}", 
    "onClick={() => { playClick(); setActiveSmartListId(null); setSelectedStatusFilter('all'); }}" // Wait, the replace string was `/setSelectedStatusFilter\(/g, "setActiveSmartListId(null); setSelectedStatusFilter("`
);

const reStatus = /onClick={\(\) => { playClick\(\); setActiveSmartListId\(null\); setSelectedStatusFilter\('([^']+)'\); }}/g;

fs.writeFileSync('components/admin/UniqueSalesPool.tsx', code);
