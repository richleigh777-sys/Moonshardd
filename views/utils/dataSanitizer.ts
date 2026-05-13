
import { Sale } from '../../types';

// 1. Phone Normalization
export const normalizePhone = (phone: string): string => {
  if (!phone) return "";
  return phone.replace(/\D/g, '').slice(-10); // Standardize to last 10 digits
};

// 2. Email Normalization
export const normalizeEmail = (email: string): string => {
  if (!email) return "";
  return email.trim().toLowerCase();
};

// 3. Name Normalization
export const normalizeName = (name: string): string => {
    if (!name) return "";
    let clean = name.toLowerCase();
    if (clean.includes(',')) {
        const parts = clean.split(',').map(p => p.trim());
        if (parts.length === 2) clean = parts[1] + parts[0];
    }
    return clean.replace(/[^a-z0-9]/g, '');
};

// 4. Address Fingerprint
export const createAddressFingerprint = (address: string): string => {
  if (!address) return "";
  // Focus on number and street name only, ignore apt/suite/zip for fuzzy matching
  const parts = address.toLowerCase().split(' ');
  return parts.slice(0, 3).join('').replace(/[^a-z0-9]/g, '');
};

/**
 * 5. Identity Confidence Scorer
 * Calculates how likely two records belong to the same person.
 * Returns 0-100 score.
 */
export const calculateIdentityConfidence = (recordA: any, recordB: any): number => {
    let score = 0;
    
    // Helper to get all phones/emails
    // Safely handles types that might not have the array property
    const getPhones = (r: any) => {
        const set = new Set<string>();
        if (r.phone) set.add(normalizePhone(r.phone));
        if (r.phones && Array.isArray(r.phones)) r.phones.forEach((p: string) => set.add(p));
        set.delete('');
        return set;
    };

    const getEmails = (r: any) => {
        const set = new Set<string>();
        if (r.email) set.add(normalizeEmail(r.email));
        if (r.emails && Array.isArray(r.emails)) r.emails.forEach((e: string) => set.add(e));
        set.delete('');
        return set;
    };

    const phonesA = getPhones(recordA);
    const phonesB = getPhones(recordB);
    const emailsA = getEmails(recordA);
    const emailsB = getEmails(recordB);

    // Intersection Check
    let phoneMatch = false;
    phonesA.forEach(p => { if (phonesB.has(p)) phoneMatch = true; });
    
    let emailMatch = false;
    emailsA.forEach(e => { if (emailsB.has(e)) emailMatch = true; });

    if (phoneMatch) score += 100;
    if (emailMatch) score += 90;

    const nameA = normalizeName(recordA.customer || recordA.fullName || "");
    const nameB = normalizeName(recordB.customer || recordB.fullName || "");
    const addrA = createAddressFingerprint(recordA.address || recordA.billingAddress || "");
    const addrB = createAddressFingerprint(recordB.address || recordB.billingAddress || "");

    if (nameA && nameA === nameB) {
        score += 20;
        if (addrA && addrA === addrB) score += 60; // Name + Address is strong
    }

    return Math.min(100, score);
};

export const generateStrictCustomerKey = (name: string, phone: string, address: string): string => {
    const normPhone = normalizePhone(phone);
    if (normPhone) return `tel-${normPhone}`;
    
    const normName = normalizeName(name);
    const normAddress = createAddressFingerprint(address);
    if (normName && normAddress) return `${normName}|${normAddress}`;
    
    return `anon-${Date.now()}-${Math.random()}`;
};

export const generateTransactionFingerprint = (sale: Partial<Sale>): string => {
    const phone = normalizePhone(sale.phone || '');
    const amount = Number(sale.amount || 0).toFixed(2);
    const date = sale.timestamp || 0;
    const product = (sale.product || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${phone}|${date}|${amount}|${product}`;
};
