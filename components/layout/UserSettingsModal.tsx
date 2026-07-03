import React, { useState } from 'react';
import { User } from '../../types';
import { X, User as UserIcon, Bell, Shield, PaintBucket } from 'lucide-react';
import { sfx } from '../../lib/soundService';

interface UserSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: string;
    user?: User | null;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose, initialTab = 'profile', user }) => {
    const [activeTab, setActiveTab] = useState(initialTab);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-surface-main w-full max-w-2xl max-h-[85vh] rounded-xl border border-border-subtle shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-surface-alt/50">
                    <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                        <UserIcon size={20} className="text-accent-primary" />
                        Settings
                    </h2>
                    <button 
                        onClick={() => {
                            sfx.playClick();
                            onClose();
                        }}
                        className="text-text-muted hover:text-text-primary transition-colors p-1"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    <div className="w-48 bg-surface-alt/20 border-r border-border-subtle flex flex-col py-4">
                        {[
                            { id: 'profile', icon: UserIcon, label: 'Profile' },
                            { id: 'preferences', icon: PaintBucket, label: 'Preferences' },
                            { id: 'notifications', icon: Bell, label: 'Notifications' },
                            { id: 'security', icon: Shield, label: 'Security' }
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    sfx.playClick();
                                    setActiveTab(t.id);
                                }}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === t.id ? 'bg-accent-primary/10 text-accent-primary border-r-2 border-accent-primary' : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'}`}
                            >
                                <t.icon size={16} />
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto">
                        {activeTab === 'profile' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div>
                                    <h3 className="text-base font-bold text-text-primary mb-4">Profile Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-text-secondary mb-1">Full Name</label>
                                            <input type="text" className="w-full bg-surface-alt border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary" defaultValue={user?.name || ''} readOnly />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-text-secondary mb-1">Email Address</label>
                                            <input type="email" className="w-full bg-surface-alt border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary" defaultValue={user?.email || ''} readOnly />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'preferences' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div>
                                    <h3 className="text-base font-bold text-text-primary mb-4">System Preferences</h3>
                                    <p className="text-sm text-text-secondary">Visual and audio settings.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div>
                                    <h3 className="text-base font-bold text-text-primary mb-4">Notification Settings</h3>
                                    <p className="text-sm text-text-secondary">Manage alerts and sounds.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div>
                                    <h3 className="text-base font-bold text-text-primary mb-4">Account Security</h3>
                                    <p className="text-sm text-text-secondary">Password and 2FA settings.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
