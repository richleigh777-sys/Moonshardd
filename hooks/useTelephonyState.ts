import { create } from 'zustand';

export type CallStatus = 'idle' | 'ringing' | 'active' | 'wrap-up';

interface TelephonyState {
    status: CallStatus;
    currentCallToken: string | null;
    callDuration: number;
    activeNumber: string | null;
    isMuted: boolean;
    isOnHold: boolean;
    autoAnswer: boolean;

    // Actions
    setRinging: (phoneNumber: string) => void;
    answerCall: () => void;
    endCall: () => void;
    finishWrapUp: () => void;
    toggleMute: () => void;
    toggleHold: () => void;
    setAutoAnswer: (val: boolean) => void;
    incrementDuration: () => void;
}

export const useTelephonyState = create<TelephonyState>((set, get) => ({
    status: 'idle',
    currentCallToken: null,
    callDuration: 0,
    activeNumber: null,
    isMuted: false,
    isOnHold: false,
    autoAnswer: false,

    setRinging: (phoneNumber: string) => {
        const { status, autoAnswer } = get();
        if (status !== 'idle') return; // Cannot receive call if busy

        set({ status: 'ringing', activeNumber: phoneNumber, callDuration: 0 });

        if (autoAnswer) {
            setTimeout(() => {
                get().answerCall();
            }, 800); // 800ms auto-answer delay
        }
    },

    answerCall: () => {
        if (get().status === 'ringing') {
            set({ status: 'active', currentCallToken: Date.now().toString(), callDuration: 0, isMuted: false, isOnHold: false });
        }
    },

    endCall: () => {
        if (get().status === 'active' || get().status === 'ringing') {
            set({ status: 'wrap-up', currentCallToken: null, isMuted: false, isOnHold: false });
        }
    },

    finishWrapUp: () => {
        set({ status: 'idle', activeNumber: null, callDuration: 0 });
    },

    toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
    toggleHold: () => set((state) => ({ isOnHold: !state.isOnHold })),
    setAutoAnswer: (val: boolean) => set({ autoAnswer: val }),

    incrementDuration: () => {
        if (get().status === 'active' && !get().isOnHold) {
            set((state) => ({ callDuration: state.callDuration + 1 }));
        }
    }
}));
