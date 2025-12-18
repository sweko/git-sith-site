const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const outDir = path.resolve(__dirname, '..', 'dev', 'screenshots');
  fs.mkdirSync(outDir, { recursive: true });

  const urls = [
    { name: 'homepage', url: 'http://127.0.0.1:8080/' },
    { name: 'aoc-day07', url: 'http://127.0.0.1:8080/aoc/2025/07.html' },
    { name: 'introducing-gitsith', url: 'http://127.0.0.1:8080/articles/introducing-gitsith.html' }
  ];

  const iPhoneSE = {
    name: 'iPhone SE',
    viewport: { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15A372 Safari/604.1'
  };

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport(iPhoneSE.viewport);
    await page.setUserAgent(iPhoneSE.userAgent);

    for (const entry of urls) {
      const filename = path.join(outDir, `${entry.name}-mobile.png`);
      console.log(`Capturing ${entry.url} -> ${filename}`);
      await page.goto(entry.url, { waitUntil: 'networkidle2', timeout: 30000 });
      await page.screenshot({ path: filename, fullPage: true });
    }

    console.log('Screenshots saved to', outDir);
  } catch (err) {
    console.error('Screenshot capture failed', err);
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
})();
