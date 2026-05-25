export const phoneUtils = {
  // Display format for UI
  format: (raw: string): string => {
    if (!raw) return '';
    const cleaned = raw.replace(/\D/g, '');
    if (cleaned.length !== 10) return raw;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  },

  // Storage format (normalized)
  normalize: (raw: string): string => {
    if (!raw) return '';
    return raw.replace(/\D/g, '').slice(-10);
  },

  // Comparison (for search)
  compare: (phone1: string, phone2: string): boolean => {
    return phoneUtils.normalize(phone1) === phoneUtils.normalize(phone2);
  }
};
