const fs = require('fs');
let code = fs.readFileSync('components/admin/system/tabs/IntegrationsTab.tsx', 'utf8');

// Find the broken part
const brokenPart = code.indexOf('                </div>\n                                    icon={Globe}');
if (brokenPart !== -1) {
    code = code.substring(0, brokenPart) + `                </div>

                {/* WEBHOOK MODULE WITH EXPANDABLE CUSTOM HEADER EDITOR */}
                <div className="space-y-4">
                    <ConfigToggle 
                        label="Neural Event Webhook" 
                        active={config.webhookEnabled || false} 
                        onToggle={() => onChange('webhookEnabled', !config.webhookEnabled)}
                        description="Push real-time payload events to any remote endpoint (Zapier, Make, Custom Server) when critical system events trigger."
                    />
                    
                    {config.webhookEnabled && (
                        <div className="pl-14 pr-4 space-y-4 animate-in fade-in duration-300">
                            <div className="flex items-center justify-between pb-3 border-b border-border-subtle/50">
                                <h5 className="text-sm font-bold text-text-primary flex items-center gap-2">
                                    <Link size={16} className="text-purple-500"/> Payload Configuration
                                </h5>
                                <button 
                                    onClick={handleTestWebhook}
                                    disabled={isWebhookTest}
                                    className="px-3 py-1.5 bg-surface-main border border-border-subtle rounded-xl text-sm font-bold  tracking-wide hover:border-purple-500/50 hover:text-purple-400 transition-all flex items-center gap-2 text-white"
                                >
                                    {isWebhookTest ? <Activity size={16} className="animate-spin text-purple-500"/> : <Zap size={16} className="text-purple-500"/>}
                                    Fire Test Event
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input ` + code.substring(brokenPart + 25);
    fs.writeFileSync('components/admin/system/tabs/IntegrationsTab.tsx', code);
    console.log("Fixed!");
} else {
    console.log("Not found");
}
