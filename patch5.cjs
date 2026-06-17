const fs = require('fs');
let code = fs.readFileSync('components/admin/UniqueSalesPool.tsx', 'utf8');

const knownColTarget = `        { key: 'weight', label: 'Weight', required: false, synonyms: ['weight', 'mass'] },
        { key: 'medicalConditions', label: 'Medical Conditions', required: false, synonyms: ['conditions', 'medical', 'symptoms', 'history', 'health', 'illness'] }
    ];`;
const knownColReplacement = `        { key: 'weight', label: 'Weight', required: false, synonyms: ['weight', 'mass'] },
        { key: 'medicalConditions', label: 'Medical Conditions', required: false, synonyms: ['conditions', 'medical', 'symptoms', 'history', 'health', 'illness'] },
        { key: 'crmTags', label: 'CRM Tags', required: false, synonyms: ['crm tags', 'tags', 'global tags'] },
        { key: 'leadSources', label: 'Lead Sources', required: false, synonyms: ['lead source', 'source', 'origin', 'marketing source'] },
        { key: 'pipelineStages', label: 'Pipeline Stages', required: false, synonyms: ['pipeline', 'stage', 'status', 'funnel stage'] }
    ];`;
code = code.replace(knownColTarget, knownColReplacement);


const extractIdxTarget = `        const medIdx = headers.indexOf(columnMapping['medicalConditions'] || '');`;
const extractIdxReplacement = `        const medIdx = headers.indexOf(columnMapping['medicalConditions'] || '');
        const crmTagsIdx = headers.indexOf(columnMapping['crmTags'] || '');
        const leadSourcesIdx = headers.indexOf(columnMapping['leadSources'] || '');
        const pipelineStagesIdx = headers.indexOf(columnMapping['pipelineStages'] || '');`;
code = code.replace(extractIdxTarget, extractIdxReplacement);


const parseRowTarget = `                const rawMed = medIdx !== -1 ? (row[medIdx] || '') : '';
                const medList = rawMed ? rawMed.split(',').map(s => s.trim()).filter(Boolean) : [];`;
const parseRowReplacement = `                const rawMed = medIdx !== -1 ? (row[medIdx] || '') : '';
                const medList = rawMed ? rawMed.split(',').map(s => s.trim()).filter(Boolean) : [];
                const rawCrm = crmTagsIdx !== -1 ? (row[crmTagsIdx] || '') : '';
                const crmList = rawCrm ? rawCrm.split(',').map(s => s.trim()).filter(Boolean) : [];
                const rawLead = leadSourcesIdx !== -1 ? (row[leadSourcesIdx] || '') : '';
                const leadList = rawLead ? rawLead.split(',').map(s => s.trim()).filter(Boolean) : [];
                const rawPipe = pipelineStagesIdx !== -1 ? (row[pipelineStagesIdx] || '') : '';
                const pipeList = rawPipe ? rawPipe.split(',').map(s => s.trim()).filter(Boolean) : [];`;
code = code.replace(parseRowTarget, parseRowReplacement);

const stitchTarget = `                    if (medList.length > 0) {
                        const originalMed = existingMatch.medicalConditions || [];
                        updates.medicalConditions = Array.from(new Set([...originalMed, ...medList]));
                    }`;
const stitchReplacement = `                    if (medList.length > 0) {
                        const originalMed = existingMatch.medicalConditions || [];
                        updates.medicalConditions = Array.from(new Set([...originalMed, ...medList]));
                    }
                    if (crmList.length > 0) {
                        const originalCrm = existingMatch.crmTags || [];
                        updates.crmTags = Array.from(new Set([...originalCrm, ...crmList]));
                    }
                    if (leadList.length > 0) {
                        const originalLead = existingMatch.leadSources || [];
                        updates.leadSources = Array.from(new Set([...originalLead, ...leadList]));
                    }
                    if (pipeList.length > 0) {
                        const originalPipe = existingMatch.pipelineStages || [];
                        updates.pipelineStages = Array.from(new Set([...originalPipe, ...pipeList]));
                    }`;
code = code.replace(stitchTarget, stitchReplacement);

const newPayloadTarget = `                        medicalConditions: medList,
                        status: 'Active',
                        ltv: 0,`;

const newPayloadReplacement = `                        medicalConditions: medList,
                        crmTags: crmList,
                        leadSources: leadList,
                        pipelineStages: pipeList,
                        status: 'Active',
                        ltv: 0,`;

code = code.replace(newPayloadTarget, newPayloadReplacement);

fs.writeFileSync('components/admin/UniqueSalesPool.tsx', code);
console.log('CSV Patch success');
