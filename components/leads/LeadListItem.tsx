
import { Bell } from 'lucide-react';
import { Note } from '../../types';
import { Badge } from '../ui/Base';

interface LeadListItemProps {
    lead: Note;
    isSelected: boolean;
    isOverdue: boolean;
    now: number;
    onSelect: (id: string) => void;
}

export const LeadListItem: React.FC<LeadListItemProps> = ({ lead, isSelected, isOverdue, now, onSelect }) => {
    const hasReminder = lead.reminderAt && !lead.reminderDismissed;
    const isReminderOverdue = hasReminder && lead.reminderAt! < now;

    return (
        <div 
            onClick={() => onSelect(lead.id)}
            className={`p-3 rounded-xl cursor-pointer border transition-all group relative overflow-hidden ${isSelected ? 'bg-surface-main border-accent-primary shadow-md' : 'bg-transparent border-transparent hover:bg-surface-alt hover:border-border-subtle'}`}
        >
            {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-primary"></div>}
            {hasReminder && (
                <div className={`absolute right-0 top-0 p-1.5 ${isReminderOverdue ? 'text-status-error animate-pulse' : 'text-status-warning'}`}>
                    <Bell size={16} fill="currentColor" />
                </div>
            )}
            
            <div className="flex justify-between items-start mb-1 pl-2">
                <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>{lead.customerName}</h4>
                <span className={`text-xs font-mono font-bold ${isOverdue ? 'text-status-error animate-pulse' : 'text-text-muted'}`}>
                    {new Date(lead.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                </span>
            </div>
            
            <div className="flex items-center gap-2 pl-2">
                <Badge status={lead.priority} className="scale-75 origin-left shadow-none" />
                <span className="text-xs text-text-muted truncate max-w-[120px]">{lead.reason}</span>
            </div>
        </div>
    );
};
