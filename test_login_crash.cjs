const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const loginBtn = buttons.find(b => b.innerText.toLowerCase().includes('unlock') || b.innerText.toLowerCase().includes('level'));
    if(loginBtn) {
        console.log('Clicking button:', loginBtn.innerText);
        loginBtn.click();
    }
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const srvBtn = buttons.find(b => b.innerText.toLowerCase().includes('connect'));
    if(srvBtn) {
        console.log('Clicking connect button:', srvBtn.innerText);
        srvBtn.click();
    }
  });

  await new Promise(r => setTimeout(r, 5000));
  
  const htmlLength = await page.evaluate(() => document.body.innerHTML.length);
  console.log('Final HTML length:', htmlLength);
  
  await browser.close();
})();
