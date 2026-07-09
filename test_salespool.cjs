const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.fill('input[type="text"]', 'admin');
  await page.fill('input[type="password"]', 'admin');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  const text = await page.evaluate(() => {
    const root = document.getElementById('sales-pool-root');
    return root ? root.innerText : 'NO_SALES_POOL_ROOT';
  });
  console.log("SALES POOL TEXT:", text);
  await browser.close();
})();
