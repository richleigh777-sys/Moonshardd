
import { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Base';

interface ServerConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialName?: string;
    initialRegion?: string;
    onSave: (name: string, region: string) => void;
    title: string;
    actionLabel: string;
}

export const ServerConfigModal: React.FC<ServerConfigModalProps> = ({ 
    isOpen, onClose, initialName = '', initialRegion = 'US-East', onSave, title, actionLabel 
}) => {
    const [name, setName] = useState(initialName);
    const [region, setRegion] = useState(initialRegion);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const t = setTimeout(() => {
                setName(initialName);
                setRegion(initialRegion);
                setIsSaving(false);
            }, 0);
            return () => clearTimeout(t);
        }
    }, [isOpen, initialName, initialRegion]);

    const handleSave = async () => {
        setIsSaving(true);
        await onSave(name, region);
        setIsSaving(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-8 p-2">
                <div className="space-y-2">
                    <label className="text-sm font-medium  text-text-muted tracking-wide ml-1">Server Identifier</label>
                    <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Phoenix Operations"
                        className="w-full bg-surface-alt border border-border-subtle p-4 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 transition-all shadow-inner"
                        autoFocus
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium  text-text-muted tracking-wide ml-1">Geo-Data Region</label>
                    <div className="relative">
                        <select 
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            className="w-full bg-surface-alt border border-border-subtle p-4 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                        >
                            <option value="US-East">N. Virginia (US-East)</option>
                            <option value="US-West">Oregon (US-West)</option>
                            <option value="EU-Central">Frankfurt (EU)</option>
                            <option value="AP-South">Singapore (APAC)</option>
                        </select>
                    </div>
                </div>
                <div className="pt-6 flex justify-end gap-3 border-t border-border-subtle">
                    <Button variant="secondary" onClick={onClose} className="h-12 px-4" disabled={isSaving}>Cancel</Button>
                    <Button 
                        variant="primary" 
                        onClick={handleSave} 
                        className="h-12 px-8 bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20  tracking-wide font-medium text-sm"
                        disabled={!name || isSaving}
                    >
                        {isSaving ? "Saving..." : actionLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
