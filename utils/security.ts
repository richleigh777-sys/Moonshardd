/**
 * Security Utilities for Data Protection
 */

/**
 * Masks sensitive information (phone, email, name)
 * @param value The raw string value
 * @param type 'phone' | 'email' | 'text'
 */
export const maskPII = (value: string | undefined | null, type: 'phone' | 'email' | 'text' = 'text'): string => {
    if (!value) return '---';
    
    switch (type) {
        case 'phone': {
            // Format: (XXX) XXX-XXXX -> (XXX) ***-****
            const cleaned = value.replace(/\D/g, '');
            if (cleaned.length < 7) return value;
            return `(${cleaned.slice(0, 3)}) ***-****`;
        }
        
        case 'email': {
            // Format: name@domain.com -> n***@domain.com
            const [local, domain] = value.split('@');
            if (!domain) return value;
            return `${local.charAt(0)}***@${domain}`;
        }
            
        case 'text':
        default:
            // Format: John Doe -> J*** D***
            return value.split(' ').map(word => word.charAt(0) + '***').join(' ');
    }
};
