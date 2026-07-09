const fs = require('fs');
let code = fs.readFileSync('components/agent/AgentSettingsView.tsx', 'utf8');

// 1. Import Eye, EyeOff
if (!code.includes('Eye,')) {
    code = code.replace("Settings, Save, PhoneCall, Copy, Info", "Settings, Save, PhoneCall, Copy, Info, Eye, EyeOff");
}

// 2. Add state
if (!code.includes('showPass')) {
    code = code.replace(
        "const [viciPass, setViciPass] = useState('');",
        "const [viciPass, setViciPass] = useState('');\n    const [showPass, setShowPass] = useState(false);"
    );
}

// 3. Update the password input field
const passInputRegex = /<label className="block text-sm font-bold text-text-secondary mb-1">Password<\/label>[\s\S]*?<input[\s\S]*?className="w-full bg-surface-main border border-border-subtle rounded-lg px-4 py-2\.5 text-text-primary outline-none focus:border-accent-primary transition-colors"[\s\S]*?\/>/;

const updatedPassInput = `<label className="block text-sm font-bold text-text-secondary mb-1">Password</label>
                                    <div className="relative">
                                        <input 
                                            type={showPass ? "text" : "password"} 
                                            value={viciPass}
                                            onChange={(e) => setViciPass(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-surface-main border border-border-subtle rounded-lg px-4 py-2.5 pr-10 text-text-primary outline-none focus:border-accent-primary transition-colors"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPass(!showPass)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                                        >
                                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>`;

code = code.replace(passInputRegex, updatedPassInput);

fs.writeFileSync('components/agent/AgentSettingsView.tsx', code);
