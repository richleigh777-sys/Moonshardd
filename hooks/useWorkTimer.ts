import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';

const STORAGE_KEYS = {
    IS_ON_BREAK: 'nexus_timer_is_on_break',
    BREAK_START: 'nexus_timer_break_start',
    TOTAL_BREAK: 'nexus_timer_total_break',
    BREAK_REASON: 'nexus_timer_break_reason'
};

export const useWorkTimer = (currentUser: User | null, sessionStartTime: number | null) => {
    const [isOnBreak, setIsOnBreak] = useState(() => {
        return localStorage.getItem(STORAGE_KEYS.IS_ON_BREAK) === 'true';
    });
    
    const [breakStartTime, setBreakStartTime] = useState<number | null>(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.BREAK_START);
        return stored ? parseInt(stored) : null;
    });

    const [totalBreakTime, setTotalBreakTime] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.TOTAL_BREAK);
        return stored ? parseInt(stored) : 0;
    });

    const [breakReason, setBreakReason] = useState<string | null>(() => {
        return localStorage.getItem(STORAGE_KEYS.BREAK_REASON);
    });

    const [workTimeSeconds, setWorkTimeSeconds] = useState(0);
    const [currentBreakDuration, setCurrentBreakDuration] = useState(0);

    const toggleBreak = useCallback((reason?: string) => {
        if (isOnBreak) {
            // End Break
            if (breakStartTime) {
                const duration = Date.now() - breakStartTime;
                const newTotal = totalBreakTime + duration;
                setTotalBreakTime(newTotal);
                localStorage.setItem(STORAGE_KEYS.TOTAL_BREAK, newTotal.toString());
            }
            
            setBreakStartTime(null);
            localStorage.removeItem(STORAGE_KEYS.BREAK_START);
            
            setIsOnBreak(false);
            localStorage.setItem(STORAGE_KEYS.IS_ON_BREAK, 'false');
            
            setBreakReason(null);
            localStorage.removeItem(STORAGE_KEYS.BREAK_REASON);
            
            setCurrentBreakDuration(0);
        } else {
            // Start Break
            const now = Date.now();
            setBreakStartTime(now);
            localStorage.setItem(STORAGE_KEYS.BREAK_START, now.toString());
            
            setIsOnBreak(true);
            localStorage.setItem(STORAGE_KEYS.IS_ON_BREAK, 'true');
            
            if (reason) {
                setBreakReason(reason);
                localStorage.setItem(STORAGE_KEYS.BREAK_REASON, reason);
            }
        }
    }, [isOnBreak, breakStartTime, totalBreakTime]);

    const resetTimerState = useCallback(() => {
        setIsOnBreak(false);
        setBreakStartTime(null);
        setTotalBreakTime(0);
        setBreakReason(null);
        setWorkTimeSeconds(0);
        setCurrentBreakDuration(0);
        
        localStorage.removeItem(STORAGE_KEYS.IS_ON_BREAK);
        localStorage.removeItem(STORAGE_KEYS.BREAK_START);
        localStorage.removeItem(STORAGE_KEYS.TOTAL_BREAK);
        localStorage.removeItem(STORAGE_KEYS.BREAK_REASON);
    }, []);

    // Timer Tick
    useEffect(() => {
        if (!currentUser || !sessionStartTime) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const totalElapsed = now - sessionStartTime;
            const currentBreak = isOnBreak && breakStartTime ? (now - breakStartTime) : 0;
            const actualWork = totalElapsed - totalBreakTime - currentBreak;
            
            const nextSeconds = Math.max(0, Math.floor(actualWork / 1000));
            setWorkTimeSeconds(prev => prev === nextSeconds ? prev : nextSeconds);
        }, 1000);

        return () => clearInterval(interval);
    }, [currentUser, sessionStartTime, isOnBreak, breakStartTime, totalBreakTime]);

    useEffect(() => {
        let interval: any;
        if (isOnBreak && breakStartTime) {
            interval = setInterval(() => {
                const nextDuration = Date.now() - breakStartTime;
                setCurrentBreakDuration(prev => Math.abs(prev - nextDuration) < 500 ? prev : nextDuration);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isOnBreak, breakStartTime]);

    return {
        isOnBreak,
        breakReason,
        toggleBreak,
        currentBreakDuration,
        workTimeSeconds,
        resetTimerState,
        setTotalBreakTime,
        setBreakStartTime,
        setIsOnBreak
    };
};
