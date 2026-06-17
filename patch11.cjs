const fs = require('fs');
let code = fs.readFileSync('components/admin/UniqueSalesPool.tsx', 'utf8');

const stateTarget = `    const [importResults, setImportResults] = useState<{
        added: number;
        skipped: number;
        skippedDetails: Array<{ name: string, phone: string, email: string }>;
    } | null>(null);`;
const stateReplacement = `    const [importResults, setImportResults] = useState<{
        added: number;
        stitched: number;
        stitchedDetails: Array<{ name: string, phone: string, email: string }>;
        addedDetails: Array<{ name: string, phone: string, email: string }>;
    } | null>(null);`;
code = code.replace(stateTarget, stateReplacement);

const variablesTarget = `        let importResultsData: any = { added: 0, skipped: 0, skippedDetails: [], addedDetails: [] };`;
const variablesReplacement = `        let importResultsData: any = { added: 0, stitched: 0, stitchedDetails: [], addedDetails: [] };`;
code = code.replace(variablesTarget, variablesReplacement);

const ifTarget = `                if (existingMatch) {
                    // Update / Stitch Profile - No, the requirement is to NOT include duplicates 
                    // and instead let the user see the duplicates that were not included.
                    // We will just record them in the skipped list.
                    updated++;
                    if (!importResultsData) {
                        importResultsData = { added: 0, skipped: 0, skippedDetails: [], addedDetails: [] };
                    }
                    importResultsData.skipped++;
                    importResultsData.skippedDetails.push({ 
                        name: fullName || 'Unknown', 
                        phone: rawPhone, 
                        email: email || 'unknown' 
                    });
                } else {`;
const ifReplacement = `                if (existingMatch) {
                    // Update / Stitch Profile
                    const updates: Partial<Customer> = { updatedAt: Date.now() };

                    if (fn && !existingMatch.firstName) updates.firstName = fn;
                    if (ln && !existingMatch.lastName) updates.lastName = ln;
                    if (fullName && (!existingMatch.fullName || existingMatch.fullName.length < fullName.length)) {
                        updates.fullName = fullName;
                        updates.name = fullName;
                    }
                    if (email && (!existingMatch.email || existingMatch.email.toLowerCase() === 'unknown')) updates.email = email;
                    if (age && !existingMatch.age) updates.age = age;
                    if (dob && !existingMatch.dob) updates.dob = dob;
                    if (height && !existingMatch.height) updates.height = height;
                    if (weight && !existingMatch.weight) updates.weight = weight;

                    // Locate details
                    if (shippingAddress) {
                        const originalShip = existingMatch.shippingAddress || existingMatch.address;
                        if (!originalShip) {
                            updates.shippingAddress = shippingAddress;
                            updates.address = shippingAddress;
                            updates.shippingCity = shippingCity;
                            updates.shippingState = shippingState;
                            updates.shippingZip = shippingZip;
                        } else if (originalShip.toLowerCase().trim() !== shippingAddress.toLowerCase().trim()) {
                            const past = existingMatch.pastShippingAddresses || [];
                            if (!past.includes(originalShip)) {
                                updates.pastShippingAddresses = [...past, originalShip];
                            }
                            updates.shippingAddress = shippingAddress;
                            updates.address = shippingAddress;
                            updates.shippingCity = shippingCity || existingMatch.shippingCity;
                            updates.shippingState = shippingState || existingMatch.shippingState;
                            updates.shippingZip = shippingZip || existingMatch.shippingZip;
                        }
                    }

                    if (billingAddress) {
                        const originalBill = existingMatch.billingAddress;
                        if (!originalBill) {
                            updates.billingAddress = billingAddress;
                            updates.billingCity = billingCity;
                            updates.billingState = billingState;
                            updates.billingZip = billingZip;
                        } else if (originalBill.toLowerCase().trim() !== billingAddress.toLowerCase().trim()) {
                            const past = existingMatch.pastBillingAddresses || [];
                            if (!past.includes(originalBill)) {
                                updates.pastBillingAddresses = [...past, originalBill];
                            }
                            updates.billingAddress = billingAddress;
                            updates.billingCity = billingCity || existingMatch.billingCity;
                            updates.billingState = billingState || existingMatch.billingState;
                            updates.billingZip = billingZip || existingMatch.billingZip;
                        }
                    }

                    if (medList.length > 0) {
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
                    }

                    await updateCustomer(existingMatch.id, updates);
                    updated++;
                    importResultsData.stitched++;
                    importResultsData.stitchedDetails.push({ 
                        name: fullName || 'Unknown', 
                        phone: rawPhone, 
                        email: email || 'unknown' 
                    });
                } else {`;
code = code.replace(ifTarget, ifReplacement);

const toastTarget = `                title: 'Data Ingestion Nexus Succeeded',
                message: \`Bulk contacts parsed successfully: \${added} new unique profiles registered. \${updated} duplicates skipped.\`,
                type: 'success'`;
const toastReplacement = `                title: 'Data Ingestion Nexus Succeeded',
                message: \`Bulk contacts parsed successfully: \${added} new unique profiles registered. \${updated} pre-existing entries stitched.\`,
                type: 'success'`;
code = code.replace(toastTarget, toastReplacement);

const statsTarget = `                                            <p className="text-3xl font-black text-status-warning">{importResults.skipped}</p>
                                            <p className="text-sm font-bold uppercase tracking-widest text-status-warning/70 mt-1">Duplicates Skipped</p>
                                        </div>
                                    </div>
                                </div>`;
const statsReplacement = `                                            <p className="text-3xl font-black text-status-warning">{importResults.stitched}</p>
                                            <p className="text-sm font-bold uppercase tracking-widest text-status-warning/70 mt-1">Duplicates Stitched / Updated</p>
                                        </div>
                                    </div>
                                </div>`;
code = code.replace(statsTarget, statsReplacement);

const uiTarget2 = `                                {importResults.skipped > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-status-warning flex items-center gap-2 border-b border-border-subtle pb-2">
                                            <AlertTriangle size={14} /> Skipped Duplicate Records (Already Existed)
                                        </h3>`;
const uiReplacement2 = `                                {importResults.stitched > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-status-warning flex items-center gap-2 border-b border-border-subtle pb-2">
                                            <AlertTriangle size={14} /> Stitched Duplicate Records (Updated)
                                        </h3>`;
code = code.replace(uiTarget2, uiReplacement2);

const uiTarget3 = `                                                    <tbody className="divide-y divide-border-subtle/50">
                                                        {importResults.skippedDetails?.map((dup, dIdx) => (`;
const uiReplacement3 = `                                                    <tbody className="divide-y divide-border-subtle/50">
                                                        {importResults.stitchedDetails?.map((dup, dIdx) => (`;
code = code.replace(uiTarget3, uiReplacement3);

fs.writeFileSync('components/admin/UniqueSalesPool.tsx', code);
