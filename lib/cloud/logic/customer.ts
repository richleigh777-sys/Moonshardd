import { Sale, Customer } from '../../../types.ts';
import { normalizePhone, normalizeEmail, createAddressFingerprint } from '../../../views/utils/dataSanitizer.ts';

export const rebuildCustomersFromSales = (sales: Sale[], currentCustomers: Customer[], serverId: string) => {
    const serverSales = sales.filter(s => s.serverId === serverId);
    const customerMap = new Map<string, Customer>();

    serverSales.forEach(sale => {
        const phone = normalizePhone(sale.phone);
        const email = normalizeEmail(sale.email || '');
        const addressFingerprint = createAddressFingerprint(sale.address);
        
        // Match by phone, email, or address
        let customer = customerMap.get(phone) || customerMap.get(email) || customerMap.get(addressFingerprint);
        
        if (!customer) {
            customer = {
                id: `cust-${phone || email || addressFingerprint}`,
                serverId,
                firstName: (sale.customer || '').split(' ')[0] || '',
                lastName: (sale.customer || '').split(' ').slice(1).join(' ') || '',
                fullName: sale.customer,
                email: sale.email || '',
                phone: sale.phone,
                address: sale.address,
                normalizedPhone: phone,
                normalizedEmail: email,
                addressFingerprint: addressFingerprint,
                ltv: 0,
                orderCount: 0,
                lastOrderDate: 0,
                firstSource: sale.sourceType || 'Direct',
                tags: [],
                salesHistory: [],
                phones: [sale.phone],
                emails: [sale.email || ''],
                dob: sale.dob,
                age: sale.age ? Number(sale.age) : undefined
            };
        }

        customer.ltv += sale.amount;
        customer.orderCount += 1;
        customer.lastOrderDate = Math.max(customer.lastOrderDate, sale.timestamp);
        customer.salesHistory.push(sale);
        
        if (sale.phone && !customer.phones.includes(sale.phone)) customer.phones.push(sale.phone);
        if (sale.email && !customer.emails.includes(sale.email)) customer.emails.push(sale.email);

        customerMap.set(phone, customer);
        if (email) customerMap.set(email, customer);
        customerMap.set(addressFingerprint, customer);
    });

    return { 
        isRebuilding: false, 
        customers: Array.from(new Set(customerMap.values())) 
    };
};
