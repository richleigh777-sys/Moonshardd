import * as React from 'react';
import { sfx } from '../../lib/soundService';
import { Loader2, Play, Pause, Trash2 } from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  variant?: 'default' | 'panel' | 'widget' | 'glass' | 'refraction';
}

export const Card = React.memo(({ children, className = "", onClick, variant = 'default' }: CardProps) => {
    const variants = {
        default: "bg-surface-main shadow-panel border border-border-subtle",
        panel:   "bg-surface-main shadow-panel border border-border-subtle", 
        widget:  "bg-surface-widget shadow-panel border border-border-subtle",
        glass:   "bg-surface-main/80 backdrop-blur-2xl border border-border-subtle shadow-float text-shadow-sm",
        refraction: "bg-gradient-to-br from-surface-main to-surface-widget backdrop-blur-3xl border border-border-subtle shadow-float"
    };

    return (
        <div 
            onClick={onClick} 
            className={`transition-all duration-300 rounded-xl ${variants[variant] || variants.default} ${
                onClick ? 'cursor-pointer hover:border-border-strong' : ''
            } ${className}`}
        >
      <div className="relative z-10 w-full h-full flex flex-col">
        {children}
      </div>
    </div>
  );
});

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glow';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const Button = React.memo(({ children, variant = 'primary', className = "", disabled, isLoading, icon, onClick, ...props }: ButtonProps) => {
  const variants = {
    primary: "bg-accent-primary text-surface-alt hover:opacity-90 shadow-sm border border-transparent shadow-accent-primary/20",
    secondary: "bg-surface-main text-text-primary border border-border-subtle hover:bg-surface-alt hover:border-border-strong shadow-sm",
    danger: "bg-status-error text-white border border-transparent hover:opacity-90 shadow-sm shadow-status-error/10",
    ghost: "bg-transparent text-text-muted hover:text-text-primary hover:bg-surface-alt",
    glow: "bg-accent-primary text-surface-alt shadow-[0_0_15px_var(--color-accent-primary)] hover:shadow-[0_0_25px_var(--color-accent-primary)] border border-accent-primary/50"
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !isLoading) {
        if (variant === 'danger') sfx.playDecline();
        else sfx.playClick();
        if (onClick) onClick(e);
    }
  };

  return (
    <button 
      className={`
        flex items-center justify-center font-medium px-4 py-2 text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 rounded-md outline-none whitespace-nowrap
        ${variants[variant] || variants.primary} ${className}
      `}
      onClick={handleClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 size={16} className="animate-spin mr-1.5" /> : icon ? <span className="mr-1.5">{icon}</span> : null}
      {children}
    </button>
  );
});

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    // Added icon prop to resolve property missing errors in multiple components
    icon?: any;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, error, icon: Icon, className = "", ...props }, ref) => {
    return (
        <div className="w-full space-y-1 flex flex-col">
            {label && (
                <label className="text-xs font-bold  text-text-muted/80 tracking-widest mb-1 flex items-center gap-1 ml-1 select-none">
                    {label}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors pointer-events-none">
                        <Icon size={16} strokeWidth={2} />
                    </div>
                )}
                <input
                    ref={ref}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    data-prevent-autofill="true"
                    className={`
                        w-full bg-surface-alt/50 border border-border-subtle px-3 py-2 rounded-md
                        ${Icon ? 'pl-10' : ''}
                        text-sm font-medium text-text-primary outline-none 
                        focus:bg-surface-main focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 focus:shadow-sm
                        transition-all placeholder:text-text-muted/40 ${className}
                    `}
                    {...props}
                />
            </div>
            {error && <p className="text-xs text-rose-500 font-medium ml-1 mt-1">{error}</p>}
        </div>
    );
});

export const Badge = ({ children, status = 'default', className = "" }: { children?: React.ReactNode, status?: string, className?: string }) => {
  const getStyles = (s: string) => {
    const l = s.toLowerCase();
    if (l.includes('approv') || l === 'online') return 'bg-status-success/10 text-status-success border-status-success/20 shadow-[0_0_10px_var(--color-status-success)]/10';
    if (l.includes('pend') || l === 'break') return 'bg-status-warning/10 text-status-warning border-status-warning/20 shadow-[0_0_10px_var(--color-status-warning)]/10';
    if (l.includes('declin') || l === 'high') return 'bg-status-error/10 text-status-error border-status-error/20 shadow-[0_0_10px_var(--color-status-error)]/10';
    return 'bg-surface-alt text-text-muted border-border-subtle';
  };

  return (
    <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs md:text-xs font-medium tracking-wide border rounded-md leading-none ${getStyles(status)} ${className}`}>
      {children || status}
    </span>
  );
};

export const AudioPlayer = ({ src, onDelete }: { src: string; onDelete?: () => void }) => {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const audioRef = React.useRef<HTMLAudioElement>(null);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) audioRef.current.pause();
        else audioRef.current.play();
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="flex items-center gap-1.5 bg-surface-highlight p-1 border border-border-subtle">
            {src && <audio ref={audioRef} src={src} onEnded={() => setIsPlaying(false)} className="hidden" />}
            <button onClick={togglePlay} className="w-6 h-6 flex items-center justify-center bg-surface-main text-text-primary shadow-sm">
                {isPlaying ? <Pause size={16} fill="currentColor"/> : <Play size={16} fill="currentColor"/>}
            </button>
            <div className="flex-1 h-0.5 bg-border-subtle overflow-hidden">
                <div className={`h-full bg-accent-primary ${isPlaying ? 'animate-pulse' : ''}`} style={{ width: isPlaying ? '100%' : '0%', transition: isPlaying ? 'width 10s linear' : 'none' }}></div>
            </div>
            {onDelete && <button onClick={onDelete} className="p-1.5 text-text-muted hover:text-rose-500 transition-colors"><Trash2 size={11}/></button>}
        </div>
    );
};