
import React, { useState, useEffect, useRef } from 'react';
import { Activity, Zap, StopCircle, PlayCircle, AlertTriangle } from 'lucide-react';
import { cloud } from '../../../lib/cloudService';
import { Sale } from '../../../types';

export const LoadTester: React.FC = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [stats, setStats] = useState({
        salesGenerated: 0,
        logsGenerated: 0,
        fps: 60,
        memory: 0
    });
    const [mode, setMode] = useState<'idle' | 'stress' | 'spike'>('idle');
    const intervalRef = useRef<any>(null);
    const frameRef = useRef<any>(null);

    // FPS Counter
    useEffect(() => {
        let lastTime = performance.now();
        let frames = 0;

        const loop = () => {
            const now = performance.now();
            frames++;
            if (now - lastTime >= 1000) {
                setStats(prev => ({
                    ...prev,
                    fps: frames,
                    // @ts-expect-error - performance.memory is a non-standard Chrome API
                    memory: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 0
                }));
                frames = 0;
                lastTime = now;
            }
            frameRef.current = requestAnimationFrame(loop);
        };
        
        if (isRunning) {
            loop();
        } else {
            cancelAnimationFrame(frameRef.current);
        }

        return () => cancelAnimationFrame(frameRef.current);
    }, [isRunning]);

    const generateRandomSale = (): Partial<Sale> => {
        const statuses: Sale['status'][] = ['Pending', 'Approved', 'Declined', 'Cancelled'];
        const products = ['Alpha Brain', 'Neuriva', 'Prevagen', 'Focus Factor'];
        
        return {
            agentId: 'agent-sim',
            agent: 'Simulated Agent',
            customer: `Sim User ${Math.floor(Math.random() * 10000)}`,
            phone: `555-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
            address: '123 Sim Lane, Matrix City',
            product: products[Math.floor(Math.random() * products.length)],
            quantity: '1',
            dosage: '10mg',
            amount: Math.floor(Math.random() * 200) + 50,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            timestamp: Date.now(),
            probability: Math.random() * 100
        };
    };

    const runStressTest = async () => {
        if (isRunning) {
            setIsRunning(false);
            clearInterval(intervalRef.current);
            setMode('idle');
            return;
        }

        // if (!confirm("WARNING: This will generate significant load and database records. Continue?")) return;

        setIsRunning(true);
        setMode('stress');

        // Add 50 sales every 500ms
        intervalRef.current = setInterval(async () => {
            const salesBatch = Array.from({ length: 50 }, generateRandomSale);
            await cloud.addBulk('sales', salesBatch);
            
            const logsBatch = Array.from({ length: 100 }, () => ({
                agentId: 'system-load-test',
                agentName: 'Load Tester',
                action: 'STRESS_TEST_EVENT',
                details: 'Simulated system load event',
                module: 'SYSTEM',
                timestamp: Date.now()
            }));
            await cloud.addBulk('audit', logsBatch);

            setStats(prev => ({
                ...prev,
                salesGenerated: prev.salesGenerated + 50,
                logsGenerated: prev.logsGenerated + 100
            }));
        }, 500);
    };

    const runSpikeTest = async () => {
        if (isRunning) return;
        
        // if (!confirm("WARNING: This will inject 1000 records immediately. UI may freeze.")) return;
        
        setIsRunning(true);
        setMode('spike');
        
        const salesBatch = Array.from({ length: 1000 }, generateRandomSale);
        await cloud.addBulk('sales', salesBatch);
        
        setStats(prev => ({
            ...prev,
            salesGenerated: prev.salesGenerated + 1000
        }));
        
        setIsRunning(false);
        setMode('idle');
    };

    return (
        <div className="bg-surface-main/50 border border-border-subtle rounded-xl p-4 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent-secondary/10 rounded-lg">
                        <Activity className="text-accent-secondary" size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-text-primary">System Load Tester</h3>
                        <p className="text-sm text-text-muted">Stress test infrastructure and UI performance</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className={`px-3 py-1.5 rounded text-sm font-mono ${stats.fps < 30 ? 'bg-status-error/20 text-status-error' : 'bg-status-success/20 text-status-success'}`}>
                        {stats.fps} FPS
                    </div>
                    {stats.memory > 0 && (
                        <div className="px-3 py-1.5 rounded text-sm font-mono bg-surface-alt text-text-muted">
                            {stats.memory} MB
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-surface-alt rounded-lg p-4 border border-border-subtle">
                    <div className="text-text-muted text-sm  tracking-wider mb-1">Sales Generated</div>
                    <div className="text-lg font-mono text-accent-secondary">{stats.salesGenerated}</div>
                </div>
                <div className="bg-surface-alt rounded-lg p-4 border border-border-subtle">
                    <div className="text-text-muted text-sm  tracking-wider mb-1">Logs Generated</div>
                    <div className="text-lg font-mono text-accent-primary">{stats.logsGenerated}</div>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={runStressTest}
                    className={`flex-1 py-3 rounded-lg font-bold text-sm  tracking-wider flex items-center justify-center gap-2 transition-all ${
                        mode === 'stress' 
                            ? 'bg-status-error/20 text-status-error border border-status-error/50 animate-pulse' 
                            : 'bg-surface-alt hover:bg-surface-highlight text-text-primary'
                    }`}
                >
                    {mode === 'stress' ? <StopCircle size={16} /> : <PlayCircle size={16} />}
                    {mode === 'stress' ? 'Stop Stress Test' : 'Start Stress Loop'}
                </button>

                <button
                    onClick={runSpikeTest}
                    disabled={isRunning}
                    className="flex-1 py-3 rounded-lg font-bold text-sm  tracking-wider flex items-center justify-center gap-2 bg-surface-alt hover:bg-surface-highlight text-text-primary disabled:opacity-50"
                >
                    <Zap size={16} />
                    Inject 1k Spike
                </button>
            </div>

            {isRunning && (
                <div className="mt-4 flex items-center gap-2 text-sm text-status-warning/80 bg-status-warning/10 p-2 rounded border border-status-warning/20">
                    <AlertTriangle size={16} />
                    <span>System performance may degrade during active testing.</span>
                </div>
            )}
        </div>
    );
};
