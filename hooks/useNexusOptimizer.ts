import { useState, useCallback } from 'react';
import { Sale, PipelineStage } from '../types';
import { useCRM } from '../hooks/useCRM';
import { sfx } from '../lib/soundService';

export const useNexusOptimizer = (sales: Sale[]) => {
  const { updateSaleStatus } = useCRM();
  const [isOptimizing, setIsOptimizing] = useState(false);

  const executeCorrection = useCallback(async () => {
    setIsOptimizing(true);
    sfx.playSubmit();

    const corrections: Promise<void>[] = [];
    let count = 0;

    sales.forEach(sale => {
      let targetStage: PipelineStage | null = null;

      // Rule A: Approved sales must be in 'Closed Won'
      if (sale.status === 'Approved' && sale.pipelineStatus !== 'Closed Won') {
        targetStage = 'Closed Won';
      }

      if (targetStage) {
        count++;
        corrections.push(updateSaleStatus(sale.id, sale.status, { pipelineStatus: targetStage }));
      }
    });

    await Promise.all(corrections);
    
    // Artificial delay for visual "Scanning" interaction
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    setIsOptimizing(false);
    if (count > 0) sfx.playSuccess();
    
    return count;
  }, [sales, updateSaleStatus]);

  return { isOptimizing, executeCorrection };
};