import * as React from 'react';
import { sfx } from '../../lib/soundService';
import { Loader2, Play, Pause, Trash2 } from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  variant?: 'default' | 'panel' | 'glass' | 'refraction';
}

export const Card = React.memo(({ children, className = "", onClick, variant = 'default' }: CardProps) => {
  const variants = {
    default: "bg-surface-main border border-border-subtle",
    panel: "bg-surface-main border border-border-subtle shadow-panel", 
    glass: "bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl",
    refraction: "bg-surface-main/20 backdrop-blur-md border border-white/5 shadow-2xl"
  };

  return (
    <div 
      onClick={onClick} 
      className={`transition-all duration-300 rounded-2xl ${variants[variant] || variants.default} ${
        onClick ? 'cursor-pointer hover:border-accent-primary/30' : ''
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
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.memo(({ children, variant = 'primary', className = "", disabled, isLoading, icon, onClick, size = 'md', ...props }: ButtonProps) => {
  const variants = {
    primary: "bg-accent-primary text-white hover:brightness-110 shadow-lg shadow-accent-primary/5",
    secondary: "bg-surface-highlight text-text-primary border border-border-subtle hover:bg-surface-main",
    danger: "bg-rose-500/5 text-rose-500 border border-rose-500/10 hover:bg-rose-500/10",
    ghost: "bg-transparent text-text-muted hover:text-text-primary hover:bg-surface-highlight",
    glow: "bg-accent-primary text-white shadow-[0_0_10px_rgba(99,102,241,0.2)] hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]"
  };

  const sizes = {
    sm: "px-2 py-1 text-[9px]",
    md: "px-3 py-1.5 text-[10px]",
    lg: "px-4 py-2 text-[11px]"
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
        flex items-center justify-center font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-40 rounded-lg
        ${variants[variant] || variants.primary} ${sizes[size]} ${className}
      `}
      onClick={handleClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 size={14} className="animate-spin mr-1.5" /> : icon ? <span className="mr-1.5">{icon}</span> : null}
      {children}
    </button>
  );
});

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: any;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, error, icon: Icon, className = "", ...props }, ref) => {
    return (
        <div className="w-full space-y-0.5 flex flex-col">
            {label && (
                <label className="text-[9px] font-black uppercase text-text-muted/60 tracking-widest mb-0.5 flex items-center gap-1 ml-1 select-none">
                    {label}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors pointer-events-none">
                        <Icon size={14} strokeWidth={2} />
                    </div>
                )}
                <input
                    ref={ref}
                    className={`
                        w-full bg-surface-alt/50 border border-border-subtle px-3 py-2 rounded-lg
                        ${Icon ? 'pl-9' : ''}
                        text-[10px] font-bold text-text-primary outline-none 
                        focus:bg-surface-main focus:border-accent-primary focus:shadow-sm focus:ring-1 focus:ring-accent-primary/20
                        transition-all placeholder:text-text-muted/30 ${className}
                    `}
                    {...props}
                />
            </div>
            {error && <p className="text-[9px] text-rose-500 font-medium ml-1">{error}</p>}
        </div>
    );
});

export const Badge = ({ children, status = 'default', className = "" }: { children?: React.ReactNode, status?: string, className?: string }) => {
  const getStyles = (s: string) => {
    const l = s.toLowerCase();
    if (l.includes('approv') || l === 'online') return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
    if (l.includes('pend') || l === 'break') return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
    if (l.includes('declin') || l === 'high') return 'bg-rose-500/10 text-rose-600 border border-rose-500/20';
    return 'bg-surface-highlight text-text-muted border border-border-subtle';
  };

  return (
    <span className={`inline-block px-2.5 py-1 text-[8px] font-black uppercase tracking-wider rounded-md border ${getStyles(status)} ${className}`}>
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
        <div className="flex items-center gap-2 bg-surface-highlight p-2 border border-border-subtle rounded-lg">
            <audio ref={audioRef} src={src} onEnded={() => setIsPlaying(false)} className="hidden" />
            <button 
              onClick={togglePlay} 
              className="p-1.5 bg-surface-main text-text-primary shadow-sm rounded-md hover:bg-surface-highlight transition-colors flex-shrink-0"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
                {isPlaying ? <Pause size={12} fill="currentColor"/> : <Play size={12} fill="currentColor"/>}
            </button>
            <div className="flex-1 h-1 bg-border-subtle overflow-hidden rounded-full">
                <div 
                  className={`h-full bg-accent-primary transition-all`} 
                  style={{ width: isPlaying ? '100%' : '0%', transitionDuration: isPlaying ? '10s' : '0s', transitionTimingFunction: 'linear' }}
                />
            </div>
            {onDelete && (
              <button 
                onClick={onDelete} 
                className="p-1.5 text-text-muted hover:text-rose-500 transition-colors flex-shrink-0"
                aria-label="Delete"
              >
                <Trash2 size={12}/>
              </button>
            )}
        </div>
    );
};
