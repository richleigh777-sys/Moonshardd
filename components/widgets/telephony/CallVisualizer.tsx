
import React, { useRef, useEffect } from 'react';

interface CallVisualizerProps {
    active: boolean;
    talking: boolean;
    height?: number;
}

export const CallVisualizer: React.FC<CallVisualizerProps> = ({ active, talking, height = 80 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        let animationId: number;
        let offset = 0;

        const draw = () => {
            // Check if container dimensions changed (basic responsiveness)
            const parent = canvas.parentElement;
            if (parent && (canvas.width !== parent.clientWidth || canvas.height !== height)) {
                canvas.width = parent.clientWidth;
                canvas.height = height;
            }

            const width = canvas.width;
            const drawHeight = canvas.height;
            const centerY = drawHeight / 2;

            ctx.clearRect(0, 0, width, drawHeight);
            
            // Channel 1: Base Carrier Wave (Always visible if active)
            ctx.beginPath();
            for (let i = 0; i < width; i++) {
                const y = centerY + Math.sin((i * 0.05) + offset) * (active ? 5 : 2);
                if (i === 0) ctx.moveTo(i, y); else ctx.lineTo(i, y);
            }
            ctx.strokeStyle = active ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Channel 2: Voice Modulation (Only when talking)
            if (active) {
                ctx.beginPath();
                const amplitude = talking ? 20 : 2;
                const freq = talking ? 0.2 : 0.05;
                
                for (let i = 0; i < width; i++) {
                    // Complex waveform simulation: Carrier + Signal + Noise
                    const y = centerY + 
                        Math.sin((i * freq) - (offset * 2)) * amplitude * Math.sin(i * 0.01) +
                        Math.cos((i * 0.1) + offset) * (amplitude * 0.5);
                    
                    if (i === 0) ctx.moveTo(i, y); else ctx.lineTo(i, y);
                }
                
                ctx.strokeStyle = talking ? '#10B981' : '#059669';
                ctx.lineWidth = talking ? 3 : 1;
                ctx.shadowBlur = talking ? 15 : 0;
                ctx.shadowColor = '#10B981';
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            offset += 0.15;
            animationId = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(animationId);
    }, [active, talking, height]);

    return <canvas ref={canvasRef} className="w-full" style={{ height }} />;
};
