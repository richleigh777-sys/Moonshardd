const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  
  try {
    await page.type('input[placeholder="Username"], input[name="username"]', 'admin-srv-001');
    await page.type('input[placeholder="Password"], input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
  } catch (e) {}
  
  await new Promise(r => setTimeout(r, 3000));
  
  // click "Money" tab
  try {
    await page.evaluate(() => {
        const elements = document.querySelectorAll('button, a, div');
        for (const el of elements) {
            if (el.textContent === 'Money') {
                el.click();
            }
        }
    });
  } catch(e) {}
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Click "Sales Pool"
  try {
    await page.evaluate(() => {
        const elements = document.querySelectorAll('button, a, div, span');
        for (const el of elements) {
            if (el.textContent === 'Sales Pool') {
                el.click();
            }
        }
    });
  } catch(e) {}
  
  await new Promise(r => setTimeout(r, 2000));
  
  const trs = await page.evaluate(() => {
    const tbodys = document.querySelectorAll('#sales-pool-table-container tbody');
    if (!tbodys.length) return "No tbody";
    return "Rows in tbody: " + tbodys[0].querySelectorAll('tr').length;
  });
  console.log(trs);
  
  const firstRowContent = await page.evaluate(() => {
    const trs = document.querySelectorAll('#sales-pool-table-container tbody tr');
    if (!trs.length) return "No rows";
    return trs[0].innerText;
  });
  console.log("FIRST ROW:", firstRowContent);
  
  await browser.close();
})();
