import React from 'react';
import { ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';

export interface FormLabelProps {
    icon?: any;
    children?: React.ReactNode;
    className?: string;
}

export const FormLabel = ({ icon: Icon, children, className = "" }: FormLabelProps) => (
    <label className={`text-sm font-[700]  text-text-muted/60 tracking-[0.2em] mb-1 flex items-center gap-1.5 ml-1 transition-colors select-none ${className}`}>
        {Icon && <Icon size={16} className="text-accent-primary/60" strokeWidth={3} />}
        {children}
    </label>
);

export type FormInputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    icon?: any;
    rightElement?: React.ReactNode;
    status?: 'default' | 'valid' | 'invalid';
};

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(({ icon: Icon, rightElement, status = 'default', className = "", ...props }: FormInputProps, ref) => {
    const isError = status === 'invalid';
    const isValid = status === 'valid';

    return (
        <div className="relative group w-full">
            <div className={`absolute -inset-[1px] rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none z-0 bg-gradient-to-br ${
                isError ? 'from-rose-500/50 to-rose-900/50' : 
                isValid ? 'from-emerald-500/50 to-emerald-900/50' : 
                'from-accent-primary/40 via-white/5 to-white/10'
            }`}></div>
            
            <div className={`
                relative z-10 w-full rounded-xl border-none backdrop-blur-3xl transition-all duration-500
                ${isError ? 'bg-rose-500/[0.03]' : isValid ? 'bg-emerald-500/[0.03]' : 'bg-surface-main/40 group-hover:bg-white/[0.05] group-focus-within:bg-surface-alt'}
                shadow-[inset_0_1px_6px_rgba(0,0,0,0.4)] ring-1 
                ${isError ? 'ring-rose-500/30' : isValid ? 'ring-emerald-500/30' : 'ring-white/10 group-focus-within:ring-accent-primary/40'}
            `}>
                {Icon && (
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 pointer-events-none z-20 ${
                        isError ? 'text-rose-400' : isValid ? 'text-status-success' : 'text-text-muted group-focus-within:text-accent-primary'
                    }`}>
                        <Icon size={16} strokeWidth={2.5} />
                    </div>
                )}
                
                <input 
                    spellCheck={false} 
                    autoCorrect="off"
                    {...props}
                    ref={ref}
                    className={`
                        w-full bg-transparent border-none outline-none py-2 px-4 
                        ${Icon ? 'pl-9' : 'pl-3'} ${rightElement ? 'pr-9' : 'pr-3'}
                        text-sm font-medium text-text-primary placeholder:text-text-muted/40 
                        tracking-normal disabled:opacity-40
                        ${className}
                    `}
                />

                {rightElement && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted/40 group-focus-within:text-text-primary transition-all z-20">
                        {rightElement}
                    </div>
                )}
                
                {(isError || isValid) && !rightElement && (
                    <div className={`absolute right-3 top-1/2 -translate-y-1/2 z-20 animate-in zoom-in duration-300 ${isError ? 'text-rose-500' : 'text-status-success'}`}>
                        {isError ? <AlertCircle size={16} strokeWidth={3} /> : <CheckCircle size={16} strokeWidth={3} />}
                    </div>
                )}
            </div>
        </div>
    );
});

FormInput.displayName = 'FormInput';

export const FormSelect = ({ icon: Icon, children, className = "", ...props }: any) => (
    <div className="relative group w-full">
        <div className="absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
        <div className="relative z-10 w-full rounded-xl bg-surface-main/40 group-hover:bg-white/[0.05] ring-1 ring-white/10 group-focus-within:ring-accent-primary/40 shadow-[inset_0_1px_6px_rgba(0,0,0,0.4)] backdrop-blur-3xl transition-all duration-500">
            {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors duration-300 pointer-events-none z-20">
                    <Icon size={16} strokeWidth={2.5} />
                </div>
            )}
            <select 
                {...props}
                className={`
                    w-full bg-transparent border-none outline-none py-2 px-4 
                    ${Icon ? 'pl-9' : 'pl-3'} pr-8
                    text-sm font-bold text-text-primary appearance-none cursor-pointer
                    ${className}
                `}
            >
                {children}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted/40 group-hover:text-text-primary transition-colors">
                <ChevronDown size={16} strokeWidth={3} />
            </div>
        </div>
    </div>
);
