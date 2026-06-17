
class SoundService {
    private _ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private _initPromise: Promise<void> | null = null;
    private _isTabLeader: boolean = true;
    private _enabled: boolean = true;
    public setEnabled(flag: boolean) { this._enabled = flag; } // Default to true until told otherwise

    constructor() {
        // Browser Autoplay Policy: Unlock audio on first interaction
        if (typeof window !== 'undefined') {
            const unlock = () => {
                this.unlockAudio().catch(() => {});
                window.removeEventListener('click', unlock);
                window.removeEventListener('keydown', unlock);
                window.removeEventListener('touchstart', unlock);
            };
            window.addEventListener('click', unlock);
            window.addEventListener('keydown', unlock);
            window.addEventListener('touchstart', unlock);
        }
    }

    public async unlockAudio(): Promise<boolean> {
        try {
            const context = await this.getSafeContext();
            if (context && context.state === 'suspended') {
                await context.resume();
                return true;
            }
        } catch {
            // fail silently
        }
        return false;
    }

    public setLeaderStatus(isLeader: boolean) {
        this._isTabLeader = isLeader;
    }

    private async init(): Promise<void> {
        if (typeof window === 'undefined') return;
        
        try {
            const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
            if (!AudioContextClass) return;

            // Create Context
            const ctx = new AudioContextClass();
            this._ctx = ctx;

            // Create Master Bus
            this.masterGain = ctx.createGain();
            this.masterGain.gain.value = 0.15; // Default safe volume
            this.masterGain.connect(ctx.destination);

        } catch (e) {
            console.error("Audio Subsystem Failed:", e);
        }
    }

    private async getSafeContext(): Promise<AudioContext | null> {
        // 1. Ensure Initialization (Singleton Pattern)
        if (!this._ctx) {
            if (!this._initPromise) {
                this._initPromise = this.init();
            }
            await this._initPromise;
        }

        if (!this._ctx) return null;

        // 2. Try to Resume if Suspended (Browser Policy)
        if (this._ctx.state === 'suspended') {
            try {
                await this._ctx.resume();
            } catch {
                // Expected if no user interaction yet; fail silently
            }
        }

        return this._ctx;
    }

    public async playTone(freq: number, type: OscillatorType, duration: number, delay = 0, vol = 1, slideTo?: number, _force = false) {
        // GUARD: Only play passive sounds (notifications) if this tab is the leader
        
        try {
            const context = await this.getSafeContext();
            if (!context || !this.masterGain) return;

            const osc = context.createOscillator();
            const gain = context.createGain();
            const t = context.currentTime + delay;

            // Oscillator Config
            osc.type = type;
            osc.frequency.setValueAtTime(freq, t);
            
            // Frequency Slide (Safe Guarded)
            if (slideTo && slideTo > 0) {
                try {
                    osc.frequency.exponentialRampToValueAtTime(slideTo, t + duration);
                } catch {
                    // Fallback to linear if exponential fails (e.g. freq <= 0)
                    osc.frequency.linearRampToValueAtTime(slideTo, t + duration);
                }
            }
            
            // Envelope (ADSR-ish)
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(vol, t + (duration * 0.1)); // Attack
            gain.gain.exponentialRampToValueAtTime(0.001, t + duration); // Decay

            // Routing
            osc.connect(gain);
            gain.connect(this.masterGain);

            // Trigger
            osc.start(t);
            osc.stop(t + duration + 0.1); // Small buffer for cleanup

            // Garbage Collection Helper
            setTimeout(() => {
                osc.disconnect();
                gain.disconnect();
            }, (duration + delay + 0.2) * 1000);

        } catch {
            // Silently fail on audio errors to not disrupt UI
            // console.warn("SFX Error:", e);
        }
    }

    // --- SOUND PRESETS ---

    // Interactive: Play regardless of leader status (user is clicking on THIS tab)
    playHover() { this.playTone(400, 'sine', 0.05, 0, 0.03); }
    
