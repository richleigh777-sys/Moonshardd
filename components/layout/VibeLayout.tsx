
import React, { ReactNode, useEffect, useRef } from 'react';
import { useCRM } from '../../hooks/useCRM';
import { useSystem } from '../../hooks/useSystem';

interface VibeLayoutProps {
  children: ReactNode;
}

export const VibeLayout: React.FC<VibeLayoutProps> = ({ children }) => {
  const { systemConfig } = useCRM();
  const { theme } = useSystem();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const isEcoModeRef = useRef(systemConfig.ecoMode);

  useEffect(() => {
      isEcoModeRef.current = systemConfig.ecoMode;
  }, [systemConfig.ecoMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetX = width / 2;
    let targetY = height / 2;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();

    const gridSize = 60;
    let tick = 0;
    let animId: number;

    const drawGrid = () => {
      if (isEcoModeRef.current) {
          ctx.clearRect(0, 0, width, height);
          animId = requestAnimationFrame(drawGrid);
          return;
      }

      ctx.clearRect(0, 0, width, height);
      
      // Dynamic Theme Colors
      const style = getComputedStyle(document.body);
      const accentColor = style.getPropertyValue('--color-accent-primary').trim() || '#8B5CF6';
      const isDark = document.documentElement.classList.contains('dark');
      
      // Parse Hex to RGB for opacity
      const hexToRgb = (hex: string) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16)
          } : { r: 139, g: 92, b: 246 };
      }
      const rgb = hexToRgb(accentColor);

      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      const vpX = width / 2 - (mouseX - width / 2) * 0.05;
      const vpY = height / 2 - (mouseY - height / 2) * 0.05;

      ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${isDark ? 0.08 : 0.04})`;
      ctx.lineWidth = 1;
      
      const timeOffset = (tick * 0.2) % gridSize;

      ctx.beginPath();
      // Vertical Lines
      for (let x = -width * 0.5; x < width * 1.5; x += gridSize) {
        const xPos = x + (mouseX * 0.02);
        ctx.moveTo(xPos, 0);
        
        // Slight curve towards mouse
        const dist = Math.abs(xPos - mouseX);
        const curve = Math.max(0, (500 - dist) / 500) * 20;
        
        ctx.quadraticCurveTo(
            xPos + (xPos < mouseX ? curve : -curve), 
            height / 2, 
            xPos + (xPos - vpX) * 0.05, 
            height
        );
      }
      
      // Horizontal Lines (Moving down)
      for (let y = -gridSize; y < height + gridSize; y += gridSize) {
        const yPos = y + timeOffset;
        ctx.moveTo(0, yPos);
        ctx.lineTo(width, yPos + (yPos - vpY) * 0.05);
      }
      ctx.stroke();

      // Floating Particles (Empathy Dust)
      for (let i = 0; i < 30; i++) {
          const pX = (Math.sin(tick * 0.001 + i) * width/2) + width/2 + ((mouseX - width/2) * (i % 5) * 0.01);
          const pY = (Math.cos(tick * 0.002 + i) * height/2) + height/2 + ((mouseY - height/2) * (i % 5) * 0.01);
          const size = Math.abs(Math.sin(tick * 0.005 + i)) * 2;
          
          if (size > 0.5) {
              ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.15 * size})`;
              ctx.beginPath();
              ctx.arc(pX, pY, size, 0, Math.PI * 2);
              ctx.fill();
          }
      }

      tick++;
      animId = requestAnimationFrame(drawGrid);
    };

    animId = requestAnimationFrame(drawGrid);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [theme]); // Re-run when theme changes

  return (
    <div className="h-full w-full w-full overflow-hidden bg-surface-alt text-text-primary relative transition-colors duration-700">
      <div className="absolute inset-0 bg-surface-alt z-0 pointer-events-none transition-colors duration-700"></div>
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0 pointer-events-none opacity-100"
      />
      {/* Vignette Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-60 mix-blend-multiply bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--color-surface-canvas))_120%)]"></div>
      
      <div className="relative z-10 h-full w-full flex flex-col">
        {children}
      </div>
    </div>
  );
};
