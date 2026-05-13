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
        (CRMHook.useCRM as any).mockReturnValue(mockCRMContext);
        (AuthHook.useAuth as any).mockReturnValue(mockAuthContext);
        
        // Mock window.confirm and scrollIntoView
        window.confirm = vi.fn(() => true);
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
    });

    it('renders the form correctly', () => {
        render(<EnrollmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
        
        expect(screen.getByText('Enrollment Terminal')).toBeInTheDocument();
        expect(screen.getByText('Active Total')).toBeInTheDocument();
        expect(screen.queryByPlaceholderText('Find Identity via Name or Phone...')).not.toBeInTheDocument(); // Modal is closed
    });

    it('updates identity fields correctly', () => {
        render(<EnrollmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
        
        const nameInput = screen.getByPlaceholderText(/First Last/i) as HTMLInputElement;
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        expect(nameInput.value).toBe('John Doe');

        const phoneInput = screen.getByPlaceholderText(/\(555\) 000-0000/i) as HTMLInputElement;
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
            const totalDisplay = screen.getByText('$100.00');
            expect(totalDisplay).toBeInTheDocument();
        });
    });

    it('validates form submission', () => {
        render(<EnrollmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
        
        const submitButton = screen.getByText('Authorize Transaction');
        fireEvent.click(submitButton);
        
        expect(screen.getByText(/Missing Identity or Payment data/i)).toBeInTheDocument();
        expect(SoundService.sfx.playDecline).toHaveBeenCalled();
    });

    it('opens lookup modal when history button is clicked', () => {
        render(<EnrollmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
        
        expect(screen.queryByText('Intelligence Lookup')).not.toBeInTheDocument();

        const historyButton = screen.getByRole('button', { name: /history lookup/i });
        fireEvent.click(historyButton);
        
        expect(screen.getByPlaceholderText('Find Identity via Name or Phone...')).toBeVisible();
    });

    it('handles successful submission', async () => {
        render(<EnrollmentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
        
        // Fill out form
        const nameInput = screen.getByPlaceholderText(/First Last/i);
        fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
        
        const phoneInput = screen.getByPlaceholderText(/\(555\) 000-0000/i);
        fireEvent.change(phoneInput, { target: { value: '5559876543' } });
        
        // Fill payment
        fireEvent.change(screen.getByPlaceholderText('0000 0000 0000 0000'), { target: { value: '4111111111111111' } }); // Visa
        fireEvent.change(screen.getByPlaceholderText('MM/YY'), { target: { value: '12/30' } });
        fireEvent.change(screen.getByPlaceholderText('***'), { target: { value: '123' } });
        
        // Click Authorize
        const submitButton = screen.getByText('Authorize Transaction');
        fireEvent.click(submitButton);
        
        // Expect review modal to appear
        await waitFor(() => {
            expect(screen.getByText('Pre-Transmission Check')).toBeInTheDocument();
        });
        
        // Confirm submission in ReviewModal
        const confirmButton = screen.getByText('Commit Transaction');
        fireEvent.click(confirmButton);
        
        await waitFor(() => {
            expect(mockCRMContext.addSale).toHaveBeenCalled();
        });

        // Click Dashboard to trigger onSuccess
        const dashboardButton = screen.getByText('Dashboard');
        fireEvent.click(dashboardButton);
        
        expect(mockOnSuccess).toHaveBeenCalled();
    });
});
