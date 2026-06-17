
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

/**
 * Parses a messy single-string address into distinct components: Street (incl. PO Box/Apt), City, State, Zip.
 * Robust against PO Box variants, two-word cities, states, and zips.
 */
export const parseFullAddressString = (fullAddress: string) => {
    let street = '';
    let city = '';
    let state = '';
    let zip = '';
    
    if (!fullAddress) return { street, city, state, zip };

    let parsingStr = fullAddress.trim();

    // 1. Extract ZIP Code from the end (5 digits optionally followed by -4 digits)
    const zipRegex = /\b(\d{5}(?:-\d{4})?)\b\s*$/;
    const zipMatch = parsingStr.match(zipRegex);
    if (zipMatch) {
        zip = zipMatch[1];
        parsingStr = parsingStr.replace(zipRegex, '').trim();
    }

    // Clean up trailing commas/spaces
    parsingStr = parsingStr.replace(/,+$/, '').trim();

    // 2. Extract State from the end
    // Look for standard 2-letter state abbreviations OR full words (e.g. "New York")
    const stateRegex = /\b([A-Z]{2}|[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b\s*$/;
    const stateMatch = parsingStr.match(stateRegex);
    if (stateMatch) {
        state = stateMatch[1];
        parsingStr = parsingStr.replace(stateRegex, '').trim();
    }

    parsingStr = parsingStr.replace(/,+$/, '').trim();

    // 3. Extract PO Box early so it doesn't get confused as a city/street
    // We look for variants like "P.O Box", "Post Office Box", "PO BOX 123" anywhere in the string
    const poBoxRegex = /\b(P\.?\s*O\.?\s*Box|Post\s*Office\s*Box)\s*\d+\b/i;
    let extractedPoBox = "";
    const poMatch = parsingStr.match(poBoxRegex);
    
    if (poMatch) {
       extractedPoBox = poMatch[0];
       parsingStr = parsingStr.replace(poBoxRegex, '').trim();
    }

    // Clean comma out if it's left scattered
    parsingStr = parsingStr.replace(/,+$/, '').trim();

    // 4. Extract City
    // Usually, what's left at the end is the city, separated by the last comma.
    // If no comma, we assume the last 1 or 2 parts of the string might be the city
    const lastCommaIdx = parsingStr.lastIndexOf(',');
    if (lastCommaIdx !== -1) {
        city = parsingStr.substring(lastCommaIdx + 1).trim();
        street = parsingStr.substring(0, lastCommaIdx).trim();
    } else {
        // Fallback heuristic: If no comma, try splitting by space, take the last 1-2 words as city if the street has enough components.
        // If it's short, just keep it all as street.
        const parts = parsingStr.split(' ');
        if (parts.length > 3) {
            city = parts.slice(-1).join(' '); // Rough guess for 1-word city
            street = parts.slice(0, -1).join(' ');
        } else {
            street = parsingStr;
        }
    }

    // append PO Box to street if it was found
    if (extractedPoBox) {
        street = street ? `${street}, ${extractedPoBox}` : extractedPoBox;
    }

    return { street, city, state, zip };
};
