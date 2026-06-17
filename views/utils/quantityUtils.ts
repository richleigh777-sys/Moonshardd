export function getQuantityMultiplier(quantity: any): number {
    if (typeof quantity === 'number') return quantity;
    if (!quantity || typeof quantity !== 'string') return 1;
    
    const q = quantity.toLowerCase();
    
    // Explicit mappings for common phrases
    if (q.includes('365') || q.includes('1 year') || q.includes('12 month')) return 12;
    if (q.includes('180') || q.includes('6 month')) return 6;
    if (q.includes('90') || q.includes('3 month')) return 3;
    if (q.includes('60') || q.includes('2 month')) return 2;
    if (q.includes('30') || q.includes('1 month')) return 1;

    // Direct multi-bottle phrasing
    const bottleMatch = q.match(/(\d+)\s*bottle/);
    if (bottleMatch) {
        return parseInt(bottleMatch[1], 10) || 1;
    }

    // Basic number extraction, assuming standard 1 qty unless stated otherwise
    const match = q.match(/^(\d+)/);
    if (match) {
        const num = parseInt(match[1], 10);
        // Prevent unusually large multipliers if they just type a string that happens to start with a number
        // e.g., "50 mg" -> we don't want a multiplier of 50. 
        if (num > 0 && num <= 24) {
             return num;
        }
    }
    
    return 1;
}

export function validateManualAmount(value: string, calculatedTotal: number): string | null {
    const amount = parseFloat(value);
    
    if (isNaN(amount)) return 'Invalid amount';
    if (amount <= 0) return 'Amount must be greater than $0.00';
    if (amount > 999999.99) return 'Amount too large (max: $999,999.99)';
    
    // Warn if significantly different from calculated total (e.g. < 10% or > 200%)
    if (calculatedTotal > 0 && (amount < calculatedTotal * 0.1 || amount > calculatedTotal * 2)) {
        // Just return null for now, can be used for warnings later if needed
    }
    
    return null;
}
