import { Customer, Sale } from '../types';

/**
 * Normalizes phone numbers by stripping all non-digit characters.
 */
export function normalizePhone(phone?: string): string {
    return (phone || '').replace(/\D/g, '');
}

/**
 * Normalizes emails by trimming and converting to lowercase.
 */
export function normalizeEmail(email?: string): string {
    return (email || '').trim().toLowerCase();
}

/**
 * Normalizes address strings for robust comparison.
 */
export function normalizeAddressString(addr?: string): string {
    if (!addr) return '';
    let cleaned = addr.replace(/\s+/g, ' ').trim().toLowerCase();
    
    const replacements = [
        { match: /\bstreet\b/g, replace: 'st' },
        { match: /\bavenue\b/g, replace: 'ave' },
        { match: /\broad\b/g, replace: 'rd' },
        { match: /\bboulevard\b/g, replace: 'blvd' },
        { match: /\blane\b/g, replace: 'ln' },
        { match: /\bdrive\b/g, replace: 'dr' },
        { match: /\bcourt\b/g, replace: 'ct' },
        { match: /\bapartment\b/g, replace: 'apt' },
        { match: /\bsuite\b/g, replace: 'ste' },
        { match: /\bhighway\b/g, replace: 'hwy' },
        { match: /\bplace\b/g, replace: 'pl' },
        { match: /\bsquare\b/g, replace: 'sq' },
        { match: /\bterrace\b/g, replace: 'ter' }
    ];
    
    replacements.forEach(({ match, replace }) => {
        cleaned = cleaned.replace(match, replace);
    });

    // Remove punctuation and extra whitespace
    return cleaned.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Strips titles, middle initials, suffixes, punctuation, and extra whitespace.
 */
export function normalizeName(name?: string): string {
    if (!name) return '';
    // Lowercase and remove punctuation
    const cleaned = name.toLowerCase().replace(/[^a-z\s]/g, ' ').trim();
    
    // Remove common prefix titles and suffixes
    const noise = [
        'jr', 'sr', 'ii', 'iii', 'iv', 'v', 'esq', 'mr', 'mrs', 'ms', 'dr', 'prof', 
        'senior', 'junior', 'the', 'nd', 'rd', 'st', 'th'
    ];
    
    let words = cleaned.split(/\s+/).filter(w => w.length > 0 && !noise.includes(w));
    
    // Filter out middle initials (single character words) if there are multiple words
    if (words.length > 1) {
        words = words.filter(w => w.length > 1);
    }
    
    return words.join(' ');
}

/**
 * Standard Levenshtein distance algorithm for calculating typo variance.
 */
export function levenshteinDistance(a: string, b: string): number {
    const tmp: number[][] = [];
    const alen = a.length;
    const blen = b.length;
    if (alen === 0) return blen;
    if (blen === 0) return alen;
    
    for (let i = 0; i <= alen; i++) {
        tmp[i] = [i];
    }
    for (let j = 0; j <= blen; j++) {
        tmp[0][j] = j;
    }
    
    for (let i = 1; i <= alen; i++) {
        for (let j = 1; j <= blen; j++) {
            tmp[i][j] = Math.min(
                tmp[i - 1][j] + 1,
                tmp[i][j - 1] + 1,
                tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
            );
        }
    }
    return tmp[alen][blen];
}

/**
 * Calculates a name similarity ratio between 0.0 and 1.0.
 */
export function getNameSimilarity(name1: string, name2: string): number {
    const n1 = normalizeName(name1);
    const n2 = normalizeName(name2);
    if (!n1 || !n2) return 0;
    if (n1 === n2) return 1.0;

    const words1 = n1.split(' ');
    const words2 = n2.split(' ');
    const set1 = new Set(words1);
    const set2 = new Set(words2);

    // Compute token overlap ratio
    let intersection = 0;
    set1.forEach(w => {
        if (set2.has(w)) intersection++;
    });

    const overlapRatio = intersection / Math.min(words1.length, words2.length);
    if (overlapRatio >= 0.8) return overlapRatio; // High overlap in first name / last name

    // Compute character-level edit distance ratio
    const maxLen = Math.max(n1.length, n2.length);
    const dist = levenshteinDistance(n1, n2);
    return 1 - dist / maxLen;
}

export interface MatchingResult {
    matchedCustomer: Customer | null;
    confidence: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
    score: number;
}

/**
 * Evaluates candidates and finds the best matching Customer with detailed scoring.
 */
export function findBestCustomerMatch(
    saleData: Partial<Sale>,
    customers: Customer[]
): MatchingResult {
    const salePhone = normalizePhone(saleData.phone);
    const saleEmail = normalizeEmail(saleData.email);
    const saleName = saleData.customer || `${saleData.firstName || ''} ${saleData.lastName || ''}`.trim();
    
    if (!salePhone && !saleEmail) {
        return { matchedCustomer: null, confidence: 'NONE', score: 0 };
    }

    let bestCustomer: Customer | null = null;
    let highestScore = 0;

    for (const c of customers) {
        let score = 0;
        let matchedOnIdentity = false;

        const cPhone = normalizePhone(c.phone);
        const cAltPhone = normalizePhone((c as any).alternatePhone);
        const cEmail = normalizeEmail(c.email);
        
        // 1. Primary Identifiers check: Phone or Email
        const phoneMatch = salePhone && (cPhone === salePhone || cAltPhone === salePhone);
        const emailMatch = saleEmail && (cEmail === saleEmail);

        if (phoneMatch) {
            score += 65; // High base weight for exact phone match
            matchedOnIdentity = true;
        } else if (emailMatch) {
            score += 65; // High base weight for exact email match
            matchedOnIdentity = true;
        }

        // If primary identifier does not match, this customer is not a matching candidate. Skip.
        if (!matchedOnIdentity) {
            continue;
        }

        // 2. Name validation check (reinforcing)
        const cName = c.fullName || c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim();
        const nameSimilarity = getNameSimilarity(saleName, cName);

        // Name similarity adds score
        score += nameSimilarity * 35; // Max 35 points for naming overlap

        // 3. Billing Address reinforcement Check
        const saleBilling = normalizeAddressString(saleData.billingAddress || saleData.address);
        const cBilling = normalizeAddressString(c.billingAddress || c.address);
        const cPrevBilling = (c.pastBillingAddresses || []).map(addr => normalizeAddressString(addr));

        if (saleBilling && cBilling) {
            if (saleBilling === cBilling || cPrevBilling.includes(saleBilling)) {
                score += 15; // 15 points for billing match
            } else {
                // Check if they are similar
                const billDistanceRatio = 1 - levenshteinDistance(saleBilling, cBilling) / Math.max(saleBilling.length, cBilling.length);
                if (billDistanceRatio > 0.70) {
                    score += billDistanceRatio * 10;
                }
            }
        }

        // 4. Shipping Address reinforcement Check
        const saleShipping = normalizeAddressString(saleData.shippingAddress || saleData.address);
        const cShipping = normalizeAddressString(c.shippingAddress || c.address);
        const cPrevShipping = (c.pastShippingAddresses || []).map(addr => normalizeAddressString(addr));

        if (saleShipping && cShipping) {
            if (saleShipping === cShipping || cPrevShipping.includes(saleShipping)) {
                score += 15; // 15 points for shipping match
            } else {
                const shipDistanceRatio = 1 - levenshteinDistance(saleShipping, cShipping) / Math.max(saleShipping.length, cShipping.length);
                if (shipDistanceRatio > 0.70) {
                    score += shipDistanceRatio * 10;
                }
            }
        }

        if (score > highestScore) {
            highestScore = score;
            bestCustomer = c;
        }
    }

    let confidence: MatchingResult['confidence'] = 'NONE';
    if (highestScore >= 80) confidence = 'HIGH';
    else if (highestScore >= 50) confidence = 'MEDIUM';
    else if (highestScore >= 30) confidence = 'LOW';

    // To stitch, we want at least a MEDIUM confidence or if direct phone matches but name is some variation
    return {
        matchedCustomer: bestCustomer,
        confidence,
        score: highestScore
    };
}

/**
 * Compiles updates for the matched customer, auto-stitching old shipping or billing locations.
 */
export function autoStitchCustomerProfile(
    customer: Customer,
    saleData: Partial<Sale>
): Partial<Customer> {
    const updates: Partial<Customer> = {
        updatedAt: Date.now()
    };

    // Parse Name bits (Middle Initial, Jr, Sr)
    const saleName = saleData.customer || `${saleData.firstName || ''} ${saleData.lastName || ''}`.trim();
    const cName = customer.fullName || customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
    
    // Resolve name spelling discrepancies cleanly:
    // If the new sale name contains suffixes like Jr., Sr., middle initials, length-wise or detail-wise, we preserve whichever is more complete
    if (saleName && getNameSimilarity(saleName, cName) >= 0.8) {
        if (saleName.length > cName.length) {
            // New name is longer / has more context (e.g. John S. Smith or Jr.)
            updates.fullName = saleName;
            updates.name = saleName;
            
            const parts = saleName.split(/\s+/);
            if (parts.length >= 3) {
                updates.firstName = parts[0];
                updates.lastName = parts.slice(2).join(' ');
                const mi = parts[1].replace(/\./g, '');
                if (mi.length === 1) {
                    (updates as any).middleInitial = mi.toUpperCase();
                }
            } else {
                updates.firstName = saleData.firstName || parts[0];
                updates.lastName = saleData.lastName || parts.slice(1).join(' ');
            }
        }
    }

    // Support primary email updates if previously empty
    if (saleData.email && (!customer.email || customer.email.toLowerCase() === 'unknown')) {
        updates.email = saleData.email;
    }

    // Capture Phone Numbers
    const currentPhones = customer.phones || (customer.phone ? [customer.phone] : []);
    const salePhone = saleData.phone;
    if (salePhone && !currentPhones.includes(salePhone)) {
        updates.phones = [...currentPhones, salePhone];
    }
    
    // Alternate phone logging if secondary number provided
    if ((saleData as any).alternatePhone) {
        const altPhone = (saleData as any).alternatePhone;
        (updates as any).alternatePhone = altPhone;
        if (!currentPhones.includes(altPhone)) {
            updates.phones = [...(updates.phones || currentPhones), altPhone];
        }
    }

    // Core Auto-Stitching of shipping locations
    const originalShipping = customer.shippingAddress || customer.address;
    const incomingShipping = saleData.shippingAddress || saleData.address;
    const pastShipping = customer.pastShippingAddresses || [];

    if (incomingShipping) {
        const normIncoming = normalizeAddressString(incomingShipping);
        const normOriginal = normalizeAddressString(originalShipping);
        
        // If incoming shipping is different from original shipping
        if (normIncoming !== normOriginal) {
            // Keep past shipping, make sure original is logged in past
            const normalizedPast = pastShipping.map(addr => normalizeAddressString(addr));
            const newPastList = [...pastShipping];
            
            if (originalShipping && !normalizedPast.includes(normOriginal)) {
                newPastList.push(originalShipping);
            }
            updates.pastShippingAddresses = newPastList;
            
            // Promote incoming to current shipping
            updates.address = incomingShipping;
            updates.shippingAddress = incomingShipping;
            updates.shippingCity = saleData.shippingCity || saleData.city;
            updates.shippingState = saleData.shippingState || saleData.state;
            updates.shippingZip = saleData.shippingZip || saleData.zip;
        }
    }

    // Core Auto-Stitching of billing locations
    const originalBilling = customer.billingAddress;
    const incomingBilling = saleData.billingAddress;
    const pastBilling = customer.pastBillingAddresses || [];

    if (incomingBilling) {
        const normIncoming = normalizeAddressString(incomingBilling);
        const normOriginal = normalizeAddressString(originalBilling);

        if (normIncoming !== normOriginal) {
            const normalizedPast = pastBilling.map(addr => normalizeAddressString(addr));
            const newPastList = [...pastBilling];

            if (originalBilling && !normalizedPast.includes(normOriginal)) {
                newPastList.push(originalBilling);
            }
            updates.pastBillingAddresses = newPastList;

            // Promote incoming to current billing address
            updates.billingAddress = incomingBilling;
            updates.billingCity = saleData.billingCity;
            updates.billingState = saleData.billingState;
            updates.billingZip = saleData.billingZip;
        }
    }

    // Merge other descriptive identifiers cleanly
    if (saleData.dob && !customer.dob) updates.dob = saleData.dob;
    if (saleData.age && !customer.age) updates.age = Number(saleData.age);
    if (saleData.height && !customer.height) updates.height = saleData.height;
    if (saleData.weight && !customer.weight) updates.weight = saleData.weight;
    
    // Merge medical conditions safely
    if (saleData.medicalConditions && saleData.medicalConditions.length > 0) {
        const originalMed = customer.medicalConditions || [];
        const combined = Array.from(new Set([...originalMed, ...saleData.medicalConditions]));
        updates.medicalConditions = combined;
    }

    return updates;
}
