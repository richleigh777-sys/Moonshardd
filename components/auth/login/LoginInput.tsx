
import React from 'react';

interface LoginInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: any;
    isActive?: boolean;
    rightElement?: React.ReactNode;
}

export const LoginInput: React.FC<LoginInputProps> = ({ 
    icon: Icon, isActive, rightElement, className = "", ...props 
}) => (
    <div className={`relative group w-full transition-all duration-300 ${isActive ? 'scale-[1.01]' : 'opacity-90 hover:opacity-100'}`}>
        {Icon && (
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 pointer-events-none ${isActive ? 'text-accent-primary' : 'text-text-muted'}`}>
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
            </div>
        )}
        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
            {...props}
            className={`
                w-full bg-surface-alt/50 border border-border-subtle rounded-xl 
                ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3.5 
                text-sm font-medium text-text-primary outline-none 
                focus:bg-surface-main focus:border-accent-primary focus:shadow-sm
                transition-all placeholder:text-text-muted/60 ${className}
            `}
        />
        {rightElement && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {rightElement}
            </div>
        )}
    </div>
);
