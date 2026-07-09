import React, { useEffect, useState } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollControlsProps {
    containerRef: React.RefObject<HTMLElement | null>;
}

export const ScrollControls: React.FC<ScrollControlsProps> = ({ containerRef }) => {
    const [canScroll, setCanScroll] = useState({ up: false, down: false, left: false, right: false });

    useEffect(() => {
        const checkScroll = () => {
            if (!containerRef.current) return;
            const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = containerRef.current;
            setCanScroll({
                up: scrollTop > 0,
                down: Math.ceil(scrollTop + clientHeight) < scrollHeight,
                left: scrollLeft > 0,
                right: Math.ceil(scrollLeft + clientWidth) < scrollWidth
            });
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
            // Initial check
            setTimeout(checkScroll, 100);
            setTimeout(checkScroll, 1000);
        }
        return () => {
            if (container) container.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [containerRef]);

    const scrollBy = (x: number, y: number) => {
        if (containerRef.current) {
            containerRef.current.scrollBy({ left: x, top: y, behavior: 'smooth' });
        }
    };

    return (
        <>
            {/* Left side Vertical Scroll Controls */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-50 pointer-events-none opacity-50 hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => scrollBy(0, -200)}
                    disabled={!canScroll.up}
                    className="p-1.5 bg-surface-main border border-border-subtle rounded-full shadow-lg text-text-secondary hover:text-accent-primary hover:bg-surface-alt disabled:opacity-0 pointer-events-auto transition-all"
                >
                    <ChevronUp size={20} />
                </button>
                <button 
                    onClick={() => scrollBy(0, 200)}
                    disabled={!canScroll.down}
                    className="p-1.5 bg-surface-main border border-border-subtle rounded-full shadow-lg text-text-secondary hover:text-accent-primary hover:bg-surface-alt disabled:opacity-0 pointer-events-auto transition-all"
                >
                    <ChevronDown size={20} />
                </button>
            </div>

            {/* Bottom side Horizontal Scroll Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 z-50 pointer-events-none opacity-50 hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => scrollBy(-300, 0)}
                    disabled={!canScroll.left}
                    className="p-1.5 bg-surface-main border border-border-subtle rounded-full shadow-lg text-text-secondary hover:text-accent-primary hover:bg-surface-alt disabled:opacity-0 pointer-events-auto transition-all"
                >
                    <ChevronLeft size={20} />
                </button>
                <button 
                    onClick={() => scrollBy(300, 0)}
                    disabled={!canScroll.right}
                    className="p-1.5 bg-surface-main border border-border-subtle rounded-full shadow-lg text-text-secondary hover:text-accent-primary hover:bg-surface-alt disabled:opacity-0 pointer-events-auto transition-all"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </>
    );
};
