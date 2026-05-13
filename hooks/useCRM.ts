import { useContext } from 'react';
import { CRMContext } from '../context/CRMContextCore';

export const useCRM = () => {
    const context = useContext(CRMContext);
    if (!context) throw new Error("useCRM must be used within a CRMProvider");
    return context;
};
