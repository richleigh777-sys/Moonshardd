import React, { useState, useEffect, useRef } from 'react';
import { 
    Mic, MicOff, PhoneOff, Grid, User, Globe, AlertCircle, Radio, Clock, 
    Copy, ExternalLink, RefreshCw, Check, PhoneCall, Terminal, Settings, Shield
} from 'lucide-react';
import { useCRM } from '../../hooks/useCRM';
import { sfx } from '../../lib/soundService';
import { useSystem } from '../../hooks/useSystem';
import { PanelFrame } from '../ui/PanelFrame';
import { DialPad } from './telephony/DialPad';
import { CallVisualizer } from './telephony/CallVisualizer';
import { useAuth } from '../../hooks/useAuth';

// Helper to resolve custom dialer URLs
const resolveDialerUrl = (template: string, phone: string, customer?: any, agent?: any) => {
    const cleanPhone = phone.replace(/\D/g, '');
    let resolved = template || 'https://dialer.yourcompany.com/?phone={phone_clean}';
    resolved = resolved.replace(/{phone}/g, encodeURIComponent(phone));
    resolved = resolved.replace(/{phone_clean}/g, encodeURIComponent(cleanPhone));
    resolved = resolved.replace(/{firstName}/g, encodeURIComponent(customer?.firstName || ''));
    resolved = resolved.replace(/{lastName}/g, encodeURIComponent(customer?.lastName || ''));
    resolved = resolved.replace(/{id}/g, encodeURIComponent(customer?.id || 'MANUAL'));
    resolved = resolved.replace(/{agent_username}/g, encodeURIComponent(agent?.username || agent?.email || 'AGENT'));
    return resolved;
};

