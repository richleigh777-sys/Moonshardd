const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  await page.goto('http://localhost:3000');
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    localStorage.setItem('nexus_session_user', JSON.stringify({id: 'admin_sys', name: 'System Admin', role: 'admin', level: 10}));
    localStorage.setItem('nexus_session_sig', 'temp_sig');
    localStorage.setItem('nexus_server_id', 'srv-001');
  });
  await page.reload();
  await new Promise(r => setTimeout(r, 2000));
  
  // Click first button that contains Enter Production
  await page.evaluate(() => {
     const btns = Array.from(document.querySelectorAll('button'));
     const enterBtn = btns.find(b => b.textContent.includes('Enter Production'));
     if (enterBtn) enterBtn.click();
  });

  await new Promise(r => setTimeout(r, 4000));
  
  const body = await page.evaluate(() => document.body.outerHTML);
  console.log("BODY LENGTH:", body.length);
  if (body.includes("Admin Portal") || body.includes("Action")) {
      console.log("ADMIN LOADED");
  } else if (body.includes("Application Error")) {
      const errorText = await page.evaluate(() => document.querySelector('.bg-surface-alt.rounded-lg').innerText);
      console.log("CRASH:", errorText);
  }
  await browser.close();
})();
