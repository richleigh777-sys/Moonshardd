
import React, { useState } from 'react';
import { User as UserIcon, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { LoginInput } from './LoginInput';
import { Button } from '../../ui/Base';

interface CredentialsStageProps {
    onSubmit: (u: string, p: string) => void;
    isProcessing: boolean;
}

export const CredentialsStage: React.FC<CredentialsStageProps> = ({ onSubmit, isProcessing }) => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [activeField, setActiveField] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (userId && password) onSubmit(userId, password);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5 animate-in slide-in-from-right-4 duration-500">
            <div className="space-y-4">
                <LoginInput 
                    icon={UserIcon} 
                    value={userId} 
                    onChange={(e) => setUserId(e.target.value)} 
                    onFocus={() => setActiveField('user')}
                    onBlur={() => setActiveField(null)}
                    isActive={activeField === 'user'}
                    placeholder="Username" 
                    autoFocus
                    disabled={isProcessing}
                />
                <LoginInput 
                    icon={Lock} 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    onFocus={() => setActiveField('pass')}
                    onBlur={() => setActiveField(null)}
                    isActive={activeField === 'pass'}
                    placeholder="Password" 
                    disabled={isProcessing}
                />
            </div>

            <Button 
                type="submit" 
                variant="primary" 
                disabled={isProcessing || !userId || !password}
                className="w-full h-12 text-sm font-bold shadow-lg shadow-accent-primary/20 rounded-xl"
            >
                {isProcessing ? (
                    <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Authenticating...</span>
                ) : (
                    <span className="flex items-center gap-2">Sign In <ArrowRight size={16} /></span>
                )}
            </Button>
        </form>
    );
};
