 

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCRM } from '../hooks/useCRM';
import { generateLeaderboard } from '../views/utils/crmLogic';
import { CRMPerformanceContext } from './CRMPerformanceContextCore';

export const CRMPerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const crm = useCRM();

    const [isClockedIn, setIsClockedIn] = useState(() => localStorage.getItem('isClockedIn') === 'true');
    const [currentSessionStart, setCurrentSessionStart] = useState<number | null>(() => {
        const saved = localStorage.getItem('sessionStart');
        return saved ? parseInt(saved) : null;
    });
    const [shiftDuration, setShiftDuration] = useState(0);

    // Sync state with cross-device database records
    useEffect(() => {
        if (!currentUser) {
            if (isClockedIn) setIsClockedIn(false);
            if (currentSessionStart) setCurrentSessionStart(null);
            if (shiftDuration > 0) setShiftDuration(0);
            return;
        }

        const todayStart = new Date().setHours(0,0,0,0);
        const myAttendanceToday = crm.attendance
            .filter(a => a.agentId === currentUser.id && a.timestamp >= todayStart && (a.type === 'CLOCK_IN' || a.type === 'CLOCK_OUT'))
            .sort((a, b) => b.timestamp - a.timestamp);

        if (myAttendanceToday.length > 0) {
            const latest = myAttendanceToday[0];
            if (latest.type === 'CLOCK_IN' && !isClockedIn) {
                setIsClockedIn(true);
                setCurrentSessionStart(latest.timestamp);
                localStorage.setItem('isClockedIn', 'true');
                localStorage.setItem('sessionStart', latest.timestamp.toString());
            } else if (latest.type === 'CLOCK_OUT' && isClockedIn) {
                setIsClockedIn(false);
                setCurrentSessionStart(null);
                setShiftDuration(0);
                localStorage.removeItem('isClockedIn');
                localStorage.removeItem('sessionStart');
            }
        }
         
    }, [currentUser, crm.attendance]);

    useEffect(() => {
        let interval: any;
        if (isClockedIn && currentSessionStart) {
            interval = setInterval(() => {
                const nextDuration = Math.floor((Date.now() - currentSessionStart) / 1000);
                setShiftDuration(prev => Math.abs(prev - nextDuration) < 2 ? prev : nextDuration);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isClockedIn, currentSessionStart]);

    const clockIn = useCallback(async () => {
        if (!currentUser) return;
        setIsClockedIn(true);
        const now = Date.now();
        setCurrentSessionStart(now);
        localStorage.setItem('isClockedIn', 'true');
        localStorage.setItem('sessionStart', now.toString());
        await crm.logAttendance('CLOCK_IN');
        await crm.logAudit({ action: 'CLOCK_IN', details: 'Shift Started', module: 'AUTH' });
    }, [currentUser, crm]);

    const clockOut = useCallback(async () => {
        if (!currentUser || !currentSessionStart) return;
        
        // Compute exact duration right now to prevent tick skew
        const finalDuration = Math.floor((Date.now() - currentSessionStart) / 1000);
        
        setIsClockedIn(false);
        await crm.logAttendance('CLOCK_OUT', 'Shift End', finalDuration);
        await crm.logAudit({ action: 'CLOCK_OUT', details: `Shift Ended. Duration: ${Math.round(finalDuration / 60)}m`, module: 'AUTH' });
        
        setCurrentSessionStart(null);
        setShiftDuration(0);
        localStorage.removeItem('isClockedIn');
        localStorage.removeItem('sessionStart');
    }, [currentUser, crm, currentSessionStart]);

    const performance = useMemo(() => {
        if (!crm.users.length) return { leaderboard: [], topPerformers: [], wallOfShame: [], myStats: null };
        
        const activeShifts: Record<string, number> = {};
        if (currentUser && isClockedIn) {
            activeShifts[currentUser.id] = shiftDuration;
        }

        const fullList = generateLeaderboard(crm.sales, crm.users, crm.attendance, crm.systemConfig, activeShifts);
        
        return {
            leaderboard: fullList,
            topPerformers: fullList.filter(a => a.isTopPerformer),
            wallOfShame: fullList.filter(a => a.isWallOfShame),
            myStats: currentUser ? fullList.find(a => a.agentId === currentUser.id) || null : null
        };
    }, [crm.sales, crm.users, crm.attendance, currentUser, crm.systemConfig, isClockedIn, shiftDuration]);

    const value = useMemo(() => ({
        ...performance,
        shiftDuration,
        isClockedIn,
        clockIn,
        clockOut
    }), [performance, shiftDuration, isClockedIn, clockIn, clockOut]);

    return (
        <CRMPerformanceContext.Provider value={value}>
            {children}
        </CRMPerformanceContext.Provider>
    );
};
