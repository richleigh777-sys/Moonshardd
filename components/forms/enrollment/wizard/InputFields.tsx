import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export const InputField = ({ label, icon: Icon, error, ...props }: any) => (
    <div className="space-y-1.5 w-full">
        <label className="text-[13px] font-semibold text-[#A0A0A0] px-1 flex justify-between items-center tracking-wide">
            {label} 
            {error && <span className="text-[#8BA888] text-sm uppercase font-bold tracking-wider bg-[#8BA888]/10 px-2 rounded-full py-0.5">{error}</span>}
        </label>
        <div className="relative">
            <input 
                {...props}
                className={`w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-[15px] font-medium text-[#FDFDFD] placeholder-[#A0A0A0]/30 outline-none transition-all focus:border-[#C4A470] focus:ring-1 focus:ring-[#C4A470] shadow-sm ${Icon ? 'pl-[42px]' : ''} ${props.className || ''}`}
            />
            {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A0A0A0]/60" size={18} />}
        </div>
    </div>
);

export function CustomSelect({ value, onChange, options, placeholder, name, tabIndex }: any) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: any) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div className="relative w-full" ref={ref}>
            <button
                type="button"
                tabIndex={tabIndex}
                onClick={() => setOpen(!open)}
                className={`w-full bg-[#1A1A1A] border ${open ? 'border-[#C4A470] ring-1 ring-[#C4A470]' : 'border-white/10'} rounded-xl px-4 py-3 text-left text-[15px] font-medium text-[#FDFDFD] outline-none transition-all flex items-center justify-between shadow-sm`}
            >
                {value ? options.find((o:any)=>o.value===value)?.label || value : <span className="text-[#A0A0A0]/30">{placeholder}</span>}
                <ChevronDown size={18} className={`text-[#A0A0A0]/60 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute z-50 mt-2 w-full bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl py-1.5 max-h-60 overflow-y-auto custom-scrollbar">
                    {options.map((opt:any) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => { onChange({ target: { name, value: opt.value }}); setOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-[14px] text-[#FDFDFD] hover:bg-[#C4A470]/10 hover:text-[#C4A470] transition-colors"
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
