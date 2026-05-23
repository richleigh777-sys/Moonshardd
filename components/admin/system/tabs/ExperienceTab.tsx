
import React from 'react';
import { Sparkles, HeartPulse, Volume2, Layout } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { ConfigToggle } from '../ConfigToggle';
import { SystemConfig } from '../../../../types';

interface ExperienceTabProps {
    config: SystemConfig;
    onChange: (field: keyof SystemConfig, value: any) => void;
}

export const ExperienceTab: React.FC<ExperienceTabProps> = ({ config, onChange }) => {
    return (
        <section>
            <SectionHeader icon={Sparkles} title="User Experience" sub="Gamification & Feedback" color="text-pink-500" />
            <div className="space-y-4">
                <ConfigToggle 
                    label="Celebration Physics" 
                    active={config.enableConfetti ?? true} 
                    onToggle={() => onChange('enableConfetti', !config.enableConfetti)}
                    icon={HeartPulse}
                    description="Trigger money rain effect on high-value sales."
                />
                <ConfigToggle 
                    label="Auditory Feedback" 
                    active={config.enableSoundFx ?? true} 
                    onToggle={() => onChange('enableSoundFx', !config.enableSoundFx)}
                    icon={Volume2}
                    description="Play interface sounds for interactions and alerts."
                />
                
                <div className="flex items-center justify-between p-4 border rounded-2xl bg-surface-alt/40 border-border-subtle">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-surface-main border border-border-subtle text-text-muted"><Layout size={16}/></div>
                        <div>
                            <span className="font-semibold text-xs block text-text-primary  tracking-wide">Visual Doctrine</span>
                            <span className="text-xs text-text-muted font-medium mt-1 block opacity-70">Enforce global theme policy.</span>
                        </div>
                    </div>
                    <div className="flex bg-surface-main p-1 rounded-lg border border-border-subtle">
                        {(['light', 'dark', 'user'] as const).map(t => (
                            <button 
                                key={t}
                                onClick={() => onChange('enforceTheme', t)}
                                className={`px-3 py-1.5 rounded-md text-xs font-[700]  transition-all ${config.enforceTheme === t ? 'bg-accent-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
