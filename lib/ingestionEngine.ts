import { db, query } from './db.ts';

// Normalize phone number to digits only
export function normalizePhone(phone: string | undefined): string {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
}

// Normalize email to lowercase
export function normalizeEmail(email: string | undefined): string {
    if (!email) return '';
    return email.toLowerCase().trim();
}

// Generate simple address fingerprint
export function generateAddressFingerprint(address: string | undefined): string {
    if (!address) return '';
    return address.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export async function processSalesIngestion(payloads: any[], userId: string, userTeam: string, tenantId: string = 'srv-001'): Promise<any[]> {
    if (!db) return payloads; // Fallback if no DB
    const processedSales = [];

    for (const rawSale of payloads) {
        if (rawSale._frontendProcessed) {
            processedSales.push(rawSale);
            continue;
        }

        // Smart Parse
        const normPhone = normalizePhone(rawSale.customerPhone || rawSale.phone);
        const normEmail = normalizeEmail(rawSale.customerEmail || rawSale.email);
        const addrFingerprint = generateAddressFingerprint(rawSale.customerAddress || rawSale.address);

        let customerId = rawSale.customerId;
        let customerProfile: any = null;
        let _isNewCustomer = false;

        // Identity Resolution
        let existingCustomer: any = null;

        if (customerId) {
            const idRows = await query(`SELECT data, id FROM crm_documents WHERE collection_name = 'customers' AND id = $1`, [customerId]);
            if (idRows.rows.length > 0) existingCustomer = { ...idRows.rows[0].data, id: idRows.rows[0].id };
        }

        if (!existingCustomer && (normPhone || normEmail || addrFingerprint)) {
            const existingRows = await query(`
                SELECT data, id FROM crm_documents 
                WHERE collection_name = 'customers' 
                AND (
                    (data->>'normalizedPhone' = $1 AND $1 != '') OR
                    (data->>'normalizedEmail' = $2 AND $2 != '') OR
                    (data->>'addressFingerprint' = $3 AND $3 != '')
                )
                LIMIT 1
            `, [normPhone, normEmail, addrFingerprint]);
            
            if (existingRows.rows.length > 0) {
                existingCustomer = { ...existingRows.rows[0].data, id: existingRows.rows[0].id };
            }
        }

        if (existingCustomer) {
            customerProfile = existingCustomer;
            customerId = existingCustomer.id;
        }

        const saleAmount = parseFloat(rawSale.amount) || 0;

        // Auto-Create/Update
        if (customerProfile) {
            // Update existing customer
            customerProfile.ltv = (customerProfile.ltv || 0) + saleAmount;
            customerProfile.orderCount = (customerProfile.orderCount || 0) + 1;
            customerProfile.lastOrderDate = Date.now();
            
            // Un-dead pool if they just reordered
            if (customerProfile.status === 'Dead') {
                customerProfile.status = 'Active';
                customerProfile.isDeadPool = false;
                customerProfile.notes = (customerProfile.notes || '') + '\n[System] Revived from Dead pool: Placed new order.';
            }

            await query(`
                UPDATE crm_documents 
                SET data = $1, updated_at = NOW() 
                WHERE collection_name = 'customers' AND id = $2
            `, [JSON.stringify(customerProfile), customerId]);

        } else {
            // Auto-create Pristine Customer profile
            _isNewCustomer = true;
            customerId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            customerProfile = {
                id: customerId,
                firstName: rawSale.customerFirstName || rawSale.firstName || 'Unknown',
                lastName: rawSale.customerLastName || rawSale.lastName || '',
                fullName: rawSale.customerName || `${rawSale.customerFirstName || ''} ${rawSale.customerLastName || ''}`.trim() || 'Unknown Customer',
                email: rawSale.customerEmail || rawSale.email || '',
                phone: rawSale.customerPhone || rawSale.phone || '',
                address: rawSale.customerAddress || rawSale.address || '',
                normalizedPhone: normPhone,
                normalizedEmail: normEmail,
                addressFingerprint: addrFingerprint,
                ltv: saleAmount,
                orderCount: 1,
                lastOrderDate: Date.now(),
                status: 'Active',
                agentId: userId,
                agentTeam: userTeam,
                serverId: tenantId,
                createdAt: Date.now()
            };

            await query(`
                INSERT INTO crm_documents (id, collection_name, data, created_at, updated_at) 
                VALUES ($1, 'customers', $2, NOW(), NOW())
            `, [customerId, JSON.stringify(customerProfile)]);
        }

        // Link the Sale
        const saleId = rawSale.id || `sale_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const saleRecord = {
            ...rawSale,
            id: saleId,
            customerId: customerId,
            customerName: customerProfile.fullName, // cache for easy display
            serverId: tenantId,
            createdAt: rawSale.createdAt || Date.now(),
            updatedAt: Date.now()
        };
        processedSales.push(saleRecord);
    }

    return processedSales;
}
