import React, { useState, useEffect, useRef } from 'react';
import { Search, Server, User as UserIcon, Phone } from 'lucide-react';
import { useSystem } from '../../hooks/useSystem';
import { useAuth } from '../../hooks/useAuth';
import { Sale } from '../../types';

export const OmniSearch = () => {
    const { currentUser } = useAuth();
    const { serverList } = useSystem();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{serverName: string, sales: Sale[]}[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const isSuperAdmin = (currentUser?.level || currentUser?.accessLevel || 0) >= 10;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!query.trim() || query.length < 3) {
             
            setResults([]);
            return;
        }

        const runSearch = async () => {
            setIsSearching(true);
            const q = query.toLowerCase();
            const allResults: {serverName: string, sales: Sale[]}[] = [];
            
            for (const server of serverList) {
                // Read from local storage directly for each server to simulate omni search across silos
                const prefix = `nexus_${server.id}`;
                try {
                    const rawSales = localStorage.getItem(`${prefix}_sales`);
                    if (rawSales) {
                        const parsedSales: Sale[] = Object.values(JSON.parse(rawSales));
                        let matched = parsedSales.filter(s => 
                            (s.phone || '').toLowerCase().includes(q) || 
                            (s.customer || '').toLowerCase().includes(q) ||
                            (s.email || '').toLowerCase().includes(q) ||
                            (s.orderId || '').toLowerCase().includes(q) ||
                            (s.agent || '').toLowerCase().includes(q)
                        );
                        
                        // Sort by timestamp descending and take the top 3
                        matched = matched.sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);
                        
                        if (matched.length > 0) {
                            allResults.push({ serverName: server.name, sales: matched });
                        }
                    }
                } catch (err) {
                    // ignore format errors in simulated omni search
                    console.warn("Format error in simulated omni search", err);
                }
            }
            
            setResults(allResults);
            setIsSearching(false);
        };

        const timeout = setTimeout(runSearch, 500);
        return () => clearTimeout(timeout);
    }, [query, serverList]);

    if (!isSuperAdmin) return null;

    return (
        <div className="relative z-[110]" ref={searchRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{ width: '300px', height: '35px' }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${isOpen ? 'bg-[#0A0A0C] border-[#3B82F6] text-[#FAFAFA] shadow-sm' : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-[#3F3F46]'}`}
            >
                <Search size={16} />
                <span className="text-sm font-semibold uppercase tracking-wide hidden md:block">Omni Search</span>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-[#0F0F11] border border-[#27272A] shadow-2xl rounded-lg overflow-hidden flex flex-col max-h-[500px]">
                    <div className="p-3 border-b border-[#2A2A2E] bg-[#0A0A0C]/50 shrink-0">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
                            <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                type="text"
                                className="w-full bg-[#18181B] border border-[#27272A] rounded-xl pl-10 pr-3 py-2 text-[13px] text-[#FAFAFA] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30 focus:outline-none placeholder-[#71717A] shadow-inner font-[600]"
                                placeholder="Search by phone, name..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                        {isSearching ? (
                            <div className="p-6 text-center flex flex-col items-center gap-3 text-[#A1A1AA]">
                                <div className="w-6 h-6 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin shadow-sm"></div>
                                <span className="text-sm font-semibold uppercase tracking-wide">Querying Silos...</span>
                            </div>
                        ) : query.length < 3 ? (
                            <div className="p-6 text-center text-[#A1A1AA] text-[12px] font-[500] leading-relaxed">
                                Enter at least 3 characters to search across all network topologies.
                            </div>
                        ) : results.length === 0 ? (
                            <div className="p-6 text-center text-[#A1A1AA] text-[12px] font-[500]">
                                No records found across any network.
                            </div>
                        ) : (
                            <div className="divide-y divide-[#27272A]">
                                {results.map((server, i) => (
                                    <div key={i} className="p-0">
                                        <div className="bg-[#0A0A0C]/80 px-4 py-2 border-b border-[#2A2A2E] flex items-center gap-3">
                                            <div className="p-1 rounded bg-[#3B82F6]/10 text-[#60A5FA]"><Server size={14} /></div>
                                            <span className="text-sm font-semibold uppercase tracking-[0.1em] text-[#A1A1AA]">{server.serverName}</span>
                                        </div>
                                    <div className="divide-y divide-[#27272A]/50">
                                            {server.sales.map((sale) => {
                                                const statusColor = sale.status === 'Approved' ? 'text-[#34D399]' : sale.status === 'Declined' ? 'text-[#F87171]' : sale.status === 'Cancelled' ? 'text-[#FCA5A5]' : 'text-[#FBBF24]';
                                                
                                                return (
                                                <div key={sale.id} className="p-4 hover:bg-[#18181B] transition-colors flex flex-col gap-2 group">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex flex-col">
                                                            <span className="text-[14px] font-medium text-[#FAFAFA] flex items-center gap-3">
                                                                {sale.customer}
                                                                <span className={`text-sm font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide bg-[#27272A] ${statusColor}`}>{sale.status}</span>
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <button 
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold uppercase tracking-wide px-3 py-1.5 rounded-lg shadow-sm hover:scale-105 active:scale-95"
                                                                onClick={() => {
                                                                    // if (window.confirm("Engage this customer and load them into a new order form?")) {
                                                                        setIsOpen(false);
                                                                        const navigateEvent = new CustomEvent('NAVIGATE', { detail: 'enrollment' });
                                                                        window.dispatchEvent(navigateEvent);
                                                                        setTimeout(() => {
                                                                            const loadEvent = new CustomEvent('LOAD_LEAD', { detail: sale });
                                                                            window.dispatchEvent(loadEvent);
                                                                        }, 100);
                                                                    // }
                                                                }}
                                                            >
                                                                Engage
                                                            </button>
                                                            <span className="text-sm font-[600] px-2 py-1 rounded bg-[#0A0A0C] border border-[#27272A] text-[#71717A] shrink-0 text-right">
                                                                {new Date(sale.timestamp).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-[#A1A1AA] font-mono mt-1">
                                                        <span className="flex items-center gap-1.5" title="Phone"><Phone size={12} className="text-[#71717A]" /> {sale.phone}</span>
                                                        {sale.email && <span className="flex items-center gap-1.5" title="Email"><span className="text-[#71717A]">@</span> {sale.email}</span>}
                                                        <span className="flex items-center gap-1.5" title="Agent"><UserIcon size={12} className="text-[#71717A]" /> {sale.agent}</span>
                                                        {(sale.trackingId || sale.orderId) && <span className="flex items-center gap-1.5" title={sale.trackingId ? "Tracking ID" : "Order ID"}><span className="text-[#71717A]">#</span> {sale.trackingId || sale.orderId}</span>}
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2A2A2E]/50">
                                                        <div className="text-[#818CF8] py-0.5 font-medium text-[13px]">
                                                            {sale.product} <span className="text-[#71717A] font-[600] text-sm ml-1">x{sale.quantity}</span>
                                                        </div>
                                                        <span className={`font-mono text-[14px] tracking-tight font-semibold ${sale.status === 'Declined' ? 'text-[#F87171]' : 'text-[#34D399]'}`}>
                                                            ${Number(sale.amount).toFixed(2)}
                                                        </span>
                                                    </div>

                                                    {sale.status === 'Declined' && sale.declineReason && (
                                                        <div className="text-sm text-[#FCA5A5] mt-2 bg-[#7F1D1D]/20 p-2.5 rounded-lg leading-relaxed border border-[#DC2626]/30 shadow-inner">
                                                            <strong className="font-semibold text-[#F87171]">Decline Reason:</strong> {sale.declineReason}
                                                        </div>
                                                    )}
                                                </div>
                                            )})}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
