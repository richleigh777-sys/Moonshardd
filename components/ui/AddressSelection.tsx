import React, { useState } from 'react';

interface AddressSelectionProps {
  onConfirm?: (address: any) => void;
}

export const AddressSelection: React.FC<AddressSelectionProps> = ({ onConfirm }) => {
  const [address, setAddress] = useState({
    location: '',
    apt: '',
    locality: '',
    administrative_area_level_1: '',
    postal_code: '',
    country: ''
  });

  return (
    <div className="flex h-[500px] w-[300px]">
      <div className="bg-surface-main box-border h-full w-full p-5 flex flex-col justify-around">
        <div>
          <img 
            className="relative top-[-5px]" 
            src="https://fonts.gstatic.com/s/i/googlematerialicons/location_pin/v5/24px.svg" 
            alt="" 
          />
          <span className="relative top-[-12px] font-sans font-medium text-text-primary">Address Selection</span>
        </div>
        <input 
          type="text" 
          placeholder="Address" 
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