export const TelephonyPanel = () => {
    const { systemConfig, customers } = useCRM();
    const { setToast, callTarget } = useSystem();
    const { currentUser } = useAuth();
    
    // States for ViciDial
    const [status, setStatus] = useState<'DISCONNECTED' | 'IDLE' | 'INCALL' | 'PAUSED' | 'WRAPPING'>('DISCONNECTED');
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [showKeypad, setShowKeypad] = useState(false);
    const [dialBuffer, setDialBuffer] = useState('');
    const [duration, setDuration] = useState(0);
    const [callInfo, setCallInfo] = useState<{ number: string, leadId: string, region: string } | null>(null);
    
    // States for Custom Dialer
    const [recentDials, setRecentDials] = useState<string[]>(() => {
        try {
            const stored = localStorage.getItem('bh_recent_dials');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });
    const [activeCustomPhone, setActiveCustomPhone] = useState<string>('');
    const [activeCustomUrl, setActiveCustomUrl] = useState<string>('');
    const [iframeRefreshKey, setIframeRefreshKey] = useState(0);
    
    // Active UI view tab
    const [activeTab, setActiveTab] = useState<'CONTROLLER' | 'SYNC_HUB' | 'AGENT_LOGIN'>('SYNC_HUB');
    const [pasteText, setPasteText] = useState('');
    
    // Agent-specific ViciDial login integration states saved in secure localStorage
    const [agentViciUser, setAgentViciUser] = useState(() => localStorage.getItem(`bh_vici_user_${currentUser?.id || 'default'}`) || '');
    const [agentViciPass, setAgentViciPass] = useState(() => localStorage.getItem(`bh_vici_pass_${currentUser?.id || 'default'}`) || '');
    const [agentPhoneLogin, setAgentPhoneLogin] = useState(() => localStorage.getItem(`bh_vici_phone_${currentUser?.id || 'default'}`) || '');
    const [agentPhonePass, setAgentPhonePass] = useState(() => localStorage.getItem(`bh_vici_phone_pass_${currentUser?.id || 'default'}`) || '');
    const [agentDialerUrl, setAgentDialerUrl] = useState(() => localStorage.getItem(`bh_vici_dialer_url_${currentUser?.id || 'default'}`) || '');
    const [agentCampaignId, setAgentCampaignId] = useState(() => localStorage.getItem(`bh_vici_campaign_id_${currentUser?.id || 'default'}`) || '');
    
    const timerRef = useRef<any>(null);

    // Auto extraction helper on URL paste or change
    const handleUrlPasteOrParse = (rawInput: string) => {
        const urlStr = rawInput.trim();
        if (!urlStr) return;

        if (urlStr.includes('?') || urlStr.includes('&')) {
            try {
                let parsedUrl: URL;
                if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
                    parsedUrl = new URL('https://' + urlStr);
                } else {
                    parsedUrl = new URL(urlStr);
                }
                
                const params = new URLSearchParams(parsedUrl.search);
                const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`;
                
                const pl = params.get('phone_login') || params.get('pl') || '';
                const pp = params.get('phone_pass') || params.get('pp') || '';
                const user = params.get('VD_login') || params.get('user') || params.get('VD_username') || params.get('VD_login_user') || '';
                const pass = params.get('VD_pass') || params.get('pass') || params.get('VD_login_pass') || '';
                const campaign = params.get('VD_campaign') || params.get('campaign') || params.get('campaign_id') || params.get('campaignId') || '';

                setAgentDialerUrl(baseUrl);
                
                const extractedList: string[] = [];
                if (user) { setAgentViciUser(user); extractedList.push(`User ID: ${user}`); }
                if (pass) { setAgentViciPass(pass); extractedList.push(`Password: (Extracted)`); }
                if (pl) { setAgentPhoneLogin(pl); extractedList.push(`Phone Login: ${pl}`); }
                if (pp) { setAgentPhonePass(pp); extractedList.push(`Phone Pass: (Extracted)`); }
                if (campaign) { setAgentCampaignId(campaign); extractedList.push(`Campaign: ${campaign}`); }

                sfx.playSuccess();
                setToast({
                    title: "Smart Link Extracted! ⚡",
                    message: extractedList.length > 0 
                        ? `Loaded: ${extractedList.join(', ')} directly from raw URL query strings.`
                        : "Extracted base URL successfully.",
                    type: "success"
                });
            } catch (err) {
                setAgentDialerUrl(urlStr);
            }
        } else {
            setAgentDialerUrl(urlStr);
        }
    };

    // Auto-Login Launcher for seamless single-tab workflow
    const handleLaunchViciSession = () => {
        if (!agentDialerUrl) {
            setToast({
                title: "Credentials Check Required",
                message: "Please specify or paste your ViciDial base URL first.",
                type: "warning"
            });
            sfx.playError();
            return;
        }

        try {
            // Keep parameters clean and avoid double queries
            const cleanBase = agentDialerUrl.split('?')[0];
            const urlObj = new URL(cleanBase.startsWith('http') ? cleanBase : `https://${cleanBase}`);
            const params = new URLSearchParams();
            
            if (agentPhoneLogin) params.set('phone_login', agentPhoneLogin);
            if (agentPhonePass) params.set('phone_pass', agentPhonePass);
            if (agentViciUser) params.set('VD_login', agentViciUser);
            if (agentViciPass) params.set('VD_pass', agentViciPass);
            if (agentCampaignId) params.set('VD_campaign', agentCampaignId);
            params.set('DB', 'default');

            const launchUrl = `${urlObj.origin}${urlObj.pathname}?${params.toString()}`;
            sfx.playConfirm();
            setToast({
                title: "Gateway Connection Initialized",
                message: `Forwarding credentials safely to ViciDial session...`,
                type: "success"
            });
            window.open(launchUrl, '_blank');
        } catch (e) {
            window.open(agentDialerUrl, '_blank');
        }
    };

    // Secure local credentials saving function block for agent privacy
    const handleSaveAgentViciCredentials = () => {
        const userId = currentUser?.id || 'default';
        localStorage.setItem(`bh_vici_user_${userId}`, agentViciUser);
        localStorage.setItem(`bh_vici_pass_${userId}`, agentViciPass);
        localStorage.setItem(`bh_vici_phone_${userId}`, agentPhoneLogin);
        localStorage.setItem(`bh_vici_phone_pass_${userId}`, agentPhonePass);
        localStorage.setItem(`bh_vici_dialer_url_${userId}`, agentDialerUrl);
        localStorage.setItem(`bh_vici_campaign_id_${userId}`, agentCampaignId);
        sfx.playSuccess();
        setToast({ 
            title: "Credentials Integrated", 
            message: "⚡ Your ViciDial Agent credentials have been linked securely with the CRM.", 
            type: "success" 
        });
    };

    // Helper: Secretly saves a custom dial target in the background if it's not and wasn't of duplicate phone values
    const secretAutoCreateLead = React.useCallback(async (phoneStr: string, firstName = 'Dialer', lastName = 'Lead') => {
        if (!phoneStr) return;
        const cleanPhone = phoneStr.replace(/\D/g, '');
        if (!cleanPhone || cleanPhone.length < 7) return;

        // Sync and verify with current customer profiles to avoid duplicate post loops
        const exists = customers?.some((c: any) => {
            const cp = c.phone?.replace(/\D/g, '');
            return cp && cp === cleanPhone;
        });

        if (exists) {
            console.log(`[ViciDial Backend Secret Sync]: Phone ${cleanPhone} exists. Skipping duplication write.`);
            return;
        }

        try {
            const response = await fetch('/api/telephony/vicidial-push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: cleanPhone,
                    first_name: firstName,
                    last_name: lastName,
                    campaign_id: systemConfig.viciCampaignId || 'Autodial Outbound',
                    agent_user: currentUser?.username || currentUser?.email || 'Vici Agent'
                })
            });
            const res = await response.json();
            if (res.success && !res.skipped) {
                setToast({
                    title: "Live Lead Logged ⚡",
                    message: "A unique profile for this prospect was registered silently in the super admin panel.",
                    type: "success"
                });
            }
        } catch (e) {
            console.error("ViciDial silent background save failed:", e);
        }
    }, [customers, systemConfig, currentUser, setToast]);

    const handleLink = React.useCallback(async () => {
        setError(null);
        sfx.playClick();
        
        if (!systemConfig.viciServerUrl) {
            sfx.playError();
            setError("CONFIG_MISSING");
            setToast({ title: 'Telephony Error', message: "Dialer Configuration Required", type: 'error' });
            return;
        }

        setIsConnecting(true);

        setTimeout(() => {
            if (Math.random() > 0.9) {
                setIsConnecting(false);
                setError("GATEWAY_TIMEOUT");
                sfx.playError();
            } else {
                setIsConnecting(false);
                setStatus('IDLE');
                sfx.playSuccess();
                setToast({ title: 'Telephony', message: "Voice Uplink Established", type: "success" });
            }
        }, 1200);
    }, [systemConfig.viciServerUrl, setToast]);

    // Handle the custom dialing operation
    const triggerCustomDial = React.useCallback((phone: string) => {
        if (!phone) return;
        
        const digits = phone.replace(/\D/g, '');
        if (!digits) return;

        sfx.playClick();
        setActiveCustomPhone(phone);

        // Add to active / recent dials
        setRecentDials(prev => {
            const next = [phone, ...prev.filter(x => x !== phone)].slice(0, 5);
            localStorage.setItem('bh_recent_dials', JSON.stringify(next));
            return next;
        });

        // Resolve customer details if available
        const matchedCust = customers?.find((c: any) => {
            const cp = c.phone?.replace(/\D/g, '');
            return cp && (cp === digits || cp.endsWith(digits) || digits.endsWith(cp));
        });

        const template = systemConfig.customDialerUrlTemplate || 'https://dialer.yourcompany.com/?phone={phone_clean}';
        const resolved = resolveDialerUrl(template, phone, matchedCust, currentUser);
        setActiveCustomUrl(resolved);

        // Secretly save this target automatically in the background if it's new
        secretAutoCreateLead(phone, matchedCust?.firstName || 'Dialed', matchedCust?.lastName || 'Lead');

        // Copy plain digits to clipboard for manual fallback use
        navigator.clipboard.writeText(digits).then(() => {
            // Success copy
        }).catch(() => {});

        const dialType = systemConfig.customDialerType || 'CLIPBOARD_ONLY';

        if (dialType === 'CLIPBOARD_ONLY') {
            sfx.playSuccess();
            setToast({
                title: 'Copy-To-Dial Active',
                message: `📋 Copied: ${phone}. Paste into your autodialer!`,
                type: 'success'
            });
        } else if (dialType === 'PROTOCOL_URI') {
            sfx.playSuccess();
            setToast({
                title: 'Softphone Trigger',
                message: `📞 Routing calling protocol for ${phone}...`,
                type: 'success'
            });
            window.location.href = `tel:${digits}`;
        } else if (dialType === 'NEW_WEB_TAB') {
            sfx.playSuccess();
            setToast({
                title: 'Browser Redirection',
                message: `🚀 Launching dial url template for ${phone}...`,
                type: 'success'
            });
            window.open(resolved, '_blank');
        } else if (dialType === 'IFRAME_DRAWER') {
            sfx.playSuccess();
            setToast({
                title: 'Embedded Sideframe',
                message: `📱 Rendered interactive dial console inside workspace.`,
                type: 'success'
            });
        }
    }, [systemConfig.customDialerUrlTemplate, systemConfig.customDialerType, customers, currentUser, setToast, secretAutoCreateLead]);

    // Listen for external call triggers
    useEffect(() => {
        if (callTarget) {
            if (systemConfig.customDialerEnabled) {
                triggerCustomDial(callTarget);
            } else if (systemConfig.telephonyEnabled && status !== 'INCALL') {
                if (status === 'DISCONNECTED') {
                    setTimeout(() => {
                        handleLink().then(() => {
                            setTimeout(() => {
                                setStatus('INCALL');
                                setCallInfo({ number: callTarget, leadId: 'MANUAL', region: 'Outbound' });
                                setDuration(0);
                                // Save silently
                                secretAutoCreateLead(callTarget);
                            }, 1500);
                        });
                    }, 0);
                } else {
                    setTimeout(() => {
                        setStatus('INCALL');
                        setCallInfo({ number: callTarget, leadId: 'MANUAL', region: 'Outbound' });
                        setDuration(0);
                        // Save silently
                        secretAutoCreateLead(callTarget);
                    }, 0);
                }
            }
        }
    }, [callTarget, status, handleLink, systemConfig.customDialerEnabled, systemConfig.telephonyEnabled, triggerCustomDial, secretAutoCreateLead]);

    // Call Timer for ViciDial
    useEffect(() => {
        if (status === 'INCALL') {
            timerRef.current = setInterval(() => setDuration(p => p + 1), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [status]);

    // Incoming Call Sim for ViciDial (only if not custom dialer, and idle)
    useEffect(() => {
        if (systemConfig.telephonyEnabled && !systemConfig.customDialerEnabled && status === 'IDLE' && !showKeypad) {
            const timeout = setTimeout(() => {
                const randomPhone = `(555) ${Math.floor(Math.random()*900)+100}-${Math.floor(Math.random()*9000)+1000}`;
                setStatus('INCALL');
                setCallInfo({
                    number: randomPhone,
                    leadId: `LD-${Math.floor(Math.random()*100000)}`,
                    region: 'US-West'
                });
                sfx.playPhoneRing();
                setDuration(0);

                // Instantly register this simulated inbound lead silently
                secretAutoCreateLead(randomPhone, 'Inbound', 'Prospect');
            }, Math.floor(Math.random() * 25000) + 15000);
            return () => clearTimeout(timeout);
        }
    }, [status, showKeypad, systemConfig.telephonyEnabled, systemConfig.customDialerEnabled, secretAutoCreateLead]);

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleDisconnect = () => {
        sfx.playDecline();
        setStatus('DISCONNECTED');
        setCallInfo(null);
        setDuration(0);
        setShowKeypad(false);
        setError(null);
    };

    const handleHangup = () => {
        sfx.playDecline();
        setStatus('WRAPPING');
        setTimeout(() => setStatus('IDLE'), 3000);
    };

    const togglePause = () => {
        sfx.playClick();
        setStatus(prev => prev === 'IDLE' ? 'PAUSED' : 'IDLE');
    };

    const initiateManualCall = () => {
        sfx.playConfirm();
        setShowKeypad(false);
        setStatus('INCALL');
        setCallInfo({ number: dialBuffer, leadId: 'MANUAL', region: 'Outbound' });
        
        // Silently capture manual dials
        secretAutoCreateLead(dialBuffer, 'Manual', 'Dial');
        
        setDialBuffer('');
        setDuration(0);
    };

    // Fallback if telephony is fully disabled in settings
    if (!systemConfig.telephonyEnabled && !systemConfig.customDialerEnabled) {
        return (
            <PanelFrame title="Voice Uplink Link (Standby)" status="IDLE">
                <div className="h-full flex flex-col items-center justify-between p-6">
                    <div className="text-center space-y-3 my-auto font-sans">
                        <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-md">
                            <Radio size={24} className="animate-pulse" />
                        </div>
                        <h3 className="text-sm font-black text-text-primary">Decoupled Standby Active</h3>
                        <p className="text-[11px] text-text-muted leading-relaxed max-w-[260px] mx-auto">
                            The system is operating securely as an offline-first workspace. Clicking a phone number copies details instantly to your clipboard and routes them for easy logging.
                        </p>
                    </div>
                </div>
            </PanelFrame>
        );
    }

    const crmUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev.run.app';

    // Fully optimized and robust browser Bookmarklet for ViciDial Agent page
    const bookmarkletScript = `javascript:(function(){
        const getVal = (ids) => {
            for (let id of ids) {
                const el = document.getElementById(id) || document.querySelector('input[name="' + id + '"]') || document.querySelector('input[name="' + id.toUpperCase() + '"]');
                if (el && el.value) return el.value.trim();
            }
            return '';
        };

        const phone = getVal(['phone_number', 'phone', 'phone_number_dial', 'phoneNumber']).replace(/\\D/g, '');
        if (!phone) {
            alert('⚠️ ViciDial Sync: No active phone number detected. Make sure the call session is open in your dialer.');
            return;
        }

        const first_name = getVal(['first_name', 'firstName', 'first']);
        const last_name = getVal(['last_name', 'lastName', 'last']);
        const address = getVal(['address1', 'address', 'address_1']);
        const city = getVal(['city']);
        const state = getVal(['state']);
        const zip = getVal(['postal_code', 'zip', 'zip_code']);
        const email = getVal(['email']);
        const lead_id = getVal(['lead_id', 'leadId', 'vendor_lead_code']);
        const campaign_id = getVal(['campaign_id', 'campaign', 'campaignId']);
        const agent_user = getVal(['user', 'agent_user', 'vd_agent']) || 'Agent';

        const url = '${crmUrl}/api/telephony/vicidial-push?phone=' + encodeURIComponent(phone) +
            '&first_name=' + encodeURIComponent(first_name) +
            '&last_name=' + encodeURIComponent(last_name) +
            '&address=' + encodeURIComponent(address) +
            '&city=' + encodeURIComponent(city) +
            '&state=' + encodeURIComponent(state) +
            '&zip=' + encodeURIComponent(zip) +
            '&email=' + encodeURIComponent(email) +
            '&lead_id=' + encodeURIComponent(lead_id) +
            '&campaign_id=' + encodeURIComponent(campaign_id || '') +
            '&agent_user=' + encodeURIComponent(agent_user);

        fetch(url, { mode: 'cors' })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert('🟢 BraveHeart CRM Sync Success!\\nLead: ' + (first_name || 'Automated') + ' ' + (last_name || 'Inbound') + ' updated in CRM profiles.');
                } else {
                    alert('⚠️ Sync Server Response: ' + JSON.stringify(data));
                }
            })
            .catch(err => {
                alert('❌ Connection failed: ' + err.message);
            });
    })();`;

    // Clipboard auto-extractor processes everything instantly in the background on paste!
    const handlePasteAndParseText = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const text = e.clipboardData.getData('text');
        setPasteText(''); // Instantly clear text area
        if (!text) return;

        const lines = text.split('\n');
        const parsed: any = {
            phone: '',
            firstName: '',
            lastName: '',
            address: '',
            city: '',
            state: '',
            zip: '',
            email: '',
            lead_id: '',
            comments: ''
        };

        lines.forEach(line => {
            const separatorIndex = line.search(/[:\t-]/);
            if (separatorIndex !== -1) {
                const label = line.substring(0, separatorIndex).trim().toLowerCase();
                const val = line.substring(separatorIndex + 1).trim();
                if (!val) return;

                if (label.includes('phone') && !label.includes('campaign')) {
                    parsed.phone = val.replace(/\D/g, '');
                } else if (label.includes('first name') || label.includes('first_name')) {
                    parsed.firstName = val;
                } else if (label.includes('last name') || label.includes('last_name')) {
                    parsed.lastName = val;
                } else if (label.includes('address1') || label.includes('address 1') || label.includes('address')) {
                    parsed.address = val;
                } else if (label.includes('city')) {
                    parsed.city = val;
                } else if (label.includes('state')) {
                    parsed.state = val;
                } else if (label.includes('zip') || label.includes('postal')) {
                    parsed.zip = val;
                } else if (label.includes('email')) {
                    parsed.email = val;
                } else if (label.includes('lead id') || label.includes('lead_id') || label.includes('vendor') || label.includes('lead_code')) {
                    parsed.lead_id = val;
                } else if (label.includes('comments') || label.includes('comment')) {
                    parsed.comments = val;
                }
            }
        });

        // Safe Regex fallbacks
        if (!parsed.phone) {
            const phoneMatch = text.match(/\b(?:\+?1[-. ]?)?\(?([2-9]\d{2})\)?[-. ]?([2-9]\d{2})[-. ]?(\d{4})\b/);
            if (phoneMatch) parsed.phone = phoneMatch[0].replace(/\D/g, '');
        }
        if (!parsed.email) {
            const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
            if (emailMatch) parsed.email = emailMatch[0];
        }

        if (!parsed.firstName && !parsed.lastName) {
            const nameMatch = text.match(/(?:name|customer)\s*:\s*([^\n]+)/i);
            if (nameMatch) {
                const parts = nameMatch[1].trim().split(/\s+/);
                parsed.firstName = parts[0];
                parsed.lastName = parts.slice(1).join(' ');
            }
        }

        if (!parsed.phone) {
            setToast({ title: "Extractor Inactive", message: "Could not isolate any phone sequence in current paste input.", type: "info" });
            sfx.playError();
            return;
        }

        const cleanPhoneNum = parsed.phone.replace(/\D/g, '');
        const exists = customers?.some((c: any) => {
            const cp = c.phone?.replace(/\D/g, '');
            return cp && cp === cleanPhoneNum;
        });

        if (exists) {
            sfx.playSuccess();
            setToast({
                title: "Customer Profile Confirmed", 
                message: `✅ Phone: ${cleanPhoneNum} already protected in CRM. Skipped write to prevent override.`, 
                type: "success" 
            });
            return;
        }

        // Secretly save the lead instantly in background
        try {
            const response = await fetch('/api/telephony/vicidial-push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: parsed.phone,
                    first_name: parsed.firstName || 'ViciDial',
                    last_name: parsed.lastName || 'Prospect',
                    address: parsed.address,
                    city: parsed.city,
                    state: parsed.state,
                    zip: parsed.zip,
                    email: parsed.email,
                    lead_id: parsed.lead_id,
                    campaign_id: 'ViciDial Live Clipboard Ingest',
                    agent_user: currentUser?.username || currentUser?.email || 'Vici Scraper'
                })
            });

            const data = await response.json();
            if (data.success) {
                sfx.playSuccess();
                setToast({ 
                    title: "Live Lead Ingested Silently", 
                    message: `⚡ Created profile for ${parsed.firstName || 'Automated'} (${parsed.phone}) automatically in the super admin panel.`, 
                    type: "success" 
                });
            }
        } catch (e: any) {
            console.error("ViciDial silent clipboard sync failed:", e);
        }
    };

    return (
        <PanelFrame 
            title="BraveHeart Telephony Link" 
            headerAction={
                <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider">SECURE DIRECT UPLINK</span>
                </div>
            }
            status="ACTIVE"
        >
            <div className="h-full flex flex-col font-sans">
                {/* Visual Tab Selection bar for CRM unification */}
                <div className="grid grid-cols-3 p-1 bg-surface-alt/75 border-b border-border-subtle">
                    <button 
                        onClick={() => { sfx.playClick(); setActiveTab('CONTROLLER'); }}
                        className={`py-2 text-[9px] font-black uppercase tracking-wider text-center rounded-xl transition-all ${activeTab === 'CONTROLLER' ? 'bg-surface-main text-cyan-400 border border-border-subtle shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        📞 DIALER
                    </button>
                    <button 
                        onClick={() => { sfx.playClick(); setActiveTab('SYNC_HUB'); }}
                        className={`py-2 text-[9px] font-black uppercase tracking-wider text-center rounded-xl transition-all flex items-center justify-center gap-1 ${activeTab === 'SYNC_HUB' ? 'bg-surface-main text-emerald-400 border border-border-subtle shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        ⚡ SILENT SYNC
                        <span className="bg-emerald-500/15 text-emerald-400 text-[7px] font-black px-1 rounded-sm animate-pulse">AUTO</span>
                    </button>
                    <button 
                        onClick={() => { sfx.playClick(); setActiveTab('AGENT_LOGIN'); }}
                        className={`py-2 text-[9px] font-black uppercase tracking-wider text-center rounded-xl transition-all flex items-center justify-center gap-1 ${activeTab === 'AGENT_LOGIN' ? 'bg-surface-main text-violet-400 border border-border-subtle shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        🛡️ VICIDIAL
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activeTab === 'CONTROLLER' ? (
                        /* DIALER CONTROLLER MODE (SUPPORTING BOTH SYSTEM & CUSTOM MODES) */
                        <div className="space-y-4 h-full flex flex-col justify-between">
                            {systemConfig.customDialerEnabled ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-surface-alt border border-border-subtle rounded-2xl flex flex-col space-y-3 relative overflow-hidden">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-black uppercase text-text-muted tracking-wider flex items-center gap-1">
                                                <Terminal size={10} /> MODE: {systemConfig.customDialerType?.replace('_', ' ')}
                                            </span>
                                            {activeCustomPhone && (
                                                <button 
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(activeCustomPhone.replace(/\D/g, ''));
                                                        sfx.playClick();
                                                        setToast({ title: 'Clipboard', message: 'Digits Copied!', type: 'success' });
                                                    }}
                                                    className="p-1 px-2 border border-border-strong rounded hover:bg-surface-main text-[10px] text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1"
                                                >
                                                    <Copy size={10} /> Copy digits
                                                </button>
                                            )}
                                        </div>

                                        {activeCustomPhone ? (
                                            <div className="space-y-1">
                                                <div className="text-[10px] text-text-muted font-bold">Active Lead Targets</div>
                                                <div className="text-xl font-mono font-extrabold text-cyan-400 tracking-wider flex items-center gap-2">
                                                    <PhoneCall size={18} className="text-cyan-400 animate-pulse" />
                                                    {activeCustomPhone}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-xs text-text-muted italic py-1">
                                                No active target dialed. Select any customer in lists to bridge!
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <input 
                                                type="text"
                                                value={dialBuffer}
                                                onChange={e => setDialBuffer(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && (triggerCustomDial(dialBuffer), setDialBuffer(''))}
                                                placeholder="Enter phone to dial..."
                                                className="flex-1 bg-surface-main border border-border-strong rounded-xl px-3 py-2 text-xs font-semibold text-text-primary outline-none focus:border-cyan-500 transition-colors"
                                            />
                                            <button
                                                onClick={() => {
                                                    if (dialBuffer) {
                                                        triggerCustomDial(dialBuffer);
                                                        setDialBuffer('');
                                                    }
                                                }}
                                                className="p-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center"
                                            >
                                                <PhoneCall size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {systemConfig.customDialerType === 'IFRAME_DRAWER' && activeCustomUrl && (
                                        <div className="border border-border-subtle rounded-2xl bg-surface-alt overflow-hidden flex flex-col min-h-[250px]">
                                            <div className="px-3 py-2 border-b border-border-subtle bg-surface-main/55 flex justify-between items-center text-[10px]">
                                                <span className="font-extrabold text-text-secondary tracking-tight truncate max-w-[150px]">
                                                    {activeCustomUrl}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    <button 
                                                        onClick={() => { sfx.playClick(); setIframeRefreshKey(k => k + 1); }}
                                                        className="p-1 border border-border-strong rounded hover:bg-surface-alt flex items-center justify-center aspect-square text-text-muted hover:text-text-primary transition-colors"
                                                    >
                                                        <RefreshCw size={11} />
                                                    </button>
                                                    <a 
                                                        href={activeCustomUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={() => sfx.playClick()}
                                                        className="p-1 border border-border-strong rounded hover:bg-surface-alt flex items-center gap-1 text-[10px] text-text-muted hover:text-text-primary transition-colors"
                                                    >
                                                        <ExternalLink size={11} />
                                                        <span>Popout</span>
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="flex-1 w-full bg-white relative">
                                                <iframe 
                                                    key={iframeRefreshKey}
                                                    src={activeCustomUrl} 
                                                    className="w-full h-full min-h-[200px] border-0"
                                                    title="Custom Embedded Autodialer Console"
                                                    sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-scripts allow-same-origin allow-downloads"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* STANDARD VICIDIAL HANDSHAKE & ACTIVE CALL RENDER */
                                <div className="space-y-4">
                                    {status === 'DISCONNECTED' ? (
                                        <div className="text-center py-6 space-y-4">
                                            <div className="w-16 h-16 rounded-full bg-surface-alt border border-border-subtle text-text-muted flex items-center justify-center mx-auto shadow-md">
                                                <Radio size={24} className="animate-pulse" />
                                            </div>
                                            <h3 className="text-xs font-bold text-text-primary">ViciDial Handshake Standby</h3>
                                            <button 
                                                onClick={handleLink}
                                                disabled={isConnecting}
                                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold tracking-wider transition-all"
                                            >
                                                {isConnecting ? 'Bridging Server...' : 'Start Line Connection'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-surface-alt border border-border-subtle rounded-2xl text-center space-y-3">
                                            <div className="text-xs font-black text-emerald-400 flex items-center justify-center gap-1">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                                {status}
                                            </div>
                                            {callInfo ? (
                                                <div className="space-y-1 font-mono">
                                                    <div className="text-lg font-black text-text-primary">{callInfo.number}</div>
                                                    <div className="text-[10px] text-text-muted">ID: {callInfo.leadId} | {formatTime(duration)}</div>
                                                </div>
                                            ) : (
                                                <div className="text-xs text-text-muted italic py-1">Waiting for auto-dialed trigger...</div>
                                            )}
                                            <button 
                                                onClick={handleDisconnect}
                                                className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-status-error text-xs font-bold rounded-xl border border-red-500/20"
                                            >
                                                Disconnect Channel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {recentDials.length > 0 && (
                                <div className="space-y-1.5">
                                    <span className="text-[9px] font-black uppercase text-text-muted tracking-wider block">Recent Dialer Targets</span>
                                    <div className="space-y-1">
                                        {recentDials.slice(0, 3).map((ph, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => triggerCustomDial(ph)}
                                                className="w-full p-2 hover:bg-surface-alt border border-border-subtle rounded-xl text-left bg-surface-main/30 flex justify-between items-center transition-colors group text-xs font-medium"
                                            >
                                                <span className="font-mono text-text-primary group-hover:text-cyan-400">{ph}</span>
                                                <span className="text-[9px] font-bold text-cyan-400 font-mono">Redial</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                             )}
                        </div>
                    ) : activeTab === 'SYNC_HUB' ? (
                        /* VICIDIAL SCRAPER & BOOKMARKLET HUB (AUTOMATED ZERO-CLICK SAVING) */
                        <div className="space-y-4 font-sans animate-in fade-in duration-300">
                            
                            {/* Bookmarklet Synchronizer (Dynamic generator) */}
                            <div className="p-3 bg-surface-alt border border-border-subtle rounded-2xl space-y-2 relative">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
                                    <span className="bg-emerald-500/10 text-emerald-400 p-1 rounded-lg">⭐</span>
                                    ViciDial Live Save Bookmarklet
                                </div>
                                <p className="text-[10px] text-text-secondary leading-relaxed">
                                    Drag this button to your browser's Bookmarks bar. When ViciDial loads a client, simply click the bookmark to instantly sync details into unique CRM profiles!
                                </p>
                                
                                <div className="py-2 flex justify-center">
                                    <a 
                                        href={bookmarkletScript}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setToast({
                                                title: "Bookmarks Bar Action",
                                                message: "Drag this button into your Bookmarks Bar (Ctrl+Shift+B if hidden) to install!",
                                                type: "info"
                                            });
                                            sfx.playClick();
                                        }}
                                        className="cursor-gather select-none px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 border border-emerald-500/30 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                                        title="Drag me to your browser bookmarks bar!"
                                    >
                                        <span>🟢 ViciDial Auto-Save</span>
                                    </a>
                                </div>
                                
                                <div className="text-[9px] text-text-muted bg-surface-main p-1.5 rounded border border-border-subtle font-mono text-center">
                                    Runs completely in the background secretly!
                                </div>
                            </div>

                            {/* Raw Clipboard Screen Paste Ingest with Background Sync */}
                            <div className="p-3 bg-surface-alt border border-border-subtle rounded-2xl space-y-2">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
                                    <span className="bg-cyan-500/10 text-cyan-400 p-1 rounded-lg">📋</span>
                                    Zero-Click Screen Extractor
                                </div>
                                <p className="text-[10px] text-text-secondary leading-relaxed">
                                    Instant Background Import: Press <kbd className="bg-surface-main px-1 border rounded text-[9px]">Ctrl+A</kbd> then <kbd className="bg-surface-main px-1 border rounded text-[9px]">Ctrl+C</kbd> on ViciDial, and paste in the box below to auto-save instantly:
                                </p>

                                <textarea
                                    value={pasteText}
                                    onPaste={handlePasteAndParseText}
                                    onChange={(e) => setPasteText(e.target.value)}
                                    placeholder="Click here and paste (Ctrl+V) entire ViciDial text to save instantly in the background..."
                                    className="w-full h-20 bg-surface-main border border-border-strong rounded-xl p-2 text-[11px] font-semibold text-text-primary outline-none focus:border-cyan-500 transition-colors resize-none placeholder:text-text-muted/65"
                                />
                            </div>
                        </div>
                    ) : (
                        /* VICIDIAL CREDENTIALS SETUPS */
                        <div className="space-y-4 font-sans animate-in fade-in duration-300">
                            {/* Fast-Paste URL Auto-Extractor Block */}
                            <div className="p-4 bg-violet-950/20 border border-violet-500/25 rounded-2xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs font-black text-violet-400 uppercase tracking-wider">
                                        <Globe size={13} className="animate-pulse" />
                                        Option 1: Paste Address Bar Link
                                    </div>
                                    <span className="bg-violet-500/10 text-violet-300 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-violet-500/20">RECOMMENDED</span>
                                </div>
                                <p className="text-[10px] text-text-secondary leading-relaxed">
                                    Logged into ViciDial first? Simply copy the entire URL from your browser's address bar and paste it below. The CRM will automatically parse and link your credentials with zero effort!
                                </p>
                                <textarea
                                    onChange={(e) => handleUrlPasteOrParse(e.target.value)}
                                    placeholder="Paste raw ViciDial login link (e.g. https://your-dialer/agc/vicidial.php?DB=default&phone_login=cc100&phone_pass=pass123&VD_login=1001&VD_pass=pwd123...)"
                                    className="w-full h-16 bg-surface-main border border-border-strong rounded-xl p-2.5 text-[10px] font-mono text-text-primary outline-none focus:border-violet-500 transition-colors resize-none placeholder:text-text-muted/65"
                                />
                            </div>

                            {/* Direct Config / Extracted Form fields */}
                            <div className="p-4 bg-surface-alt border border-border-subtle rounded-2xl space-y-3">
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-wider block">
                                    Option 2: Manual Session Parameters
                                </span>
                                <div className="space-y-3 text-xs">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-tight">Active Base Dialer URL</label>
                                        <input 
                                            type="text"
                                            value={agentDialerUrl}
                                            onChange={(e) => handleUrlPasteOrParse(e.target.value)}
                                            placeholder="https://vicidial.yourcompany.com/agc/vicidial.php"
                                            className="w-full bg-surface-main border border-border-strong rounded-xl px-3 py-2 text-xs font-semibold text-text-primary outline-none focus:border-violet-500 transition-colors tracking-tight text-xs font-mono"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-tight">Agent User ID</label>
                                            <input 
                                                type="text"
                                                value={agentViciUser}
                                                onChange={(e) => setAgentViciUser(e.target.value)}
                                                placeholder="1001"
                                                className="w-full bg-surface-main border border-border-strong rounded-xl px-3 py-2 text-xs font-semibold text-text-primary outline-none focus:border-violet-500 transition-colors text-xs font-mono"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-tight">Agent Password</label>
                                            <input 
                                                type="password"
                                                value={agentViciPass}
                                                onChange={(e) => setAgentViciPass(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-surface-main border border-border-strong rounded-xl px-3 py-2 text-xs font-semibold text-text-primary outline-none focus:border-violet-500 transition-colors text-xs font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-tight">Phone Login</label>
                                            <input 
                                                type="text"
                                                value={agentPhoneLogin}
                                                onChange={(e) => setAgentPhoneLogin(e.target.value)}
                                                placeholder="cc100"
                                                className="w-full bg-surface-main border border-border-strong rounded-xl px-3 py-2 text-xs font-semibold text-text-primary outline-none focus:border-violet-500 transition-colors text-xs font-mono"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-tight">Phone Pass</label>
                                            <input 
                                                type="password"
                                                value={agentPhonePass}
                                                onChange={(e) => setAgentPhonePass(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-surface-main border border-border-strong rounded-xl px-3 py-2 text-xs font-semibold text-text-primary outline-none focus:border-violet-500 transition-colors text-xs font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-tight">Campaign ID (Optional Override)</label>
                                        <input 
                                            type="text"
                                            value={agentCampaignId}
                                            onChange={(e) => setAgentCampaignId(e.target.value)}
                                            placeholder="OUTBOUND_SPEED"
                                            className="w-full bg-surface-main border border-border-strong rounded-xl px-3 py-2 text-xs font-semibold text-text-primary outline-none focus:border-violet-500 transition-colors text-xs font-mono"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 pt-2">
                                        <button
                                            onClick={handleSaveAgentViciCredentials}
                                            className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <Check size={14} /> Link & Secure Session Login
                                        </button>
                                        
                                        {agentDialerUrl && (
                                            <button
                                                onClick={handleLaunchViciSession}
                                                className="w-full py-2.5 bg-surface-main border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                            >
                                                <ExternalLink size={13} /> Launch Session & Log In inside ViciDial
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PanelFrame>
    );
};
