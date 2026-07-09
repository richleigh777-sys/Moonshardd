const fs = require('fs');
let code = fs.readFileSync('components/agent/AgentSettingsView.tsx', 'utf8');

const updatedCode = code.replace(
    /const \[viciUrl, setViciUrl\] = useState\(''\);/,
    `const [viciUrl, setViciUrl] = useState('');
    const [viciUser, setViciUser] = useState('');
    const [viciPass, setViciPass] = useState('');`
).replace(
    /const saved = getStorageItem\('agent_vici_url'\) \|\| '';\s*setViciUrl\(saved\);/,
    `const saved = getStorageItem('agent_vici_url') || '';
        setViciUrl(saved);
        setViciUser(getStorageItem('agent_vici_user') || '');
        setViciPass(getStorageItem('agent_vici_pass') || '');`
).replace(
    /setStorageItem\('agent_vici_url', viciUrl\);/,
    `setStorageItem('agent_vici_url', viciUrl);
        setStorageItem('agent_vici_user', viciUser);
        setStorageItem('agent_vici_pass', viciPass);`
).replace(
    /<input\s*type="url"[\s\S]*?className="w-full bg-surface-main border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary outline-none focus:border-accent-primary transition-colors"\s*\/>\s*<\/div>/,
    `<input 
                                    type="url" 
                                    value={viciUrl}
                                    onChange={(e) => setViciUrl(e.target.value)}
                                    placeholder="https://vici.yourcompany.com/vicidial/welcome.php"
                                    className="w-full bg-surface-main border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary outline-none focus:border-accent-primary transition-colors"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-text-secondary mb-1">User ID</label>
                                    <input 
                                        type="text" 
                                        value={viciUser}
                                        onChange={(e) => setViciUser(e.target.value)}
                                        placeholder="e.g. 1001"
                                        className="w-full bg-surface-main border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary outline-none focus:border-accent-primary transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-text-secondary mb-1">Password</label>
                                    <input 
                                        type="password" 
                                        value={viciPass}
                                        onChange={(e) => setViciPass(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-surface-main border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary outline-none focus:border-accent-primary transition-colors"
                                    />
                                </div>
                            </div>
                            {viciUser && (
                                <div className="p-3 bg-surface-main border border-border-strong rounded-lg flex items-center justify-between text-sm">
                                    <span className="text-text-secondary flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        Active Profile
                                    </span>
                                    <span className="font-bold text-text-primary font-mono">{viciUser}</span>
                                </div>
                            )}`
);

fs.writeFileSync('components/agent/AgentSettingsView.tsx', updatedCode);
