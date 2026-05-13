
import React, { createContext, useContext, useState } from 'react';
import { sfx } from '../../lib/soundService';

type TabsContextType = {
  activeTab: string;
  setActiveTab: (id: string) => void;
  orientation: 'horizontal' | 'vertical';
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const Tabs: React.FC<TabsProps> = ({ defaultValue, value, onValueChange, children, className = "", orientation = 'horizontal' }) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultValue || '');

  const isControlled = value !== undefined;
  const activeTab = isControlled ? value : internalActiveTab;

  const setActiveTab = (id: string) => {
    if (onValueChange) {
      onValueChange(id);
    }
    if (!isControlled) {
      setInternalActiveTab(id);
    }
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, orientation }}>
      <div className={`${orientation === 'vertical' ? 'flex w-full h-full' : 'flex flex-col w-full'} ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

interface TabListProps {
  children?: React.ReactNode;
  className?: string;
  isCollapsed?: boolean;
}

export const TabList: React.FC<TabListProps> = ({ children, className = "", isCollapsed }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabList must be used within Tabs");

  const baseStyle = context.orientation === 'vertical' 
    ? "flex flex-col space-y-2 w-full" 
    : "flex items-center space-x-2 border-b border-border-subtle w-full";

  return (
    <div className={`${baseStyle} ${className}`}>
      {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
             // Avoid passing non-DOM props to HTML elements
             if (typeof child.type === 'string') {
                 return child;
             }
             return React.cloneElement(child as React.ReactElement<any>, { isCollapsed });
          }
          return child;
      })}
    </div>
  );
};

interface TabTriggerProps {
  value: string;
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  isCollapsed?: boolean; 
}

export const TabTrigger: React.FC<TabTriggerProps> = ({ value, children, className = "", icon, title, isCollapsed }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabTrigger must be used within Tabs");

  const isActive = context.activeTab === value;
  
  const verticalStyles = `w-full ${isCollapsed ? 'px-0 justify-center' : 'px-3 justify-start'} py-1.5 flex items-center gap-2.5 text-[11px] font-bold transition-all duration-200 hover:translate-x-1 active:scale-95 rounded-lg mb-0.5 ${
    isActive 
      ? 'bg-accent-primary/10 text-accent-primary shadow-sm shadow-accent-primary/10 border border-accent-primary/20' 
      : 'text-white/70 hover:bg-white/5 hover:text-white border border-transparent'
  }`;

  const horizontalStyles = `px-3 py-1.5 flex items-center gap-2 text-[11px] font-bold transition-all duration-200 border-b-2 active:scale-95 ${
    isActive 
      ? 'border-accent-primary text-accent-primary' 
      : 'border-transparent text-text-muted hover:text-text-primary hover:border-border-subtle'
  }`;

  const handleClick = () => {
      sfx.playClick();
      context.setActiveTab(value);
  };

  return (
    <button 
      onClick={handleClick}
      onMouseEnter={() => sfx.playHover()}
      className={`${context.orientation === 'vertical' ? verticalStyles : horizontalStyles} ${className} outline-none group`}
      title={title || (typeof children === 'string' ? children : '')}
    >
      {icon && (
          <span className={`${isActive ? (context.orientation === 'vertical' ? 'text-accent-primary' : 'text-accent-primary') + ' scale-110' : (context.orientation === 'vertical' ? 'text-white/50 group-hover:text-accent-secondary' : 'text-text-muted group-hover:text-text-primary')} transition-transform shrink-0`}>
              {icon}
          </span>
      )}
      {!isCollapsed && <span className="whitespace-nowrap overflow-hidden transition-opacity duration-200 tracking-wide">{children}</span>}
    </button>
  );
};

interface TabContentProps {
  value: string;
  children?: React.ReactNode;
  className?: string;
}

export const TabContent: React.FC<TabContentProps> = ({ value, children, className = "" }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabContent must be used within Tabs");

  if (context.activeTab !== value) return null;

  return (
    <div className={`w-full ${className} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      {children}
    </div>
  );
};
