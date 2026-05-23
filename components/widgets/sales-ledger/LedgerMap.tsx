/// <reference types="google.maps" />
import React, { useEffect, useState, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Sale } from '../../../types';
import { Card } from '../../ui/Base';

interface LedgerMapProps {
    sales: Sale[];
    onAction?: (sale: Sale, action: string, payload?: any) => void;
}

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

const MapContent = ({ sales, onAction }: { sales: Sale[], onAction?: (sale: Sale, action: string, payload?: any) => void }) => {
    const map = useMap();
    const geocodingLib = useMapsLibrary('geocoding');
    const [markers, setMarkers] = useState<{ id: string, pos: google.maps.LatLngLiteral, sale: Sale }[]>([]);

    useEffect(() => {
        if (!geocodingLib || !sales.length) return;
        
        let isActive = true;
        const geocoder = new geocodingLib.Geocoder();
        const results: { id: string, pos: google.maps.LatLngLiteral, sale: Sale }[] = [];

        // Batch geocoding cautiously to respect limits (for demonstration, just first 10 distinct addresses to avoid spam)
        const geocodeSales = async () => {
            const seen = new Set<string>();
            let count = 0;
            
            for (const s of sales) {
                if (!s.address || count >= 20) continue; // Rate limit safety in pure client
                
                // Extremely simple dedup
                if (seen.has(s.address)) continue;
                seen.add(s.address);

                try {
                    const res = await new Promise<google.maps.GeocoderResponse>((resolve, reject) => {
                        geocoder.geocode({ address: s.address }, (results, status) => {
                            if (status === 'OK' && results) resolve({ results });
                            else reject(status);
                        });
                    });
                    
                    if (res.results[0] && isActive) {
                        results.push({
                            id: s.id,
                            pos: { lat: res.results[0].geometry.location.lat(), lng: res.results[0].geometry.location.lng() },
                            sale: s
                        });
                        // update live
                        setMarkers([...results]);
                    }
                } catch (e) {
                    console.error('Geocode error', e);
                }
                count++;
                
                // Sleep slightly to avoid OVER_QUERY_LIMIT
                await new Promise(r => setTimeout(r, 250));
            }
        };

        geocodeSales();

        return () => { isActive = false; };
    }, [geocodingLib, sales]);

    if (!sales.length) {
        return <div className="absolute inset-0 flex items-center justify-center text-text-muted bg-surface-main">No deals available to map.</div>;
    }

    return (
        <>
            {markers.map(m => {
                const isApproved = m.sale.status === 'Approved';
                return (
                    <AdvancedMarker 
                        key={m.id} 
                        position={m.pos} 
                        title={`${m.sale.customer} - $${m.sale.amount}`}
                        onClick={() => onAction && onAction(m.sale, 'view_profile')}
                    >
                        <Pin 
                            background={isApproved ? '#10B981' : '#F59E0B'} 
                            glyphColor="#fff" 
                            borderColor={isApproved ? '#047857' : '#B45309'}
                        />
                    </AdvancedMarker>
                );
            })}
        </>
    );
};

export const LedgerMap: React.FC<LedgerMapProps> = ({ sales, onAction }) => {
    const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

    return (
        <div className="w-full h-full relative bg-surface-main flex flex-col items-center justify-center">
            {!hasValidKey ? (
                <div className="text-center max-w-md p-6 bg-surface-alt rounded-2xl border border-border-subtle shadow-xl">
                    <h2 className="text-lg font-bold text-text-primary mb-2">Maps Initialization Required</h2>
                    <p className="text-sm text-text-muted mb-4 leading-relaxed">
                        To visualize customer deals on the geographic terminal, please inject a Google Maps Platform key into the environment variables.
                    </p>
                    <div className="text-left text-xs bg-surface-main p-4 rounded-xl font-mono text-text-secondary border border-border-subtle">
                        <p>1. Open Settings (⚙️ Top Right)</p>
                        <p>2. Select Secrets</p>
                        <p>3. Add <span className="text-accent-primary">GOOGLE_MAPS_PLATFORM_KEY</span></p>
                        <p>4. Save to recompile.</p>
                    </div>
                </div>
            ) : (
                <APIProvider apiKey={API_KEY} version="weekly">
                    <Map
                        defaultCenter={{ lat: 39.8283, lng: -98.5795 }} // Center of US roughly
                        defaultZoom={4}
                        mapId="CRM_DEALS_MAP"
                        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                        style={{ width: '100%', height: '100%' }}
                        disableDefaultUI={true}
                    >
                        <MapContent sales={sales} onAction={onAction} />
                    </Map>
                </APIProvider>
            )}
        </div>
    );
};
