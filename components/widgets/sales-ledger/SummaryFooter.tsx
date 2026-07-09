
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SummaryFooterProps {
    count: number;
    approved: number;
    pending: number;
    total: number;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const SummaryFooter: React.FC<SummaryFooterProps> = React.memo(({ 
    count, approved, pending, total, currentPage, totalPages, onPageChange
}) => (
    <div className="bg-surface-alt/80 border-t border-border-subtle py-1.5 px-3 flex justify-between items-center text-[10px] font-bold tracking-widest text-text-muted backdrop-blur-md sticky bottom-0 z-20">
        
        {/* Stats */}
        <div className="flex gap-4 items-center">
            <span>Rows: {count}</span>
            <div className="w-px h-3 bg-border-subtle mx-1"></div>
            <div className="flex gap-2 items-center text-text-primary">
                <span>Total Volume:</span>
                <span className="text-xs font-[700] num-font">${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-3">
            <span className="text-text-secondary">Page {currentPage} of {totalPages}</span>
            <div className="flex gap-1">
                <button 
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1 rounded border border-border-subtle hover:bg-surface-main disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronLeft size={14} />
                </button>
                <button 
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded border border-border-subtle hover:bg-surface-main disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    </div>
));

