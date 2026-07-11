import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useCRM } from '../../../hooks/useCRM';
import { useSystem } from '../../../hooks/useSystem';
import { sfx } from '../../../lib/soundService';
import { triggerLeadStagnationProtocol } from '../../../lib/protocolService';
import { realtimeClient } from '../../../lib/realtimeClient';

export const useAgentPortalLogic = () => {
    const { currentUser } = useAuth();
    const { 
        sales, notes, deleteNote, systemConfig, attendance, 
        notifications, clearNotification 
    } = useCRM();
    const { setToast } = useSystem();

    const [view, setView] = useState('action');
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [showCalculator, setShowCalculator] = useState(false);
    const [showScratchpad, setShowScratchpad] = useState(false);
    const [showTimeSheet, setShowTimeSheet] = useState(false);

    useEffect(() => {
        const unsubscribe = realtimeClient.subscribe((event) => {
            if (event.type === 'FLASH_DIRECTIVE') {
                sfx.playError(); // Use error sound for urgent alert
                setToast({
                    title: 'FLASH DIRECTIVE',
                    message: event.payload?.message || 'Emergency Broadcast Received',
                    type: 'error'
                });
            }
        });
        return unsubscribe;
    }, [setToast]);

    const allowedWorkspaces = useMemo(() => {
        return ['action', 'money', 'settings'];
    }, [systemConfig.permissions]);

    const isAllowed = useCallback((id: string) => allowedWorkspaces.includes(id), [allowedWorkspaces]);

    useEffect(() => {
        if (!isAllowed(view)) {
            // Use timeout to avoid synchronous state update warning
            const t = setTimeout(() => setView('action'), 0);
            return () => clearTimeout(t);
        }
    }, [allowedWorkspaces, view, isAllowed]);

    useEffect(() => {
        const handleNav = (e: Event) => {
            const customE = e as CustomEvent;
            if (customE.type === 'NAVIGATE') {
                const target = customE.detail;
                if (target && isAllowed(target)) {
                    setView(target);
                }
            }
            if (customE.type === 'OPEN_SCRATCHPAD') {
                setShowScratchpad(true);
            }
        };
        
        document.addEventListener('NAVIGATE', handleNav);
        document.addEventListener('OPEN_SCRATCHPAD', handleNav);
        return () => {
            document.removeEventListener('NAVIGATE', handleNav);
            document.removeEventListener('OPEN_SCRATCHPAD', handleNav);
        };
    }, [isAllowed]);

    const mySales = useMemo(() => sales.filter(s => s.agentId === currentUser?.id), [sales, currentUser?.id]);
    const myNotes = useMemo(() => notes.filter(n => n.agentId === currentUser?.id), [notes, currentUser?.id]);

    const notifiedIds = useRef<Set<string>>(new Set());

    // Lead Watchdog: Auto-notify when callback or protocol is due
    useEffect(() => {
        if (!currentUser) return;
        
        const checkCallbacks = () => {
            const now = Date.now();
            const FIVE_MINS = 300000;
            
            myNotes.forEach(note => {
                // Check for stagnation
                triggerLeadStagnationProtocol(note);

                if ((note.type === 'callback' || note.type === 'protocol') && note.reminderAt) {
                    if (now >= note.reminderAt && (now - note.reminderAt < FIVE_MINS) && !notifiedIds.current.has(note.id!)) { 
                        setToast({
                            title: `ACTION REQUIRED: ${note.subtype?.toUpperCase() || 'CALLBACK'}`,
                            message: `${note.customerName} - ${note.content.split(':')[1] || note.content}`,
                            type: note.priority === 'High' ? 'warning' : 'info'
                        });
                        notifiedIds.current.add(note.id!);
                        sfx.playSubmit(); // Play sound for incoming protocol
                    }
                }
            });
        };

        const interval = setInterval(checkCallbacks, 60000); 
        return () => clearInterval(interval);
    }, [myNotes, currentUser, setToast]);

    return {
        currentUser, sales, notes, deleteNote, attendance, notifications, clearNotification,
        view, setView, isFocusMode, setIsFocusMode, showCalculator, setShowCalculator,
        showScratchpad, setShowScratchpad, showTimeSheet, setShowTimeSheet,
        isAllowed, mySales, myNotes, setToast
    };
};
