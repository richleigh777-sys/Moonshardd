import React, { useState, useEffect, useRef } from 'react';
import { Search, Server, User as UserIcon, Phone, FileText } from 'lucide-react';
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
            // eslint-disable-next-line react-hooks/set-state-in-effect
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
                        const matched = parsedSales.filter(s => 
                            s.phone?.toLowerCase().includes(q) || 
                            s.customer?.toLowerCase().includes(q) ||
                            s.email?.toLowerCase().includes(q) ||
                            s.orderId?.toLowerCase().includes(q) ||
                            s.agent?.toLowerCase().includes(q)
                        );
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
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${isOpen ? 'bg-surface-main border-accent-primary text-text-primary shadow-[0_0_15px_rgba(0,229,255,0.2)]' : 'bg-surface-alt border-border-subtle text-text-muted hover:text-text-primary hover:border-border-strong'}`}
            >
                <Search size={16} />
                <span className="text-xs font-bold  tracking-wider hidden md:block">Omni Search</span>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-surface-main border border-border-strong shadow-float rounded-xl overflow-hidden flex flex-col max-h-[500px]">
                    <div className="p-3 border-b border-border-subtle bg-surface-alt/50 shrink-0">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                type="text"
                                className="w-full bg-surface-main border border-border-subtle rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                                placeholder="Search by phone, name..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                        {isSearching ? (
                            <div className="p-6 text-center flex flex-col items-center gap-2 text-text-muted">
                                <div className="w-5 h-5 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs font-bold  tracking-widest">Querying Silos...</span>
                            </div>
                        ) : query.length < 3 ? (
                            <div className="p-6 text-center text-text-muted text-xs">
                                Enter at least 3 characters to search across all network topologies.
                            </div>
                        ) : results.length === 0 ? (
                            <div className="p-6 text-center text-text-muted text-xs">
                                No records found across any network.
                            </div>
                        ) : (
                            <div className="divide-y divide-border-subtle">
                                {results.map((server, i) => (
                                    <div key={i} className="p-0">
                                        <div className="bg-surface-alt/50 px-3 py-2 border-b border-border-subtle flex items-center gap-2">
                                            <Server size={12} className="text-accent-primary" />
                                            <span className="text-[10px] font-[700]  tracking-widest text-text-secondary">{server.serverName}</span>
                                        </div>
                                    <div className="divide-y divide-border-subtle/50">
                                            {server.sales.map((sale) => {
                                                const statusColor = sale.status === 'Approved' ? 'text-status-success' : sale.status === 'Declined' ? 'text-status-error' : sale.status === 'Cancelled' ? 'text-status-error' : 'text-status-warning';
                                                
                                                return (
                                                <div key={sale.id} className="p-3 hover:bg-surface-highlight transition-colors flex flex-col gap-1.5">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-text-primary flex items-center gap-2">
                                                                {sale.customer}
                                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-surface-alt/50 ${statusColor}`}>{sale.status}</span>
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-alt text-text-muted shrink-0 text-right">
                                                            {new Date(sale.timestamp).toLocaleDateString()}
                                                            <div className="font-mono text-[9px] opacity-70">{new Date(sale.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-text-muted font-mono">
                                                        <span className="flex items-center gap-1" title="Phone"><Phone size={10} /> {sale.phone}</span>
                                                        {sale.email && <span className="flex items-center gap-1" title="Email">@ {sale.email}</span>}
                                                        <span className="flex items-center gap-1" title="Agent"><UserIcon size={10} /> {sale.agent}</span>
                                                        {sale.orderId && <span className="flex items-center gap-1" title="Order ID"># {sale.orderId}</span>}
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between text-xs mt-0.5">
                                                        <div className="text-accent-secondary py-0.5 font-bold">
                                                            {sale.product} <span className="text-text-muted font-normal text-[10px]">x{sale.quantity}</span>
                                                        </div>
                                                        <span className="text-text-primary font-mono text-sm tracking-tight font-bold">
                                                            ${Number(sale.amount).toFixed(2)}
                                                        </span>
                                                    </div>

                                                    <div className="text-[10px] text-text-secondary line-clamp-2 mt-0.5 bg-surface-alt/30 p-1.5 rounded-md leading-relaxed border border-border-subtle/30">
                                                        <FileText size={10} className="inline mr-1 opacity-50 relative -top-[1px]" />
                                                        {sale.callSummary || 'No summary provided.'}
                                                    </div>
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
