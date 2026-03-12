const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
    page.on('pageerror', error => console.log('BROWSER PAGE ERROR:', error.message));
    page.on('requestfailed', request => console.log('BROWSER NETWORK ERROR:', request.url(), request.failure().errorText));

    console.log('Navigating to http://localhost:8081...');
    try {
        await page.goto('http://localhost:8081', { waitUntil: 'networkidle2', timeout: 15000 });
        await page.waitForTimeout(5000); // Wait for the 2 second app timer plus extra
        console.log('Capture complete.');
    } catch (e) {
        console.log('Navigation error:', e.message);
    }
    
    await browser.close();
})();
