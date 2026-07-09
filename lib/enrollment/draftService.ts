import { getStorageItem, setStorageItem, removeStorageItem, getAllStorageKeys } from '../../lib/storage';
/**
 * DRAFT SERVICE
 * Manages form draft saving and recovery
 * Auto-saves every 1 second, expires after 24 hours
 */

interface EnrollmentDraft {
  formData: any;
  financials: any;
  cart: any[];
  manualAmount: string;
  notes: string;
  useShippingForBilling: boolean;
  savedAt: number;
  version: string;
}

const DRAFT_VERSION = '3.0';
const DRAFT_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export const draftService = {
  /**
   * Save draft to localStorage
   */
  save: (storageKey: string, data: Omit<EnrollmentDraft, 'savedAt' | 'version'>) => {
    try {
      const draft: EnrollmentDraft = {
        ...data,
        savedAt: Date.now(),
        version: DRAFT_VERSION,
      };

      setStorageItem(storageKey, JSON.stringify(draft));
      console.debug(`[Draft] Saved at ${new Date().toLocaleTimeString()}`);
    } catch (err) {
      console.error('[Draft] Save failed:', err);
      // Silently fail - don't break the app
    }
  },

  /**
   * Load draft from localStorage
   */
  load: (storageKey: string): Omit<EnrollmentDraft, 'savedAt' | 'version'> | null => {
    try {
      const draftJson = getStorageItem(storageKey);
      if (!draftJson) {
        console.debug('[Draft] No draft found');
        return null;
      }

      const draft: EnrollmentDraft = JSON.parse(draftJson);

      // Validate version
      if (draft.version !== DRAFT_VERSION) {
        console.debug('[Draft] Version mismatch, discarding');
        draftService.delete(storageKey);
        return null;
      }

      // Check if draft is stale
      const age = Date.now() - draft.savedAt;
      if (age > DRAFT_EXPIRY_MS) {
        console.debug('[Draft] Expired, discarding');
        draftService.delete(storageKey);
        return null;
      }

      console.debug(`[Draft] Loaded (saved ${Math.round(age / 1000)} seconds ago)`);
      return {
        formData: draft.formData,
        financials: draft.financials,
        cart: draft.cart,
        manualAmount: draft.manualAmount,
        notes: draft.notes,
        useShippingForBilling: draft.useShippingForBilling,
      };
    } catch (err) {
      console.error('[Draft] Load failed:', err);
      draftService.delete(storageKey);
      return null;
    }
  },

  /**
   * Delete draft
   */
  delete: (storageKey: string) => {
    try {
      removeStorageItem(storageKey);
      console.debug('[Draft] Deleted');
    } catch (err) {
      console.error('[Draft] Delete failed:', err);
    }
  },

  /**
   * Check if draft exists
   */
  exists: (storageKey: string): boolean => {
    try {
      return getStorageItem(storageKey) !== null;
    } catch (_err) {
      return false;
    }
  },

  /**
   * Get draft age in seconds
   */
  getAge: (storageKey: string): number | null => {
    try {
      const draftJson = getStorageItem(storageKey);
      if (!draftJson) return null;

      const draft: EnrollmentDraft = JSON.parse(draftJson);
      const ageMs = Date.now() - draft.savedAt;
      return Math.round(ageMs / 1000);
    } catch (_err) {
      return null;
    }
  },

  /**
   * Get all drafts (for debugging/recovery)
   */
  getAllDrafts: (): Record<string, EnrollmentDraft> => {
    const drafts: Record<string, EnrollmentDraft> = {};

    try {
      const keys = getAllStorageKeys();
      for (const key of keys) {
        if (key?.includes('enrollment_draft')) {
          const draftJson = getStorageItem(key);
          if (draftJson) {
            drafts[key] = JSON.parse(draftJson);
          }
        }
      }
    } catch (err) {
      console.error('[Draft] Get all failed:', err);
    }

    return drafts;
  },

  /**
   * Clean up expired drafts
   */
  cleanupExpired: () => {
    try {
      const now = Date.now();
      const keysToDelete: string[] = [];

      const keys = getAllStorageKeys();
      for (const key of keys) {
        if (key?.includes('enrollment_draft')) {
          const draftJson = getStorageItem(key);
          if (draftJson) {
            const draft: EnrollmentDraft = JSON.parse(draftJson);
            if (now - draft.savedAt > DRAFT_EXPIRY_MS) {
              keysToDelete.push(key);
            }
          }
        }
      }

      keysToDelete.forEach((key) => removeStorageItem(key));
      console.debug(`[Draft] Cleaned up ${keysToDelete.length} expired drafts`);
    } catch (err) {
      console.error('[Draft] Cleanup failed:', err);
    }
  },
};
