const fs = require('fs');
let code = fs.readFileSync('components/admin/UniqueSalesPool.tsx', 'utf8');

// Patch handle adding Taxonomy array string states when opening the Edit Modal
const openModalTarget = `onClick={() => { playClick(); setEditingCustomer({ ...customer, medicalConditionsString: medConditionsList.join(', ') } as any); }}`;
const openModalReplacement = `onClick={() => { 
    playClick(); 
    setEditingCustomer({ 
        ...customer, 
        medicalConditionsString: medConditionsList.join(', '),
        crmTagsString: (customer.crmTags || []).join(', '),
        leadSourcesString: (customer.leadSources || []).join(', '),
        pipelineStagesString: (customer.pipelineStages || []).join(', ')
    } as any); 
}}`;
code = code.replace(openModalTarget, openModalReplacement);

// Patch Edit Modal form fields
const editFormTarget = `                                {/* Declarations / Medical */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2 flex items-center gap-2">
                                        <Heart size={14} className="text-status-error" />
                                        5. Medical Annotations
                                    </h3>
                                    
                                    <div className="relative">
                                        <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">Conditions (Comma Separated)</div>
                                        <textarea 
                                            value={(editingCustomer as any).medicalConditionsString || ''}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, medicalConditionsString: e.target.value } as any)}
                                            placeholder="Asthma, Diabetes, Heart Murmur"
                                            rows={2}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-semibold resize-none"
                                        />
                                    </div>
                                </div>`;

const editFormReplacement = `                                {/* Declarations / Medical */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2 flex items-center gap-2">
                                        <Heart size={14} className="text-status-error" />
                                        Medical Annotations
                                    </h3>
                                    
                                    <div className="relative">
                                        <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">Conditions (Comma Separated)</div>
                                        <textarea 
                                            value={(editingCustomer as any).medicalConditionsString || ''}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, medicalConditionsString: e.target.value } as any)}
                                            placeholder="Asthma, Diabetes, Heart Murmur"
                                            rows={2}
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary font-semibold resize-none"
                                        />
                                    </div>
                                    
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2 flex items-center gap-2 mt-6">
                                        <Layers size={14} className="text-purple-500" />
                                        Taxonomy & CRM Variables
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="relative">
                                            <div className="absolute top-2 left-3 text-xs font-black tracking-widest text-purple-500 uppercase z-10">CRM Tags</div>
                                            <textarea 
                                                value={(editingCustomer as any).crmTagsString || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, crmTagsString: e.target.value } as any)}
                                                placeholder="VIP, High Value..."
                                                rows={2}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-purple-500 font-semibold resize-none"
                                            />
                                        </div>
                                        <div className="relative">
                                            <div className="absolute top-2 left-3 text-xs font-black tracking-widest text-blue-500 uppercase z-10">Lead Sources</div>
                                            <textarea 
                                                value={(editingCustomer as any).leadSourcesString || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, leadSourcesString: e.target.value } as any)}
                                                placeholder="Organic, Direct..."
                                                rows={2}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-blue-500 font-semibold resize-none"
                                            />
                                        </div>
                                        <div className="relative">
                                            <div className="absolute top-2 left-3 text-xs font-black tracking-widest text-amber-500 uppercase z-10">Pipeline Stages</div>
                                            <textarea 
                                                value={(editingCustomer as any).pipelineStagesString || ''}
                                                onChange={(e) => setEditingCustomer({ ...editingCustomer, pipelineStagesString: e.target.value } as any)}
                                                placeholder="New, Qualified..."
                                                rows={2}
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-amber-500 font-semibold resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>`;

code = code.replace(editFormTarget, editFormReplacement);

// Patch New Modal form fields
const newFormTarget = `                                    <div className="relative">
                                        <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">Medical Conditions (Comma Separated)</div>
                                        <input 
                                            type="text"
                                            value={newCustForm.medicalConditions}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, medicalConditions: e.target.value })}
                                            placeholder="e.g. Asthma, High Blood Pressure"
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                                        />
                                    </div>
                                </div>`;

const newFormReplacement = `                                    <div className="relative">
                                        <div className="absolute top-2 left-3 text-sm font-black tracking-widest text-text-muted uppercase z-10">Medical Conditions (Comma Separated)</div>
                                        <input 
                                            type="text"
                                            value={newCustForm.medicalConditions}
                                            onChange={(e) => setNewCustForm({ ...newCustForm, medicalConditions: e.target.value })}
                                            placeholder="e.g. Asthma, High Blood Pressure"
                                            className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="relative">
                                            <div className="absolute top-2 left-3 text-[10px] font-black tracking-widest text-purple-500 uppercase z-10">CRM Tags</div>
                                            <input 
                                                type="text"
                                                value={(newCustForm as any).crmTags || ''}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, crmTags: e.target.value } as any)}
                                                placeholder="VIP, Follow Up"
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-purple-500"
                                            />
                                        </div>
                                        <div className="relative">
                                            <div className="absolute top-2 left-3 text-[10px] font-black tracking-widest text-blue-500 uppercase z-10">Lead Sources</div>
                                            <input 
                                                type="text"
                                                value={(newCustForm as any).leadSources || ''}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, leadSources: e.target.value } as any)}
                                                placeholder="Organic Search"
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="relative">
                                            <div className="absolute top-2 left-3 text-[10px] font-black tracking-widest text-amber-500 uppercase z-10">Pipeline Stages</div>
                                            <input 
                                                type="text"
                                                value={(newCustForm as any).pipelineStages || ''}
                                                onChange={(e) => setNewCustForm({ ...newCustForm, pipelineStages: e.target.value } as any)}
                                                placeholder="Qualified"
                                                className="w-full bg-surface-alt border border-border-strong rounded-lg px-3 pt-6 pb-2 text-sm text-text-primary outline-none focus:border-amber-500"
                                            />
                                        </div>
                                    </div>
                                </div>`;

code = code.replace(newFormTarget, newFormReplacement);

fs.writeFileSync('components/admin/UniqueSalesPool.tsx', code);
console.log('Update success');
