
import React from 'react';

interface SecurityLayoutProps {
  children: React.ReactNode;
}

export const SecurityLayout: React.FC<SecurityLayoutProps> = ({ children }) => {
  return (
    <div className="relative h-full w-full print:hidden cursor-default overflow-hidden flex flex-col bg-[#F5F8FA]">
      {children}
    </div>
  );
};
