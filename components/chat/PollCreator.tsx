
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, Input } from '../ui/Base';

interface PollCreatorProps {
    onSubmit: (question: string, options: string[]) => void;
    onCancel: () => void;
}

export const PollCreator: React.FC<PollCreatorProps> = ({ onSubmit, onCancel }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);

    const addOption = () => setOptions([...options, '']);
    const updateOption = (idx: number, val: string) => {
        const newOpts = [...options];
        newOpts[idx] = val;
        setOptions(newOpts);
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <Input 
                label="Question" 
                placeholder="Ask something..." 
                value={question} 
                onChange={e => setQuestion(e.target.value)} 
                autoFocus 
                className="text-lg font-bold"
            />
            <div className="space-y-3">
                <label className="text-sm font-[700]  text-text-muted tracking-[0.2em]">Options</label>
                {options.map((opt, i) => (
                    <Input 
                        key={i} 
                        placeholder={`Option ${i + 1}`} 
                        value={opt} 
                        onChange={e => updateOption(i, e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && opt) {
                                if (i === options.length - 1) addOption();
                            }
                        }}
                    />
                ))}
                {options.length < 5 && (
                    <button onClick={addOption} className="text-sm text-accent-primary font-bold hover:underline flex items-center gap-1.5 mt-2 transition-all">
                        <Plus size={16}/> Add Option
                    </button>
                )}
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t border-border-subtle">
                <Button variant="secondary" onClick={onCancel} className="h-12 px-4">Cancel</Button>
                <Button 
                    variant="primary" 
                    disabled={!question || options.some(o => !o)} 
                    onClick={() => onSubmit(question, options)} 
                    className="h-12 px-8 shadow-lg shadow-accent-primary/20"
                >
                    Create Poll
                </Button>
            </div>
        </div>
    );
};
