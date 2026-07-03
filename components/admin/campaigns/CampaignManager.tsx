import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/Base';
import { Button, Input } from '../../ui/Base';
import { Activity, Mail, Users, Clock, Plus, RefreshCw } from 'lucide-react';
import { sfx } from '../../../lib/soundService';

export const CampaignManager = () => {
    const [leads, setLeads] = useState<any[]>([]);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchLeads = async () => {
        try {
            const res = await fetch('/api/leads');
            if (res.ok) {
                const data = await res.json();
                setLeads(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const ingestLead = async () => {
        if (!email && !phone) return;
        setLoading(true);
        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, phone, source: 'Manual Entry' })
            });
            if (res.ok) {
                sfx.playSuccess();
                setEmail('');
                setPhone('');
                fetchLeads();
            } else {
                sfx.playError();
            }
        } catch (err) {
            console.error(err);
            sfx.playError();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Activity className="text-accent-primary" /> Drip Campaigns & Leads
                    </h2>
                    <p className="text-text-muted mt-1">Ingest leads and manage automated drip sequences.</p>
                </div>
                <Button onClick={fetchLeads} variant="ghost" className="h-10 px-4 rounded-full">
                    <RefreshCw size={16} className="mr-2" /> Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card variant="panel" className="md:col-span-1 border-border-subtle bg-surface-main">
                    <div className="p-4 border-b border-border-subtle flex items-center gap-2">
                        <Plus className="text-accent-primary" size={20} />
                        <h3 className="font-bold text-white">Ingest Lead</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        <Input 
                            label="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="lead@example.com"
                        />
                        <Input 
                            label="Phone Number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 555-0199"
                        />
                        <Button 
                            onClick={ingestLead}
                            disabled={loading || (!email && !phone)}
                            variant="primary"
                            className="w-full h-12"
                        >
                            {loading ? 'Ingesting...' : 'Ingest & Start Sequence'}
                        </Button>
                        <p className="text-xs text-text-muted mt-2">
                            Leads added here are automatically enrolled in the active Drip Campaign sequence.
                        </p>
                    </div>
                </Card>

                <Card variant="panel" className="md:col-span-2 border-border-subtle bg-surface-main flex flex-col min-h-[400px]">
                    <div className="p-4 border-b border-border-subtle flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="text-accent-primary" size={20} />
                            <h3 className="font-bold text-white">Active Queue</h3>
                        </div>
                        <span className="px-2 py-1 bg-accent-primary/10 text-accent-primary rounded text-xs font-bold">
                            {leads.length} Leads
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {leads.map(lead => (
                            <div key={lead.id} className="p-3 bg-surface-alt rounded border border-border-subtle flex items-center justify-between">
                                <div>
                                    <div className="font-mono text-sm text-white">
                                        {lead.email || lead.phone || 'Unknown Contact'}
                                    </div>
                                    <div className="text-xs text-text-muted mt-1 flex items-center gap-2">
                                        <Clock size={12} /> Added {new Date(lead.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-accent-primary flex items-center gap-1 justify-end">
                                        <Mail size={12} /> Step {lead.sequence_step || 0}
                                    </div>
                                    <div className={`text-xs mt-1 ${lead.campaign_status === 'Pending' ? 'text-status-warning' : 'text-status-success'}`}>
                                        {lead.campaign_status || 'Unenrolled'}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {leads.length === 0 && (
                            <div className="h-full flex items-center justify-center text-text-muted text-sm">
                                No leads in queue.
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};
