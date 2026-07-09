
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  type?: 'default' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  position?: 'center' | 'right';
}

export const Modal = ({ isOpen, onClose, title, children, footer, type = 'default', size = 'md', position = 'center' }: ModalProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShow(true), 0);
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => setShow(false), 200);
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!show && !isOpen) return null;

  const typeStyles = {
    default: 'border-border-strong shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]',
    danger: 'border-status-error shadow-[0_20px_40px_-15px_rgba(255,0,0,0.2)]',
    success: 'border-status-success shadow-[0_20px_40px_-15px_rgba(0,255,0,0.2)]'
  };

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-3xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'w-screen h-screen max-w-none m-0 rounded-none'
  };

  const isFull = size === 'full';
  const isRight = position === 'right';

  const containerAlign = isRight ? 'justify-end' : 'justify-center';
  const paddingStyle = isRight ? 'p-0' : 'p-0 md:p-4';
  
  const modalShape = isFull ? '' : isRight ? 'rounded-l-2xl shadow-[-20px_0_40px_rgba(0,0,0,0.3)]' : 'rounded-[8px]';
  const modalHeight = isFull || isRight ? 'h-full' : 'max-h-[90vh]';
  
  // Animation classes
  const openTransform = 'translate-y-0 translate-x-0 scale-100';
  const closedTransform = isRight ? 'translate-x-full scale-100' : 'scale-[0.98] translate-y-4';

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center ${containerAlign} ${paddingStyle} transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div 
        className={`absolute inset-0 ${isRight ? 'bg-black/20' : 'bg-surface-main/90 backdrop-blur-sm'}`} 
        onClick={onClose}
      />
      <div className={`relative w-full bg-surface-main border-l border-y ${typeStyles[type]} ${modalShape} transform transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${modalHeight} ${sizeStyles[size]} ${isOpen ? openTransform : closedTransform}`}>
        
        <div className={`flex items-center justify-between px-6 py-4 border-b border-border-strong shrink-0 bg-surface-alt ${isRight ? 'rounded-tl-2xl' : 'rounded-t-[8px]'}`}>
          <h3 className="text-[16px] font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
            {title}
          </h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors p-1 rounded hover:bg-surface-main border border-transparent hover:border-border-strong hover:shadow-sm">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 text-text-primary overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>

        {footer && (
          <div className={`p-4 pt-0 flex justify-end gap-4 border-t border-border-subtle mt-auto shrink-0 bg-surface-main ${isFull || isRight ? '' : 'rounded-b-xl'}`}>
            <div className="pt-6 w-full flex justify-end gap-4">
                {footer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
