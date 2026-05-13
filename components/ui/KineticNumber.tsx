
import React, { useState, useEffect } from 'react';

interface KineticNumberProps {
    value: number;
    prefix?: string;
    suffix?: string;
    duration?: number;
    className?: string;
}

export const KineticNumber: React.FC<KineticNumberProps> = ({ value, prefix = "", suffix = "", duration = 800, className = "" }) => {
    const [display, setDisplay] = useState(value);
    const currentRef = React.useRef(value);

    useEffect(() => {
        const start = currentRef.current;
        const end = value;
        if (start === end) return;
        
        const startTime = performance.now();
        
        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease Out Quart
            const ease = 1 - Math.pow(1 - progress, 4);
            
            const current = start + (end - start) * ease;
            currentRef.current = current;
            setDisplay(current);
            
            if (progress < 1) requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }, [value, duration]);

    return (
        <span className={className}>
            {prefix}{display.toLocaleString(undefined, { maximumFractionDigits: 0 })}{suffix}
        </span>
    );
};
