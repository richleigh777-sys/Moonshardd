const fs = require('fs');
let code = fs.readFileSync('components/admin/UniqueSalesPool.tsx', 'utf8');

const target1 = `                                                <td className="px-3 py-2 max-w-[200px]" onClick={(e) => e.stopPropagation()}>
                                                    {medConditionsList.length === 0 ? (
                                                        <span className="text-sm font-medium text-text-muted italic">No declarations</span>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-1 max-h-[50px] overflow-y-auto">
                                                            {medConditionsList.map((m, idx) => (
                                                                <span key={idx} className="text-sm font-black tracking-wide uppercase px-1.5 py-0.5 rounded-md bg-status-error/10 border border-status-error/20 text-status-error">
                                                                    {m}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>`;
const replacement1 = `                                                <td className="px-3 py-2 max-w-[200px]" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex flex-col gap-1 max-h-[60px] overflow-y-auto custom-scrollbar pr-1">
                                                        {medConditionsList.length === 0 && !(customer.crmTags?.length) && !(customer.pipelineStages?.length) ? (
                                                            <span className="text-[11px] font-medium text-text-muted italic">No declarations</span>
                                                        ) : (
                                                            <div className="flex flex-wrap gap-1">
                                                                {medConditionsList.map((m, idx) => (
                                                                    <span key={'med'+idx} className="text-[9px] font-black tracking-wide uppercase px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-500">
                                                                        {m}
                                                                    </span>
                                                                ))}
                                                                {(customer.crmTags || []).map((m, idx) => (
                                                                    <span key={'crm'+idx} className="text-[9px] font-black tracking-wide uppercase px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400">
                                                                        {m}
                                                                    </span>
                                                                ))}
                                                                {(customer.pipelineStages || []).map((m, idx) => (
                                                                    <span key={'pipe'+idx} className="text-[9px] font-black tracking-wide uppercase px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
                                                                        {m}
                                                                    </span>
                                                                ))}
                                                                {(customer.leadSources || []).map((m, idx) => (
                                                                    <span key={'lead'+idx} className="text-[9px] font-black tracking-wide uppercase px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                                                        {m}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>`;

code = code.replace(target1, replacement1);

const headerTarget = `<th className="px-3 py-1.5">Medical Profile</th>`;
const headerReplacement = `<th className="px-3 py-1.5">Profile & Taxonomy</th>`;
code = code.replace(headerTarget, headerReplacement);

fs.writeFileSync('components/admin/UniqueSalesPool.tsx', code);
console.log('Update success');
