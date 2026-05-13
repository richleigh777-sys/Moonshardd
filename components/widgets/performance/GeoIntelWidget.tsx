
import React, { useState } from 'react';
import { Card } from '../../ui/Base';
import { Globe, MapPin, Grid3X3, List } from 'lucide-react';

interface GeoIntelProps {
    geoData: {
        topStates: { name: string; count: number }[];
        topCities: { name: string; count: number }[];
        totalUniqueLocations: number;
    };
}

export const GeoIntelWidget: React.FC<GeoIntelProps> = ({ geoData }) => {
    const [geoMode, setGeoMode] = useState<'State' | 'City'>('State');
    const [viewType, setViewType] = useState<'list' | 'grid'>('list');
    
    // Safety check for empty or undefined data
    const safeData = geoData || { topStates: [], topCities: [], totalUniqueLocations: 0 };
    const dataList = geoMode === 'State' ? safeData.topStates : safeData.topCities;

    // Grid Map Visualization Helper
    // Mock grid of US states for visual effect
    const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];
    
    const getIntensityColor = (code: string) => {
        const item = safeData.topStates.find(s => s.name === code);
        const count = item?.count || 0;
        if (count > 10) return 'bg-indigo-600 border-indigo-500 text-white';
        if (count > 5) return 'bg-indigo-500/60 border-indigo-500/50 text-white';
        if (count > 0) return 'bg-indigo-500/20 border-indigo-500/30 text-indigo-200';
        return 'bg-surface-alt border-border-subtle text-text-muted/20';
    };

    return (
        <Card variant="panel" className="xl:col-span-4 p-0 flex flex-col bg-surface-main border-border-subtle shadow-soft relative overflow-hidden h-[280px]">
            <div className="p-5 border-b border-border-subtle bg-surface-alt/20 flex items-center justify-between backdrop-blur-md shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20 shadow-sm">
                        <Globe size={18} strokeWidth={2.5}/>
                    </div>
                    <div>
                        <h4 className="text-xs font-black uppercase text-text-primary tracking-widest">Geographic Intel</h4>
                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider">{safeData.totalUniqueLocations} Active Zones</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="flex gap-1 bg-surface-main p-1 rounded-lg border border-border-subtle shadow-inner">
                        <button onClick={() => setViewType('list')} className={`p-1.5 rounded transition-all ${viewType === 'list' ? 'bg-surface-alt text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}><List size={12}/></button>
                        <button onClick={() => setViewType('grid')} className={`p-1.5 rounded transition-all ${viewType === 'grid' ? 'bg-surface-alt text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}><Grid3X3 size={12}/></button>
                    </div>
                    <div className="flex gap-1 bg-surface-main p-1 rounded-lg border border-border-subtle shadow-inner">
                        <button onClick={() => setGeoMode('State')} className={`px-2 py-1 text-[8px] font-black uppercase rounded transition-all ${geoMode === 'State' ? 'bg-blue-500 text-white shadow-sm' : 'text-text-muted hover:bg-surface-alt'}`}>State</button>
                        <button onClick={() => setGeoMode('City')} className={`px-2 py-1 text-[8px] font-black uppercase rounded transition-all ${geoMode === 'City' ? 'bg-blue-500 text-white shadow-sm' : 'text-text-muted hover:bg-surface-alt'}`}>City</button>
                    </div>
                </div>
            </div>
            
            {/* CONTENT AREA */}
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar relative bg-surface-main">
                {(!dataList || dataList.length === 0) ? (
                    <div className="flex flex-col items-center justify-center h-full text-text-muted opacity-50 pb-4">
                        <MapPin size={24} className="mb-2"/>
                        <p className="text-[10px] font-black uppercase tracking-widest">No Location Data</p>
                    </div>
                ) : viewType === 'grid' && geoMode === 'State' ? (
                    <div className="grid grid-cols-10 gap-1.5 h-full content-start">
                        {US_STATES.map(code => (
                            <div 
                                key={code} 
                                className={`aspect-square rounded border flex items-center justify-center text-[8px] font-black cursor-default transition-all hover:scale-110 ${getIntensityColor(code)}`}
                                title={code}
                            >
                                {code}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-2.5">
                        {dataList.map((item, index) => {
                            const max = dataList[0]?.count || 1;
                            const percent = (item.count / max) * 100;
                            
                            return (
                                <div key={item.name || index} className="relative w-full flex items-center justify-between group">
                                    <div className="flex-1 mr-4">
                                        <div className="flex justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[9px] font-black w-4 text-center ${index < 3 ? 'text-accent-primary' : 'text-text-muted'}`}>
                                                    #{index + 1}
                                                </span>
                                                <span className="text-[10px] font-bold text-text-primary uppercase tracking-wide truncate">
                                                    {item.name || 'Unknown Zone'}
                                                </span>
                                            </div>
                                            <span className="text-[9px] font-mono font-bold text-text-secondary">
                                                {item.count}
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-surface-alt rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-blue-500 rounded-full" 
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Card>
    );
};
