import { useInfiniteQuery } from '@tanstack/react-query';
import { nexusGateway } from '../nexus/adapters/DataGateway';

export const usePaginatedCustomers = (searchQuery: string = '', limitCount: number = 20) => {
    return useInfiniteQuery({
        queryKey: ['customers', searchQuery],
        queryFn: async ({ pageParam = null }) => {
            const conditions: any[] = [];
            
            const { data, lastDoc } = await nexusGateway.getPaginated('customers', conditions, limitCount, pageParam);
            
            // Client side filter if search is active since firestore wildcard search is limited
            let filteredData = data;
            if (searchQuery) {
                const lowerQ = searchQuery.toLowerCase();
                const normalizedQ = searchQuery.replace(/[\s\-()+]/g, '');
                const isNumericSearch = /^\d+$/.test(normalizedQ);

                filteredData = data.filter((c: any) => {
                    if (isNumericSearch && c.phone) {
                        const normalizedPhone = c.phone.replace(/[\s\-()+]/g, '');
                        if (normalizedPhone.includes(normalizedQ)) return true;
                    }
                    return (c.name || '').toLowerCase().includes(lowerQ) ||
                           (c.phone || '').includes(lowerQ) ||
                           (c.email || '').toLowerCase().includes(lowerQ);
                });
            }
            
            return { data: filteredData, lastDoc };
        },
        getNextPageParam: (lastPage) => lastPage.lastDoc || undefined,
        initialPageParam: null,
    });
};
