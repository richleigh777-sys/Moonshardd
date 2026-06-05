import React, { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

interface AddressSelectionProps {
  onConfirm?: (address: any) => void;
}

const SHORT_NAME_ADDRESS_COMPONENT_TYPES = new Set(['street_number', 'administrative_area_level_1', 'postal_code']);

export const AddressSelection: React.FC<AddressSelectionProps> = ({ onConfirm }) => {
  const placesLib = useMapsLibrary('places');
  const locationInputRef = useRef<HTMLInputElement>(null);

  const [address, setAddress] = useState({
    location: '',
    apt: '',
    locality: '',
    administrative_area_level_1: '',
    postal_code: '',
    country: ''
  });

  useEffect(() => {
    if (!placesLib || !locationInputRef.current) return;

    const autocomplete = new placesLib.Autocomplete(locationInputRef.current, {
      fields: ['address_components', 'geometry', 'name'],
      types: ['address'],
    });

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) {
        window.alert(`No details available for input: '${place.name}'`);
        return;
      }
      
      const getComponentName = (componentType: string) => {
        for (const component of place.address_components || []) {
          if (component.types[0] === componentType) {
            return SHORT_NAME_ADDRESS_COMPONENT_TYPES.has(componentType) ?
                component.short_name :
                component.long_name;
          }
        }
        return '';
      };

      const getComponentText = (componentType: string) => {
        return (componentType === 'location') ?
            `${getComponentName('street_number')} ${getComponentName('route')}`.trim() :
            getComponentName(componentType);
      };

      setAddress(prev => ({
        ...prev,
        location: getComponentText('location'),
        locality: getComponentText('locality'),
        administrative_area_level_1: getComponentText('administrative_area_level_1'),
        postal_code: getComponentText('postal_code'),
        country: getComponentText('country'),
      }));
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [placesLib]);

  return (
    <div className="flex h-[500px] w-[300px]">
      <div className="bg-white box-border h-full w-full p-5 flex flex-col justify-around">
        <div>
          <img 
            className="relative top-[-5px]" 
            src="https://fonts.gstatic.com/s/i/googlematerialicons/location_pin/v5/24px.svg" 
            alt="" 
          />
          <span className="relative top-[-12px] font-sans font-medium text-black">Address Selection</span>
        </div>
        <input 
          type="text" 
          placeholder="Address" 
          ref={locationInputRef}
          value={address.location}
          onChange={(e) => setAddress({...address, location: e.target.value})}
          className="h-[30px] border-0 border-b border-black text-sm font-sans"
        />
        <input 
          type="text" 
          placeholder="Apt, Suite, etc (optional)"
          value={address.apt}
          onChange={(e) => setAddress({...address, apt: e.target.value})}
          className="h-[30px] border-0 border-b border-black text-sm font-sans"
        />
        <input 
          type="text" 
          placeholder="City" 
          value={address.locality}
          onChange={(e) => setAddress({...address, locality: e.target.value})}
          className="h-[30px] border-0 border-b border-black text-sm font-sans"
        />
        <div className="flex justify-between">
          <input 
            type="text" 
            placeholder="State/Province" 
            value={address.administrative_area_level_1}
            onChange={(e) => setAddress({...address, administrative_area_level_1: e.target.value})}
            className="w-[120px] h-[30px] border-0 border-b border-black text-sm font-sans"
          />
          <input 
            type="text" 
            placeholder="Zip/Postal code" 
            value={address.postal_code}
            onChange={(e) => setAddress({...address, postal_code: e.target.value})}
            className="w-[120px] h-[30px] border-0 border-b border-black text-sm font-sans"
          />
        </div>
        <input 
          type="text" 
          placeholder="Country" 
          value={address.country}
          onChange={(e) => setAddress({...address, country: e.target.value})}
          className="h-[30px] border-0 border-b border-black text-sm font-sans"
        />
        <button 
          onClick={() => onConfirm?.(address)}
          className="bg-blue-600 text-white rounded px-4 py-2 mt-4 hover:bg-blue-700 transition"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};
