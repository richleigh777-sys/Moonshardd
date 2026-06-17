/**
 * Smart Client-Side Address Parser
 * 
 * This module exports a pure Vanilla ES6 JavaScript function that intelligent parses strings.
 * It uses zero external dependencies and reverse-extraction logic based on USPS formatting.
 * 
 * Behavior Logic:
 * 1. Reverse Extraction: Identifies ZIP first, then State preceding it, then City preceding that.
 * 2. USPS Knowledge: Uses known Secondary Designators (APT, STE, etc.) and Street Suffixes
 *    to split strings when commas are missing.
 * 3. Fallback: If no clear ZIP is found, it returns null meaning "just a street, do not parse."
 */

export interface ParsedAddress {
    street: string;
    city: string;
    state: string;
    zip: string;
}

// 50 Standard US States + DC mapping
const STATE_MAP: Record<string, string> = {
  'ALABAMA': 'AL', 'ALASKA': 'AK', 'ARIZONA': 'AZ', 'ARKANSAS': 'AR', 'CALIFORNIA': 'CA',
  'COLORADO': 'CO', 'CONNECTICUT': 'CT', 'DELAWARE': 'DE', 'FLORIDA': 'FL', 'GEORGIA': 'GA',
  'HAWAII': 'HI', 'IDAHO': 'ID', 'ILLINOIS': 'IL', 'INDIANA': 'IN', 'IOWA': 'IA',
  'KANSAS': 'KS', 'KENTUCKY': 'KY', 'LOUISIANA': 'LA', 'MAINE': 'ME', 'MARYLAND': 'MD',
  'MASSACHUSETTS': 'MA', 'MICHIGAN': 'MI', 'MINNESOTA': 'MN', 'MISSISSIPPI': 'MS',
  'MISSOURI': 'MO', 'MONTANA': 'MT', 'NEBRASKA': 'NE', 'NEVADA': 'NV', 'NEW HAMPSHIRE': 'NH',
  'NEW JERSEY': 'NJ', 'NEW MEXICO': 'NM', 'NEW YORK': 'NY', 'NORTH CAROLINA': 'NC',
  'NORTH DAKOTA': 'ND', 'OHIO': 'OH', 'OKLAHOMA': 'OK', 'OREGON': 'OR', 'PENNSYLVANIA': 'PA',
  'RHODE ISLAND': 'RI', 'SOUTH CAROLINA': 'SC', 'SOUTH DAKOTA': 'SD', 'TENNESSEE': 'TN',
  'TEXAS': 'TX', 'UTAH': 'UT', 'VERMONT': 'VT', 'VIRGINIA': 'VA', 'WASHINGTON': 'WA',
  'WEST VIRGINIA': 'WV', 'WISCONSIN': 'WI', 'WYOMING': 'WY',
  'DISTRICT OF COLUMBIA': 'DC', 'WASHINGTON DC': 'DC'
};

const US_STATES = new Set(Object.values(STATE_MAP));

// USPS Suffixes (Avenue, Street, Parkway, etc.)
const STREET_SUFFIXES = [
  'AV', 'AVE', 'AVENUE', 'HWY', 'HIGHWAY', 'ST', 'STREET', 'WY', 'WAY', 
  'CIR', 'CIRCLE', 'LN', 'LANE', 'RD', 'ROAD', 'BLVD', 'BOULEVARD',
  'DR', 'DRIVE', 'CT', 'COURT', 'PL', 'PLACE', 'SQ', 'SQUARE',
  'TRL', 'TRAIL', 'PKWY', 'PARKWAY', 'TPKE', 'TURNPIKE',
  'ALY', 'ALLEY', 'BND', 'BEND', 'CV', 'COVE', 'XING', 'CROSSING',
  'HL', 'HILL', 'PT', 'POINT', 'RIDGE', 'RDG', 'TER', 'TERRACE'
];

/**
 * Parses an unstructured address string into constituent geographic components.
 * Returns null if the string doesn't appear to be a full address (e.g. it's just "123 Main St").
 */
