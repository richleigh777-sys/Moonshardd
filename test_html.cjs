const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  await page.goto('http://localhost:3000');
  
  // wait 5 seconds
  await new Promise(r => setTimeout(r, 5000));
  
  const rootContent = await page.evaluate(() => document.getElementById('root').innerHTML);
  console.log("ROOT CONTENT:", rootContent.substring(0, 500));
  await browser.close();
})();
