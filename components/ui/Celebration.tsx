
import React, { useEffect, useRef } from 'react';

export const MoneyRain: React.FC<{ active: boolean }> = ({ active }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!active || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrame: number;
        const particles: any[] = [];
        const emoji = ['💵', '💰', '💎', '🚀', '✨'];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * -canvas.height,
                vy: 2 + Math.random() * 5,
                vx: (Math.random() - 0.5) * 2,
                symbol: emoji[Math.floor(Math.random() * emoji.length)],
                size: 20 + Math.random() * 30,
                rotation: Math.random() * 360,
                rv: (Math.random() - 0.5) * 5
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(p => {
                p.y += p.vy;
                p.x += p.vx;
                p.rotation += p.rv;

                if (p.y > canvas.height) {
                    p.y = -50;
                    p.x = Math.random() * canvas.width;
                }

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                // Force Emoji Font Stack
                ctx.font = `${p.size}px "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif`;
                ctx.fillText(p.symbol, -p.size / 2, p.size / 2);
                ctx.restore();
            });

            animationFrame = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrame);
            window.removeEventListener('resize', resize);
        };
    }, [active]);

    if (!active) return null;

    return (
        <canvas 
            ref={canvasRef} 
            className="fixed inset-0 pointer-events-none z-[1000] animate-in fade-in duration-500"
        />
    );
};
