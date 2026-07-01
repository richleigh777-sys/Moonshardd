import React, { useEffect, useState } from 'react';
import { SmartNotification as SmartNotificationType } from '../../types/uiState';

interface SmartNotificationProps {
  notification: SmartNotificationType;
  onDismiss: (id: string) => void;
}

export const SmartNotification: React.FC<SmartNotificationProps> = ({
  notification,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss(notification.id);
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.duration, notification.id, onDismiss]);

  if (!isVisible) return null;

  const bgColor = {
    'action-required': 'bg-red-900',
    'milestone': 'bg-green-900',
    'motivational': 'bg-blue-900',
    'alert': 'bg-yellow-900',
  }[notification.type];

  const borderColor = {
    'action-required': 'border-red-700',
    'milestone': 'border-green-700',
    'motivational': 'border-blue-700',
    'alert': 'border-yellow-700',
  }[notification.type];

  return (
    <div className={`${bgColor} ${borderColor} border rounded-lg p-4 mb-3 shadow-lg`}>
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-bold text-white">{notification.title}</h4>
          <p className="text-sm text-text-primary mt-1">{notification.body}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            onDismiss(notification.id);
          }}
          className="text-text-primary hover:text-white ml-3"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
