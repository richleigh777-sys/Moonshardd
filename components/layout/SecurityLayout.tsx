
import React, { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';

interface SecurityLayoutProps {
  children: React.ReactNode;
}

export const SecurityLayout: React.FC<SecurityLayoutProps> = ({ children }) => {
  const [violationAttempt, setViolationAttempt] = useState(false);

  const triggerViolation = () => {
    setViolationAttempt(true);
    setTimeout(() => setViolationAttempt(false), 2500);
  };

  useEffect(() => {
    // 1. Disable Right Click
    const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        triggerViolation();
    };

    // 2. Disable Developer Tools & Shortcuts
    const blockDevTools = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        triggerViolation();
      }
      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
        e.preventDefault();
        triggerViolation();
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        triggerViolation();
      }
      // Ctrl+S (Save Page)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        triggerViolation();
      }
      // Ctrl+P (Print)
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        triggerViolation();
      }
    };

    window.addEventListener('keydown', blockDevTools);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', blockDevTools);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <div className="relative h-[100dvh] w-full print:hidden cursor-default overflow-hidden flex flex-col bg-[#F5F8FA]">
      {/* Watermark */}
      <div className="security-overlay" />
      
      {/* Violation Overlay */}
      <div 
        className={`fixed inset-0 z-[9999] bg-black/80 flex flex-col items-center justify-center text-status-error transition-all duration-200 pointer-events-none backdrop-blur-sm ${
          violationAttempt ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
        }`}
      >
        <div className="relative z-10 flex flex-col items-center animate-in zoom-in-50 duration-300">
            <div className="w-16 h-16 bg-red-500/10 text-status-error rounded-full flex items-center justify-center mb-4">
                <ShieldAlert size={32} strokeWidth={2} />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Restricted Action</h2>
            <p className="text-sm text-zinc-400">
                This action is not allowed.
            </p>
        </div>
      </div>

      {children}
    </div>
  );
};
