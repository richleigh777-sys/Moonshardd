
import React, { useEffect, useRef, useState } from "react";

export function ChartFrame({
  children,
  minHeight = 260,
  className = ""
}: {
  children: (opts: { ready: boolean }) => React.ReactNode;
  minHeight?: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let animationFrameId: number;

    const observer = new ResizeObserver((entries) => {
      // Debounce the resize event to the next animation frame
      // This prevents "ResizeObserver loop limit exceeded" errors
      cancelAnimationFrame(animationFrameId);

      animationFrameId = requestAnimationFrame(() => {
        if (!entries || !entries.length) return;
        const entry = entries[0];
        const { width, height } = entry.contentRect;

        // Enhanced Check: Only mount the heavy chart component if we have valid, safe dimensions
        // width > 5 guards against micro-layouts or collapsed flex containers causing width(-1) in Recharts
        if (width > 10 && height > 10) {
          setIsReady(true);
        } else {
          setIsReady(false);
        }
      });
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight,
        minWidth: 0, // CRITICAL: Allows flex children to shrink below content size
        position: "relative",
        overflow: "hidden"
      }}
      className={`chart-frame ${className}`}
    >
      {isReady ? (
        // Absolute positioning ensures the chart takes the exact dimensions of the parent
        // preventing Recharts from reading '0' or '-1' during flexbox reflows.
        <div className="absolute inset-0 w-full h-full animate-in fade-in duration-500">
          {children({ ready: true })}
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-alt/5 backdrop-blur-[1px] rounded-xl border border-white/5">
          <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin opacity-40 mb-2"></div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted opacity-50">Calibrating Nexus...</span>
        </div>
      )}
    </div>
  );
}