    playClick() {
        this.playTone(600, 'triangle', 0.05, 0, 0.1);
        this.playTone(300, 'sine', 0.05, 0.02, 0.1);
    }
    
    playSuccess() {
        // Ascending major triad
        this.playTone(523.25, 'sine', 0.2, 0, 0.2); // C5
        this.playTone(659.25, 'sine', 0.2, 0.1, 0.2); // E5
        this.playTone(783.99, 'sine', 0.4, 0.2, 0.2); // G5
        // Sparkle
        this.playTone(1046.50, 'sine', 0.1, 0.25, 0.1); // C6
    }
    
    playConfirm() {
        // High-tech affirmative
        this.playTone(880, 'sine', 0.1, 0, 0.15); // A5
        this.playTone(1760, 'sine', 0.3, 0.08, 0.1); // A6
    }
    
    playDecline() {
        // Gentle rejection/disconnect
        this.playTone(440, 'sine', 0.15, 0, 0.15); // A4
        this.playTone(349.23, 'sine', 0.3, 0.1, 0.15); // F4
    }
    
    playSubmit() {
        // Data transmitted sound
        this.playTone(1200, 'sine', 0.05, 0, 0.1);
        this.playTone(1800, 'sine', 0.05, 0.05, 0.1);
        this.playTone(2400, 'sine', 0.1, 0.1, 0.1);
    }
    
    playError() {
        // Subtle error bump
        this.playTone(150, 'sawtooth', 0.15, 0, 0.15);
        this.playTone(150, 'sawtooth', 0.15, 0.1, 0.1);
    }

    playProcessing() {
        // Rhythmic "scanning" or "thinking" sound
        this.playTone(800, 'sine', 0.05, 0, 0.05);
        this.playTone(1000, 'sine', 0.05, 0.1, 0.05);
        this.playTone(800, 'sine', 0.05, 0.2, 0.05);
        this.playTone(1200, 'sine', 0.05, 0.3, 0.05);
    }

    playTrash() {
        // Descending "crumple" or delete sound
        this.playTone(400, 'sawtooth', 0.1, 0, 0.1);
        this.playTone(200, 'sawtooth', 0.1, 0.1, 0.1);
        this.playTone(100, 'sawtooth', 0.2, 0.2, 0.05);
    }
    
    // Passive: Only Leader plays these to avoid echo
    playNotification() {
        if (!this._isTabLeader) return; 
        // Glassy "Ding"
        this.playTone(880, 'sine', 0.6, 0, 0.2); // A5
        this.playTone(1760, 'sine', 0.4, 0, 0.05); // A6 Harmonic
    }
    
    playAlarm() {
        if (!this._isTabLeader) return;
        // Urgent but not harsh
        this.playTone(880, 'sine', 0.2, 0, 0.3);
        this.playTone(880, 'sine', 0.2, 0.25, 0.3);
        this.playTone(880, 'sine', 0.2, 0.5, 0.3);
    }
    
    playPhoneRing() {
        if (!this._isTabLeader) return;
        
        // Premium "Incoming Transmission" Ringtone
        // Rhythmic Pulse + Melodic Overlay
        
        const now = 0; // Relative start

        // 1. Digital Pulse (Background)
        this.playTone(400, 'triangle', 0.05, now + 0.0, 0.05);
        this.playTone(400, 'triangle', 0.05, now + 0.1, 0.05);
        this.playTone(400, 'triangle', 0.05, now + 0.2, 0.05);

        // 2. Ethereal Chime (E Major 7 Arpeggio)
        // E5, G#5, B5, D#6
        this.playTone(659.25, 'sine', 0.2, now + 0.0, 0.15); 
        this.playTone(830.61, 'sine', 0.2, now + 0.15, 0.15); 
        this.playTone(987.77, 'sine', 0.2, now + 0.30, 0.15); 
        this.playTone(1244.51, 'sine', 0.8, now + 0.45, 0.2); 
    }
}

export const sfx = new SoundService();
