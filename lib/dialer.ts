export const executeDialer = (phone: string, customer: any, config: any) => {
    if (!phone) return;
    
    // Clean phone number: remove non-digits, but keep the + if it exists
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    // Default to PROTOCOL_URI if not set, as they explicitly want click-to-call
    const dialerType = config?.customDialerType || 'PROTOCOL_URI'; 
    const template = config?.customDialerUrlTemplate || 'https://dialer.yourcompany.com/?phone={phone_clean}';
    
    if (dialerType === 'PROTOCOL_URI') {
        // Use an anchor tag with target="_top" to escape iframe sandboxes
        const a = document.createElement('a');
        a.href = `tel:${cleanPhone}`;
        a.target = '_top';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
    }
    
    if (dialerType === 'CLIPBOARD_ONLY') {
        navigator.clipboard.writeText(cleanPhone);
        return;
    }
    
    // Process template
    const url = template
        .replace(/{phone}/g, phone)
        .replace(/{phone_clean}/g, cleanPhone)
        .replace(/{firstName}/g, customer?.firstName || '')
        .replace(/{lastName}/g, customer?.lastName || '')
        .replace(/{id}/g, customer?.id || '');
        
    if (dialerType === 'NEW_WEB_TAB') {
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
    }
    
    if (dialerType === 'IFRAME_DRAWER') {
        // We can emit a custom event to open the iframe drawer
        window.dispatchEvent(new CustomEvent('OPEN_DIALER_IFRAME', { detail: { url, phone } }));
        return;
    }
    
    // Fallback
    const a = document.createElement('a');
    a.href = `tel:${cleanPhone}`;
    a.target = '_top';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};
