import React from 'react';

interface LoginInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: any;
    isActive?: boolean;
    rightElement?: React.ReactNode;
}

export const LoginInput: React.FC<LoginInputProps> = ({ 
    icon: Icon, isActive, rightElement, className = "", ...props 
}) => (
    <div className={`relative group w-full transition-all duration-300 ${isActive ? 'scale-[1.01]' : 'opacity-100 hover:scale-[1.005]'}`}>
        {Icon && (
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 pointer-events-none ${isActive ? 'text-emerald-400' : 'text-emerald-100/40'}`}>
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
            </div>
        )}
        <input 
            autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
            {...props}
            className={`
                w-full bg-[#05110A] border border-emerald-500/20 rounded-[14px] 
                ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3.5 
                text-sm font-medium text-white outline-none 
                focus:bg-[#06160D] focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50
                transition-all placeholder:text-emerald-100/30 shadow-inner ${className}
            `}
        />
        {rightElement && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {rightElement}
            </div>
        )}
    </div>
);
