
import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, AlarmClock } from 'lucide-react';

interface CountdownBadgeProps {
  targetTimestamp: number;
}

export const CountdownBadge: React.FC<CountdownBadgeProps> = ({ targetTimestamp }) => {
  const [timeLeft, setTimeLeft] = useState<number>(() => targetTimestamp - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(targetTimestamp - Date.now());
    }, 1000); // Update every second
    return () => clearInterval(interval);
  }, [targetTimestamp]);

  const formatDelta = (ms: number) => {
    const absMs = Math.abs(ms);
    const h = Math.floor(absMs / 3600000);
    const m = Math.floor((absMs % 3600000) / 60000);
    const s = Math.floor((absMs % 60000) / 1000);
    return `${h}h ${m}m ${s}s`;
  };

  const isOverdue = timeLeft < 0;
  const isCritical = timeLeft > 0 && timeLeft < 600000; // < 10 mins
  
  // Styles
  const overdueStyle = "bg-status-error text-surface-main animate-pulse border-status-error shadow-lg shadow-status-error/20";
  const criticalStyle = "bg-status-warning text-surface-main border-status-warning shadow-lg shadow-status-warning/20 animate-pulse";
  const normalStyle = "bg-surface-alt text-text-muted border-border-subtle";
  const futureStyle = "bg-accent-primary/10 text-accent-primary border-accent-primary/20";

  let currentStyle = normalStyle;
  let icon = <Clock size={12} />;

  if (isOverdue) {
      currentStyle = overdueStyle;
      icon = <AlertTriangle size={12} />;
  } else if (isCritical) {
      currentStyle = criticalStyle;
      icon = <AlarmClock size={12} />;
  } else if (timeLeft < 3600000) {
      currentStyle = "bg-status-warning/10 text-status-warning border-status-warning/30";
  } else {
      currentStyle = futureStyle;
  }

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider transition-colors ${currentStyle}`}>
      {icon}
      <span>
        {isOverdue ? `Overdue +${formatDelta(timeLeft)}` : `Due in ${formatDelta(timeLeft)}`}
      </span>
    </div>
  );
};
