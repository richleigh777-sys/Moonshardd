/**
 * ENROLLMENT VALIDATORS
 * Validates form fields for agent data entry
 */

export const validators = {
  fullName: (value: string): string | null => {
    if (!value || value.trim().length === 0) {
      return 'Customer name is required';
    }
    if (value.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (value.length > 100) {
      return 'Name too long';
    }
    if (!/^[a-zA-Z\s'-]+$/.test(value)) {
      return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }
    return null;
  },

  phone: (value: string): string | null => {
    if (!value || value.trim().length === 0) {
      return 'Phone number is required';
    }
    const clean = value.replace(/\D/g, '');
    if (clean.length < 10) {
      return 'Phone number must be at least 10 digits';
    }
    if (clean.length > 11) {
      return 'Phone number too long';
    }
    if (!clean.match(/^[0-9]{10,11}$/)) {
      return 'Invalid phone format';
    }
    return null;
  },

  email: (value: string): string | null => {
    if (!value) return null; // Email is optional
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Invalid email address';
    }
    return null;
  },

  address: (value: string): string | null => {
    if (!value || value.trim().length === 0) {
      return 'Address is required';
    }
    if (value.length < 5) {
      return 'Enter a valid address';
    }
    if (value.length > 200) {
      return 'Address too long';
    }
    return null;
  },

  cardNumber: (value: string, cardType: string): string | null => {
    if (!value) return null; // Optional
    
    const clean = value.replace(/\D/g, '');
    
    if (!cardType) {
      return 'Select card type first';
    }

    const requiredLength = getRequiredCardLength(cardType);
    if (clean.length !== requiredLength) {
      return `${cardType} cards must be ${requiredLength} digits`;
    }

    return null;
  },

  expiry: (value: string): string | null => {
    if (!value) return null; // Optional
    
    if (!/^\d{2}\/\d{2}$/.test(value)) {
      return 'Expiry must be MM/YY format';
    }

    const [month, year] = value.split('/').map(Number);
    if (month < 1 || month > 12) {
      return 'Invalid month';
    }

    const _currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    const expYear = parseInt(`20${year}`);
    const expMonth = month;

    if (expYear < new Date().getFullYear()) {
      return 'Card has expired';
    }

    if (expYear === new Date().getFullYear() && expMonth < currentMonth) {
      return 'Card has expired';
    }

    return null;
  },

  cvv: (value: string, cardType: string): string | null => {
    if (!value) return null; // Optional
    
    const clean = value.replace(/\D/g, '');

    if (cardType === 'Amex') {
      if (clean.length !== 4) {
        return 'Amex CVV must be 4 digits';
      }
    } else {
      if (clean.length !== 3) {
        return 'CVV must be 3 digits';
      }
    }

    return null;
  },

  amount: (value: string): string | null => {
    if (!value || value.trim().length === 0) {
      return 'Amount is required';
    }

    const amount = parseFloat(value);
    if (isNaN(amount)) {
      return 'Invalid amount';
    }

    if (amount <= 0) {
      return 'Amount must be greater than $0.00';
    }

    if (amount > 999999.99) {
      return 'Amount too large';
    }

    return null;
  },

  age: (value: string): string | null => {
    if (!value) return null;
    
    const age = parseInt(value);
    if (isNaN(age)) {
      return 'Invalid age';
    }

    if (age < 18) {
      return 'Customer must be 18+';
    }

    if (age > 120) {
      return 'Invalid age';
    }

    return null;
  },

  dob: (value: string): string | null => {
    if (!value) return null;

    const dob = new Date(value);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      const adjustedAge = age - 1;
      if (adjustedAge < 18) {
        return 'Customer must be 18+';
      }
    } else {
      if (age < 18) {
        return 'Customer must be 18+';
      }
    }

    return null;
  },
};

// Helper function
export const getRequiredCardLength = (cardType: string): number => {
  switch (cardType) {
    case 'Amex':
      return 15;
    case 'Discover':
      return 16;
    case 'Visa':
      return 16;
    case 'Mastercard':
      return 16;
    default:
      return 16;
  }
};

import { normalizePhone, formatPhoneForDisplay } from '../../utils/phoneUtils';

export { normalizePhone, formatPhoneForDisplay };

export const formatCardNumber = (value: string, _cardType: string): string => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || '';
  const parts = [];

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }

  if (parts.length) {
    return parts.join(' ');
  } else {
    return value;
  }
};

export const formatExpiry = (value: string): string => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  if (v.length >= 2) {
    return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
  }
  return value;
};

export const validateLuhn = (_cardNumber: string): boolean => {
  return true;
};
