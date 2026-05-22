
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { RefreshCw, Ruler, Magnet } from 'lucide-react';
import { sfx } from '../../lib/soundService';

interface ResizableFrameProps {
    children: React.ReactNode;
    minHeight?: number;
    minWidth?: number;
    maxHeight?: string | number;
    maxWidth?: string | number;
    defaultHeight?: string | number;
    defaultWidth?: string | number;
    className?: string;
    persistenceKey?: string; // If provided, saves size to localStorage
    direction?: 'vertical' | 'horizontal' | 'both';
}

export const ResizableFrame: React.FC<ResizableFrameProps> = ({ 
    children, 
    minHeight = 300, 
    minWidth = 300,
    maxHeight = '95vh',
    maxWidth = '95vw',
    defaultHeight = '100%',
    defaultWidth = '100%',
    className = "",
    persistenceKey,
    direction = 'both'
}) => {
    const { currentUser } = useAuth();
    const isSuperAdmin = (currentUser?.accessLevel || 0) >= 10;
    
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState(() => {
        if (persistenceKey && isSuperAdmin) {
            const saved = localStorage.getItem(`nexus_frame_${persistenceKey}`);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    return {
                        width: parsed.width || defaultWidth,
                        height: parsed.height || defaultHeight
                    };
                } catch (_e) {
                    console.warn("Failed to load frame dimensions", _e);
                }
            }
        }
        return { width: defaultWidth, height: defaultHeight };
    });
    const [isResizing, setIsResizing] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isSnapped, setIsSnapped] = useState(false);
    const [measuredSize, setMeasuredSize] = useState({ w: 0, h: 0 });

    const dimensionsRef = useRef(dimensions);
    useEffect(() => {
        dimensionsRef.current = dimensions;
    }, [dimensions]);

    useEffect(() => {
        if (containerRef.current) {
            setTimeout(() => {
                if (containerRef.current) {
                    setMeasuredSize({
                        w: containerRef.current.offsetWidth,
                        h: containerRef.current.offsetHeight
                    });
                }
            }, 0);
        }
    }, [dimensions]);

    // Cleanup drag listeners
    useEffect(() => {
        const handleMouseUp = () => {
            if (isResizing) {
                setIsResizing(false);
                setIsSnapped(false);
                document.body.style.cursor = 'default';
                document.body.style.userSelect = 'auto';
                sfx.playConfirm();
                
                // Save on release
                if (persistenceKey && containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    const newDims = {
                        width: direction !== 'vertical' ? rect.width : dimensionsRef.current.width,
                        height: direction !== 'horizontal' ? rect.height : dimensionsRef.current.height
                    };
                    localStorage.setItem(`nexus_frame_${persistenceKey}`, JSON.stringify(newDims));
                }
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !containerRef.current) return;

            e.preventDefault();
            const rect = containerRef.current.getBoundingClientRect();
            
            // Calculate new dimensions
            let newWidth = dimensionsRef.current.width;
            let newHeight = dimensionsRef.current.height;

            if (direction === 'both' || direction === 'horizontal') {
                newWidth = Math.max(minWidth, e.clientX - rect.left);
            }
            
            if (direction === 'both' || direction === 'vertical') {
                newHeight = Math.max(minHeight, e.clientY - rect.top);
            }

            // --- MAGNETIC SNAPPING LOGIC ---
            const SNAP_GRID = 50;
            const SNAP_THRESHOLD = 15;
            let snapped = false;

            if (typeof newWidth === 'number') {
                const diffW = newWidth % SNAP_GRID;
                if (diffW < SNAP_THRESHOLD) {
                    newWidth = newWidth - diffW;
                    snapped = true;
                } else if (diffW > (SNAP_GRID - SNAP_THRESHOLD)) {
                    newWidth = newWidth + (SNAP_GRID - diffW);
                    snapped = true;
                }
            }

            if (typeof newHeight === 'number') {
                const diffH = newHeight % SNAP_GRID;
                if (diffH < SNAP_THRESHOLD) {
                    newHeight = newHeight - diffH;
                    snapped = true;
                } else if (diffH > (SNAP_GRID - SNAP_THRESHOLD)) {
                    newHeight = newHeight + (SNAP_GRID - diffH);
                    snapped = true;
                }
            }

            if (snapped && !isSnapped) {
                sfx.playHover(); // Subtle click feel on snap
            }
            setIsSnapped(snapped);

            // Apply dimensions
            if (containerRef.current) {
                if (direction !== 'vertical') containerRef.current.style.width = `${newWidth}px`;
                if (direction !== 'horizontal') containerRef.current.style.height = `${newHeight}px`;
            }

            // Update state strictly for the HUD (actual resize happens via ref style for performance)
            setDimensions({ width: newWidth, height: newHeight });
        };

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, direction, minHeight, minWidth, persistenceKey, isSnapped]); 

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        sfx.playClick();
        document.body.style.cursor = direction === 'vertical' ? 'ns-resize' : 'nwse-resize';
        document.body.style.userSelect = 'none';
    };

    const handleReset = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        sfx.playDecline(); // Mechanical sound for reset
        setDimensions({ width: defaultWidth, height: defaultHeight });
        if (persistenceKey) {
            localStorage.removeItem(`nexus_frame_${persistenceKey}`);
        }
    };

    // Keyboard Precision Control
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isSuperAdmin) return;
        
        let dW = 0;
        let dH = 0;
        const step = e.shiftKey ? 50 : 10;

        switch(e.key) {
            case 'ArrowRight': dW = step; break;
            case 'ArrowLeft': dW = -step; break;
            case 'ArrowDown': dH = step; break;
            case 'ArrowUp': dH = -step; break;
            default: return;
        }

        e.preventDefault();
        sfx.playHover();

        const currentW = containerRef.current?.offsetWidth || (typeof dimensions.width === 'number' ? dimensions.width : minWidth);
        const currentH = containerRef.current?.offsetHeight || (typeof dimensions.height === 'number' ? dimensions.height : minHeight);

        const nextW = Math.max(minWidth, Number(currentW) + dW);
        const nextH = Math.max(minHeight, Number(currentH) + dH);

        setDimensions({ width: nextW, height: nextH });
        if (containerRef.current) {
            if (direction !== 'vertical') containerRef.current.style.width = `${nextW}px`;
            if (direction !== 'horizontal') containerRef.current.style.height = `${nextH}px`;
        }

        // Save on key release/debounce would be better, but direct save for now
        if (persistenceKey) {
            localStorage.setItem(`nexus_frame_${persistenceKey}`, JSON.stringify({ width: nextW, height: nextH }));
        }
    };

    // Calculate dynamic styles based on admin status
    const adminBorderClass = isSuperAdmin && isHovered 
        ? 'ring-1 ring-accent-primary/30 shadow-[0_0_15px_rgba(124,58,237,0.1)]' 
        : '';
    
    const resizingClass = isResizing 
        ? isSnapped 
            ? 'ring-2 ring-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)] z-50' 
            : 'ring-2 ring-accent-primary shadow-[0_0_30px_rgba(124,58,237,0.2)] z-50'
        : '';

    return (
        <div 
            ref={containerRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative transition-all duration-200 ${className} ${adminBorderClass} ${resizingClass}`}
            style={{ 
                width: typeof dimensions.width === 'number' ? `${dimensions.width}px` : dimensions.width, 
                height: typeof dimensions.height === 'number' ? `${dimensions.height}px` : dimensions.height,
                maxHeight: maxHeight,
                maxWidth: maxWidth,
                minHeight: minHeight
            }}
        >
            {children}

            {/* --- ADMIN OVERLAY CONTROLS --- */}
            {isSuperAdmin && (
                <>
                    {/* 1. Holographic Alignment Grid (Visible during resize) */}
                    {isResizing && (
                        <div className="absolute inset-0 z-40 pointer-events-none opacity-40 bg-[linear-gradient(rgba(124,58,237,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.2)_1px,transparent_1px)] bg-[length:20px_20px] rounded-[inherit]">
                            {/* Central Crosshair */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-accent-primary/50 opacity-50 flex items-center justify-center rounded-full">
                                <div className="w-1 h-1 bg-accent-primary rounded-full"></div>
                            </div>
                        </div>
                    )}

                    {/* 2. Holographic HUD */}
                    {isResizing && (
                        <div className="absolute top-4 right-4 z-[60] backdrop-blur-xl border border-border-subtle/50 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-4 animate-in fade-in zoom-in duration-200 pointer-events-none bg-surface-main/80">
                            {isSnapped ? <Magnet size={16} className="animate-pulse text-emerald-500" /> : <Ruler size={16} className="animate-pulse text-accent-primary" />}
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-70 flex justify-between gap-4">
                                    <span>Dimensions</span>
                                    {isSnapped && <span className="text-emerald-400">MAGNETIC LOCK</span>}
                                </span>
                                <span className="text-sm font-mono font-bold tracking-wider text-text-primary">
                                    W:{Math.round(typeof dimensions.width === 'number' ? dimensions.width : measuredSize.w || 0)} 
                                    <span className="opacity-30 mx-2">|</span> 
                                    H:{Math.round(typeof dimensions.height === 'number' ? dimensions.height : measuredSize.h || 0)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* 3. Tactical Grip Handle */}
                    <div 
                        onMouseDown={handleMouseDown}
                        onDoubleClick={handleReset}
                        tabIndex={0}
                        onKeyDown={handleKeyDown}
                        className={`
                            absolute bottom-0 right-0 z-50 group cursor-nwse-resize outline-none
                            flex items-end justify-end w-12 h-12
                            transition-all duration-300
                            ${direction === 'vertical' ? 'cursor-ns-resize w-full h-4' : ''}
                            ${isHovered || isResizing ? 'opacity-100 translate-x-0 translate-y-0' : 'opacity-0 translate-x-2 translate-y-2'}
                        `}
                        title="Drag to Resize / Arrows to Nudge / Double-Click to Reset"
                    >
                        {direction === 'vertical' ? (
                            // Vertical Handle Bar
                            <div className="w-full h-full flex items-center justify-center relative hover:bg-accent-primary/10 transition-colors rounded-t-lg">
                                <div className="w-16 h-1 rounded-full bg-accent-primary/40 group-hover:bg-accent-primary group-hover:shadow-[0_0_10px_var(--color-accent-primary)] transition-all" />
                            </div>
                        ) : (
                            // Corner Tech Handle
                            <div className="w-full h-full relative">
                                {/* Reset Button (Mini - appears on hover) */}
                                <button 
                                    onClick={handleReset}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="absolute bottom-2 right-12 p-1.5 bg-surface-main border border-border-subtle rounded-lg text-text-muted hover:text-rose-500 hover:border-rose-500/30 transition-all"
                                    title="Reset Size"
                                    aria-label="Reset frame size"
                                >
                                    <RefreshCw size={11} />
                                </button>

                                {/* The Grip Graphic */}
                                <div className={`
                                    absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] rounded-tl-lg transition-all duration-300
                                    ${isResizing ? 'border-accent-primary bg-accent-primary/10' : 'border-accent-primary/30 group-hover:border-accent-primary bg-surface-main/30 backdrop-blur-sm'}
                                `}></div>
                                
                                {/* Inner Details */}
                                <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-accent-primary rounded-sm group-hover:animate-pulse"></div>
                                <div className="absolute bottom-2 right-4 w-1 h-1 bg-accent-primary/50 rounded-full"></div>
                                <div className="absolute bottom-4 right-2 w-1 h-1 bg-accent-primary/50 rounded-full"></div>
                                
                                {/* Keyboard Hint */}
                                <div className="absolute bottom-1 right-1 opacity-0 group-focus:opacity-100 transition-opacity text-[8px] text-accent-primary font-black -translate-x-full pr-2 whitespace-nowrap">
                                    USE ARROWS
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 4. Helper Border (When resizing) */}
                    {isResizing && (
                        <div className={`absolute inset-0 border-2 rounded-[inherit] pointer-events-none animate-pulse z-40 ${isSnapped ? 'border-emerald-500' : 'border-accent-primary/50'}`}></div>
                    )}
                </>
            )}
        </div>
    );
};
