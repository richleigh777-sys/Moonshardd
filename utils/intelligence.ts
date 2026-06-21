
import { Sale } from '../types';
import { normalizePhone, normalizeEmail } from '../views/utils/dataSanitizer';

// --- TYPE DEFINITIONS FOR ENRICHED PROFILES ---
export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalSpent: number;
  orderCount: number;
  lastPurchaseDate: number; // Timestamp
  firstPurchaseDate: number;
  status: 'VIP' | 'Active' | 'At Risk' | 'New' | 'Lost' | 'Prospect';
  salesHistory: Sale[];
  favoriteProduct: string;
  avgOrderValue: number;
  tags: string[];
  phones: Set<string>; // Track multiple contact points (Normalized)
  emails: Set<string>; // Track multiple emails (Normalized)
  customFields?: Record<string, any>;
}

// --- 1. THE SENTINEL: DEDUPLICATION ENGINE ---
export const deduplicateAndEnrich = (sales: Sale[]): CustomerProfile[] => {
  // Master storage for unique profiles
  const profiles: CustomerProfile[] = [];
  
  // Indexes pointing to the profile object
  const phoneIndex = new Map<string, CustomerProfile>();
  const emailIndex = new Map<string, CustomerProfile>();

  (sales || []).forEach((sale) => {
    const cleanPhone = normalizePhone(sale.phone || '');
    const cleanEmail = normalizeEmail(sale.email || '');
    
    // 1. Attempt to find existing profile via indexes
    let profile: CustomerProfile | undefined;

    if (cleanPhone && phoneIndex.has(cleanPhone)) {
        profile = phoneIndex.get(cleanPhone);
    } else if (cleanEmail && emailIndex.has(cleanEmail)) {
        profile = emailIndex.get(cleanEmail);
    }

    // 2. If no profile exists, create new one
    if (!profile) {
        profile = {
            id: `cust-${cleanPhone || cleanEmail || Date.now()}-${Math.random().toString(36).substr(2,5)}`,
            name: sale.customer,
            email: sale.email || '',
            phone: sale.phone || '',
            address: sale.address || sale.billingAddress || '',
            totalSpent: 0,
            orderCount: 0,
            lastPurchaseDate: sale.timestamp,
            firstPurchaseDate: sale.timestamp,
            status: 'New',
            salesHistory: [],
            favoriteProduct: '',
            avgOrderValue: 0,
            tags: [],
            phones: new Set(),
            emails: new Set()
        };
        profiles.push(profile);
    }

    // 3. Update Indexes (The "Stitching" Phase)
    // Even if we found the profile via Phone, we map the Email to it too (and vice versa)
    if (cleanPhone) {
        phoneIndex.set(cleanPhone, profile);
        profile.phones.add(cleanPhone);
    }
    if (cleanEmail) {
        emailIndex.set(cleanEmail, profile);
        profile.emails.add(cleanEmail);
    }

    // 4. Enrich Profile Data
    // Only count approved sales towards financial value
    if (sale.status === 'Approved') {
        profile.totalSpent += Number(sale.amount || 0);
        profile.orderCount += 1;
    }

    // Add to history
    // Avoid duplicates in history if the array is re-processed (simple ID check)
    if (!profile.salesHistory.some(s => s.id === sale.id)) {
        profile.salesHistory.push(sale);
    }
    
    // Update Contact Info (Latest data wins)
    if (sale.timestamp >= profile.lastPurchaseDate) {
      profile.lastPurchaseDate = sale.timestamp;
      profile.name = sale.customer; 
      if (sale.email) profile.email = sale.email;
      if (sale.phone) profile.phone = sale.phone;
      if (sale.address) profile.address = sale.address;
    }
    
    if (sale.timestamp < profile.firstPurchaseDate) {
      profile.firstPurchaseDate = sale.timestamp;
    }
  });

  // --- 2. ENRICHMENT CORE: CALCULATE METRICS ---
  return profiles.map(profile => {
    // A. CALCULATE STATUS
    const daysSinceLastOrder = (Date.now() - profile.lastPurchaseDate) / (1000 * 3600 * 24);
    
    if (profile.totalSpent > 5000) profile.status = 'VIP';
    else if (profile.orderCount > 1 && daysSinceLastOrder < 60) profile.status = 'Active';
    else if (profile.orderCount === 1 && daysSinceLastOrder < 30) profile.status = 'New';
    else if (daysSinceLastOrder > 90) profile.status = 'Lost';
    else if (profile.orderCount === 0) profile.status = 'Prospect';
    else profile.status = 'At Risk';

    // B. FIND FAVORITE PRODUCT
    const productCounts: Record<string, number> = {};
    profile.salesHistory.forEach(s => {
        if (s.product) {
            productCounts[s.product] = (productCounts[s.product] || 0) + 1;
        }
    });
    
    let favorite = 'None';
    let maxCount = 0;
    Object.entries(productCounts).forEach(([prod, count]) => {
        if (count > maxCount) {
            maxCount = count;
            favorite = prod;
        }
    });
    profile.favoriteProduct = favorite;

    // C. AVG ORDER VALUE
    profile.avgOrderValue = profile.orderCount > 0 ? profile.totalSpent / profile.orderCount : 0;

    // D. SMART TAGS
    if (profile.totalSpent > 10000) profile.tags.push('Whale');
    if (profile.salesHistory.some(s => s.status === 'Declined')) profile.tags.push('Payment Issues');
    if (profile.salesHistory.some(s => s.isReorder)) profile.tags.push('Loyal');
    if (profile.phones.size > 1) profile.tags.push('Multi-Device');
    if (profile.emails.size > 1) profile.tags.push('Linked Accounts');

    // SORT HISTORY (Newest First)
    profile.salesHistory.sort((a, b) => b.timestamp - a.timestamp);

    return profile;
  }).sort((a, b) => b.lastPurchaseDate - a.lastPurchaseDate);
};
