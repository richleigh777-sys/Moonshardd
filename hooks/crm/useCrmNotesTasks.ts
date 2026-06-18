import { useCallback } from 'react';
import { User, Note, Task } from '../../types';
import { nexusGateway } from '../../nexus/adapters/DataGateway';
import { createNotification } from '../../lib/notificationService';

export const useCrmNotesTasks = (
    currentUser: User | null
) => {
    const addNote = useCallback(async (note: Partial<Note>) => {
        const payload = { 
            ...note, 
            timestamp: note.timestamp || Date.now(), 
            createdAt: Date.now(), 
            team: currentUser?.team || 'Alpha' 
        };
        await nexusGateway.add('notes', payload);
        if (note.type === 'callback' && note.priority === 'High' && note.agentId) {
             await createNotification(
                 note.agentId, 
                 'agent', 
                 'workflow', 
                 'Priority Callback Set', 
                 `Urgent follow-up for ${note.customerName}.`
             );
        }
    }, [currentUser]);

    const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
        await nexusGateway.update('notes', id, updates);
    }, []);

    const deleteNote = useCallback(async (id: string) => {
        // blocked by iframe
        await nexusGateway.delete('notes', id);
    }, []);

    const addTask = useCallback(async (task: Partial<Task>) => {
        const payload = { 
            ...task, 
            timestamp: task.timestamp || Date.now(), 
            team: currentUser?.team || 'Alpha' 
        };
        await nexusGateway.add('tasks', payload);
    }, [currentUser]);

    const updateTaskStatus = useCallback(async (id: string, status: 'completed') => {
        await nexusGateway.update('tasks', id, { status });
    }, []);

    return {
        addNote,
        updateNote,
        deleteNote,
        addTask,
        updateTaskStatus
    };
};