export function parseSmartAddress(input: string): ParsedAddress | null {
    if (!input || typeof input !== 'string') return null;
    const raw = input.trim();

    // STEP 1: DETECT FULL ADDRESS & EXTRACT ZIP
    // regex targets the absolute tail end of the string for 5 digits or ZIP+4
    // [^\w]*$ ignores trailing spaces or punctuation
    const zipRegex = /\b(\d{5}(?:-\d{4})?)[^\w]*$/;
    const zipMatch = raw.match(zipRegex);
    
    // Fallback trigger: if no zip found at the tail end, we check if it is comma delimited.
    if (!zipMatch) {
        const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
        if (parts.length >= 3) {
            const statePart = parts.pop()!;
            const cityPart = parts.pop()!;
            const streetPart = parts.join(', ');
            
            const up = statePart.toUpperCase();
            if (US_STATES.has(up) || STATE_MAP[up]) {
                return {
                    zip: '',
                    state: STATE_MAP[up] || up,
                    city: cityPart,
                    street: streetPart
                };
            }
        }
        return null;
    }
    
    const zip = zipMatch[1];
    
    // Trim string to remove the zip and trailing punctuation/commas
    let remaining = raw.slice(0, zipMatch.index).trim().replace(/,+$/, '').trim();

    // STEP 2: REVERSE EXTRACT STATE
    // Check if the preceding text is a 2-letter word or a spelled out state name.
    let state = '';
    
    // First check exact full names by regex
    const sortedFullNames = Object.keys(STATE_MAP).sort((a,b) => b.length - a.length);
    const fullNamePattern = new RegExp(`\\b(${sortedFullNames.join('|')})\\b[^\\w]*$`, 'i');
    
    let stateMatch = remaining.match(fullNamePattern);
    if (stateMatch) {
        state = STATE_MAP[stateMatch[1].toUpperCase()];
        remaining = remaining.slice(0, stateMatch.index).trim().replace(/,+$/, '').trim();
    } else {
        // Fallback to 2-letter abbreviation check
        const stateRegex = /\b([a-zA-Z]{2})\b[^\w]*$/;
        stateMatch = remaining.match(stateRegex);
        if (stateMatch && US_STATES.has(stateMatch[1].toUpperCase())) {
            state = stateMatch[1].toUpperCase();
            remaining = remaining.slice(0, stateMatch.index).trim().replace(/,+$/, '').trim();
        }
    }

    // STEP 3: EXTRACT CITY AND STREET
    let city = '';
    let street = '';

    // Easing case: Check for explicit commas (e.g. "123 Main St, Springfield")
    const lastCommaIndex = remaining.lastIndexOf(',');
    if (lastCommaIndex !== -1) {
        city = remaining.slice(lastCommaIndex + 1).trim();
        street = remaining.slice(0, lastCommaIndex).trim();
    } else {
        // Hard case: Missing commas (e.g. "123 Main St Apt 4B Springfield")
        // We use the USPS knowledge base to search backwards for the LAST street suffix,
        // and safely split preserving the secondary designator (Apt, Suite, etc.)
        
        let splitIndex = -1;
        const potentialSuffixes = new RegExp(`\\b(?:${STREET_SUFFIXES.join('|')})\\b`, 'gi');
        
        let match;
        // Loop to find the last match
        while ((match = potentialSuffixes.exec(remaining)) !== null) {
            splitIndex = match.index + match[0].length;
        }

        // If we found a known suffix
        if (splitIndex !== -1 && splitIndex < remaining.length - 1) {
            // Check if there is a secondary designator trailing the street suffix
            const afterSuffixText = remaining.slice(splitIndex);
            
            // Secondary designators: APT, BLDG, FL, STE, RM, DEPT, UNIT, or #
            // Including Directionals N, S, E, W, NE, NW, SE, SW
            const secondaryRegex = /^\s*(?:APT|BLDG|FL|STE|RM|DEPT|UNIT|#|N|S|E|W|NE|NW|SE|SW)\b[\s#]*[\w\d-]+/i;
            const secondaryMatch = afterSuffixText.match(secondaryRegex);
            
            if (secondaryMatch) {
                // Keep the secondary designator as part of the street vector
                splitIndex += secondaryMatch[0].length;
            }
            
            city = remaining.slice(splitIndex).trim();
            street = remaining.slice(0, splitIndex).trim();
        } else {
            // If we absolutely cannot distinguish it based on structural fuzzy rules,
            // we leave the remaining as street to prevent destructive splitting.
            street = remaining;
        }
    }

    return {
        street: street.replace(/,+$/, '').trim(),
        city: city,
        state: state,
        zip: zip
    };
}
