const fs = require('fs');
let code = fs.readFileSync('components/forms/enrollment/wizard/Stage3Checkout.tsx', 'utf8');

// Replace local state with financials.cardType
code = code.replace(/const \[cardTypeLabel, setCardTypeLabel\] = useState\('Credit'\);/, '');
code = code.replace(/cardTypeLabel === 'Credit'/g, "(financials.cardType !== 'Debit')");
code = code.replace(/cardTypeLabel === 'Debit'/g, "(financials.cardType === 'Debit')");
code = code.replace(/setCardTypeLabel\('Credit'\)/g, "setFinancials({...financials, cardType: 'Credit'})");
code = code.replace(/setCardTypeLabel\('Debit'\)/g, "setFinancials({...financials, cardType: 'Debit'})");
code = code.replace(/\{cardTypeLabel\}/g, "{financials.cardType === 'Debit' ? 'Debit' : 'Credit'}");

fs.writeFileSync('components/forms/enrollment/wizard/Stage3Checkout.tsx', code);
console.log("cardType fixed");
