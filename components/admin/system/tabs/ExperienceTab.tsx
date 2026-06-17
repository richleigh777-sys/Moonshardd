import React from 'react';
import { Sparkles, HeartPulse, Volume2, Layout, Zap, Award, Compass, Eye } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { ConfigToggle } from '../ConfigToggle';
import { SystemConfig } from '../../../../types';
import { sfx } from '../../../../lib/soundService';

interface ExperienceTabProps {
    config: SystemConfig;
    onChange: (field: keyof SystemConfig, value: any) => void;
}

export const ExperienceTab: React.FC<ExperienceTabProps> = ({ config, onChange }) => {
    
    const handleToggle = (field: keyof SystemConfig, currentValue: boolean) => {
        sfx.playClick();
        onChange(field, !currentValue);
    };

    const handleSelect = (field: keyof SystemConfig, value: any) => {
        sfx.playConfirm();
        onChange(field, value);
    };

    return (
        <section className="space-y-6">
            <SectionHeader 
                icon={Sparkles} 
                title="User Experience (UX) & Vibe" 
                sub="Interface Psychology, Gamification, and Auditory Spaces" 
                color="text-pink-500" 
            />
            
            <p className="text-sm text-text-muted leading-relaxed">
                As the Director of UI/UX, this suite grants you absolute authority over the cognitive atmospheric patterns of the system. Fine-tune animations, auditory levels, and visual comfort filters to maximize operative focus and minimize sensory exhaustion.
            </p>

            <div className="space-y-4">
                
                {/* 1. Core Psychological Elements */}
                <div className="bg-surface-main border border-border-subtle rounded-xl p-4 space-y-4 shadow-sm">
                    <h4 className="text-sm font-black uppercase text-text-muted tracking-wider font-mono mb-2">Primary Cognitive Systems</h4>
                    
                    <ConfigToggle 
                        label="Celebration Particle Physics" 
                        active={config.enableConfetti ?? true} 
                        onToggle={() => handleToggle('enableConfetti', config.enableConfetti ?? true)}
                        icon={HeartPulse}
                        description="Inject celebratory confetti and money rain canvas overlays globally during peak sales milestones."
                    />
                    
                    <ConfigToggle 
                        label="Auditory Sensory Feedback" 
                        active={config.enableSoundFx ?? true} 
                        onToggle={() => handleToggle('enableSoundFx', config.enableSoundFx ?? true)}
                        icon={Volume2}
                        description="Enforce responsive haptic sound cues on task success, state transitions, and supportive dispatches."
                    />
                </div>

                {/* 2. Visual Doctrine Selector */}
                <div className="bg-surface-main border border-border-subtle rounded-xl p-4 space-y-4 shadow-sm">
                    <h4 className="text-sm font-black uppercase text-text-muted tracking-wider font-mono mb-2 font-bold">Aesthetic Doctrine & Styling</h4>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-xl bg-surface-alt/30 border-border-subtle gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-surface-main border border-border-subtle text-accent-primary">
                                <Layout size={18}/>
                            </div>
                            <div>
                                <span className="font-extrabold text-sm block text-text-primary tracking-wide">Color Doctrine Control</span>
                                <span className="text-sm text-text-muted font-medium mt-1 block leading-normal">
                                    Override and enforce matching system branding across all operative login screens.
                                </span>
                            </div>
                        </div>
                        <div className="flex bg-surface-main p-1 rounded-xl border border-border-subtle shrink-0">
                            {[
                                { key: 'light', label: 'Cashmere Off-White' },
                                { key: 'dark', label: 'Balsamic Espresso Dark' },
                                { key: 'user', label: 'Operative Standard' }
                            ].map(t => (
                                <button 
                                    key={t.key}
                                    onClick={() => handleSelect('enforceTheme', t.key)}
                                    className={`px-4 py-2 rounded-lg text-sm font-black uppercase tracking-wider transition-all ${config.enforceTheme === t.key ? 'bg-accent-primary text-white shadow-md' : 'text-text-muted hover:text-text-primary hover:bg-surface-alt/50'}`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3. Interface Velocity Configuration */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-xl bg-surface-alt/30 border-border-subtle gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-surface-main border border-border-subtle text-accent-primary">
                                <Zap size={18}/>
                            </div>
                            <div>
                                <span className="font-extrabold text-sm block text-text-primary tracking-wide">Cognitive Transition Speed</span>
                                <span className="text-sm text-text-muted font-medium mt-1 block leading-normal">
                                    Set page-loading animation curves. Staggering curves helps ground nervous system focus.
                                </span>
                            </div>
                        </div>
                        <div className="flex bg-surface-main p-1 rounded-xl border border-border-subtle shrink-0">
                            {[
                                { key: 'gentle', label: 'Silky Stagger' },
                                { key: 'normal', label: 'SaaS Standard' },
                                { key: 'instant', label: 'Instant Focus' }
                            ].map(v => (
                                <button 
                                    key={v.key}
                                    onClick={() => handleSelect('transitionSpeed', v.key)}
                                    className={`px-4 py-2 rounded-lg text-sm font-black uppercase tracking-wider transition-all ${ config.transitionSpeed === v.key || (!config.transitionSpeed && v.key === 'gentle') ? 'bg-accent-primary text-white shadow-md' : 'text-text-muted hover:text-text-primary hover:bg-surface-alt/50'}`}
                                >
                                    {v.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 4. Empathy Comfort Palette Settings */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-xl bg-surface-alt/30 border-border-subtle gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-surface-main border border-border-subtle text-accent-primary">
                                <Eye size={18}/>
                            </div>
                            <div>
                                <span className="font-extrabold text-sm block text-text-primary tracking-wide">Ocular Fatigue Protections</span>
                                <span className="text-sm text-text-muted font-medium mt-1 block leading-normal">
                                    Dynamically smooth high contrast spikes to make the screen safe for extended 12h shifts.
                                </span>
                            </div>
                        </div>
                        <div className="flex bg-surface-main p-1 rounded-xl border border-border-subtle shrink-0">
                            {[
                                { key: 'cozy', label: 'Amber Tint Cozy' },
                                { key: 'neutral', label: 'High Contrast' }
                            ].map(filter => (
                                <button 
                                    key={filter.key}
                                    onClick={() => handleSelect('eyeCareFilter', filter.key)}
                                    className={`px-4 py-2 rounded-lg text-sm font-black uppercase tracking-wider transition-all ${ config.eyeCareFilter === filter.key || (!config.eyeCareFilter && filter.key === 'cozy') ? 'bg-accent-primary text-white shadow-md' : 'text-text-muted hover:text-text-primary hover:bg-surface-alt/50'}`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

                {/* 5. Gamification progression details */}
                <div className="bg-surface-main border border-border-subtle rounded-xl p-4 space-y-4 shadow-sm">
                    <h4 className="text-sm font-black uppercase text-text-muted tracking-wider font-mono mb-2">Progression Systems</h4>

                    <ConfigToggle 
                        label="Motivational Streak Tickers" 
                        active={config.enableStreakAnimation ?? true} 
                        onToggle={() => handleToggle('enableStreakAnimation', config.enableStreakAnimation ?? true)}
                        icon={Award}
                        description="Animate dynamic flame sparks around the active score metric of operatives during multi-deal streaks."
                    />

                    <ConfigToggle 
                        label="Supportive Underwriter Broadcast Banner" 
                        active={config.enableSupportTicker ?? true} 
                        onToggle={() => handleToggle('enableSupportTicker', config.enableSupportTicker ?? true)}
                        icon={Compass}
                        description="Render a small, comforting marquee at the very peak of the agent portal with uplifting words from underwriting."
                    />
                </div>

            </div>
        </section>
    );
};
