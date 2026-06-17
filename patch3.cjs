const fs = require('fs');
let code = fs.readFileSync('components/admin/UniqueSalesPool.tsx', 'utf8');

// Update handleSaveEdit
const handleSaveEditTarget = `            const medConds = typeof (editingCustomer as any).medicalConditionsString === 'string'
                ? (editingCustomer as any).medicalConditionsString.split(',').map((s: string) => s.trim()).filter(Boolean)
                : editingCustomer.medicalConditions;`;

const handleSaveEditReplacement = `            const medConds = typeof (editingCustomer as any).medicalConditionsString === 'string'
                ? (editingCustomer as any).medicalConditionsString.split(',').map((s: string) => s.trim()).filter(Boolean)
                : editingCustomer.medicalConditions;
            const crmConds = typeof (editingCustomer as any).crmTagsString === 'string'
                ? (editingCustomer as any).crmTagsString.split(',').map((s: string) => s.trim()).filter(Boolean)
                : editingCustomer.crmTags;
            const leadConds = typeof (editingCustomer as any).leadSourcesString === 'string'
                ? (editingCustomer as any).leadSourcesString.split(',').map((s: string) => s.trim()).filter(Boolean)
                : editingCustomer.leadSources;
            const pipeConds = typeof (editingCustomer as any).pipelineStagesString === 'string'
                ? (editingCustomer as any).pipelineStagesString.split(',').map((s: string) => s.trim()).filter(Boolean)
                : editingCustomer.pipelineStages;`;

code = code.replace(handleSaveEditTarget, handleSaveEditReplacement);

const updatePayloadTarget = `                weight: editingCustomer.weight,
                medicalConditions: medConds,
                name: \`\${editingCustomer.firstName} \${editingCustomer.lastName}\`.trim(),`;

const updatePayloadReplacement = `                weight: editingCustomer.weight,
                medicalConditions: medConds,
                crmTags: crmConds,
                leadSources: leadConds,
                pipelineStages: pipeConds,
                name: \`\${editingCustomer.firstName} \${editingCustomer.lastName}\`.trim(),`;

code = code.replace(updatePayloadTarget, updatePayloadReplacement);

// Update handleAddCustomer
const handleAddCustomerTarget = `            const medConds = newCustForm.medicalConditions
                ? newCustForm.medicalConditions.split(',').map(s => s.trim()).filter(Boolean)
                : [];`;

const handleAddCustomerReplacement = `            const medConds = newCustForm.medicalConditions
                ? newCustForm.medicalConditions.split(',').map(s => s.trim()).filter(Boolean)
                : [];
            const crmConds = (newCustForm as any).crmTags
                ? (newCustForm as any).crmTags.split(',').map((s: string) => s.trim()).filter(Boolean)
                : [];
            const pipeConds = (newCustForm as any).pipelineStages
                ? (newCustForm as any).pipelineStages.split(',').map((s: string) => s.trim()).filter(Boolean)
                : [];
            const leadConds = (newCustForm as any).leadSources
                ? (newCustForm as any).leadSources.split(',').map((s: string) => s.trim()).filter(Boolean)
                : [];`;

code = code.replace(handleAddCustomerTarget, handleAddCustomerReplacement);

const newPayloadTarget = `                weight: newCustForm.weight,
                medicalConditions: medConds,
                status: 'Active',`;

const newPayloadReplacement = `                weight: newCustForm.weight,
                medicalConditions: medConds,
                crmTags: crmConds,
                pipelineStages: pipeConds,
                leadSources: leadConds,
                status: 'Active',`;

code = code.replace(newPayloadTarget, newPayloadReplacement);

const newCustFormTarget = `        medicalConditions: ''
    });`;

const newCustFormReplacement = `        medicalConditions: '',
        crmTags: '',
        pipelineStages: '',
        leadSources: ''
    } as any);`;

code = code.replace(newCustFormTarget, newCustFormReplacement);

fs.writeFileSync('components/admin/UniqueSalesPool.tsx', code);
