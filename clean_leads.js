const http = require('http');

const port = process.env.PORT || 3000;

function fetchCustomers() {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/api/collections/batch?names=customers',
            method: 'GET',
            headers: {
                'x-user-level': '10',
                'x-user-id': 'sys_root'
            }
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(data).customers || []);
                } else {
                    reject(new Error(`Status ${res.statusCode}`));
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

function bulkDelete(ids) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({ ids });
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/api/collections/customers/bulk',
            method: 'DELETE',
            headers: {
                'x-user-level': '10',
                'x-user-id': 'sys_root',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`Status ${res.statusCode}: ${data}`));
                }
            });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function run() {
    console.log("Fetching customers...");
    const customers = await fetchCustomers();
    console.log(`Fetched ${customers.length} customers.`);
    
    const toDelete = customers.filter(c => 
        !c.firstName && !c.lastName && !c.name && !c.phone && !c.email
    );
    
    console.log(`Found ${toDelete.length} empty leads to delete.`);
    
    if (toDelete.length > 0) {
        const ids = toDelete.map(c => c.id);
        const result = await bulkDelete(ids);
        console.log("Delete result:", result);
    } else {
        console.log("No empty leads to delete.");
    }
}

run().catch(console.error);
