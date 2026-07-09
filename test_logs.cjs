const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' }).catch(e => console.log('nav error', e));
  await page.waitForTimeout(2000);
  const text = await page.evaluate(() => document.body.innerText);
  console.log("BODY TEXT:", text);
  await browser.close();
})();
