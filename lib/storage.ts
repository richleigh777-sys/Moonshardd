export const getStorageItem = (key: string): string | null => {
    try {
        return localStorage.getItem(key);
    } catch (e) {
        return null;
    }
};

export const setStorageItem = (key: string, value: string): void => {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        // Ignore
    }
};

export const removeStorageItem = (key: string): void => {
    try {
        localStorage.removeItem(key);
    } catch (e) {
        // Ignore
    }
};

export const getAllStorageKeys = (): string[] => {
    try {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) keys.push(key);
        }
        return keys;
    } catch (e) {
        return [];
    }
};

export const getSessionStorageItem = (key: string): string | null => {
    try {
        return sessionStorage.getItem(key);
    } catch (e) {
        return null;
    }
};

export const setSessionStorageItem = (key: string, value: string): void => {
    try {
        sessionStorage.setItem(key, value);
    } catch (e) {
        // Ignore
    }
};

export const removeSessionStorageItem = (key: string): void => {
    try {
        sessionStorage.removeItem(key);
    } catch (e) {
        // Ignore
    }
};
