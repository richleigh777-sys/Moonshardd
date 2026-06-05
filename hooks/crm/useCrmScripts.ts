import { useCallback } from 'react';
import { nexusGateway } from '../../nexus/adapters/DataGateway';

export const useCrmScripts = () => {
    const validateGhostTarget = useCallback(async (id: string) => await nexusGateway.validateGhostTarget(id), []);
    
    const logScriptUsage = useCallback(async (id: string, outcome: any, amt: number) => {
        await nexusGateway.logScriptUsage(id, outcome, amt);
    }, []);
    
    const addScript = useCallback(async (s: any) => await nexusGateway.add('scripts', s), []);
    const updateScript = useCallback(async (id: string, s: any) => await nexusGateway.update('scripts', id, s), []);
    const deleteScript = useCallback(async (id: string) => await nexusGateway.delete('scripts', id), []);

    return {
        validateGhostTarget,
        logScriptUsage,
        addScript,
        updateScript,
        deleteScript
    };
};
