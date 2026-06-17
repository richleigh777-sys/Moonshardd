import React, { useState } from 'react';
import { Mail, Calendar, User, Phone, MapPin, AlertCircle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export function BiographicalSector({ formData, handleIdentityChange, handleDobChange, handleAgeChange, autoFillFromCustomer }: any) {
  
  const handleFirstNamePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      const paste = e.clipboardData.getData('text');
      const parts = paste.trim().split(' ');
      if (parts.length > 1) {
          e.preventDefault();
          handleIdentityChange({ target: { name: 'firstName', value: parts[0] } });
          const lastName = parts.slice(1).join(' ');
          handleIdentityChange({ target: { name: 'lastName', value: lastName } });
      }
  };

  // Simple email regex for visual validation
  const isEmailValid = !formData.email || /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email);

  const parsedDate = formData.dob ? new Date(formData.dob + 'T12:00:00Z') : null;

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">First Name</label>
                <input 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleIdentityChange}
                    onPaste={handleFirstNamePaste}
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
                <div className="flex justify-between items-center ml-1">
                    <label className="text-sm font-medium text-text-secondary">Email Address</label>
                    {!isEmailValid && <span className="text-sm text-rose-400 flex items-center gap-1"><AlertCircle size={12}/> Invalid email</span>}
                </div>
                <input 
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleIdentityChange}
                    placeholder="jane@example.com"
                    className={`w-full bg-surface-alt/50 border ${!isEmailValid ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : 'border-white/5 focus:border-white focus:ring-white'} rounded-2xl px-5 py-4 text-lg font-medium text-white placeholder-text-muted outline-none transition-all focus:bg-surface-alt focus:ring-1 shadow-sm`}
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Phone Number</label>
                <input 
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                        // Let handleIdentityChange do the formatting from useEnrollment
                        handleIdentityChange(e);
                    }}
                    placeholder="(555) 000-0000"
                    className="w-full bg-surface-alt/50 border border-white/5 rounded-2xl px-5 py-4 text-lg font-medium text-white placeholder-text-muted outline-none transition-all focus:border-white focus:bg-surface-alt focus:ring-1 focus:ring-white shadow-sm"
                />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Age</label>
                <input 
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleAgeChange(e.target.value)}
                    placeholder="e.g. 34"
                    className="w-full bg-surface-alt/50 border border-white/5 rounded-2xl px-5 py-4 text-lg font-medium text-white placeholder-text-muted outline-none transition-all focus:border-white focus:bg-surface-alt focus:ring-1 focus:ring-white shadow-sm"
                />
            </div>
            <div className="space-y-2 relative">
                <label className="text-sm font-medium text-text-secondary ml-1">Date of Birth</label>
                <div className="custom-datepicker-wrapper w-full">
                     <DatePicker
                        selected={parsedDate}
                        onChange={(date: Date | null) => {
                            if (date) {
                                const y = date.getFullYear();
                                const m = String(date.getMonth() + 1).padStart(2, '0');
                                const d = String(date.getDate()).padStart(2, '0');
                                handleDobChange(y + '-' + m + '-' + d);
                            } else {
                                handleDobChange('');
                            }
                        }}
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        placeholderText="MM/DD/YYYY"
                        className="w-full bg-surface-alt/50 border border-white/5 rounded-2xl px-5 py-4 text-lg font-medium text-white placeholder-text-muted outline-none transition-all focus:border-white focus:bg-surface-alt focus:ring-1 focus:ring-white shadow-sm"
                    />
                </div>
            </div>
        </div>

    </div>
  );
}
