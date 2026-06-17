import React, { useState, useMemo } from 'react';
import { Search, History, ChevronDown } from 'lucide-react';
import { Modal } from '../../../ui/Modal';
import { Sale } from '../../../../types';
import { paginationService } from '../../../../lib/enrollment/paginationService';

interface CustomerLookupProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Sale[];
  allSales: Sale[];
  onSelectCustomer: (customer: Sale) => void;
}

export const CustomerLookup: React.FC<CustomerLookupProps> = ({
  isOpen,
  onClose,
  customers,
  allSales,
  onSelectCustomer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers.slice(0, pageSize);
    const q = searchQuery.toLowerCase();
    const normalizedSearch = q.replace(/\D/g, '');
    return customers.filter(
      (c) => {
        const normalizedPhone = c.phone.replace(/\D/g, '');
        return c.customer.toLowerCase().includes(q) || 
               (normalizedSearch.length > 0 && normalizedPhone.includes(normalizedSearch)) || 
               c.address?.toLowerCase().includes(q);
      }
    );
  }, [customers, searchQuery]);

  const { items, pagination } = paginationService.paginate(
    filteredCustomers,
    page,
    pageSize
  );

  const handleSelectCustomer = (customer: Sale) => {
    onSelectCustomer(customer);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customer History" size="lg">
      <div className="space-y-6 pb-2">
        {/* Search */}
        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-indigo-500 transition-colors"
            size={18}
          />
          <input
            autoFocus
            type="text"
            placeholder="Search by name, phone, or ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            className="w-full pl-11 pr-4 py-3.5 bg-surface-alt/50 border border-border-subtle rounded-xl text-sm font-bold text-text-primary outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-surface-main transition-all shadow-inner"
          />
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-2 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center justify-center border-2 border-dashed border-border-subtle rounded-xl bg-surface-alt/20">
              <History size={32} className="text-text-muted/30 mb-3" />
              <p className="text-sm font-bold text-text-muted">No customers found</p>
              <p className="text-sm text-text-muted/70 mt-1">Try adjusting your search terms</p>
            </div>
          ) : (
            items.map((customer) => {
              const customerSales = allSales
                .filter(s => s.phone === customer.phone || s.customer === customer.customer)
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
              
              return (
                <div
                  key={customer.id}
                  onClick={() => handleSelectCustomer(customer)}
                  className="p-4 bg-surface-main border border-border-subtle rounded-xl hover:border-indigo-500/50 hover:bg-surface-alt/50 cursor-pointer transition-all flex flex-col gap-3 group shadow-sm hover:shadow-md"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-black text-lg text-indigo-500 flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                        {customer.customer.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-text-primary group-hover:text-indigo-400 truncate flex items-center gap-2">
                           {customer.customer}
                           {customer.email && <span className="text-sm font-medium text-text-muted/70 bg-surface-alt px-1.5 py-0.5 rounded border border-border-subtle/50 hidden sm:inline-block truncate max-w-[120px]">{customer.email}</span>}
                        </p>
                        <p className="text-sm font-mono font-medium text-text-muted mt-0.5 flex items-center gap-2">
                           <span className="text-indigo-500/70">Phone:</span> {customer.phone}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4 flex flex-col items-end gap-1">
                      <span className="text-sm font-bold text-text-muted uppercase tracking-wider">Last Interaction</span>
                      <span className="text-sm font-medium text-text-primary bg-surface-alt px-2 py-1 rounded-md border border-border-subtle">
                         {new Date(customerSales[0]?.timestamp || customer.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  {customerSales.length > 0 && (
                    <div className="pt-4 border-t border-border-subtle/50">
                       <div className="flex justify-between items-center mb-3">
                         <p className="text-sm font-bold text-text-muted uppercase tracking-wider">Transaction History</p>
                         <span className="text-sm text-text-muted font-bold bg-surface-alt px-2 py-1 rounded border border-border-subtle">{customerSales.length} Records</span>
                       </div>
                       <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                         {customerSales.map((sale) => {
                            const date = new Date(sale.timestamp);
                            const daysSince = Math.floor((Date.now() - sale.timestamp) / (1000 * 60 * 60 * 24));
                            const timeAgo = daysSince === 0 ? 'Today' : daysSince < 30 ? `${daysSince} days ago` : `${Math.floor(daysSince/30)} months ago`;
                            
                            const isDeclined = sale.status === 'Declined';
                            const isApproved = sale.status === 'Approved';
                            
                            return (
                              <div key={sale.id} className={`p-3 rounded-xl border ${isDeclined ? 'bg-status-error/5 border-status-error/20' : 'bg-surface-alt/70 border-border-subtle'} text-sm flex flex-col gap-2`}>
                                 <div className="flex justify-between items-start border-b border-border-subtle/50 pb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-sm text-text-muted bg-surface-main px-1.5 py-0.5 rounded border border-border-subtle truncate max-w-[80px]">ID: {sale.id.split('-')[0]}</span>
                                      <span className="font-bold text-text-primary">{date.toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                                      <span className="text-sm font-medium text-text-muted italic">({timeAgo})</span>
                                    </div>
                                    <span className={`font-black ml-auto px-2 py-0.5 rounded text-sm uppercase tracking-wider ${isDeclined ? 'bg-status-error/20 text-status-error' : isApproved ? 'bg-status-success/20 text-status-success' : 'bg-status-warning/20 text-status-warning'}`}>
                                      {sale.status || 'Pending'}
                                    </span>
                                 </div>
                                 
                                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <div>
                                      <span className="text-sm text-text-muted uppercase block">Product</span>
                                      <span className="font-bold text-text-primary truncate block">{sale.product || 'N/A'}</span>
                                    </div>
                                    <div>
                                      <span className="text-sm text-text-muted uppercase block">Quantity</span>
                                      <span className="font-bold text-text-primary block">{sale.quantity || 'N/A'}</span>
                                    </div>
                                    <div>
                                      <span className="text-sm text-text-muted uppercase block">Dosage</span>
                                      <span className="font-bold text-text-primary block">{sale.dosage || 'N/A'}</span>
                                    </div>
                                    <div>
                                      <span className="text-sm text-text-muted uppercase block">Total</span>
                                      <span className="font-black text-status-success block">${(sale as any).revenue?.toFixed(2) || sale.amount?.toFixed(2) || '0.00'}</span>
                                    </div>
                                 </div>
                                 
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                                   <div className="bg-surface-main p-2 rounded-lg border border-border-subtle flex items-center justify-between">
                                      <span className="text-sm text-text-muted uppercase mr-2">Pkg Status:</span>
                                      <span className={`font-bold text-sm ${isApproved ? 'text-emerald-500' : isDeclined ? 'text-status-error' : 'text-text-muted'}`}>{isApproved ? 'Delivered' : isDeclined ? 'Cancelled' : 'Processing'}</span>
                                   </div>
                                   <div className="bg-surface-main p-2 rounded-lg border border-border-subtle flex items-center justify-between">
                                      <span className="text-sm text-text-muted uppercase mr-2">Track ID:</span>
                                      <span className="font-mono font-bold text-sm text-text-primary truncate">{sale.trackingId || `TRK-${sale.id.slice(0,6).toUpperCase()}`}</span>
                                   </div>
                                 </div>

                                 {isDeclined && (
                                   <div className="mt-1 bg-status-error/10 border border-status-error/20 p-2 rounded-lg">
                                     <span className="text-sm text-status-error uppercase font-bold block mb-0.5">Decline Reason / Notes:</span>
                                     <span className="text-sm text-status-error font-medium">{sale.callSummary || sale.adminLabel || 'Declined by processor - No additional details provided.'}</span>
                                   </div>
                                 )}
                              </div>
                            );
                         })}
                       </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {pagination.total > pageSize && (
          <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
            <span className="text-sm font-bold text-text-muted">
              Showing <span className="text-text-primary">{page * pageSize + 1} - {Math.min((page + 1) * pageSize, pagination.total)}</span> of <span className="text-text-primary">{pagination.total}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-surface-alt border border-border-subtle rounded-lg text-sm font-bold text-text-primary hover:bg-surface-main hover:border-text-muted disabled:opacity-30 disabled:hover:border-border-subtle transition-all active:scale-95"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasMore}
                className="px-4 py-2 bg-surface-alt border border-border-subtle rounded-lg text-sm font-bold text-text-primary hover:bg-surface-main hover:border-text-muted disabled:opacity-30 disabled:hover:border-border-subtle transition-all active:scale-95"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
