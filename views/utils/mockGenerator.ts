
import { Sale } from '../../types';

// Utility to generate anonymized, policy-compliant identifiers
const generateAnonymizedIdentity = (index: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const segment = Math.floor(index / 26);
    const char = chars[index % 26];
    return `Client-${char}${segment > 0 ? segment : ''}-${Math.floor(Math.random() * 900) + 100}`;
};

export const generateMockData = (): Sale[] => {
    const sales: Sale[] = [];
    
    const products = ['Alpha Formula', 'Sigma Protocol', 'Nexus Core', 'Prime Wellness'];
    const banks = ['JPMorgan Chase', 'Bank of America', 'Wells Fargo', 'Citigroup'];
    
    // Generic Location Data
    const locations = [
        { city: 'Metro City', state: 'NY', zip: '10001' },
        { city: 'Westside', state: 'CA', zip: '90001' },
        { city: 'Central Hub', state: 'TX', zip: '75001' },
        { city: 'North Sector', state: 'IL', zip: '60601' },
        { city: 'South Base', state: 'FL', zip: '33101' }
    ];

    let globalIdCounter = 1;

    // Loop through 25 agents (1001 to 1025)
    for (let i = 0; i < 25; i++) {
        const agentId = (1001 + i).toString();
        // Matches the naming convention in constants.ts
        const agentName = `Agent ${(i + 1).toString().padStart(2, '0')}`;

        // Create 5 sales per agent
        for (let j = 0; j < 5; j++) {
            const status: Sale['status'] = j === 0 ? 'Pending' : (Math.random() > 0.3 ? 'Approved' : 'Declined');
            const timestamp = Date.now() - (Math.random() * 86400000 * 45); // Last 45 days
            const loc = locations[Math.floor(Math.random() * locations.length)];
            const hasTracking = status === 'Approved' && Math.random() > 0.4;
            const product = products[Math.floor(Math.random() * products.length)];
            
            // SECURITY: Use anonymized customer data
            const customerName = generateAnonymizedIdentity((i * 5) + j);

            sales.push({
                id: `mock-sale-${globalIdCounter++}`,
                serverId: 'server_alpha_prime',
                agent: agentName,
                agentId: agentId,
                customer: customerName,
                address: `${Math.floor(Math.random() * 9999)} Generic Blvd, ${loc.city}, ${loc.state} ${loc.zip}`,
                phone: `(555) 000-${Math.floor(Math.random() * 9000) + 1000}`,
                product: product,
                dosage: 'Maximum',
                quantity: '90 Day Supply',
                amount: Math.floor(Math.random() * 4000) + 1500,
                status,
                timestamp,
                bankName: banks[Math.floor(Math.random() * banks.length)],
                cardProvider: 'Visa Credit',
                medicalConditions: ['General Wellness'],
                trackingId: hasTracking ? `1Z${Math.random().toString(36).substring(2, 10).toUpperCase()}` : undefined
            });
        }
    }

    return sales.sort((a,b) => b.timestamp - a.timestamp);
};
