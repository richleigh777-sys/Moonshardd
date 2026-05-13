
import { useState, useEffect, useRef, useCallback } from 'react';

export const useAutoScroll = (initialSpeed = 1) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [scrollSpeed, setScrollSpeed] = useState(initialSpeed);
    const scrollerRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<any>(null);

    const togglePlay = useCallback(() => setIsPlaying(p => !p), []);

    const adjustSpeed = useCallback((delta: number) => {
        setScrollSpeed(prev => Math.max(1, Math.min(10, prev + delta)));
    }, []);

    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                if (scrollerRef.current) {
                    // Standardize scroll amount based on speed
                    scrollerRef.current.scrollTop += (scrollSpeed * 0.8);
                }
            }, 16); // ~60fps
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isPlaying, scrollSpeed]);

    return {
        isPlaying,
        togglePlay,
        scrollSpeed,
        adjustSpeed,
        scrollerRef
    };
};
