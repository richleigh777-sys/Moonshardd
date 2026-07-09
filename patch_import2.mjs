import fs from 'fs';

const path = 'components/widgets/sales-ledger/useImportLogic.ts';
let data = fs.readFileSync(path, 'utf8');

const oldCode = `                        if ((sysKey === 'address' || sysKey === 'shippingAddress' || sysKey === 'billingAddress') && value && typeof value === 'string') {
                            const parsed = parseFullAddressString(value);
                            value = parsed.street || value;
                            if (parsed.city && !columnMapping['city'] && !columnMapping['shippingCity']) {
                                entry['city'] = parsed.city;
                            }
                            if (parsed.state && !columnMapping['state'] && !columnMapping['shippingState']) {
                                entry['state'] = parsed.state;
                            }
                            if (parsed.zip && !columnMapping['zip'] && !columnMapping['shippingZip']) {
                                entry['zip'] = parsed.zip;
                            }
                        }`;

const newCode = `                        if ((sysKey === 'address' || sysKey === 'shippingAddress' || sysKey === 'billingAddress') && value && typeof value === 'string') {
                            const parsed = parseFullAddressString(value);
                            value = parsed.street || value;
                            
                            const prefix = sysKey === 'billingAddress' ? 'billing' : (sysKey === 'shippingAddress' ? 'shipping' : '');
                            const cityKey = prefix ? prefix + 'City' : 'city';
                            const stateKey = prefix ? prefix + 'State' : 'state';
                            const zipKey = prefix ? prefix + 'Zip' : 'zip';

                            if (parsed.city && !columnMapping[cityKey]) {
                                entry[cityKey] = parsed.city;
                            }
                            if (parsed.state && !columnMapping[stateKey]) {
                                entry[stateKey] = parsed.state;
                            }
                            if (parsed.zip && !columnMapping[zipKey]) {
                                entry[zipKey] = parsed.zip;
                            }
                        }`;

if(data.includes("if ((sysKey === 'address' || sysKey === 'shippingAddress' || sysKey === 'billingAddress') && value && typeof value === 'string') {")) {
    data = data.replace(oldCode, newCode);
    fs.writeFileSync(path, data, 'utf8');
    console.log("Patched useImportLogic.ts correctly");
} else {
    console.log("Could not find code to replace");
}
