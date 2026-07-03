// System-wide phone utility functions to ensure consistent formatting and matching
import { areaCodeData } from './areaCodeData';

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

export function getTimeInfoForPhone(phone: string | undefined | null): { time: string, cityState: string } | null {
    const clean = normalizePhone(phone);
    if (!clean || clean.length < 3) return null;
    
    const areaCode = clean.slice(0, 3);
    const data = areaCodeData[areaCode];
    if (!data) return null;

    try {
        const time = new Date().toLocaleTimeString('en-US', {
            timeZone: data.timezone,
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        return {
            time,
            cityState: `${data.city ? data.city + ', ' : ''}${data.state}`
        };
    } catch (_e) {
        return null; // fallback if timezone is invalid
    }
}

