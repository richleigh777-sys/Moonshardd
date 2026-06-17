import React from 'react';

export const AutoScaler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // We removed the forced scaling because it prevents native browser zooming 
    // and causes the layout to shrink when the user tries to zoom in.
    // The CRM should rely on native scrolling and CSS breakpoints instead.
    return (
        <div className="w-full h-full min-h-screen relative max-w-[100vw] overflow-x-hidden">
            {children}
        </div>
    );
};

