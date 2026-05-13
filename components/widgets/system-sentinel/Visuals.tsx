
import React, { useState, useEffect, useRef } from 'react';

export const UptimeDisplay = React.memo(() => {
    const [uptime, setUptime] = useState(0);
    useEffect(() => {
        const start = Date.now() - (1000 * 60 * 60 * 4); // Fake 4h uptime start
        const interval = setInterval(() => { setUptime(Math.floor((Date.now() - start) / 1000)); }, 1000);
        return () => clearInterval(interval);
    }, []);
    const format = (s: number) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${h}h ${m}m ${sec}s`;
    };
    return <span className="font-mono text-emerald-500 font-bold tracking-tight">{format(uptime)}</span>;
});

export const LatencyGraph = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const dataPoints: number[] = Array(30).fill(20);
        let animationId: number;
        let isMounted = true;

        const draw = () => {
            if (!isMounted) return;
            
            dataPoints.shift();
            const last = dataPoints[dataPoints.length - 1];
            let next = last + (Math.random() - 0.5) * 15;
            next = Math.max(5, Math.min(35, next));
            dataPoints.push(next);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            ctx.beginPath();
            ctx.moveTo(0, canvas.height - dataPoints[0]);
            
            for(let i = 1; i < dataPoints.length; i++) {
                const x = i * (canvas.width / (dataPoints.length - 1));
                const y = canvas.height - dataPoints[i];
                ctx.lineTo(x, y);
            }
            
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.shadowBlur = 4;
            ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
            ctx.stroke();

            ctx.lineTo(canvas.width, canvas.height);
            ctx.lineTo(0, canvas.height);
            ctx.closePath();
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
            ctx.fillStyle = gradient;
            ctx.fill();

            animationId = requestAnimationFrame(() => setTimeout(draw, 50));
        };

        draw();
        return () => {
            isMounted = false;
            cancelAnimationFrame(animationId);
        };
    }, []);

    return <canvas ref={canvasRef} width={120} height={40} className="w-full h-10 opacity-80" />;
};
