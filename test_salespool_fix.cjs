const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));

  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1000);
  
  // Fill username (placeholder "Username")
  await page.fill('input[placeholder="Username"]', 'admin-srv-001');
  
  // Fill password (placeholder "Password")
  await page.fill('input[placeholder="Password"]', 'admin123');
  
  // Click Sign In
  await page.click('button[type="submit"]');
  console.log("Clicked submit...");
  
  // Wait for login and routing
  await page.waitForTimeout(3000);
  
  const html = await page.evaluate(() => {
    const root = document.getElementById('sales-pool-root');
    return root ? root.innerHTML : 'NULL';
  });
  console.log("SALES POOL HTML length:", html.length);
  if (html.length < 500) {
      console.log("SALES POOL HTML:\n", html);
  } else {
      console.log("SALES POOL HTML starts with:\n", html.substring(0, 500));
  }
  
  const trs = await page.evaluate(() => {
      const tbodys = document.querySelectorAll('#sales-pool-root tbody');
      if (!tbodys.length) return "No tbody";
      return "Rows in tbody: " + tbodys[0].querySelectorAll('tr').length;
  });
  console.log(trs);
  
  await browser.close();
})();
