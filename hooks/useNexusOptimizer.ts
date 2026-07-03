import { useState, useCallback } from 'react';
import { Sale } from '../types';
import { useCRM } from '../hooks/useCRM';
import { sfx } from '../lib/soundService';

export const useNexusOptimizer = (sales: Sale[]) => {
  const { bulkUpdateSales } = useCRM();
  const [isOptimizing, setIsOptimizing] = useState(false);

  const executeCorrection = useCallback(async () => {
    setIsOptimizing(true);
    sfx.playSubmit();

    const ids: string[] = [];
    const _updates: Partial<Sale> = {}; // In this specific case, all selected get { pipelineStatus: 'Closed Won' }
    let count = 0;

    sales.forEach(sale => {
      // Rule A: Approved sales must be in 'Closed Won'
      if (sale.status === 'Approved' && sale.pipelineStatus !== 'Closed Won') {
        ids.push(sale.id);
        count++;
      }
    });

    if (ids.length > 0) {
        await bulkUpdateSales(ids, { pipelineStatus: 'Closed Won' });
    }
    
    // Artificial delay for visual "Scanning" interaction
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    setIsOptimizing(false);
    if (count > 0) sfx.playSuccess();
    
    return count;
  }, [sales, bulkUpdateSales]);

  return { isOptimizing, executeCorrection };
};