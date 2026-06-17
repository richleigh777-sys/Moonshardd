
import React from 'react';

interface SectionHeaderProps {
    icon: any;
    title: string;
    sub?: string;
    color?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ icon: Icon, title, sub, color = "text-text-primary" }) => (
    <div className="flex items-center justify-between pb-3 border-b border-border-subtle/50 mb-6">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-surface-alt border border-border-subtle ${color}`}>
                <Icon size={18} strokeWidth={2.5} />
            </div>
            <div>
                <h4 className="text-sm font-bold text-text-primary  tracking-wide">{title}</h4>
                {sub && <p className="text-sm font-medium text-text-muted tracking-wide mt-0.5">{sub}</p>}
            </div>
        </div>
    </div>
);
