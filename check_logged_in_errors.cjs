const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push('CONSOLE ERROR: ' + msg.text());
        }
    });
    page.on('pageerror', error => {
        errors.push('PAGE ERROR: ' + error.message);
    });
    
    // Go to page to get origin
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Set localStorage
    await page.evaluate(() => {
        localStorage.setItem('crm_auth_user', JSON.stringify({ id: 'admin', name: 'Admin', level: 10 }));
        localStorage.setItem('crm_auth_sig', 'mock-sig');
        localStorage.setItem('crm_auth_company', 'nexus');
    });
    
    // Reload to apply logged-in state
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    const fs = require('fs');
    fs.writeFileSync('logged_in_errors.txt', errors.join('\n') + '\n\nBODY_LENGTH: ' + bodyHTML.length);
    await browser.close();
})();
