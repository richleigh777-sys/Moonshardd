
import { Sale, User, AgentPerformance, AttendanceRecord, SystemConfig } from '../../types';
import { getAgentAvatar } from '../../constants';

/**
 * BRAVEHEART TRUTH ENGINE v6.0 (PRECISION TIME)
 */

// --- FORMATTERS ---

export const formatUSAPhone = (val: string) => {
  const x = val.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
  if (!x) return '';
  return !x[2] ? x[1] : `(${x[1]}) ${x[2]}${x[3] ? '-' + x[3] : ''}`;
};

export const parseFullAddress = (fullAddress: string) => {
    if (!fullAddress) return { street: '', apt: '', city: '', state: '', zip: '' };
    let street = fullAddress;
    let apt = '';
    let city = '';
    let state = '';
    let zip = '';

    // Extract Unit/Apt
    const aptMatch = fullAddress.match(/(?:\s+|,)\s*(?:Apt|Unit|Ste|Suite|#|Apartment)\s*\.?\s*([\w\d-]+)/i);
    if (aptMatch) {
       apt = aptMatch[1];
    }

    // Attempt to match US format: Street, City, State Zip
    const match = fullAddress.match(/(.*?)(?:,\s*|\s+)([^,]+?)(?:,\s*|\s+)([A-Za-z]{2})\s+(\d{5}(?:-\d{4})?)$/);
    if (match) {
        street = match[1].trim();
        city = match[2].trim();
        state = match[3].trim().toUpperCase();
        zip = match[4].trim();
    } else {
        // Fallback: match at least state and zip at the end
        const match2 = fullAddress.match(/(.*?)\s+([A-Za-z]{2})\s+(\d{5}(?:-\d{4})?)$/);
        if (match2) {
            zip = match2[3].trim();
            state = match2[2].trim().toUpperCase();
            const remaining = match2[1].trim();
            const cityMatch = remaining.match(/(.*?)(?:,\s*|\s+)([^,\s]+)$/);
            if (cityMatch) {
                street = cityMatch[1].trim();
                city = cityMatch[2].trim();
                // strip trailing comma from street
                street = street.replace(/,$/, '').trim();
            } else {
                street = remaining.replace(/,$/, '').trim();
            }
        }
    }

    return { street, apt, city, state, zip };
};

export const formatCardNumber = (val: string, cardType?: string) => {
  const digits = val.replace(/\D/g, '');
  if (cardType === 'Amex') {
    return digits.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3').trim();
  }
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};

export const formatExpiry = (val: string) => {
  const digits = val.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
};

export const formatCurrency = (amount: number, compact: boolean = false) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    notation: compact ? 'compact' : 'standard',
  }).format(amount);
};

export const formatDuration = (hours: number): string => {
    const totalSeconds = Math.floor(hours * 3600);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
};

export const formatTimer = (seconds: number): string => {
    const isNegative = seconds < 0;
    const absSeconds = Math.abs(seconds);
    const h = Math.floor(absSeconds / 3600);
    const m = Math.floor((absSeconds % 3600) / 60);
    const s = absSeconds % 60;
    
    const timeStr = `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return isNegative ? `-${timeStr}` : timeStr;
};

// --- TIME UTILITIES ---

export const getShiftSeconds = (start: string, end: string): number => {
    if (!start || !end) return 28800; // Default 8 hours
    
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    
    let totalMins = (endH * 60 + endM) - (startH * 60 + startM);
    
    // Handle overnight shifts (e.g. 22:00 to 06:00)
    if (totalMins < 0) totalMins += 24 * 60;
    
    return totalMins * 60;
};

// --- LOGISTICS UTILITIES ---

export const getTrackingLink = (trackingId: string): string => {
    const cleanId = trackingId.replace(/\s/g, '').toUpperCase();
    return `https://parcelsapp.com/en/tracking/${cleanId}`;
};

// --- CORE UTILITIES ---

export const preciseRound = (num: number, decimals: number = 2): number => {
    const factor = Math.pow(10, decimals);
    return Math.round((num + Number.EPSILON) * factor) / factor;
};

export const getCycleBoundaries = (config: SystemConfig, monthOffset: number = 0) => {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const year = target.getFullYear();
    const month = target.getMonth();
    
    const cutoffDay = config.cutoffDay1 || 15;
    
    const cycle1Start = new Date(year, month, 1, 0, 0, 0, 0).getTime();
    const cycle1End = new Date(year, month, cutoffDay, 23, 59, 59, 999).getTime();
    const cycle2Start = new Date(year, month, cutoffDay + 1, 0, 0, 0, 0).getTime();
    const cycle2End = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();
    
    return { cycle1Start, cycle1End, cycle2Start, cycle2End };
};

