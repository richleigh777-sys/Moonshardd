
import { useContext } from 'react';
import { AuthContext, WorkTimerContext } from '../context/AuthContextCore';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const useTimer = () => {
    const context = useContext(WorkTimerContext);
    if (!context) {
        throw new Error("useTimer must be used within an AuthProvider");
    }
    return context;
};
