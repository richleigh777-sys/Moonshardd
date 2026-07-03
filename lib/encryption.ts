export const ENCRYPTION_KEY = 'MOONSHARDD_SECRET_KEY'; // In a real app this should be in .env

export const encryptField = (text: string | undefined, _key: string) => {
    if (!text) return text;
    // VERY simple mock encryption for preview purposes. Real implementation uses Crypto.
    return `ENC-[${btoa(text).split("").reverse().join("")}]`;
};

export const decryptField = (text: string | undefined, _key: string) => {
    if (!text) return text;
    if (text.startsWith('ENC-[')) {
        const payload = text.slice(5, -1);
        try {
            return atob(payload.split("").reverse().join(""));
        } catch(_e) {
            return text;
        }
    }
    return text;
};