// --- CORE WORKFLOW CALCULATIONS ---

export const calculateWinRate = (approved: number, declined: number): number => {
    const totalResolved = approved + declined;
    if (totalResolved === 0) return 0;
    return Math.floor((approved / totalResolved) * 100);
};

export const getDailyHours = (
    agentId: string, 
    timestamp: number, 
    attendance: AttendanceRecord[],
    activeSessionSeconds: number = 0
): number => {
    if (attendance.length === 0 && activeSessionSeconds === 0) return 0;

    const d = new Date(timestamp);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayEnd = dayStart + 86400000;

    const historicalSeconds = attendance
        .filter(a => a.agentId === agentId && a.type === 'CLOCK_OUT' && a.timestamp >= dayStart && a.timestamp < dayEnd)
        .reduce((acc, curr) => acc + (Number(curr.duration) || 0), 0);
    
    const todayStart = new Date().setHours(0,0,0,0);
    const isTargetDayToday = dayStart === todayStart;
    
    // Combine historical logs with current live session
    const totalSeconds = isTargetDayToday ? (historicalSeconds + activeSessionSeconds) : historicalSeconds;
    
    return preciseRound(totalSeconds / 3600, 2);
};

export const calculateSalePayout = (sale: Sale, dailyHours: number, _config: SystemConfig, _agentCommissionRate?: number, _agentShippingDeduction?: number) => {
    // SERVER-AUTHORITATIVE ARCHITECTURE:
    // All math has been moved to secure backend API routes (server.ts)
    // The frontend now only displays what the server tells it.
    
    if ((sale as any).server_computed_payout) {
        return (sale as any).server_computed_payout;
    }

    // Fallback if server hasn't computed yet
    return {
        net: 0,
        commission: 0,
        commissionableBasis: 0,
        grossAmount: sale.amount || 0,
        spiff: 0,
        activeSpiffRule: null,
        missedSpiff: 0,
        shippingDeduction: 0,
        rateUsed: 0,
        qualifiedForSpiff: false,
        dailyHoursAtTimeOfSale: dailyHours
    };
};

export const generateLeaderboard = (
    sales: Sale[], 
    users: User[], 
    attendance: AttendanceRecord[], 
    systemConfig: SystemConfig,
    activeShifts?: Record<string, number>
): AgentPerformance[] => {
  const agents = users.filter(u => u.role === 'agent');
  const boundaries = getCycleBoundaries(systemConfig);

  const salesByAgent: Record<string, Sale[]> = {};
  for (const s of sales) {
      if (!salesByAgent[s.agentId]) {
          salesByAgent[s.agentId] = [];
      }
      salesByAgent[s.agentId].push(s);
  }

  const hoursMap = new Map<string, number>();
  attendance.forEach(att => {
      if (att.type === 'CLOCK_OUT') {
          const dateKey = new Date(att.timestamp).toDateString();
          const key = `${att.agentId}_${dateKey}`;
          const current = hoursMap.get(key) || 0;
          hoursMap.set(key, current + (att.duration || 0));
      }
  });

  const getCachedDailyHours = (agentId: string, timestamp: number, activeSeconds: number) => {
      const dateKey = new Date(timestamp).toDateString();
      const key = `${agentId}_${dateKey}`;
      const historicalSeconds = hoursMap.get(key) || 0;
      const isToday = new Date(timestamp).setHours(0,0,0,0) === new Date().setHours(0,0,0,0);
      const totalSeconds = isToday ? (historicalSeconds + activeSeconds) : historicalSeconds;
      return preciseRound(totalSeconds / 3600, 2);
  };

  const stats = agents.map(agent => {
    const agentSales = salesByAgent[agent.id] || [];
    let revenue = 0;
    let rev1 = 0;
    let rev2 = 0;
    let approvedCount = 0;
    let declinedCount = 0;
    let totalEarnings = 0;
    const activeSeconds = activeShifts?.[agent.id] || 0;

    for (const s of agentSales) {
        if (s.status === 'Approved') {
            const amt = Number(s.amount) || 0;
            revenue += amt;
            approvedCount++;
            if (s.timestamp >= boundaries.cycle1Start && s.timestamp <= boundaries.cycle1End) rev1 += amt;
            if (s.timestamp >= boundaries.cycle2Start && s.timestamp <= boundaries.cycle2End) rev2 += amt;
            
            const dailyHours = getCachedDailyHours(agent.id, s.timestamp, activeSeconds);
            const payout = calculateSalePayout(s, dailyHours, systemConfig, agent.commissionRate);
            totalEarnings += payout.net;
        } else if (s.status === 'Declined') {
            declinedCount++;
        }
    }

    return {
      agentId: agent.id,
      agentName: agent.name,
      name: agent.name,
      team: agent.team || 'Alpha',
      avatar: getAgentAvatar(agent.id),
      totalRevenue: revenue,
      revenue1stCutoff: rev1,
      revenue2ndCutoff: rev2,
      approvedCount,
      dealCount: approvedCount,
      declinedCount,
      vitalityScore: 0,
      pipelineVelocity: 0,
      rank: 0,
      isTopPerformer: false,
      isWallOfShame: revenue <= 0 && approvedCount === 0,
      hoursLogged: agent.dailyHours || 0,
      wlRatio: `${calculateWinRate(approvedCount, declinedCount)}%`,
      totalEarnings: preciseRound(totalEarnings),
      sales: agentSales,
      status: agent.currentStatus || 'offline'
    };
  });

  stats.sort((a, b) => b.totalRevenue - a.totalRevenue);

  return stats.map((stat, index) => ({
    ...stat,
    rank: index + 1,
    isTopPerformer: index < 3 && stat.totalRevenue > 0, 
  }));
};

