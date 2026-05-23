
import React, { useState, useRef, useCallback } from 'react';
import { sfx } from '../../../lib/soundService';

interface UseChatInputProps {
    onSend: (text: string, attachments: any[], replyTo?: any, extras?: any) => void;
    onTyping: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const useChatInputLogic = ({ onSend, onTyping }: UseChatInputProps) => {
    // Core State
    const [input, setInput] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [recordTime, setRecordTime] = useState(0);
    
    // UI Toggles
    const [showEmoji, setShowEmoji] = useState(false);
    const [showAI, setShowAI] = useState(false);
    const [scheduleTime, setScheduleTime] = useState<string | null>(null);
    const [isThinking, setIsThinking] = useState(false);
    const [isInternal, setIsInternal] = useState(false);

    // Autocomplete State
    const [mentionSearch, setMentionSearch] = useState<string | null>(null);
    const [commandSearch, setCommandSearch] = useState<string | null>(null);
    const [popupIndex, setPopupIndex] = useState(0);

    const recordTimerRef = useRef<any>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // --- RECORDING ENGINE ---
    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordTime(0);
            sfx.playClick();
            
            if (recordTimerRef.current) clearInterval(recordTimerRef.current);
            recordTimerRef.current = setInterval(() => {
                setRecordTime(prev => prev + 1);
            }, 1000);
        } catch (err: any) {
            console.warn("Microphone access denied or unavailable:", err?.message || 'Permission dismissed');
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                if (audioBlob.size > 0) {
                    const audioUrl = URL.createObjectURL(audioBlob);
                    
                    const audioAttachment = { 
                        type: 'audio', 
                        name: `voice_memo_${Date.now()}.webm`, 
                        url: audioUrl,
                        size: `${(audioBlob.size / 1024).toFixed(1)}KB`
                    };
                    
                    onSend(`Voice Note (${formatDuration(recordTime)})`, [audioAttachment]);
                }
                
                mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
            };
            mediaRecorderRef.current.stop();
        }

        setIsRecording(false);
        if (recordTimerRef.current) {
            clearInterval(recordTimerRef.current);
            recordTimerRef.current = null;
        }
        sfx.playConfirm();
        setRecordTime(0);
    }, [recordTime, onSend, isRecording]);

    const cancelRecording = useCallback(() => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        setIsRecording(false);
        if (recordTimerRef.current) {
            clearInterval(recordTimerRef.current);
            recordTimerRef.current = null;
        }
        setRecordTime(0);
        audioChunksRef.current = [];
        sfx.playDecline();
    }, []);

    // --- TEXT ENGINE ---
    const handleTyping = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setInput(val);
        onTyping(e);

        // Smart Trigger Detection (@ for users, / for commands)
        const cursorPos = e.target.selectionStart;
        const textBefore = val.slice(0, cursorPos);
        
        const mentionMatch = textBefore.match(/(?:^|\s)@(\w*)$/);
        if (mentionMatch) {
            setMentionSearch(mentionMatch[1]);
            setCommandSearch(null);
            setPopupIndex(0);
            return;
        }

        const commandMatch = textBefore.match(/(?:^|\s)\/(\w*)$/);
        if (commandMatch) {
            setCommandSearch(commandMatch[1]);
            setMentionSearch(null);
            setPopupIndex(0);
            return;
        }

        setMentionSearch(null);
        setCommandSearch(null);
    }, [onTyping]);

    const handleSend = useCallback(() => {
        if (!input.trim() && !isRecording) return;
        
        const trimmedInput = input.trim();
        
        // Command Processing
        if (trimmedInput.startsWith('/')) {
            const [cmd] = trimmedInput.slice(1).split(' ');
            const command = cmd.toLowerCase();

            switch (command) {
                case 'clear':
                    setInput("");
                    return;
                case 'internal':
                    setIsInternal(!isInternal);
                    setInput("");
                    sfx.playClick();
                    return;
                case 'mute':
                    // This would ideally call a context function, but for now we just clear
                    setInput("");
                    sfx.playDecline();
                    return;
                case 'help':
                    onSend("Available Commands: /clear, /internal, /mute, /help", [], undefined, { senderId: 'system' });
                    setInput("");
                    return;
            }
        }

        const extras: any = {};
        if (isInternal) extras.isInternal = true;
        
        // Scheduling Logic
        if (scheduleTime) {
            extras.scheduledFor = Date.now() + 3600000; // Mock +1 hour
        }
        
        onSend(input, [], undefined, extras);
        
        // Reset State
        setInput("");
        setScheduleTime(null);
        
        // Refocus for rapid fire
        setTimeout(() => textareaRef.current?.focus(), 10);
    }, [input, scheduleTime, onSend, isRecording, isInternal]);

    const insertText = useCallback((text: string) => {
        const current = textareaRef.current;
        if (!current) {
            setInput(prev => prev + text);
            return;
        }
        
        const start = current.selectionStart;
        const end = current.selectionEnd;
        const before = input.substring(0, start);
        const after = input.substring(end);
        
        // Intelligent replacement for triggers
        let newBefore = before;
        if (mentionSearch !== null) newBefore = before.replace(/@\w*$/, '');
        if (commandSearch !== null) newBefore = before.replace(/\/\w*$/, '');

        const newVal = newBefore + text + ' ' + after;
        setInput(newVal);
        
        setMentionSearch(null);
        setCommandSearch(null);

        setTimeout(() => {
            current.focus();
            const newCursorPos = newBefore.length + text.length + 1; // +1 for space
            current.setSelectionRange(newCursorPos, newCursorPos);
        }, 10);
    }, [input, mentionSearch, commandSearch]);

    return {
        input, setInput,
        isRecording, recordTime,
        startRecording, stopRecording, cancelRecording,
        showEmoji, setShowEmoji,
        showAI, setShowAI,
        scheduleTime, setScheduleTime,
        isThinking, setIsThinking,
        mentionSearch, commandSearch, popupIndex, setPopupIndex,
        isInternal, setIsInternal,
        handleTyping, handleSend, insertText,
        textareaRef
    };
};
