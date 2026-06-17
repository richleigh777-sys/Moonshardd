import React from 'react';
import { motion } from 'framer-motion';
import { useSystem } from '../../hooks/useSystem';
import { Quote } from 'lucide-react';

export const SupportTicker: React.FC = () => {
    const { activeServer } = useSystem();
    
    if (activeServer?.config?.enableSupportTicker === false) return null;

    const messages = [
        "You are built for this. Take a deep breath and dial.",
        "Quality underwriting starts with a thorough presentation. You've got this.",
        "Focus on the client's needs. The sale will follow naturally.",
        "Every 'no' gets you closer to a 'yes'. Keep pushing.",
        "We are here to protect families. Remember your mission today.",
        "Your empathy is your greatest tool. Listen carefully."
    ];

    return (
        <div className="w-full bg-accent-secondary/5 border-b border-accent-secondary/20 py-1.5 overflow-hidden flex items-center relative z-50">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-surface-main to-transparent z-10"></div>
            <div className="flex items-center gap-2 pl-4 shrink-0 z-10 border-r border-accent-secondary/20 pr-3 bg-surface-main">
                <Quote size={12} className="text-accent-secondary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-accent-secondary">Underwriting</span>
            </div>
            <div className="flex flex-1 overflow-hidden relative">
                <motion.div 
                    initial={{ x: "100%" }}
                    animate={{ x: "-100%" }}
                    transition={{
                        repeat: Infinity,
                        duration: 35,
                        ease: "linear"
                    }}
                    className="whitespace-nowrap flex items-center gap-16 px-4"
                >
                    {[...messages, ...messages].map((msg, i) => (
                        <span key={i} className="text-xs font-medium text-text-secondary tracking-wide flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 mr-3 inline-block"></span>
                            {msg}
                        </span>
                    ))}
                </motion.div>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-surface-main to-transparent z-10"></div>
        </div>
    );
};
