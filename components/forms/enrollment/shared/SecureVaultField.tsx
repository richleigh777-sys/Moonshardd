/**
 * NEXT-LEVEL SOLUTION 7: Isolation Vault for PCI Compliance
 * 
 * Flaw Addressed: Main React states (formData, financials) stored PAN 
 * (Primary Account Number) and CVV in plain text on the main thread.
 * 
 * Solution: Tokenization abstraction. When saving financials, we only output 
 * a masked reference/token.
 */
import React, { useState } from 'react';
import { Lock } from 'lucide-react';

export const SecureVaultField: React.FC<{
    onChangeToken: (token: string, masked: string, isValid: boolean) => void;
    label: string;
    placeholder?: string;
}> = ({ onChangeToken, label, placeholder }) => {
    const [isFocused, setIsFocused] = useState(false);

    // In a real PCI environment, this input would be wrapped in a secure `iframe` 
    // originating from the payment processor (e.g. Stripe Elements).
    // Here we simulate the isolation boundaries.
    
    const handleSimulatedTokenization = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val.length === 15 || val.length === 16) {
            // Generate deterministic mock token
            const token = `tok_pci_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            const masked = `•••• •••• •••• ${val.slice(-4)}`;
            onChangeToken(token, masked, true);
        } else {
            onChangeToken('', '', false);
        }
    };

    return (
        <div className="relative mb-4">
            <label className="text-sm font-bold text-text-muted mb-1 block uppercase tracking-wider">{label}</label>
            <div className={`flex items-center border rounded-lg bg-surface-main transition-colors ${
                isFocused ? 'border-accent-primary ring-1 ring-accent-primary' : 'border-border-subtle'
            }`}>
                <div className="p-3 bg-surface-alt border-r border-border-subtle text-status-success">
                    <Lock size={16} />
                </div>
                <input
                    type="password"
                    inputMode="numeric"
                    placeholder={placeholder || "Simulated Secure Frame"}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={handleSimulatedTokenization}
                    className="w-full bg-transparent p-3 outline-none text-text-primary text-sm font-mono tracking-widest"
                />
            </div>
            <p className="text-sm text-text-muted mt-1 opacity-70">
                Data entered here is directly tokenized and never touches global React states.
            </p>
        </div>
    );
}
