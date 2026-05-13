
import React from 'react';
import { AlertTriangle, RefreshCw, Save, X } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Base';

interface ConflictDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onOverwrite: () => void;
    onReload: () => void;
    itemName?: string;
    conflicts?: string[];
}

export const ConflictDialog: React.FC<ConflictDialogProps> = ({
    isOpen,
    onClose,
    onOverwrite,
    onReload,
    itemName = 'record',
    conflicts = []
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Concurrent Edit Detected" size="md">
            <div className="p-4 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-status-warning/20 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle size={32} className="text-status-warning" />
                </div>
                
                <h3 className="text-lg font-bold text-text-primary mb-2">
                    Conflict Detected
                </h3>
                
                <p className="text-sm text-text-muted mb-4">
                    This {itemName} has been modified by another user while you were editing. 
                </p>

                {conflicts.length > 0 && (
                    <div className="w-full bg-surface-alt rounded-xl p-3 mb-6 text-left border border-border-subtle">
                        <p className="text-[10px] font-black uppercase text-text-muted mb-2 tracking-widest">Conflicting Fields:</p>
                        <div className="flex flex-wrap gap-2">
                            {conflicts.map(field => (
                                <span key={field} className="px-2 py-1 bg-status-error/10 text-status-error text-[10px] font-bold rounded border border-status-error/20 uppercase">
                                    {field.replace(/([A-Z])/g, ' $1')}
                                </span>
                            ))}
                        </div>
                        <p className="text-[9px] text-text-muted mt-3 italic">
                            Other fields were automatically merged successfully.
                        </p>
                    </div>
                )}

                <p className="text-xs text-text-muted mb-6">
                    Saving now will overwrite the changes made to the fields listed above. What would you like to do?
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    <Button 
                        variant="secondary" 
                        onClick={onReload}
                        className="flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={16} />
                        Reload & Discard
                    </Button>
                    
                    <Button 
                        variant="primary" 
                        onClick={onOverwrite}
                        className="bg-status-warning hover:bg-status-warning/80 border-none flex items-center justify-center gap-2"
                    >
                        <Save size={16} />
                        Overwrite Anyway
                    </Button>
                </div>
                
                <button 
                    onClick={onClose}
                    className="mt-4 text-xs font-bold text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors"
                >
                    <X size={12} />
                    Cancel
                </button>
            </div>
        </Modal>
    );
};
