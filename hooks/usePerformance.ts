import { useContext } from 'react';
import { CRMPerformanceContext } from '../context/CRMPerformanceContextCore';

export const usePerformance = () => {
    const context = useContext(CRMPerformanceContext);
    if (!context) {
        throw new Error("usePerformance must be used within a CRMPerformanceProvider");
    }
    return context;
};
