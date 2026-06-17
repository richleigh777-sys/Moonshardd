const fs = require('fs');
let code = fs.readFileSync('components/admin/UniqueSalesPool.tsx', 'utf8');

const targetLoopVars = `        let added = 0;
        let updated = 0;
        let importResultsData: any = { added: 0, stitched: 0, stitchedDetails: [], addedDetails: [] };

        try {
            for (const row of importConfig.fullData) {`;

const replacementLoopVars = `        let added = 0;
        let updated = 0;
        let importResultsData: any = { added: 0, stitched: 0, stitchedDetails: [], addedDetails: [] };

        // Create a fast Map to track phones and ensure duplicates from the SAME CSV file are stitched, not duplicated
        const phoneDbMap = new Map<string, Customer>();
        
        // Sort newest first to ensure we get the latest profile if duplicates already exist
        const sortedRaw = [...customers].sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
        sortedRaw.forEach(c => {
            if (c.phone) phoneDbMap.set(c.phone.replace(/\\D/g, ''), c);
            if ((c as any).alternatePhone) phoneDbMap.set((c as any).alternatePhone.replace(/\\D/g, ''), c);
        });

        try {
            for (const row of importConfig.fullData) {`;

code = code.replace(targetLoopVars, replacementLoopVars);

const targetMatch = `                const fullName = \`\${fn} \${ln}\`.trim();

                const existingMatch = uniqueCustomers.find(c => {
                    const cPhone = (c.phone || '').replace(/\\D/g, '');
                    const cAlt = ((c as any).alternatePhone || '').replace(/\\D/g, '');
                    return cPhone === cleanPhone || cAlt === cleanPhone;
                });

                if (existingMatch) {`;

const replacementMatch = `                const fullName = \`\${fn} \${ln}\`.trim();

                // 2. Fetch from our active tracker Map to catch cross-file duplicates AND in-file duplicates
                const existingMatch = phoneDbMap.get(cleanPhone);

                if (existingMatch) {`;

code = code.replace(targetMatch, replacementMatch);


const targetAppend = `                    };
                    await addCustomer(customerPayload);
                    added++;
                    importResultsData.added++;
                    importResultsData.addedDetails.push({
                        name: fullName || 'Unknown',
                        phone: rawPhone,
                        email: email || 'unknown'
                    });
                }`;

const replacementAppend = `                    };
                    await addCustomer(customerPayload);
                    
                    // Immediately add the new customer to the Map so subsequent rows with the same phone in the CSV get stitched into it!
                    phoneDbMap.set(cleanPhone, customerPayload as Customer);
                    
                    added++;
                    importResultsData.added++;
                    importResultsData.addedDetails.push({
                        name: fullName || 'Unknown',
                        phone: rawPhone,
                        email: email || 'unknown'
                    });
                }`;

code = code.replace(targetAppend, replacementAppend);


fs.writeFileSync('components/admin/UniqueSalesPool.tsx', code);
