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
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    const fs = require('fs');
    fs.writeFileSync('errors_log.txt', errors.join('\n') + '\n\nBODY_LENGTH: ' + bodyHTML.length);
    await browser.close();
})();
