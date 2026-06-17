
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
  
  const verticalStyles = `w-full px-1 py-3 flex flex-col items-center justify-center gap-1 transition-all duration-200 hover:translate-y-[1px] outline-none rounded-xl mb-2 group relative overflow-hidden ${
    isActive 
      ? 'bg-accent-primary/10 text-accent-primary shadow-[inset_0_0_10px_rgba(0,0,0,0.1)] border border-accent-primary/20' 
      : 'text-text-secondary hover:bg-surface-highlight hover:text-text-primary border border-transparent'
  }`;

  const horizontalStyles = `px-4 py-2 flex items-center gap-2 text-sm font-semibold transition-all duration-200 border-b-2 outline-none ${
    isActive 
      ? 'border-accent-primary text-accent-primary bg-accent-primary/5' 
      : 'border-transparent text-text-muted hover:text-text-primary hover:border-border-subtle hover:bg-surface-highlight/50'
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
          <span className={`${isActive ? 'text-accent-primary scale-110' : 'text-text-muted group-hover:text-accent-secondary'} transition-transform shrink-0`}>
              {icon}
          </span>
      )}
      {!isCollapsed && <span className={`${context.orientation === 'vertical' ? 'text-xs font-bold text-center whitespace-normal leading-tight opacity-90 mt-1 max-w-full px-0.5' : 'whitespace-nowrap'} overflow-hidden transition-opacity duration-200 tracking-wide`}>{children}</span>}
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
