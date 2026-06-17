import React from 'react';
import { Copy, Radio } from 'lucide-react';
import { sfx } from '../../../lib/soundService';

interface SyncHubSectionProps {
    crmUrl: string;
    bookmarkletScript: string;
    setToast: (toast: { title: string; message: string; type: 'success' | 'info' | 'error' }) => void;
    pasteText: string;
    setPasteText: (val: string) => void;
    handlePasteAndParseText: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
}

export const SyncHubSection: React.FC<SyncHubSectionProps> = ({
    crmUrl,
    bookmarkletScript,
    setToast,
    pasteText,
    setPasteText,
    handlePasteAndParseText,
}) => {
    return (
        <div className="space-y-4 font-sans animate-in fade-in duration-300">
            {/* 100% AUTOMATED ENTERPRISE WEB FORM PUSH METHOD */}
            <div className="p-4 bg-gradient-to-br from-emerald-950/20 to-teal-950/20 border border-emerald-500/20 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm font-black text-emerald-400 uppercase tracking-widest">
                        <Radio size={14} className="animate-pulse" />
                        Option A: Live Automated Web Form (Recommended)
                    </div>
                    <span className="bg-emerald-500/15 text-emerald-300 text-[8px] font-black px-1.5 py-0.5 rounded border border-emerald-500/30">100% AUTO</span>
                </div>
                
                <p className="text-sm text-text-secondary leading-relaxed">
                    <strong>No Agent Setup Required!</strong> Your sales agents do not need to drag buttons, install scripts, or configure anything on their browsers. 
                    By pasting the unified Web Form URL below into your ViciDial Campaign, the dialer automatically pushes active calls directly to BraveHeart CRM in the background!
                </p>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-[9px] font-black text-text-muted uppercase tracking-wider">
                        <span>Your Campaign Web Form Link</span>
                        <span className="text-emerald-400 font-mono">Pops Leads on Ring</span>
                    </div>
                    <div className="p-2 bg-black/40 border border-border-strong rounded-xl font-mono text-[9px] text-emerald-400 select-all overflow-x-auto truncate">
                        {`${crmUrl}/api/telephony/vicidial-push?phone=--A--phone_number--B--&first_name=--A--first_name--B--&last_name=--A--last_name--B--&address=--A--address1--B--&city=--A--city--B--&state=--A--state--B--&zip=--A--postal_code--B--&email=--A--email--B--&lead_id=--A--lead_id--B--&campaign_id=--A--campaign--B--&agent_user=--A--user--B--`}
                    </div>
                    <button 
                        onClick={() => {
                            const webformUrl = `${crmUrl}/api/telephony/vicidial-push?phone=--A--phone_number--B--&first_name=--A--first_name--B--&last_name=--A--last_name--B--&address=--A--address1--B--&city=--A--city--B--&state=--A--state--B--&zip=--A--postal_code--B--&email=--A--email--B--&lead_id=--A--lead_id--B--&campaign_id=--A--campaign--B--&agent_user=--A--user--B--`;
                            navigator.clipboard.writeText(webformUrl);
                            setToast({
                                title: "Copied Campaign URL! 📋",
                                message: "Paste this into ViciDial Campaign -> Web Form URL to automate all agent pushes fully!",
                                type: "success"
                            });
                            sfx.playSuccess();
                        }}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold active:scale-95 transition-all text-center flex items-center justify-center gap-1 shadow-lg"
                    >
                        <Copy className="w-3" />
                        <span>Copy Campaign Web Form Link</span>
                    </button>
                </div>

                <div className="text-[9px] text-text-muted leading-relaxed p-2 bg-text-primary/5 rounded border border-border-subtle/50 font-mono">
                    <strong className="text-text-primary text-[8px]">🎯 Super Admin Setup:</strong> In your ViciDial admin portal, go to Campaign Settings, set <code className="text-cyan-400">Web Form</code> to the copied link, and set <code className="text-cyan-400">Web Form Target</code> to <code className="text-white">_blank</code> or <code className="text-white">hidden_iframe</code>. Live leads will sync 100% silently!
                </div>
            </div>

            {/* Option B: Bookmarklet (For testing/standalone setup) */}
            <div className="p-4 bg-surface-alt border border-border-subtle rounded-2xl space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm font-black text-text-primary uppercase tracking-wider">
                        <span className="bg-cyan-500/15 text-cyan-400 p-1.5 rounded-xl">⭐</span>
                        Option B: Live Bookmarklet Synchronizer
                    </div>
                    <span className="text-[8px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 font-bold border border-cyan-500/25 rounded-full">AGENT UTILITY</span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                    Does your administration prefer that agents trigger save actions themselves? This bookmarklet allows a sales rep or supervisor to sync lead coordinates with one simple click.
                </p>

                <div className="p-3 bg-surface-main/60 rounded-xl border border-border-subtle space-y-2">
                    <span className="text-[9px] font-black uppercase text-cyan-400 tracking-wider block">⚡ Quick Actions</span>
                    <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
                        <div 
                            dangerouslySetInnerHTML={{
                                __html: `
                                    <a 
                                        href="${bookmarkletScript.replace(/"/g, '&quot;')}"
                                        onclick="event.preventDefault(); window.dispatchBookmarkletAlert?.()"
                                        class="cursor-gather select-none px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-500 hover:brightness-110 border border-cyan-500/30 text-white rounded-xl text-sm font-extrabold inline-flex items-center gap-1.5 shadow-lg active:scale-95 transition-all text-center whitespace-nowrap"
                                        title="Drag me directly to your browser's bookmarks bar!"
                                    >
                                        <span>🟢 ViciDial Live Sync</span>
                                    </a>
                                `
                            }}
                        />
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(bookmarkletScript);
                                setToast({
                                    title: "Copied Script to Clipboard! 📋",
                                    message: "Use Chrome Bookmark setup to paste as the location link.",
                                    type: "success"
                                });
                                sfx.playSuccess();
                            }}
                            className="px-3 py-2 bg-surface-main hover:bg-surface-accent border border-border-strong text-text-primary rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all w-full sm:w-auto justify-center"
                        >
                            <Copy className="w-3" />
                            <span>Copy Script Code</span>
                        </button>
                    </div>
                </div>

                {/* Step-by-Step Interactive Guide */}
                <div className="space-y-3 pt-2 text-sm text-text-secondary">
                    <div className="border-t border-border-subtle pt-3">
                        <span className="text-[9px] font-black uppercase text-text-muted tracking-wider block mb-2">💡 IDIOT-PROOF INSTALLATION GUIDES</span>
                        
                        <div className="space-y-2 bg-surface-main/30 p-3 rounded-xl border border-border-subtle/45">
                            <div className="flex gap-2 items-start">
                                <span className="w-4 h-4 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5">1</span>
                                <div className="space-y-1">
                                    <strong className="text-text-primary">What button do I drag?</strong>
                                    <p className="text-[9px] text-text-muted leading-relaxed">
                                        Drag the green <strong>🟢 ViciDial Live Sync</strong> button above directly onto your browser's Bookmarks Bar (press <kbd className="bg-surface-main px-1 border border-border-strong text-[8px] rounded">Ctrl + Shift + B</kbd> if your bookmarks bar is hidden).
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2 items-start border-t border-border-subtle/30 pt-2">
                                <span className="w-4 h-4 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5">2</span>
                                <div className="space-y-1">
                                    <strong className="text-text-primary">Where do I paste the "Copied Script Code"?</strong>
                                    <p className="text-[9px] text-text-muted leading-relaxed">
                                        If your browser blocks mouse dragging, you can easily install it manually:
                                    </p>
                                    <ul className="list-decimal list-inside text-[9px] pl-1 space-y-1 text-text-muted/90 font-mono">
                                        <li>Press <kbd className="bg-surface-main font-semibold px-1 rounded border">Ctrl + D</kbd> to bookmark this page.</li>
                                        <li>Click <span className="text-text-primary font-bold">More</span> or right-click the bookmark, select <span className="text-text-primary font-bold">Edit</span>.</li>
                                        <li>Change the Name to: <code className="text-cyan-400 bg-black/30 px-1 rounded font-bold">🎯 BraveHeart Sync</code>.</li>
                                        <li>Delete whatever is inside the <span className="text-text-primary">URL / Location</span> box.</li>
                                        <li>Paste (<kbd className="bg-surface-main font-semibold px-1 rounded border">Ctrl + V</kbd>) the copied script directly inside it.</li>
                                        <li>Click <span className="text-text-primary font-bold">Save</span>. It is now installed!</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex gap-2 items-start border-t border-border-subtle/30 pt-2">
                                <span className="w-4 h-4 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5">3</span>
                                <div className="space-y-1">
                                    <strong className="text-text-primary">How do agents use it on ViciDial?</strong>
                                    <p className="text-[9px] text-text-muted leading-relaxed">
                                        When they are on ViciDial working with a customer profile, they just click the new <strong className="text-text-primary">🎯 BraveHeart Sync</strong> bookmark. 
                                        A gorgeous non-blocking floating card pops up in ViciDial, syncing first name, street address, city, state, zip, and phone numbers in 100ms flat!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Simulation Sandbox */}
                    <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-[9px] font-black text-cyan-400 uppercase tracking-widest">
                            <span>🎮 Rep experience Simulator</span>
                            <span className="text-[8px] font-bold text-text-muted bg-surface-main px-1.5 py-0.5 rounded border border-border-subtle">LIVE DEMO</span>
                        </div>
                        <p className="text-[9px] text-text-secondary leading-relaxed">
                            Click the button below to simulate exactly how ViciDial will look and behave inside your agent's browser when they trigger the sync!
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                try {
                                    const simulatedToastBg = 'linear-gradient(135deg, #064e43, #0f766e)';
                                    const simulatedToastBorder = '#2dd4bf';
                                    
                                    const existingToast = document.getElementById('bh-crm-sync-toast');
                                    if (existingToast) { existingToast.remove(); }
                                    
                                    const toast = document.createElement('div');
                                    toast.id = 'bh-crm-sync-toast';
                                    toast.style.cssText = 'position:fixed;top:24px;right:24px;zIndex:99999999;padding:16px 20px;borderRadius:16px;fontFamily:"Inter",system-ui,-apple-system,sans-serif;boxShadow:0 25px 50px -12px rgba(0,0,0,0.5),0 0 15px rgba(56,189,248,0.15);maxWidth:360px;color:#ffffff;background:' + simulatedToastBg + ';border-left:5px solid ' + simulatedToastBorder + ';transition:all 0.5s cubic-bezier(0.16,1,0.3,1);transform:translateY(-30px);opacity:0;display:flex;alignItems:center;gap:14px;fontSize:12px;fontWeight:500;lineHeight:1.45;boxSizing:border-box;pointerEvents:auto;';
                                    toast.innerHTML = '<div style="fontSize:18px;lineHeight:1;flex-shrink:0;">🟢</div><div style="flex:1;"><strong>🟢 Telephony Sync Success!</strong><br/>Lead <strong>Johnny Appleseed</strong> (12065550143) has been synchronized with unified CRM profiles successfully. Address details mapped.</div>';
                                    
                                    document.body.appendChild(toast);
                                    setTimeout(() => {
                                        toast.style.transform = 'translateY(0)';
                                        toast.style.opacity = '1';
                                    }, 50);
                                    
                                    setTimeout(() => {
                                        toast.style.transform = 'translateY(-30px)';
                                        toast.style.opacity = '0';
                                        setTimeout(() => { if (toast && toast.parentNode) toast.parentNode.removeChild(toast); }, 400);
                                    }, 5500);
                                    
                                    toast.onclick = () => { toast.remove(); };
                                    sfx.playSuccess();
                                    setToast({
                                        title: "Simulated Toast Triggered! ⚡",
                                        message: "Look at the top-right corner of your screen to see the agent experience!",
                                        type: "success"
                                    });
                                } catch(err){
                                    console.error("Simulation error:", err);
                                }
                            }}
                            className="w-full py-1.5 bg-gradient-to-r from-emerald-600/20 to-cyan-500/20 hover:brightness-110 border border-emerald-500/30 text-emerald-300 rounded-lg text-[9px] font-bold active:scale-95 transition-all text-center flex items-center justify-center gap-1"
                        >
                            🚀 Simulate Active Sync Toast
                        </button>
                    </div>
                </div>
            </div>

            {/* Raw Clipboard Screen Paste Ingest with Background Sync */}
            <div className="p-3 bg-surface-alt border border-border-subtle rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 text-sm font-bold text-text-primary">
                    <span className="bg-cyan-500/10 text-cyan-400 p-1 rounded-lg">📋</span>
                    Zero-Click Screen Extractor
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                    Instant Background Import: Press <kbd className="bg-surface-main px-1 border rounded text-[9px]">Ctrl+A</kbd> then <kbd className="bg-surface-main px-1 border rounded text-[9px]">Ctrl+C</kbd> on ViciDial, and paste in the box below to auto-save instantly:
                </p>

                <textarea
                    value={pasteText}
                    onPaste={handlePasteAndParseText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder="Click here and paste (Ctrl+V) entire ViciDial text to save instantly in the background..."
                    className="w-full h-20 bg-surface-main border border-border-strong rounded-xl p-2 text-sm font-semibold text-text-primary outline-none focus:border-cyan-500 transition-colors resize-none placeholder:text-text-muted/65"
                />
            </div>
        </div>
    );
};
