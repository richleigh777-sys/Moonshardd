import { Ghost, LogOut } from 'lucide-react';
import { User } from '../../types';

interface GhostModeBannerProps {
    currentUser: User | null;
    exitGhostMode: () => void;
}

export const GhostModeBanner: React.FC<GhostModeBannerProps> = ({ currentUser, exitGhostMode }) => (
    <div className="fixed top-0 left-0 right-0 z-[500] bg-amber-500 text-black px-4 py-1.5 flex items-center justify-between shadow-xl animate-in slide-in-from-top-full duration-500">
        <div className="flex items-center gap-3">
            <span className="text-xs font-[700]  tracking-widest">
                Viewing as User: {currentUser?.name}
            </span>
        </div>
        <button 
            onClick={exitGhostMode}
            className="flex items-center gap-2 bg-black/10 hover:bg-black/20 px-3 py-1 rounded-full text-xs font-[700]  tracking-widest transition-all"
        >
            Exit
        </button>
    </div>
);
