
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

        if (!confirm("WARNING: This will generate significant load and database records. Continue?")) return;

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
        
        if (!confirm("WARNING: This will inject 1000 records immediately. UI may freeze.")) return;
        
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
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Activity className="text-purple-500" size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-zinc-100">System Load Tester</h3>
                        <p className="text-xs text-zinc-500">Stress test infrastructure and UI performance</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className={`px-3 py-1.5 rounded text-xs font-mono ${stats.fps < 30 ? 'bg-red-500/20 text-status-error' : 'bg-green-500/20 text-green-400'}`}>
                        {stats.fps} FPS
                    </div>
                    {stats.memory > 0 && (
                        <div className="px-3 py-1.5 rounded text-xs font-mono bg-zinc-800 text-zinc-400">
                            {stats.memory} MB
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-surface-alt rounded-lg p-4 border border-zinc-800/50">
                    <div className="text-zinc-500 text-xs  tracking-wider mb-1">Sales Generated</div>
                    <div className="text-2xl font-mono text-purple-400">{stats.salesGenerated}</div>
                </div>
                <div className="bg-surface-alt rounded-lg p-4 border border-zinc-800/50">
                    <div className="text-zinc-500 text-xs  tracking-wider mb-1">Logs Generated</div>
                    <div className="text-2xl font-mono text-blue-400">{stats.logsGenerated}</div>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={runStressTest}
                    className={`flex-1 py-3 rounded-lg font-bold text-xs  tracking-wider flex items-center justify-center gap-2 transition-all ${
                        mode === 'stress' 
                            ? 'bg-red-500/20 text-status-error border border-red-500/50 animate-pulse' 
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                >
                    {mode === 'stress' ? <StopCircle size={16} /> : <PlayCircle size={16} />}
                    {mode === 'stress' ? 'Stop Stress Test' : 'Start Stress Loop'}
                </button>

                <button
                    onClick={runSpikeTest}
                    disabled={isRunning}
                    className="flex-1 py-3 rounded-lg font-bold text-xs  tracking-wider flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-50"
                >
                    <Zap size={16} />
                    Inject 1k Spike
                </button>
            </div>

            {isRunning && (
                <div className="mt-4 flex items-center gap-2 text-xs text-yellow-500/80 bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
                    <AlertTriangle size={16} />
                    <span>System performance may degrade during active testing.</span>
                </div>
            )}
        </div>
    );
};
