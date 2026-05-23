import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useDataHealthWorker } from '../../hooks/useDataHealthWorker';

export const GlobalWorkers: React.FC = () => {
    const { currentUser } = useAuth();
    useDataHealthWorker(currentUser);

    return null;
};
