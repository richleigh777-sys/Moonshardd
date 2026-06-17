
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
}

export const Modal = ({ isOpen, onClose, title, children, footer, type = 'default', size = 'md' }: ModalProps) => {
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
    default: 'border-border-subtle shadow-2xl',
    danger: 'border-status-error shadow-2xl shadow-status-error/10',
    success: 'border-status-success shadow-2xl shadow-status-success/10'
  };

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'w-screen h-screen max-w-none m-0 rounded-none'
  };

  const isFull = size === 'full';

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-4 transition-all duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div 
        className="absolute inset-0 bg-surface-alt/80 backdrop-blur-md" 
        onClick={onClose}
      />

      <div className={`relative w-full bg-surface-main border ${typeStyles[type]} ${isFull ? '' : 'rounded-xl'} transform transition-all duration-200 flex flex-col ${isFull ? 'h-full' : 'max-h-[90vh]'} ${sizeStyles[size]} ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        
        <div className="flex items-center justify-between p-4 border-b border-border-subtle shrink-0">
          <h3 className="text-xl font-semibold text-text-primary tracking-tight flex items-center gap-2">
            {title}
          </h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-surface-alt">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 text-text-primary overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>

        {footer && (
          <div className={`p-4 pt-0 flex justify-end gap-4 border-t border-border-subtle mt-auto shrink-0 bg-surface-main ${isFull ? '' : 'rounded-b-xl'}`}>
            <div className="pt-6 w-full flex justify-end gap-4">
                {footer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
