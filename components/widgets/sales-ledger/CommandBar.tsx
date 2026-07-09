
import React from 'react';
import { Save, X } from 'lucide-react';
import { Button } from '../../ui/Base';

interface CommandBarProps {
    agents?: string[];
    count: number;
    isBulkEdit: boolean;
    isSaving: boolean;
    onSave: () => void;
    onCancel: () => void;
    onAction: (action: string) => void;
}

export const CommandBar: React.FC<CommandBarProps> = React.memo(({ count, isBulkEdit, isSaving, onSave, onCancel, onAction, agents = [] }) => (
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-surface-main/90 backdrop-blur-xl border border-border-subtle shadow-2xl shadow-black/20 ring-1 ring-white/5">
            <div className="bg-surface-alt px-3 py-1.5 rounded-xl border border-border-subtle flex items-center gap-2 mr-1">
                <span className="text-xs font-[700]  text-accent-primary">{count}</span>
                <span className="text-xs font-bold text-text-muted ">Selected</span>
            </div>

            {isBulkEdit ? (
                <>
                    <span className="text-xs font-bold text-text-muted px-2  tracking-wider hidden sm:block">Bulk Edit Mode</span>
                    <Button onClick={onSave} isLoading={isSaving} variant="primary" className="h-9 px-4 text-xs font-[700]  bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20">
                        <Save size={16} className="mr-2"/> Save Changes
                    </Button>
                    <button onClick={onCancel} className="p-2 hover:bg-surface-alt rounded-xl text-text-muted hover:text-text-primary transition-colors">
                        <X size={16}/>
                    </button>
                </>
            ) : (
                <select 
                    className="bg-surface-alt/50 border border-border-subtle text-text-primary h-9 rounded-xl px-3 text-xs font-bold  outline-none focus:border-accent-primary cursor-pointer hover:bg-surface-alt transition-colors"
                    onChange={(e) => { onAction(e.target.value); e.target.value = ""; }}
                >
                    <option value="">Batch Actions...</option>
                    <option value="copy-sheets">Copy for Client Sheets (TSV)</option>
                    
                    <optgroup label="Update Status">
                        <option value="Approved">Mark Approved</option>
                        <option value="Declined">Mark Declined</option>
                        <option value="Pending">Mark Pending</option>
                    </optgroup>
                    
                    <optgroup label="Update Pipeline">
                        <option value="pipeline:New">New</option>
                        <option value="pipeline:Contacted">Contacted</option>
                        <option value="pipeline:Follow Up">Follow Up</option>
                        <option value="pipeline:Callback">Callback</option>
                        <option value="pipeline:Closing">Closing</option>
                        <option value="pipeline:Closed Won">Closed Won</option>
                        <option value="pipeline:Closed Lost">Closed Lost</option>
                    </optgroup>
                    
                    {agents.length > 0 && (
                        <optgroup label="Assign Agent">
                            {agents.map(a => (
                                <option key={a} value={`agent:${a}`}>Assign to {a}</option>
                            ))}
                        </optgroup>
                    )}

                    <optgroup label="Other Actions">
                        {/* <option value="edit">Bulk Edit</option> */}
                        <option value="delete">Delete Selection</option>
                    </optgroup>
                </select>
            )}
        </div>
    </div>
));
