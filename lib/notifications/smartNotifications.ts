import { SmartNotification } from '../../types/uiState';

export class SmartNotificationService {
  static callbackDue(customerName: string, time: string): SmartNotification {
    return {
      id: `callback-${Date.now()}`,
      type: 'action-required',
      title: '📞 Callback Required',
      body: `${customerName} - due at ${time}`,
      priority: 'high',
      timestamp: Date.now(),
      read: false,
      sound: 'alert',
      duration: 10000,
    };
  }

  static saleApproved(amount: number, commission: number): SmartNotification {
    return {
      id: `approved-${Date.now()}`,
      type: 'milestone',
      title: '✅ Sale Approved!',
      body: `+$${commission} commission earned!`,
      priority: 'high',
      timestamp: Date.now(),
      read: false,
      sound: 'coin-drop',
      duration: 5000,
    };
  }

  static goalReached(): SmartNotification {
    return {
      id: `goal-${Date.now()}`,
      type: 'milestone',
      title: '🏆 Goal Reached!',
      body: "You've hit today's sales target!",
      priority: 'high',
      timestamp: Date.now(),
      read: false,
      sound: 'success',
      duration: 7000,
    };
  }

  static motivationalReminder(message: string): SmartNotification {
    return {
      id: `motivation-${Date.now()}`,
      type: 'motivational',
      title: '💪 Keep Going!',
      body: message,
      priority: 'medium',
      timestamp: Date.now(),
      read: false,
      duration: 5000,
    };
  }

  static warning(message: string): SmartNotification {
    return {
      id: `warning-${Date.now()}`,
      type: 'alert',
      title: '⚠️ Heads Up',
      body: message,
      priority: 'medium',
      timestamp: Date.now(),
      read: false,
      duration: 8000,
    };
  }
}

export function shouldSendNotification(
  event: any,
  userPreferences: any
): boolean {
  const allowedTypes = [
    'callback-due',
    'sale-approved',
    'goal-reached',
    'high-value-lead',
  ];

  if (!allowedTypes.includes(event.type)) return false;

  const lastNotificationTime = userPreferences.lastNotificationTime || 0;
  if (Date.now() - lastNotificationTime < 5 * 60 * 1000) {
    return false;
  }

  return true;
}

export async function playNotificationSound(
  sound: 'coin-drop' | 'success' | 'alert' | 'none'
): Promise<void> {
  if (sound === 'none') return;

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

  const sounds: Record<string, () => void> = {
    'coin-drop': () => playCoinSound(audioContext),
    'success': () => playSuccessSound(audioContext),
    'alert': () => playAlertSound(audioContext),
  };

  sounds[sound]?.();
}

function playCoinSound(ctx: AudioContext): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

  osc.start(now);
  osc.stop(now + 0.1);
}

function playSuccessSound(ctx: AudioContext): void {
  const now = ctx.currentTime;
  for (let i = 0; i < 2; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(1000 + i * 200, now + i * 0.1);
    gain.gain.setValueAtTime(0.3, now + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.1);

    osc.start(now + i * 0.1);
    osc.stop(now + i * 0.1 + 0.1);
  }
}

function playAlertSound(ctx: AudioContext): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.2);

  gain.gain.setValueAtTime(0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

  osc.start(now);
  osc.stop(now + 0.2);
}
