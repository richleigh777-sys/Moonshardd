import { useState } from 'react';
import { Search } from 'lucide-react';
import { useSystem } from '../../../../hooks/useSystem';
import { PayoutCycle } from '../../../widgets/payouts/usePayoutHistory';
import { User } from '../../../../types';
import { sfx } from '../../../../lib/soundService';
import { usePayrollData } from './hooks/usePayrollData';

// Modular Components
import { PayrollMetrics } from './components/PayrollMetrics';
import { PayrollCycleCard } from './components/PayrollCycleCard';
import { PayStubDrawer } from './components/PayStubDrawer';
import { AdjustmentModal } from './components/AdjustmentModal';

export const PayrollManager: React.FC = () => {
    const { setToast } = useSystem();
    
    // Logic Hook
    const {
        agents,
        filteredPayroll,
        metrics,
        selectedAgentId,
        setSelectedAgentId,
        setAdjustment
    } = usePayrollData();
    
    // UI State
    // Updated type to include agentPayouts which is available in the mapped data from usePayrollData
    const [inspecting, setInspecting] = useState<{cycle: PayoutCycle & { agentPayouts: any[] }, agent: User, sales: any[]} | null>(null);
    const [adjustModal, setAdjustModal] = useState<{isOpen: boolean, cycleId: string, agentId: string, currentVal: number} | null>(null);
    const [adjustAmount, setAdjustAmount] = useState('0');

    // Handlers
    const handleSaveAdjustment = () => {
        if (!adjustModal) return;
        const val = parseFloat(adjustAmount);
        if (isNaN(val)) return;

        setAdjustment(adjustModal.cycleId, adjustModal.agentId, val);
        setToast({ title: 'Payroll', message: "Adjustment Applied", type: "success" });
        sfx.playConfirm();
        setAdjustModal(null);
        setAdjustAmount('0');
    };

    const openAdjustModal = ({ cycleId, agentId, currentVal }: { cycleId: string, agentId: string, currentVal: number }) => {
        setAdjustModal({ isOpen: true, cycleId, agentId, currentVal });
        setAdjustAmount(currentVal.toString());
        sfx.playClick();
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 pb-10">
            
            {/* PAY STUB DRAWER */}
            {inspecting && (
                <PayStubDrawer 
                    cycle={inspecting.cycle} 
                    agent={inspecting.agent} 
                    sales={inspecting.sales} 
                    adjustments={inspecting.cycle.agentPayouts.find((p: any) => p.agent.id === inspecting.agent.id)?.manualAdj || 0}
                    onClose={() => setInspecting(null)} 
                />
            )}

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary tracking-tight">Financial Operations</h1>
                    <p className="text-sm text-text-muted">Manage payouts, adjustments, and compliance.</p>
                </div>
                
                <div className="flex items-center bg-surface-main rounded-xl shadow-sm border border-border-subtle p-1">
                    <div className="pl-3 text-text-muted">
                        <Search size={16} />
                    </div>
                    <select 
                        value={selectedAgentId} 
                        onChange={(e) => setSelectedAgentId(e.target.value)}
                        className="bg-transparent text-sm font-medium text-text-secondary outline-none cursor-pointer py-2 pl-2 pr-8 hover:text-accent-primary transition-colors"
                    >
                        <option value="All">All Partners</option>
                        {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                </div>
            </div>

            {/* METRICS GRID */}
            <div className="mb-8">
                <PayrollMetrics metrics={metrics} />
            </div>

            {/* CYCLES LIST */}
            <div className="space-y-8">
                {filteredPayroll.map(cycle => (
                    <PayrollCycleCard 
                        key={cycle.id}
                        cycle={cycle as any}
                        onInspect={() => setInspecting(cycle as any)}
                        onAdjust={openAdjustModal}
                    />
                ))}
            </div>

            {/* ADJUSTMENT MODAL */}
            <AdjustmentModal 
                isOpen={!!adjustModal}
                onClose={() => setAdjustModal(null)}
                onSave={handleSaveAdjustment}
                amount={adjustAmount}
                setAmount={setAdjustAmount}
            />
        </div>
    );
};