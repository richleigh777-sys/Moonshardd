const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    const fs = require('fs');
    fs.writeFileSync('body_dump_blank.html', bodyHTML);
    await browser.close();
})();
