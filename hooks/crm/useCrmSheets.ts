import { useCallback } from 'react';
import { nexusGateway } from '../../nexus/adapters/DataGateway';

export const useCrmSheets = (
    customSheets: any[]
) => {
    const addSheet = useCallback(async (type = 'native', url?: string) => {
        const name = type === 'google' ? 'Google Sheet' : type === 'teams' ? 'Teams View' : 'New Sheet';
        await nexusGateway.add('sheets', { 
            name, 
            type, 
            url, 
            data: type === 'native' ? Array(10).fill(0).map(() => Array(10).fill('')) : [] 
        });
    }, []);

    const removeSheet = useCallback(async (id: string) => {
        await nexusGateway.delete('sheets', id);
    }, []);

    const updateSheet = useCallback(async (id: string, data: any) => {
        await nexusGateway.update('sheets', id, data);
    }, []);

    const updateSheetCell = useCallback(async (sheetId: string, row: number, col: number, value: string) => {
        const sheet = customSheets.find(s => s.id === sheetId);
        if (sheet && sheet.data) {
             const newData = sheet.data.map((r: string[]) => [...r]);
             if (newData[row]) {
                 newData[row][col] = value;
                 await nexusGateway.update('sheets', sheetId, { data: newData });
             }
        }
    }, [customSheets]);

    return {
        addSheet,
        removeSheet,
        updateSheet,
        updateSheetCell
    };
};
