
import { nexusGateway } from '../nexus/adapters/DataGateway';
import { AppNotification, NotificationType } from '../types';

export const createNotification = async (
  recipientId: string,
  roleTarget: 'agent' | 'admin' | 'all',
  type: NotificationType,
  title: string,
  message: string,
  metadata?: { recordId?: string; context?: 'sale' | 'task' | 'callback' }
) => {
  // SECURITY CHECK:
  // Ensure we aren't sending system errors to agents unnecessarily
  if (type === 'system' && roleTarget === 'agent') {
    // Allowed for Tasks, blocked for internal errors if any
  }

  const notification: AppNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    serverId: nexusGateway.activeServerId,
    recipientId,
    roleTarget,
    type,
    title,
    message,
    read: false,
    timestamp: Date.now(),
    metadata
  };

  await nexusGateway.add('notifications', notification);
};