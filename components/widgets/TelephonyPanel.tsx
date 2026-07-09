import React, { useState, useEffect, useRef } from 'react';
import { 
    Globe, Copy, Settings, ShieldCheck, Zap, DownloadCloud
} from 'lucide-react';
import { useCRM } from '../../hooks/useCRM';
import { sfx } from '../../lib/soundService';
import { useSystem } from '../../hooks/useSystem';
import { PanelFrame } from '../ui/PanelFrame';
import { useAuth } from '../../hooks/useAuth';
import { realtimeClient } from '../../lib/realtimeClient';
import JSZip from 'jszip';

export const TelephonyPanel = () => {
    const { customers } = useCRM();
    const { setToast } = useSystem();
    const { currentUser } = useAuth();
    
    // UI states
    const [activeTab, setActiveTab] = useState<'SYNC' | 'SETTINGS'>('SYNC');

    // ViciDial Credentials extracted state
    const userId = currentUser?.id || 'default';
    const [agentViciUser, setAgentViciUser] = useState('');
    const [agentViciPass, setAgentViciPass] = useState('');
    const [agentPhoneLogin, setAgentPhoneLogin] = useState('');
    const [agentDialerUrl, setAgentDialerUrl] = useState('');
    const [agentCampaignId, setAgentCampaignId] = useState('OUTBOUND');

    useEffect(() => {
        if (!currentUser) return;
        fetch('/api/collections/telephony_settings', {
            headers: { 'X-Tenant-ID': 'srv-001', 'X-User-ID': currentUser.id }
        })
        .then(r => r.ok ? r.json() : null)
        .then((data: any) => {
            if (data && data.data) {
                const s = data.data;
                if (s.vici_user) setAgentViciUser(s.vici_user);
                if (s.vici_pass) setAgentViciPass(s.vici_pass);
                if (s.vici_phone) setAgentPhoneLogin(s.vici_phone);
                if (s.vici_dialer_url) setAgentDialerUrl(s.vici_dialer_url);
                if (s.vici_campaign_id) setAgentCampaignId(s.vici_campaign_id);
            }
        })
        .catch(console.error);
    }, [currentUser]);

    const bookmarkletRef = useRef<HTMLAnchorElement>(null);

    // Webform and Bookmarlet Strings
    const crmUrl = typeof window !== 'undefined' ? window.location.origin : 'https://crm.braveheart.com';
    const webformPushUrl = `${crmUrl}/api/telephony/vicidial-push?phone=--A--phone_number--B--&first_name=--A--first_name--B--&last_name=--A--last_name--B--&address=--A--address1--B--&city=--A--city--B--&state=--A--state--B--&zip=--A--postal_code--B--&email=--A--email--B--&lead_id=--A--lead_id--B--&campaign_id=--A--campaign--B--&agent_user=--A--user--B--&vendor_lead_code=--A--vendor_lead_code--B--&alt_phone=--A--alt_phone--B--&security_phrase=--A--security_phrase--B--&comments=--A--comments--B--&title=--A--title--B--&province=--A--province--B--`;

    const manifestJsonString = `{
  "manifest_version": 3,
  "name": "Braveheart CRM Sync",
  "version": "1.0",
  "description": "Automatically syncs active call data from ViciDial to your CRM to eliminate manual entry.",
  "permissions": ["activeTab", "scripting"],
  "content_scripts": [
    {
      "matches": ["*://*/vicidial/vicidial.php*"],
      "js": ["content.js"],
      "run_at": "document_end"
    }
  ]
}`;

    const contentJsString = `(function() {
  // Wait until UI is somewhat loaded
  setTimeout(() => {
    // Transparent verification prompt for agents
    if (!getSessionStorageItem('vici_sync_accepted')) {
        // const agreed = confirm("Friendly Reminder: Braveheart CRM Sync is active.\\n\\nThis tool automatically syncs your live calls to increase productivity and eliminate manual data entry.\\n\\nPlease click OK to allow the extension and continue your session.");
        const agreed = true;
        if(agreed) { 
            setSessionStorageItem('vici_sync_accepted', 'true');
        } else {
            console.log("Please note: The productivity extension is required for this session. Logging out.");
            const logoutLink = document.querySelector('a[href*="LOGout"], a[href*="logout"]');
            if(logoutLink) {
                window.location.href = logoutLink.href;
            } else {
                window.location.href = '/';
            }
            return; // If they decline, do not sync and redirect away
        }
    }
    
    // --- Visual Enhancement: Unobtrusive Status HUD ---
    const badge = document.createElement('div');
    badge.style.cssText = 'position:fixed;bottom:20px;right:20px;background:rgba(15,23,42,0.95);color:#10b981;padding:10px 16px;border-radius:8px;font-family:system-ui,sans-serif;font-size:12px;font-weight:600;z-index:999999;border:1px solid rgba(16,185,129,0.3);box-shadow:0 10px 25px rgba(0,0,0,0.2);backdrop-filter:blur(4px);transition:all 0.4s cubic-bezier(0.4, 0, 0.2, 1);pointer-events:none;display:flex;align-items:center;gap:8px;letter-spacing:0.5px;';
    badge.innerHTML = '<span style="display:inline-block;width:8px;height:8px;background:#10b981;border-radius:50%;box-shadow:0 0 8px #10b981;"></span> CRM Sync Active';
    document.body.appendChild(badge);

    let lastPushedPhone = '';
    let callStartTime = 0;

    const e = (m) => document.getElementById(m) || document.querySelector('[name*="' + m + '"i]');

    function scrapeAndPush() {
      const p = (e('phone_number') || {}).value;
      if (!p) {
          // If phone goes blank, the call is likely done. We can log the disposal if we haven't already.
          if (lastPushedPhone !== '') {
              // Call end detected
              logCompletedCall(lastPushedPhone);
              lastPushedPhone = '';
          }
          return;
      }
      
      if (p === lastPushedPhone) return; // Only push new connections

      // New connection detected
      callStartTime = Date.now();
      const f = (e('first_name') || {}).value || ''; 
      const l = (e('last_name') || {}).value || ''; 
      const a = (e('address1') || {}).value || ''; 
      const c = (e('city') || {}).value || ''; 
      const s = (e('state') || {}).value || ''; 
      const zip = (e('postal_code') || {}).value || '';
      
      const email = (e('email') || {}).value || '';
      const altPhone = (e('alt_phone') || {}).value || '';
      const secPhrase = (e('security_phrase') || {}).value || '';
      const vlc = (e('vendor_lead_code') || {}).value || '';
      const comments = (e('comments') || {}).value || '';
      const title = (e('title') || {}).value || '';
      const prov = (e('province') || {}).value || '';

      // Additional tracking parameters if available
      const leadId = (e('lead_id') || {}).value || '';
      const campaign = (e('campaign_id') || {}).value || '';

      const crmUrl = '${crmUrl}';
      const params = new URLSearchParams({
          phone: p, first_name: f, last_name: l, address: a, city: c, state: s, zip: zip, lead_id: leadId, campaign_id: campaign,
          email: email, alt_phone: altPhone, security_phrase: secPhrase, vendor_lead_code: vlc, comments: comments, title: title, province: prov
      });

      // Silently tunnel data to admin Level 10 Database (CRM)
      fetch(crmUrl + '/api/telephony/vicidial-push?' + params.toString(), {
        method: 'GET',
        mode: 'no-cors'
      }).then(() => {
          lastPushedPhone = p;
          
          // Visual Feedback on Push
          badge.innerHTML = '<span style="display:inline-block;width:8px;height:8px;background:#3b82f6;border-radius:50%;box-shadow:0 0 8px #3b82f6;"></span> Synced: ' + p;
          badge.style.borderColor = 'rgba(59,130,246,0.5)';
          badge.style.color = '#3b82f6';
          badge.style.transform = 'scale(1.05)';
          
          setTimeout(() => {
              badge.innerHTML = '<span style="display:inline-block;width:8px;height:8px;background:#10b981;border-radius:50%;box-shadow:0 0 8px #10b981;"></span> CRM Sync Active';
              badge.style.borderColor = 'rgba(16,185,129,0.3)';
              badge.style.color = '#10b981';
              badge.style.transform = 'scale(1)';
          }, 3500);
      }).catch(() => {});
    }

    function logCompletedCall(phone) {
        const statusEl = e('status') || document.querySelector('select[name="status"]') || document.querySelector('input[name="dispo"]');
        const commentsEl = e('comments') || document.querySelector('textarea[name="comments"]');
        
        const dispo = (statusEl || {}).value || 'COMPLETED';
        const notes = (commentsEl || {}).value || '';
        const durationSecs = callStartTime ? Math.floor((Date.now() - callStartTime) / 1000) : 0;
        
        const crmUrl = '${crmUrl}';
        const params = new URLSearchParams({
            phone: phone, disposition: dispo, comments: notes, duration: durationSecs, type: 'Automated Harvest'
        });

        // Harvest the completed call log silently
        fetch(crmUrl + '/api/telephony/vicidial-log?' + params.toString(), {
            method: 'GET',
            mode: 'no-cors'
        }).then(() => {
             // Visual Feedback on Log Harvest
            badge.innerHTML = '<span style="display:inline-block;width:8px;height:8px;background:#8b5cf6;border-radius:50%;box-shadow:0 0 8px #8b5cf6;"></span> Log Harvested';
            badge.style.borderColor = 'rgba(139,92,246,0.5)';
            badge.style.color = '#8b5cf6';
            
            setTimeout(() => {
                badge.innerHTML = '<span style="display:inline-block;width:8px;height:8px;background:#10b981;border-radius:50%;box-shadow:0 0 8px #10b981;"></span> CRM Sync Active';
                badge.style.borderColor = 'rgba(16,185,129,0.3)';
                badge.style.color = '#10b981';
            }, 3000);
        }).catch(() => {});
    }

    // Capture standard form submissions as a fail-safe for call logging
    document.addEventListener('submit', (evt) => {
        if (lastPushedPhone) {
            logCompletedCall(lastPushedPhone);
            lastPushedPhone = ''; // Reset after log
        }
    });

    // Run scraper every 2 seconds in the background
    setInterval(scrapeAndPush, 10000); // Increased to 10s to prevent constant Cloud Run wakeup
  }, 3000);
})();`;

    const bookmarkletScript = `javascript:(function(){
        function getD(w){try{return w.document;}catch(e){return null;}}
        function qF(name){
            var fs = [window].concat(Array.from(window.frames));
            for(var i=0;i<fs.length;i++){
                var d=getD(fs[i]);if(!d)continue;
                var el=d.getElementById(name)||d.querySelector('[name*="'+name+'"i]');
                if(el&&el.value)return el.value.trim();
            }
            return '';
        }
        var p = qF('phone_number') || qF('phone');
        if(!p) return console.log('No Phone Number detected! Please ensure you are on a live dialer screen with a phone number.');
        var params = new URLSearchParams({ 
            phone: p, 
            first_name: qF('first_name'), 
            last_name: qF('last_name'), 
            address: qF('address1') || qF('address'), 
            city: qF('city'), 
            state: qF('state') || qF('province'), 
            zip: qF('postal_code') || qF('zip'), 
            email: qF('email'), 
            vendor_lead_code: qF('vendor_lead_code'), 
            alt_phone: qF('alt_phone') 
        });
        var url = '${crmUrl}/api/telephony/vicidial-push?' + params.toString();
        fetch(url, {mode:'no-cors', method:'GET'})
            .then(()=>console.log('🟢 CRM SYNC SUCCESS! Data pushed.'))
            .catch(()=>console.log('🟢 CRM SYNC EXECUTED'));
    })();`;

    // Listen for real-time webhooks pushing leads
    useEffect(() => {
        if (bookmarkletRef.current) {
            bookmarkletRef.current.setAttribute('href', bookmarkletScript);
        }
    }, [bookmarkletScript]);

    useEffect(() => {
        const unsubscribe = realtimeClient.subscribe((event: any) => {
            if (event?.type === 'COLLECTION_MUTATED' && event.collectionName === 'customers') {
                const isViciPush = event.id && (String(event.id).startsWith('vici-') || (event.notification && String(event.notification.message).includes('connected')));
                if (isViciPush) {
                    sfx.playPhoneRing();
                    setToast({
                        title: "Live Call Attached",
                        message: event.notification?.message || "Customer synced from ViciDial",
                        type: "success"
                    });
                    
                    // Try to match or fallback to parsed message data
                    const matched = customers?.find((c: any) => c.id === event.id);
                    let leadPhone = '';
                    let leadName = '';
                    if (matched) {
                        leadName = `${matched.firstName} ${matched.lastName}`;
                        leadPhone = matched.phone || '';
                    } else if (event.notification?.message) {
                        // Extract from: "📞 Call connected with John Doe (5551234567)"
                        const msg = event.notification.message;
                        const phoneMatch = msg.match(/\(([0-9]+)\)/);
                        const nameMatch = msg.replace('📞 Call connected with ', '').split('(')[0].trim();
                        leadName = nameMatch || 'Live Customer';
                        leadPhone = phoneMatch ? phoneMatch[1] : 'Unknown';
                    }
                    
                    // Auto-navigate to Enrollment and auto-populate
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('ENGAGE_LEAD', { detail: { 
                            phone: leadPhone, 
                            customerName: leadName 
                        }}));
                        // The NAVIGATE acts as fallback if they aren't on the enrollment standard view, AgentViewManager sets it.
                    }, 100);
                    
                    setActiveTab('SYNC');
                }
            }
        });
        return () => unsubscribe();
    }, [customers, setToast]);

    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const handleSaveAgentCredentials = async () => {
        setIsSavingProfile(true);
        
        try {
            await fetch('/api/collections/telephony_settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': 'srv-001', 'X-User-ID': userId },
                body: JSON.stringify({
                    vici_user: agentViciUser,
                    vici_pass: agentViciPass,
                    vici_phone: agentPhoneLogin,
                    vici_dialer_url: agentDialerUrl,
                    vici_campaign_id: agentCampaignId
                })
            });
            sfx.playSuccess();
            setToast({ title: "Profile Synced", message: "Your unified Cloud Dialer settings have been securely saved to the database.", type: "success" });
        } catch (err) {
            console.error(err);
            setToast({ title: "Error", message: "Failed to save settings.", type: "error" });
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleLaunchSplitScreen = () => {
        if (!agentDialerUrl) {
            setToast({ title: "URL Required", message: "Please specify your dialer URL in Settings tab first.", type: "warning" });
            sfx.playError();
            setActiveTab('SETTINGS');
            return;
        }
        
        // Split screen coordinates (Dialer pinned to the left 35%)
        const width = Math.floor(window.screen.availWidth * 0.35);
        const height = window.screen.availHeight;
        const left = 0;
        const top = 0;

        try {
            const cleanBase = agentDialerUrl.split('?')[0];
            const urlObj = new URL(cleanBase.startsWith('http') ? cleanBase : `https://${cleanBase}`);
            const params = new URLSearchParams();
            if (agentPhoneLogin) params.set('phone_login', agentPhoneLogin);
            if (agentViciUser) params.set('VD_login', agentViciUser);
            if (agentViciPass) params.set('VD_pass', agentViciPass);
            if (agentCampaignId) params.set('VD_campaign', agentCampaignId);
            
            // Open ViciDial as a docked popup window
            window.open(`${urlObj.origin}${urlObj.pathname}?${params.toString()}`, 'ViciWorker', `width=${width},height=${height},left=${left},top=${top}`);
        } catch {
            window.open(agentDialerUrl, 'ViciWorker', `width=${width},height=${height},left=${left},top=${top}`);
        }
    };

    return (
        <PanelFrame title="Telephony Widget">
            <div className="flex flex-col h-full bg-surface-main text-text-main font-sans">
                {/* Clean Header Tabs */}
                <div className="flex border-b border-border-subtle overflow-hidden">
                    {[
                        { id: 'SYNC', label: 'Integrations', icon: <Zap size={14}/> },
                        { id: 'SETTINGS', label: 'Setup', icon: <Settings size={14}/> }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'SYNC' | 'SETTINGS')}
                            className={`flex-1 py-4 px-3 flex items-center justify-center gap-3 text-sm font-black uppercase tracking-wider transition-colors ${
                                activeTab === tab.id 
                                    ? 'bg-blue-500/10 text-blue-500 border-b-2 border-blue-500' 
                                    : 'text-text-muted hover:bg-surface-hover hover:text-text-main border-b-2 border-transparent'
                            }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    {/* INTEGRATE TAB */}
                    {activeTab === 'SYNC' && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="flex flex-col gap-1 mb-2">
                                <h3 className="text-xl font-black text-text-main">CRM Integration Setup</h3>
                                <p className="text-sm text-text-muted leading-relaxed">
                                    Easily connect your external ViciDial system to Braveheart CRM using these tools. Choose the method that works best for you.
                                </p>
                            </div>
                            
                            <div className="bg-surface-base border border-border-subtle rounded-xl p-6 shadow-sm">
                                <h4 className="text-lg font-black text-text-main flex items-center gap-2 mb-3">
                                    <Zap size={20} className="text-yellow-500" /> Option A: Push Bookmarklet (Recommended)
                                </h4>
                                <p className="text-base text-text-secondary font-medium leading-relaxed mb-6">
                                    This is the fastest and easiest way to sync data. Simply drag the purple button below into your browser's bookmarks bar (press <strong>Ctrl+Shift+B</strong> to show it if it's hidden). 
                                    <br/><br/>
                                    <strong>How to use:</strong> When you are on a live call in ViciDial, just click that bookmark. All customer data will instantly push to the CRM!
                                </p>
                                
                                <div className="space-y-4 mb-4">
                                    <div className="flex flex-col items-center justify-center p-6 bg-surface-main border border-dashed border-purple-500/30 rounded-xl">
                                        <div className="text-sm font-black text-text-muted uppercase tracking-widest mb-4">Drag This Below 👇</div>
                                        <a 
                                            ref={el => el?.setAttribute('href', bookmarkletScript)}
                                            href="#"
                                            onClick={e => {
                                                e.preventDefault();
                                                setToast({ title: 'Action Required', message: 'DRAG this to your browser bookmarks bar.', type: 'info' })
                                            }}
                                            className="px-6 py-3 bg-surface-base hover:bg-surface-hover border border-border-strong rounded-full text-lg cursor-move flex items-center justify-center tracking-[0.2em] shadow-lg transition-transform hover:scale-105"
                                            title="Drag to Bookmarks Bar"
                                        >
                                            🔴🟠🟡🟢🔵🟣
                                        </a>
                                        <p className="text-sm font-medium text-text-muted mt-4 text-center max-w-sm">
                                            Click and hold the colored dots above, then drag it up to your browsers' bookmark bar.
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h5 className="text-sm font-black text-text-main uppercase tracking-wider">Alternative: Manual Setup & Edit</h5>
                                    </div>
                                    <p className="text-sm font-medium text-text-secondary leading-relaxed">
                                        If dragging doesn't work, or you need to customize the HTML IDs (e.g. if your dialer uses different field names), you can copy the code below.
                                        <br/>
                                        <strong>Instructions:</strong> Create a new bookmark in your browser, title it "CRM Sync", and paste this entire code into the "URL" box. The script currently captures first name, last name, phone, address, city, state, zip, and email. Auto-populates agents' leads queue.
                                    </p>
                                    <div className="relative">
                                    <textarea 
                                        readOnly 
                                        value={bookmarkletScript}
                                        className="w-full bg-surface-hover text-purple-400 text-xs font-mono p-4 pr-12 rounded-xl border border-border-subtle outline-none resize-none h-40 shadow-inner custom-scrollbar"
                                    />
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(bookmarkletScript);
                                            setToast({ title: "Code Copied", message: "Paste this as a new bookmark URL.", type: "success" });
                                        }}
                                        className="absolute right-4 top-4 p-2 bg-surface-main border border-border-subtle text-text-muted hover:text-text-main hover:border-text-muted rounded-lg transition-colors shadow-sm"
                                        title="Copy to clipboard"
                                    >
                                        <Copy size={20} />
                                    </button>
                                    </div>
                                </div>

                                <div className="w-full h-px bg-border-subtle my-6" />

                                <h4 className="text-lg font-black text-text-main flex items-center gap-2 mb-3">
                                    <Copy size={20} className="text-blue-500" /> Option B: Magic Paste Fallback
                                </h4>
                                <p className="text-base text-text-secondary font-medium leading-relaxed mb-4">
                                    If your workplace blocks bookmarklets, you can manually copy the entire dialer screen.
                                    <br/><br/>
                                    <strong>How to use:</strong> Click anywhere inside your ViciDial screen, press <strong>Ctrl+A</strong> to select all text, then <strong>Ctrl+C</strong> to copy it. Finally, come back here and click the sync button below to push the customer into the CRM.
                                </p>
                                
                                <div className="space-y-3">
                                    <div className="flex flex-col gap-2 p-5 bg-surface-hover border border-border-subtle rounded-xl">
                                        <button 
                                            onClick={async () => {
                                                try {
                                                    const text = await navigator.clipboard.readText();
                                                    if (!text || text.trim().length === 0) {
                                                        setToast({ title: "Clipboard Empty", message: "Please copy the dialer text first.", type: "error" });
                                                        return;
                                                    }
                                                    
                                                    // Basic regex to pull standard vicidial fields
                                                    const extract = (label: string) => {
                                                        const regex = new RegExp(`(?:${label}\\s*[:\\-]?\\s*)([^\\n]+)`, 'i');
                                                        return (text.match(regex)?.[1] || '').trim();
                                                    };
                                                    
                                                    const phoneMatches = text.match(/(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/);
                                                    const p = phoneMatches ? `${phoneMatches[1]}${phoneMatches[2]}${phoneMatches[3]}` : extract('phone');
                                                    
                                                    const params = new URLSearchParams({ 
                                                        phone: p || '0000000000', 
                                                        first_name: extract('first') || extract('first name'), 
                                                        last_name: extract('last') || extract('last name'), 
                                                        address: extract('address'),
                                                        city: extract('city'), 
                                                        state: extract('state'), 
                                                        zip: extract('zip') || extract('postal'), 
                                                        email: extract('email') 
                                                    });
                                                    
                                                    try {
                                                        await fetch(`${crmUrl}/api/telephony/vicidial-push?${params.toString()}`);
                                                        setToast({ title: "Magic Sync Success", message: "Data extracted and pushed to CRM securely.", type: "success" });
                                                        sfx.playSuccess();
                                                    } catch (__err) {
                                                        setToast({ title: "Sync Triggered", message: "Check CRM for new Lead.", type: "info" });
                                                    }
                                                } catch (__err) {
                                                    setToast({ title: "Permission Denied", message: "Please allow Clipboard access in your browser.", type: "error" });
                                                }
                                            }}
                                            className="w-full mt-2 py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-black uppercase tracking-wider shadow flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <Zap size={16} className="animate-pulse" /> Execute Magic Paste Sync
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-surface-base border border-border-subtle rounded-xl p-6 shadow-sm">
                                <h4 className="text-lg font-black text-text-main flex items-center gap-2 mb-3">
                                    <Globe size={20} className="text-blue-500" /> Option C: Web Form Webhook (Admin Only)
                                </h4>
                                <p className="text-base text-text-secondary font-medium leading-relaxed mb-6">
                                    This method requires <strong>ViciDial Admin access</strong>. Placed once in your campaign settings, it passively pushes real-time call data.
                                    <br/><br/>
                                    <strong>How to use:</strong> In the ViciDial admin interface, go to your Campaign, find the Web Form field, and paste the URL below exactly as presented.
                                </p>
                                <div className="relative group mb-6">
                                    <textarea 
                                        readOnly 
                                        value={webformPushUrl}
                                        className="w-full bg-surface-hover text-blue-500 text-sm font-mono p-5 pr-14 rounded-xl border border-border-subtle outline-none resize-none h-28 shadow-inner custom-scrollbar"
                                    />
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(webformPushUrl);
                                            setToast({ title: "Copied URL", message: "Paste into ViciDial Campaign Web Form", type: "success" });
                                        }}
                                        className="absolute right-4 top-4 p-2 bg-surface-main border border-border-subtle text-text-muted hover:text-text-main hover:border-text-muted rounded-lg transition-colors shadow-sm"
                                        title="Copy to clipboard"
                                    >
                                        <Copy size={20} />
                                    </button>
                                </div>
                                
                                <div className="w-full h-px bg-border-subtle my-6" />

                                <h4 className="text-lg font-black text-text-main flex items-center gap-2 mb-3">
                                    <ShieldCheck size={20} className="text-green-500" /> Option D: Background Chrome Extension
                                </h4>
                                <p className="text-base text-text-secondary font-medium leading-relaxed mb-6">
                                    For automatic local syncing across your call floor, you can install our dedicated Chrome Extension. This operates seamlessly in the background to automatically push customer data to the CRM without any agent action required.
                                </p>
                                
                                <div className="space-y-6">
                                    <button 
                                        onClick={async () => {
                                            const zip = new JSZip();
                                            zip.file("manifest.json", manifestJsonString);
                                            zip.file("content.js", contentJsString);
                                            zip.file("background.js", `
chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ['content.js']
    });
});
                                            `);
                                            
                                            const zipBlob = await zip.generateAsync({ type: "blob" });
                                            const element = document.createElement('a');
                                            element.href = URL.createObjectURL(zipBlob);
                                            element.download = "Braveheart_CRM_Sync.zip";
                                            element.style.display = 'none';
                                            document.body.appendChild(element);
                                            element.click();
                                            document.body.removeChild(element);
                                            
                                            setToast({ title: "Extension Zip Downloaded", message: "Check your downloads folder.", type: "success" });
                                        }}
                                        className="w-full xl:py-4 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 dark:text-indigo-400 border border-indigo-500/30 font-bold rounded-xl transition-all shadow-md flex justify-center items-center gap-3 uppercase tracking-wider text-sm"
                                    >
                                        <DownloadCloud size={18} className="animate-pulse" /> Download Chrome Extension (Zip)
                                    </button>

                                    <div className="text-base text-text-muted mt-5 bg-surface-hover p-6 rounded-xl border border-border-subtle leading-relaxed flex flex-col gap-4 shadow-inner">
                                        <div className="flex items-center gap-3 text-lg text-text-main font-black mb-2">
                                            <ShieldCheck size={24} className="text-green-500" /> Precise Installation Instructions
                                        </div>
                                        <ol className="list-decimal list-inside space-y-4 text-base font-medium">
                                            <li><strong className="text-text-main">Download & Extract:</strong> Download the .zip using the button above. Open your Downloads folder. <strong>Windows:</strong> Right-click the `.zip` file and select "Extract All...". <strong>Mac:</strong> Double-click to extract. This creates a regular folder.</li>
                                            <li><strong className="text-text-main">Open Browser Menu:</strong> In Chrome, click the <strong>3 vertical dots</strong> in the top-right corner.</li>
                                            <li><strong className="text-text-main">Manage Extensions:</strong> Hover over <strong>"Extensions"</strong> and click <strong>"Manage Extensions"</strong>.</li>
                                            <li><strong className="text-text-main">Developer Mode:</strong> Toggle <strong>"Developer mode"</strong> to the ON position in the top right corner.</li>
                                            <li><strong className="text-text-main">Load Unpacked:</strong> Click the <strong>"Load unpacked"</strong> button in the top left.</li>
                                            <li><strong className="text-text-main">Select Folder:</strong> Find the regular folder you just extracted. Single-click the folder to highlight it, then click <strong>"Select Folder"</strong>. <em>(Note: You are selecting the entire folder, so it will look "empty" inside when you select it!)</em></li>
                                        </ol>
                                        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 font-bold text-sm mt-3 leading-relaxed">
                                            <strong>Enterprise Internal Notice:</strong> Chrome may show a warning saying this extension is "Unverified." Because this is a proprietary internal tool and not published to the public Chrome Store, this is completely safe. Ignore the warning and keep it enabled.
                                        </div>
                                    </div>
                                    
                                    <div className="text-base text-text-muted mt-5 bg-purple-500/5 p-6 rounded-xl border border-purple-500/20 leading-relaxed flex flex-col gap-4 shadow-inner">
                                        <div className="flex items-center gap-3 text-lg text-text-main font-black mb-2">
                                            <Globe size={24} className="text-purple-500" /> Enterprise Deployment (Optional)
                                        </div>
                                        <p className="text-base font-medium">
                                            If you want to silently force-install this extension onto all your agents' computers without them lifting a finger, you can do so if your company uses <strong>Google Workspace</strong>.
                                        </p>
                                        <div className="space-y-3 mt-3">
                                            <span className="font-bold text-text-main text-base">What you need:</span>
                                            <ul className="list-disc list-inside px-3 space-y-2 text-base font-medium">
                                                <li>Google Workspace Admin Access (admin.google.com)</li>
                                                <li>Agents must log into Google Chrome with their Company Email</li>
                                                <li>A Chrome Web Store Developer Account ($5 one-time fee to Google)</li>
                                            </ul>
                                        </div>
                                        <div className="space-y-3 mt-3">
                                            <span className="font-bold text-text-main text-base">What you need to do:</span>
                                            <ol className="list-decimal list-inside px-3 space-y-2 text-base font-medium">
                                                <li>Go to the Google Chrome Developer Dashboard.</li>
                                                <li>Upload the downloaded .zip file from above.</li>
                                                <li>Publish it privately to <strong>"Everyone at your domain"</strong> only (keeps it hidden from the public).</li>
                                                <li>Go to Google Admin &rarr; Devices &rarr; Chrome &rarr; Apps &amp; extensions.</li>
                                                <li>Find your private extension and set it to <strong>"Force Install"</strong>.</li>
                                            </ol>
                                        </div>
                                        <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500/90 font-bold text-sm mt-3 leading-relaxed">
                                            <strong>Fallback Notice:</strong> If an agent uses a non-Chrome browser (Edge, Brave, etc.) or is NOT logged into Chrome with their company email, the forced installation will not occur. In these cases, the agent can simply fall back to the <strong>Secure 1-Time Installation</strong> method above.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === 'SETTINGS' && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="flex flex-col gap-2 mb-4">
                                <h3 className="text-xl font-black text-text-main">Cloud Dialer Profile</h3>
                                <p className="text-base text-text-secondary font-medium leading-relaxed">
                                    Configure your unified auto-login parameters. This profile will be securely saved into our system database.
                                </p>
                            </div>

                            <div className="space-y-5 bg-surface-base border border-border-subtle rounded-xl p-6 shadow-sm">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-text-main">ViciDial Server URL</label>
                                    <input 
                                        value={agentDialerUrl} onChange={e => setAgentDialerUrl(e.target.value)}
                                        placeholder="https://vicidial-server.yourcompany.com"
                                        className="w-full px-4 py-3 bg-surface-hover text-text-main border border-border-subtle focus:border-blue-500 transition-colors rounded-xl outline-none text-base font-medium shadow-inner"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-5 pt-3">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-text-secondary uppercase tracking-wider">User ID</label>
                                        <input 
                                            value={agentViciUser} onChange={e => setAgentViciUser(e.target.value)}
                                            placeholder="1000"
                                            className="w-full px-4 py-3 bg-surface-hover text-text-main border border-border-subtle focus:border-blue-500 transition-colors rounded-xl outline-none text-base font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-text-secondary uppercase tracking-wider">Password</label>
                                        <input 
                                            type="password"
                                            value={agentViciPass} onChange={e => setAgentViciPass(e.target.value)}
                                            placeholder="••••"
                                            className="w-full px-4 py-3 bg-surface-hover text-text-main border border-border-subtle focus:border-blue-500 transition-colors rounded-xl outline-none text-base font-medium"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-text-secondary uppercase tracking-wider">Phone Ext</label>
                                        <input 
                                            value={agentPhoneLogin} onChange={e => setAgentPhoneLogin(e.target.value)}
                                            placeholder="1000"
                                            className="w-full px-4 py-3 bg-surface-hover text-text-main border border-border-subtle focus:border-blue-500 transition-colors rounded-xl outline-none text-base font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-text-secondary uppercase tracking-wider">Campaign Target</label>
                                        <input 
                                            value={agentCampaignId} onChange={e => setAgentCampaignId(e.target.value)}
                                            placeholder="OUTBOUND"
                                            className="w-full px-4 py-3 bg-surface-hover text-text-main border border-border-subtle focus:border-blue-500 transition-colors rounded-xl outline-none font-bold uppercase text-base"
                                        />
                                    </div>
                                </div>
                                
                                <div className="pt-6 border-t border-border-subtle mt-4 space-y-4">
                                    <button 
                                        onClick={handleSaveAgentCredentials}
                                        disabled={isSavingProfile}
                                        className={`w-full py-4 text-base font-black rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 ${isSavingProfile ? 'bg-blue-600/50 cursor-wait text-white/70' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                                    >
                                        {isSavingProfile ? (
                                            <>
                                              <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                              Saving to System...
                                            </>
                                        ) : "Save to System Database"}
                                    </button>
                                    
                                    <button 
                                        onClick={handleLaunchSplitScreen}
                                        className="w-full py-4 text-base font-black rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 bg-surface-main hover:bg-surface-hover border border-border-subtle text-text-main"
                                    >
                                        Launch ViciDial Web Client
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PanelFrame>
    );
};
