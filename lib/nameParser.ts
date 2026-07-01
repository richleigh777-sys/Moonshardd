export interface ParsedName {
    firstName: string;
    lastName: string;
    middleInitial?: string;
}

export function parseFullName(fullName: string): ParsedName {
    if (!fullName) return { firstName: '', lastName: '' };

    const cleanedName = fullName.trim();
    
    // Check for "Last, First" format
    if (cleanedName.includes(',')) {
        const parts = cleanedName.split(',');
        if (parts.length >= 2) {
            const firstAndMiddle = parts.slice(1).join(' ').trim().split(/\s+/);
            const firstName = firstAndMiddle[0] || '';
            const middleInitial = firstAndMiddle.length > 1 ? firstAndMiddle[1][0].toUpperCase() : undefined;
            return {
                lastName: parts[0].trim(),
                firstName: firstName,
                middleInitial: middleInitial
            };
        }
    }

    const nameParts = cleanedName.split(/\s+/);

    if (nameParts.length <= 1) {
        return { firstName: fullName, lastName: '' };
    }

    // Common suffixes
    const suffixes = new Set(['jr', 'sr', 'jr.', 'sr.', 'ii', 'iii', 'iv', 'v', 'phd', 'md', 'dds', 'esq', 'esq.']);
    
    const lastNameParts = [];
    let firstNameParts = [];
    
    const lastPart = nameParts[nameParts.length - 1].toLowerCase();
    
    if (suffixes.has(lastPart) && nameParts.length > 2) {
        // Last part is a suffix, and we have at least 3 parts (e.g., John Doe Jr.)
        lastNameParts.push(nameParts[nameParts.length - 2]);
        lastNameParts.push(nameParts[nameParts.length - 1]);
        firstNameParts = nameParts.slice(0, nameParts.length - 2);
    } else {
        // Normal case: last part is the last name
        lastNameParts.push(nameParts[nameParts.length - 1]);
        firstNameParts = nameParts.slice(0, nameParts.length - 1);
    }
    
    let middleInitial: string | undefined = undefined;
    
    // Extract middle initial from first name parts if more than one word
    if (firstNameParts.length > 1) {
        // Assume the last part of firstNameParts is the middle name/initial
        const middlePart = firstNameParts.pop();
        if (middlePart) {
            middleInitial = middlePart.replace(/[^a-zA-Z]/g, '')[0]?.toUpperCase();
        }
    }
    
    return {
        firstName: firstNameParts.join(' '),
        lastName: lastNameParts.join(' '),
        middleInitial
    };
}
