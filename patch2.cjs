const fs = require('fs');
let code = fs.readFileSync('components/admin/UniqueSalesPool.tsx', 'utf8');

const target1 = `    const allTags = useMemo(() => {
        const tags = new Set<string>();
        uniqueCustomers.forEach(c => {
            if (c.tags) c.tags.forEach(t => tags.add(t));
            if (c.medicalConditions) c.medicalConditions.forEach(m => tags.add(m));
        });
        return Array.from(tags).sort();
    }, [uniqueCustomers]);`;

const rep1 = `    const allTags = useMemo(() => {
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

code = code.replace(target1, rep1);
fs.writeFileSync('components/admin/UniqueSalesPool.tsx', code);
