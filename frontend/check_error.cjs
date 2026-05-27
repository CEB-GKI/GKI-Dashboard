const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    console.log("Navigating...");
    await page.goto('file://C:/Users/Chris/Apps/GKI_Waha_Dashboard/GKI_Dashboard.html');
    
    await new Promise(r => setTimeout(r, 2000));
    
    console.log("Clicking Pers. Kategorial...");
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const tab = tabs.find(t => t.innerText.includes('Pers. Kategorial'));
      if (tab) tab.click();
    });
    
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'screenshot_pers.png' });

    console.log("Clicking RAPAT...");
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const tab = tabs.find(t => t.innerText.includes('RAPAT'));
      if (tab) tab.click();
    });

    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'screenshot_rapat.png' });

    console.log("Done");
    await browser.close();
  } catch (e) {
    console.error(e);
  }
})();
