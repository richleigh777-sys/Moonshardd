
import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useSystem } from '../../hooks/useSystem';

export const Toast = () => {
    const { toast, setToast } = useSystem();

    React.useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                setToast(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [toast, setToast]);

    const icons = {
        success: <CheckCircle2 className="text-emerald-500" size={16} />,
        error: <AlertCircle className="text-rose-500" size={16} />,
        warning: <AlertTriangle className="text-amber-500" size={16} />,
        info: <Info className="text-blue-500" size={16} />
    };

    const colors = {
        success: "border-emerald-500/20 bg-emerald-500/5",
        error: "border-rose-500/20 bg-rose-500/5",
        warning: "border-amber-500/20 bg-amber-500/5",
        info: "border-blue-500/20 bg-blue-500/5"
    };

    return (
        <AnimatePresence>
            {toast && (
                <motion.div
                    key="toast-active"
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.2 } }}
                    className={`
                        fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 
                        border backdrop-blur-md rounded-xl shadow-2xl min-w-[320px] max-w-md
                        ${colors[toast.type] || colors.info}
                    `}
                >
                    <div className="flex-shrink-0">
                        {icons[toast.type] || icons.info}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-text-primary mb-0.5">
                            {toast.title}
                        </h4>
                        <p className="text-[10px] font-medium text-text-muted leading-relaxed">
                            {toast.message}
                        </p>
                    </div>

                    <button 
                        onClick={() => setToast(null)}
                        className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors text-text-muted"
                    >
                        <X size={14} />
                    </button>

                    {/* Progress Bar */}
                    <motion.div 
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 5, ease: "linear" }}
                        className={`absolute bottom-0 left-0 h-0.5 ${
                            toast.type === 'success' ? 'bg-emerald-500' :
                            toast.type === 'error' ? 'bg-rose-500' :
                            toast.type === 'warning' ? 'bg-amber-500' :
                            'bg-blue-500'
                        } opacity-40`}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};
