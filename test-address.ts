import { parseSmartAddress } from './lib/addressParser.ts';
console.log(parseSmartAddress('123 Main St, New York, NY'));
console.log(parseSmartAddress('123 Main St, New York, New York'));
