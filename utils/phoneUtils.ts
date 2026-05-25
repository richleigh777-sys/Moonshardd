// System-wide phone utility functions to ensure consistent formatting and matching

export function normalizePhone(phone: string | undefined | null): string {
    if (!phone) return '';
    const clean = phone.replace(/\D/g, '');
    // Standardize to 10 digits if possible (e.g., removing US country code 1 if it's 11 digits)
    if (clean.length === 11 && clean.startsWith('1')) {
        return clean.slice(1);
    }
    return clean;
}

export function formatPhoneForDisplay(phone: string | undefined | null): string {
    if (!phone) return '';
    const clean = normalizePhone(phone);
    if (clean.length === 10) {
        return `(${clean.slice(0, 3)}) ${clean.slice(3, 6)}-${clean.slice(6, 10)}`;
    }
    return phone;
}

export function comparePhones(phone1: string, phone2: string): boolean {
    return normalizePhone(phone1) === normalizePhone(phone2) && normalizePhone(phone1).length > 0;
}
