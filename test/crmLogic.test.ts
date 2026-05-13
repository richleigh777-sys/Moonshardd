
import { describe, it, expect } from 'vitest';
import { 
    formatUSAPhone, 
    formatCardNumber, 
    formatExpiry, 
    formatCurrency, 
    preciseRound, 
    calculateWinRate, 
    validateLuhn, 
    validateExpiry,
    getRequiredCardLength
} from '../views/utils/crmLogic';

describe('crmLogic Utilities', () => {
    describe('formatUSAPhone', () => {
        it('should format a 10-digit number correctly', () => {
            expect(formatUSAPhone('1234567890')).toBe('(123) 456-7890');
        });
        it('should handle partial numbers', () => {
            expect(formatUSAPhone('123')).toBe('123');
            expect(formatUSAPhone('123456')).toBe('(123) 456');
        });
        it('should strip non-digits', () => {
            expect(formatUSAPhone('123-456-7890')).toBe('(123) 456-7890');
        });
    });

    describe('formatCardNumber', () => {
        it('should format standard 16-digit cards', () => {
            expect(formatCardNumber('1234567812345678')).toBe('1234 5678 1234 5678');
        });
        it('should format Amex correctly', () => {
            expect(formatCardNumber('123456789012345', 'Amex')).toBe('1234 567890 12345');
        });
    });

    describe('formatExpiry', () => {
        it('should format MMYY to MM/YY', () => {
            expect(formatExpiry('1225')).toBe('12/25');
        });
        it('should handle partial expiry', () => {
            expect(formatExpiry('1')).toBe('1');
            expect(formatExpiry('12')).toBe('12');
        });
    });

    describe('formatCurrency', () => {
        it('should format numbers to USD', () => {
            expect(formatCurrency(1234.56)).toBe('$1,234.56');
        });
        it('should handle compact notation', () => {
            // Note: Intl.NumberFormat output can vary slightly by environment, 
            // but standard 'compact' for 1000 is usually '1K' or '$1.00K' depending on currency settings
            expect(formatCurrency(1000, true)).toContain('1');
            expect(formatCurrency(1000, true)).toContain('K');
        });
    });

    describe('preciseRound', () => {
        it('should round to 2 decimal places by default', () => {
            expect(preciseRound(1.234)).toBe(1.23);
            expect(preciseRound(1.235)).toBe(1.24);
        });
        it('should handle floating point precision issues', () => {
            expect(preciseRound(1.005, 2)).toBe(1.01);
        });
    });

    describe('calculateWinRate', () => {
        it('should calculate percentage correctly', () => {
            expect(calculateWinRate(10, 10)).toBe(50);
            expect(calculateWinRate(1, 3)).toBe(25);
        });
        it('should return 0 for zero total resolved', () => {
            expect(calculateWinRate(0, 0)).toBe(0);
        });
    });

    describe('validateLuhn', () => {
        it('should validate correct card numbers', () => {
            // Standard test card for Luhn
            expect(validateLuhn('49927398716')).toBe(true);
        });
        it('should invalidate incorrect card numbers', () => {
            expect(validateLuhn('49927398717')).toBe(false);
        });
    });

    describe('validateExpiry', () => {
        it('should return false for invalid format', () => {
            expect(validateExpiry('1225')).toBe(false);
            expect(validateExpiry('13/25')).toBe(false);
        });
        it('should return true for future dates', () => {
            const futureYear = (new Date().getFullYear() % 100) + 1;
            expect(validateExpiry(`12/${futureYear}`)).toBe(true);
        });
        it('should return false for past dates', () => {
            expect(validateExpiry('01/20')).toBe(false);
        });
    });

    describe('getRequiredCardLength', () => {
        it('should return 15 for Amex', () => {
            expect(getRequiredCardLength('Amex')).toBe(15);
        });
        it('should return 16 for others', () => {
            expect(getRequiredCardLength('Visa')).toBe(16);
            expect(getRequiredCardLength('Mastercard')).toBe(16);
        });
    });
});
