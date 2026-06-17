const fs = require('fs');

const content = `import React from 'react';
import { Mail, Calendar, User, Phone, MapPin } from 'lucide-react';

export function BiographicalSector({ formData, handleIdentityChange, handleDobChange, handleAgeChange, autoFillFromCustomer }: any) {
  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">First Name</label>
                <input 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleIdentityChange}
                    placeholder="e.g. Jane"
                    className="w-full bg-surface-alt/50 border border-white/5 rounded-2xl px-5 py-4 text-lg font-medium text-white placeholder-text-muted outline-none transition-all focus:border-white focus:bg-surface-alt focus:ring-1 focus:ring-white shadow-sm"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Last Name</label>
                <input 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleIdentityChange}
                    placeholder="e.g. Doe"
                    className="w-full bg-surface-alt/50 border border-white/5 rounded-2xl px-5 py-4 text-lg font-medium text-white placeholder-text-muted outline-none transition-all focus:border-white focus:bg-surface-alt focus:ring-1 focus:ring-white shadow-sm"
                />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Email Address</label>
                <input 
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleIdentityChange}
                    placeholder="jane@example.com"
                    className="w-full bg-surface-alt/50 border border-white/5 rounded-2xl px-5 py-4 text-lg font-medium text-white placeholder-text-muted outline-none transition-all focus:border-white focus:bg-surface-alt focus:ring-1 focus:ring-white shadow-sm"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Phone Number</label>
                <input 
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleIdentityChange}
                    placeholder="(555) 000-0000"
                    className="w-full bg-surface-alt/50 border border-white/5 rounded-2xl px-5 py-4 text-lg font-medium text-white placeholder-text-muted outline-none transition-all focus:border-white focus:bg-surface-alt focus:ring-1 focus:ring-white shadow-sm"
                />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Date of Birth</label>
                <input 
                    type="date"
                    value={formData.dob}
                    onChange={handleDobChange}
                    className="w-full bg-surface-alt/50 border border-white/5 rounded-2xl px-5 py-4 text-lg font-medium text-white placeholder-text-muted outline-none transition-all focus:border-white focus:bg-surface-alt focus:ring-1 focus:ring-white shadow-sm"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Age</label>
                <input 
                    type="number"
                    value={formData.age}
                    onChange={handleAgeChange}
                    placeholder="e.g. 34"
                    className="w-full bg-surface-alt/50 border border-white/5 rounded-2xl px-5 py-4 text-lg font-medium text-white placeholder-text-muted outline-none transition-all focus:border-white focus:bg-surface-alt focus:ring-1 focus:ring-white shadow-sm"
                />
            </div>
        </div>

    </div>
  );
}`;

fs.writeFileSync('./components/forms/enrollment/sectors/BiographicalSector.tsx', content);
console.log('Bio done');
