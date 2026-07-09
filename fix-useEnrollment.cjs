const fs = require('fs');
let code = fs.readFileSync('components/forms/enrollment/hooks/useEnrollment.ts', 'utf8');

code = code.replace(/await addSale\(newSale\);/g, 'const savedSale = await addSale(newSale);');
code = code.replace(/\.\.\.newSale,/g, '...savedSale,');
code = code.replace(/setLastOrder\(newSale\);/g, 'setLastOrder(savedSale);');

fs.writeFileSync('components/forms/enrollment/hooks/useEnrollment.ts', code);
