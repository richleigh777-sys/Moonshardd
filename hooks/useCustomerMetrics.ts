import { useMemo } from 'react';
import { Customer, Sale } from '../types';

export function useCustomerMetrics(customers: Customer[], sales: Sale[]) {
    // Unique customers selection (Deduplicate customers array by phone number just to guarantee safe state)
    const uniqueCustomers = useMemo(() => {
        const seen = new Set<string>();
        const result: Customer[] = [];
        // Sort original customers newest first so we always grab latest profile if duplicates exist in db
        const sortedRaw = [...customers].sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
        
        sortedRaw.forEach(c => {
            const cleanPhone = (c.phone || '').replace(/\D/g, '');
            const cleanEmail = (c.email || '').toLowerCase().trim();
            const uniqueKey = cleanPhone || cleanEmail;
            
            if (!uniqueKey) {
                result.push(c);
                return;
            }
            if (!seen.has(uniqueKey)) {
                seen.add(uniqueKey);
                result.push(c);
            }
        });
        return result;
    }, [customers]);

    // Precompute dynamic activity metrics from the loaded live Sales Ledger
    const customerDynamicMetrics = useMemo(() => {
        const metricsMap = new Map<string, {
            sales: Sale[];
            ltv: number;
            orderCount: number;
            declineCount: number;
            lastStatus: 'Pending' | 'Approved' | 'Declined' | 'Cancelled' | 'Rescue In Progress' | 'None';
            lastAmount: number;
            lastProduct: string;
            lastTimestamp: number;
            firstSource: string;
        }>();

        // High-performance index maps to bypass O(N * M) nested scanning
        const salesByCustId = new Map<string, Sale[]>();
        const salesByPhone = new Map<string, Sale[]>();
        const salesByEmail = new Map<string, Sale[]>();

        sales.forEach(sale => {
            if (sale.customerId) {
                let list = salesByCustId.get(sale.customerId);
                if (!list) {
                    list = [];
                    salesByCustId.set(sale.customerId, list);
                }
                list.push(sale);
            }

            const salePhone = (sale.phone || '').replace(/\D/g, '');
            if (salePhone) {
                let list = salesByPhone.get(salePhone);
                if (!list) {
                    list = [];
                    salesByPhone.set(salePhone, list);
                }
                list.push(sale);
            }
            
            const saleEmail = (sale.email || '').toLowerCase().trim();
            if (saleEmail) {
                let list = salesByEmail.get(saleEmail);
                if (!list) {
                    list = [];
                    salesByEmail.set(saleEmail, list);
                }
                list.push(sale);
            }
        });

        uniqueCustomers.forEach(c => {
            const cleanCustPhone = (c.phone || '').replace(/\D/g, '');
            const cleanCustEmail = (c.email || '').toLowerCase().trim();

            // Set-based deduplication of sales records for this specific customer
            const matchedSalesSet = new Set<Sale>();

            // 1. Check ID lookup
            const listById = salesByCustId.get(c.id);
            if (listById) {
                listById.forEach(s => matchedSalesSet.add(s));
            }

            // 2. Check Phone lookup
            if (cleanCustPhone) {
                const listByPhone = salesByPhone.get(cleanCustPhone);
                if (listByPhone) {
                    listByPhone.forEach(s => matchedSalesSet.add(s));
                }
            }
            
            // 3. Check Email lookup
            if (cleanCustEmail) {
                const listByEmail = salesByEmail.get(cleanCustEmail);
                if (listByEmail) {
                    listByEmail.forEach(s => matchedSalesSet.add(s));
                }
            }

            // Standard descending chronological sort of transaction ledger rows
            const cSales = Array.from(matchedSalesSet).sort((a, b) => b.timestamp - a.timestamp);

            const approvedSales = cSales.filter(s => s.status === 'Approved');
            const ltv = approvedSales.reduce((sum, s) => sum + (s.amount || 0), 0);
            const orderCount = approvedSales.length;
            const declineCount = cSales.filter(s => s.status === 'Declined').length;
            const newest = cSales[0];

            metricsMap.set(c.id, {
                sales: cSales,
                ltv: ltv,
                orderCount: orderCount,
                declineCount: declineCount,
                lastStatus: newest ? newest.status : 'None',
                lastAmount: newest ? newest.amount : 0,
                lastProduct: newest ? newest.product : '',
                lastTimestamp: newest ? newest.timestamp : 0,
                firstSource: newest ? (newest.sourceType || 'Pipeline') : (c.firstSource || 'Imported'),
            });
        });

        return metricsMap;
    }, [uniqueCustomers, sales]);

    return { uniqueCustomers, customerDynamicMetrics };
}
