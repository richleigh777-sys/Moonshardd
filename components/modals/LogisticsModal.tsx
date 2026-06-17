
import React, { useState, useMemo } from 'react';
import { Truck, Package, MapPin, CheckCircle, Clock, ExternalLink, RefreshCw, Box, Activity, Signal } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button, Card } from '../../components/ui/Base';
import { Sale } from '../../types';
import { getTrackingLink } from '../../views/utils/crmLogic';
import { sfx } from '../../lib/soundService';

interface LogisticsModalProps {
    isOpen: boolean;
    onClose: () => void;
    sale: Sale;
    onUpdateStatus: (saleId: string, status: string) => void;
}

export const LogisticsModal: React.FC<LogisticsModalProps> = ({ isOpen, onClose, sale, onUpdateStatus }) => {
    const [, setIsScanning] = useState(false);

    const carrierInfo = useMemo(() => {
        const id = (sale.trackingId || '').toUpperCase();
        if (id.startsWith('1Z')) return { name: 'UPS Ground', color: 'text-amber-700', bg: 'bg-[#351C15]', icon: Truck };
        if (/^\d{12}$/.test(id)) return { name: 'FedEx Express', color: 'text-purple-600', bg: 'bg-[#4D148C]', icon: Box };
        if (/^9/.test(id)) return { name: 'USPS Priority', color: 'text-blue-600', bg: 'bg-[#004B87]', icon: MapPin };
        return { name: 'Logistics Provider', color: 'text-text-primary', bg: 'bg-surface-alt', icon: Package };
    }, [sale.trackingId]);

    const timelineEvents = useMemo(() => {
        // Generate simulated events based on current status to look like a real API
        const events = [];
        const date = new Date(sale.timestamp);
        
        events.push({ time: new Date(date.getTime() + 3600000).toLocaleString(), status: 'Label Created', location: 'System Entry' });
        
        if (sale.deliveryStatus === 'Shipped' || sale.deliveryStatus === 'In Transit' || sale.deliveryStatus === 'Out for Delivery' || sale.deliveryStatus === 'Delivered') {
            events.push({ time: new Date(date.getTime() + 86400000).toLocaleString(), status: 'Origin Scan', location: 'Distribution Center A' });
            events.push({ time: new Date(date.getTime() + 172800000).toLocaleString(), status: 'In Transit', location: 'Transit Hub' });
        }
        
        if (sale.deliveryStatus === 'Out for Delivery' || sale.deliveryStatus === 'Delivered') {
            events.push({ time: new Date().toLocaleDateString() + ' 08:30 AM', status: 'Out for Delivery', location: 'Local Facility' });
        }

        if (sale.deliveryStatus === 'Delivered') {
            events.push({ time: new Date().toLocaleDateString() + ' 02:15 PM', status: 'DELIVERED', location: 'Front Porch' });
        }

        return events.reverse();
    }, [sale.deliveryStatus, sale.timestamp]);

    const handleUpdate = (status: string) => {
        setIsScanning(true);
        sfx.playSubmit();
        setTimeout(() => {
            onUpdateStatus(sale.id, status);
            setIsScanning(false);
            sfx.playSuccess();
        }, 800);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Logistics Command Center" size="lg">
            <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-surface-alt/40 border border-border-subtle p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
                    <div className={`absolute left-0 top-0 w-2 h-full ${carrierInfo.bg}`}></div>
                    
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-16 h-16 rounded-xl bg-surface-main border border-border-subtle flex items-center justify-center shadow-lg">
                            <carrierInfo.icon size={32} className={carrierInfo.color} />
                        </div>
                        <div>
                            <h3 className="text-lg font-[700] text-text-primary tracking-tight">{carrierInfo.name}</h3>
                            <p className="text-sm font-mono font-bold text-text-muted mt-1 tracking-wider">{sale.trackingId || 'NO_ID_ASSIGNED'}</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 relative z-10">
                        <div className={`px-4 py-1.5 rounded-lg border text-xs font-[700]  tracking-widest ${
                            sale.deliveryStatus === 'Delivered' ? 'bg-emerald-500/10 text-status-success border-emerald-500/20' : 
                            sale.deliveryStatus === 'Out for Delivery' ? 'bg-amber-500/10 text-status-warning border-amber-500/20 animate-pulse' :
                            'bg-surface-main text-text-muted border-border-subtle'
                        }`}>
                            {sale.deliveryStatus || 'Pending Scan'}
                        </div>
                        {sale.trackingId && (
                            <a 
                                href={getTrackingLink(sale.trackingId)} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-xs font-bold text-accent-primary hover:underline flex items-center gap-1 bg-surface-main px-3 py-1 rounded-full border border-border-subtle"
                            >
                                <Signal size={16} className="animate-pulse" /> Live Global Tracking
                            </a>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Status Controls */}
                    <Card className="p-5 border-border-subtle bg-surface-main h-full">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border-subtle">
                            <RefreshCw size={16} className="text-accent-primary" />
                            <h4 className="text-xs font-[700]  text-text-primary tracking-widest">Manual Override</h4>
                        </div>
                        <div className="space-y-2">
                            <button onClick={() => handleUpdate('Label Created')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-alt border border-transparent hover:border-border-subtle transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                    <span className="text-xs font-bold text-text-muted group-hover:text-text-primary">Label Created</span>
                                </div>
                                {sale.deliveryStatus === 'Label Created' && <CheckCircle size={16} className="text-status-success"/>}
                            </button>
                            <button onClick={() => handleUpdate('In Transit')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-alt border border-transparent hover:border-border-subtle transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span className="text-xs font-bold text-text-muted group-hover:text-text-primary">In Transit</span>
                                </div>
                                {sale.deliveryStatus === 'In Transit' && <CheckCircle size={16} className="text-status-success"/>}
                            </button>
                            <button onClick={() => handleUpdate('Out for Delivery')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-alt border border-border-subtle hover:border-status-warning/30 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                                    <span className="text-xs font-bold text-text-muted group-hover:text-text-primary">Out for Delivery</span>
                                </div>
                                {sale.deliveryStatus === 'Out for Delivery' && <CheckCircle size={16} className="text-status-success"/>}
                            </button>
                            <button onClick={() => handleUpdate('Delivered')} className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-xs font-bold text-emerald-600">Delivered</span>
                                </div>
                                {sale.deliveryStatus === 'Delivered' && <CheckCircle size={16} className="text-status-success"/>}
                            </button>
                        </div>
                    </Card>

                    {/* Timeline (Simulated) */}
                    <Card className="p-5 border-border-subtle bg-surface-main h-full flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                            <Activity size={100} />
                        </div>
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-border-subtle relative z-10">
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-text-muted" />
                                <h4 className="text-xs font-[700]  text-text-primary tracking-widest">Event Log</h4>
                            </div>
                            <span className="text-sm font-[700]  text-status-warning bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 tracking-wider">Internal Projection</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar relative pl-2 z-10">
                            <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border-subtle"></div>
                            <div className="space-y-6">
                                {timelineEvents.map((event, i) => (
                                    <div key={i} className="relative pl-6">
                                        <div className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-surface-main ${i === 0 ? 'bg-emerald-500 ring-4 ring-emerald-500/10' : 'bg-text-muted'}`}></div>
                                        <p className={`text-xs font-bold ${i === 0 ? 'text-text-primary' : 'text-text-muted'}`}>{event.status}</p>
                                        <p className="text-xs text-text-muted opacity-80">{event.location}</p>
                                        <p className="text-xs font-mono text-text-muted/60 mt-0.5">{event.time}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="pt-6 border-t border-border-subtle flex justify-end gap-3">
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                    {sale.trackingId && (
                        <Button 
                            variant="primary" 
                            onClick={() => window.open(getTrackingLink(sale.trackingId!), '_blank')}
                            icon={<ExternalLink size={16}/>}
                            className="bg-accent-primary hover:bg-accent-primary/90 text-white shadow-lg shadow-accent-primary/20"
                        >
                            Track on ParcelsApp
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
};
