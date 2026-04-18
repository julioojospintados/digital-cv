// scripts/record-demo-playwright.js
// Usage:
// 1) Serve the site (e.g. `npm run dev --prefix cv-site` or `npx http-server cv-site/dist`)
// 2) npm i -D playwright
// 3) node scripts/record-demo-playwright.js

const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    recordVideo: { dir: 'videos', size: { width: 390, height: 844 } }
  });
  const page = await context.newPage();
  await page.goto('http://localhost:3000/prototype/mobile-demo/index.html');
  // Wait for demo to run (adjust if you extended the demo sequence)
  await page.waitForTimeout(6000);
  await context.close();
  await browser.close();
  console.log('Recording saved to videos/ (webm). Convert to GIF with ffmpeg if needed.');
})();
