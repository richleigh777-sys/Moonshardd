import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../nexus/services/AuthService';
import { BaseRepository } from '../nexus/repositories/BaseRepository';

// Mock dependencies
vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(() => ({ currentUser: { email: 'test@local' } })),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    onAuthStateChanged: vi.fn((auth, cb) => {
        setTimeout(cb, 0);
        return () => {};
    })
}));

vi.mock('../../lib/firebase', () => ({
    auth: { currentUser: { email: 'test@local' } },
    db: {}
}));

vi.mock('firebase/firestore', () => {
    return {
        doc: vi.fn(),
        getDoc: vi.fn(),
        initializeFirestore: vi.fn(() => ({})),
        setLogLevel: vi.fn(),
        getDocFromServer: vi.fn()
    }
});


describe('AuthService', () => {
    let authService: AuthService;
    let mockRepository: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockRepository = {
            activeServerId: 'srv-001',
            setActiveServer: vi.fn(),
            getPath: vi.fn((collection, id) => `${collection}/${id}`)
        };
        authService = new AuthService(mockRepository as unknown as BaseRepository);
    });

    it('verifySession should return null if signature is missing', async () => {
        const result = await authService.verifySession('user-1', 'agent', 1, '');
        expect(result).toBeNull();
    });

    it('verifySession should return null if userId mismatch', async () => {
        const sig = btoa('user-2:srv-001:9999999999999');
        const result = await authService.verifySession('user-1', 'agent', 1, sig);
        expect(result).toBeNull();
    });

    it('verifySession should return null if session is expired', async () => {
        const pastTimestamp = Date.now() - (13 * 60 * 60 * 1000); // 13 hours ago
        const sig = btoa(`user-1:srv-001:${pastTimestamp}`);
        
        const result = await authService.verifySession('user-1', 'agent', 1, sig);
        expect(result).toBeNull();
    });

    it('verifySession should switch repository active server if needed and fetch user', async () => {
        const timestamp = Date.now();
        const sig = btoa(`user-1:srv-002:${timestamp}`);

        localStorage.setItem('nexus_session_user', JSON.stringify({ id: 'user-1', name: 'Test User' }));

        const result = await authService.verifySession('user-1', 'agent', 1, sig);
        
        expect(mockRepository.setActiveServer).toHaveBeenCalledWith('srv-002');
        expect(result).toEqual({ id: 'user-1', name: 'Test User' });
    });

    it('verifySession should return null if user doc does not exist', async () => {
        const timestamp = Date.now();
        const sig = btoa(`user-1:srv-001:${timestamp}`);

        localStorage.removeItem('nexus_session_user');

        const result = await authService.verifySession('user-1', 'agent', 1, sig);
        expect(result).toBeNull();
    });
});
