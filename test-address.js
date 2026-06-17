"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var addressParser_ts_1 = require("./lib/addressParser.ts");
console.log((0, addressParser_ts_1.parseSmartAddress)('123 Main St, New York, NY 10001'));
console.log((0, addressParser_ts_1.parseSmartAddress)('123 Main st apt 4b Los Angeles CA 90001'));
