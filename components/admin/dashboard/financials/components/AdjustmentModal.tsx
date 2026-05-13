
import { Plus, Minus } from 'lucide-react';
import { Modal } from '../../../../../components/ui/Modal';
import { Input, Button } from '../../../../../components/ui/Base';

interface AdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    amount: string;
    setAmount: (val: string) => void;
}

export const AdjustmentModal: React.FC<AdjustmentModalProps> = ({ isOpen, onClose, onSave, amount, setAmount }) => {
    
    // Quick adjustment handlers
    const adjust = (delta: number) => {
        const current = parseFloat(amount) || 0;
        setAmount((current + delta).toString());
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Manual Payroll Adjustment"
            size="sm"
        >
            <div className="space-y-6 pt-2">
                <p className="text-sm text-text-muted">Add a one-time bonus (positive) or deduction (negative) to this pay cycle. This will affect the net payout immediately.</p>
                
                <div className="flex items-center gap-3">
                    <button onClick={() => adjust(-50)} className="p-3 bg-surface-alt hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-colors border border-border-subtle"><Minus size={20}/></button>
                    <Input 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                        className="text-center font-bold text-2xl h-14 bg-surface-main border-border-subtle text-text-primary" 
                        autoFocus
                    />
                    <button onClick={() => adjust(50)} className="p-3 bg-surface-alt hover:bg-emerald-500/10 hover:text-emerald-500 rounded-xl transition-colors border border-border-subtle"><Plus size={20}/></button>
                </div>

                <div className="flex justify-end pt-4">
                    <Button variant="primary" onClick={onSave} className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20">
                        Apply Adjustment
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
