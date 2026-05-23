export const formatUSAPhone = (phone: string) => {
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        const intlCode = (match[1] ? '+1 ' : '');
        return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('');
    }
    return phone;
};

export const generateInternalStackFormat = (saleData: any) => {
    const d = new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York' });
    const amount = saleData.amount ? `$${saleData.amount.toLocaleString()}` : 'TBD';
    
    return `🚨 NEW DEAL SECURED 🚨\n\n🎯 Agent: ${saleData.agent || saleData.agentId || 'Unknown'}\n👤 Client: ${saleData.customer || 'Unknown'}\n📞 Phone: ${saleData.phone || 'N/A'}\n💰 Revenue: ${amount}\n📝 Details: ${saleData.callSummary || saleData.notes || 'No notes provided'}\n📅 Date: ${d}\n\n🔥 LFG! keep pushing!`;
};
