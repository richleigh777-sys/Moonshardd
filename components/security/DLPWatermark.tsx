import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export const DLPWatermark = () => {
    const { currentUser } = useAuth();
    
    // Only apply to non-admins
    if (!currentUser || currentUser.level >= 10) return null;

    // Create a repeating SVG background of the user's ID/Email
    const watermarkText = `${currentUser.name} (${currentUser.email}) - Confidential - IP Logged`;
    const svgStr = `
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="150" viewBox="0 0 400 150">
            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
                  fill="rgba(0, 0, 0, 0.03)" font-size="14" font-family="sans-serif" 
                  transform="rotate(-25, 200, 75)" style="pointer-events: none; user-select: none;">
                ${watermarkText}
            </text>
        </svg>
    `;
    
    const bgUrl = `url("data:image/svg+xml;base64,${btoa(svgStr)}")`;

    return (
        <div 
            className="fixed inset-0 pointer-events-none z-[9998]"
            style={{ 
                backgroundImage: bgUrl,
                backgroundRepeat: 'repeat',
                backgroundSize: '400px 150px'
            }}
        />
    );
};
