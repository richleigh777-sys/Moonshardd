import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EnrollmentForm from '../EnrollmentForm';
import * as CRMHook from '../../../hooks/useCRM';
import * as AuthHook from '../../../hooks/useAuth';
import * as SoundService from '../../../lib/soundService';

// Mock dependencies
vi.mock('../../../hooks/useCRM', () => ({
    useCRM: vi.fn(),
}));

vi.mock('../../../hooks/useAuth', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../../../lib/soundService', () => ({
    sfx: {
        playSubmit: vi.fn(),
        playClick: vi.fn(),
        playSuccess: vi.fn(),
        playError: vi.fn(),
        playDecline: vi.fn(),
        playHover: vi.fn(),
    },
}));

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock clipboard
Object.assign(navigator, {
    clipboard: {
        readText: vi.fn(),
        writeText: vi.fn(),
    },
});

describe('EnrollmentForm Component', () => {
    const mockOnSuccess = vi.fn();
    const mockOnCancel = vi.fn();
    
    const mockCRMContext = {
        addSale: vi.fn(),
        addNote: vi.fn(),
        productConfig: {
            products: [
                { id: 'p1', name: 'Product A', price: 100, dosages: ['10mg', '20mg'] },
                { id: 'p2', name: 'Product B', price: 200, dosages: ['5mg'] },
            ],
            quantities: ['30 Day Supply', '60 Day Supply', '90 Day Supply'],
            presets: []
        },
        sales: [],
        systemConfig: {
            medicalConditions: ['Headache', 'Nausea'],
        },
    };

    const mockAuthContext = {
        currentUser: {
            id: 'user1',
            name: 'Test Agent',
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        
        let uuidCounter = 0;
        // Mock crypto.randomUUID
        Object.defineProperty(globalThis, 'crypto', {
            value: {
                randomUUID: () => `test-uuid-${++uuidCounter}`,
            },
            configurable: true
        });

        (CRMHook.useCRM as any).mockReturnValue(mockCRMContext);
        (AuthHook.useAuth as any).mockReturnValue(mockAuthContext);
        
        // Mock window.confirm and scrollIntoView
        window.confirm = vi.fn(() => true);
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
    });

    it('renders the form correctly', () => {
        render(<EnrollmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
        
        expect(screen.getByText('Sales Entry')).toBeInTheDocument();
        expect(screen.getByText('Order Total')).toBeInTheDocument();
        expect(screen.queryByPlaceholderText('Search by name, phone, or ID...')).not.toBeInTheDocument(); // Modal is closed
    });

    it('updates identity fields correctly', () => {
        render(<EnrollmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
        
        const nameInput = screen.getByPlaceholderText(/Full Name \*/i) as HTMLInputElement;
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        expect(nameInput.value).toBe('John Doe');

        const phoneInput = screen.getByPlaceholderText(/Phone \*/i) as HTMLInputElement;
        fireEvent.change(phoneInput, { target: { value: '5551234567' } });
        // Assuming formatUSAPhone formats it
        expect(phoneInput.value).toBe('(555) 123-4567'); 
    });

    it('calculates total correctly when adding items to cart', async () => {
        render(<EnrollmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
        
        // Initial total should be based on default product (Product A, 100)
        // Default quantity is '30 Day Supply' -> multiplier 1
        // Total = 100 * 1 = 100
        
        // Wait for initial effect to set cart
        await waitFor(() => {
            const totalDisplays = screen.getAllByText(/\$100\.00/i);
            expect(totalDisplays.length).toBeGreaterThan(0);
        });
    });

    it('validates form submission', () => {
        render(<EnrollmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
        
        const submitButton = screen.getByText(/Payment/, { selector: 'button' });
        fireEvent.click(submitButton);
        
        expect(screen.getByText(/Customer name is required before payment/i)).toBeInTheDocument();
        expect(SoundService.sfx.playDecline).toHaveBeenCalled();
    });

    it('opens lookup modal when history button is clicked', () => {
        render(<EnrollmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
        
        expect(screen.queryByText('Intelligence Lookup')).not.toBeInTheDocument();

        const historyButton = screen.getByText('Find Existing Customer');
        fireEvent.click(historyButton);
        
        expect(screen.getByPlaceholderText('Search by name, phone, or ID...')).toBeVisible();
    });

    it('handles successful submission', async () => {
        render(<EnrollmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
        
        // Fill out form
        const nameInput = screen.getByPlaceholderText(/Full Name \*/i);
        fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
        
        const phoneInput = screen.getByPlaceholderText(/Phone \*/i);
        fireEvent.change(phoneInput, { target: { value: '5559876543' } });
        
        // Proceed to payment modal
        const proceedButton = screen.getByText(/Payment/i, { selector: 'button' });
        fireEvent.click(proceedButton);
        
        // Fill payment
        fireEvent.change(screen.getByPlaceholderText('Card Number'), { target: { value: '4111111111111111' } }); // Visa
        
        const monthSelect = document.querySelector('select[name="cardExpMonth"]') as HTMLSelectElement;
        if (monthSelect) fireEvent.change(monthSelect, { target: { value: '12' } });
        
        const yearSelect = document.querySelector('select[name="cardExpYear"]') as HTMLSelectElement;
        if (yearSelect) fireEvent.change(yearSelect, { target: { value: '2026' } });
        
        fireEvent.change(screen.getByPlaceholderText('CVV'), { target: { value: '123' } });
        
        // Click Review & Submit
        const submitButton = screen.getByText(/Review & Submit Order/i);
        fireEvent.click(submitButton);
        
        // Expect review modal to appear
        await waitFor(() => {
            expect(screen.getByText('Review Order')).toBeInTheDocument();
        });
        
        // Confirm submission in ReviewModal
        const confirmButton = screen.getByText('Submit Order');
        fireEvent.click(confirmButton);
        
        await waitFor(() => {
            expect(mockCRMContext.addSale).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(screen.getByText(/Order Submitted!/i)).toBeInTheDocument();
        });

        // Click Start Next Caller to trigger onSuccess
        const nextCallerButton = screen.getByText(/Close & Next Lead/i, { selector: 'button' });
        fireEvent.click(nextCallerButton);
        
        await waitFor(() => {
            expect(mockOnSuccess).toHaveBeenCalled();
        });
    });
});