export const generateTeamLeaderboard = (sales: Sale[], users: User[]): {teamName: string, totalRevenue: number, approvedCount: number, declinedCount: number, members: User[], agentCount: number}[] => {
    const teams = new Map<string, Sale[]>();
    
    sales.forEach(s => {
        const teamName = s.team || 'Unassigned';
        if (!teams.has(teamName)) teams.set(teamName, []);
        teams.get(teamName)!.push(s);
    });
    
    return Array.from(teams.entries()).map(([teamName, teamSales]) => ({
        teamName,
        totalRevenue: teamSales
            .filter(s => s.status === 'Approved')
            .reduce((sum, s) => sum + (Number(s.amount) || 0), 0),
        approvedCount: teamSales.filter(s => s.status === 'Approved').length,
        declinedCount: teamSales.filter(s => s.status === 'Declined').length,
        members: users.filter(u => u.team === teamName),
        agentCount: users.filter(u => u.team === teamName && u.role === 'agent').length,
    }));
};

export const getCutoffStatus = (cutoffDay: number) => {
    const now = new Date();
    const today = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    let targetDay = cutoffDay;
    let label = "Cycle 1";
    if (today > cutoffDay) {
      targetDay = daysInMonth;
      label = "Cycle 2";
    }

    const daysLeft = Math.max(0, targetDay - today);
    const progress = Math.min(100, (today / targetDay) * 100);
    const deadline = new Date(now.getFullYear(), now.getMonth(), targetDay).toLocaleDateString();

    return { daysLeft, progress, label, deadline };
};

export const getPhoneTime = (phone: string): string | null => {
    const areaCode = phone.replace(/\D/g, '').slice(0, 3);
    if (!areaCode) return null;
    const offsets: Record<string, number> = {
        '212': -5, '310': -8, '312': -6, '713': -6, '602': -7, '215': -5, '210': -6, '619': -8, '214': -6, '408': -8,
        '512': -6, '904': -5, '415': -8, '614': -5, '817': -6, '317': -5, '704': -5, '206': -8, '303': -7, '202': -5,
        '305': -5, '617': -5, '615': -6, '313': -5, '503': -8
    };
    const offset = offsets[areaCode];
    if (offset === undefined) return null;
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const targetTime = new Date(utc + (3600000 * offset));
    return targetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => 
        Object.values(obj).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const filterSalesByDate = (sales: Sale[], month: number, year: number, period: '1' | '2' | 'MTD' = 'MTD') => {
    return sales.filter(s => {
        const d = new Date(s.timestamp);
        const matchesMonth = d.getMonth() === month && d.getFullYear() === year;
        if (!matchesMonth) return false;
        if (period === 'MTD') return true;
        const day = d.getDate();
        if (period === '1') return day <= 15;
        if (period === '2') return day > 15;
        return true;
    });
};

export const validateLuhn = (cardNumber: string) => {
    const digits = cardNumber.replace(/\D/g, '');
    let sum = 0;
    let shouldDouble = false;
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits.charAt(i));
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return (sum % 10) === 0;
};

export const validateExpiry = (expiry: string) => {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
    const [m, y] = expiry.split('/').map(Number);
    if (m < 1 || m > 12) return false;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear() % 100;
    if (y < currentYear) return false;
    if (y === currentYear && m < currentMonth) return false;
    return true;
};

export const getRequiredCardLength = (type: string) => {
    return type === 'Amex' ? 15 : 16;
};
