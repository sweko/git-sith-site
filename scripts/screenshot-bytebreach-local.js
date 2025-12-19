const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

function waitForServer(url, attempts = 60, delay = 500) {
  return new Promise(async (resolve) => {
    for (let i = 0; i < attempts; i++) {
      try {
        await new Promise((res, rej) => {
          const req = http.get(url, res2 => { res2.destroy(); res(); });
          req.on('error', rej);
        });
        return resolve(true);
      } catch (e) {
        await new Promise(r => setTimeout(r, delay));
      }
    }
    resolve(false);
  });
}

(async () => {
  const outDir = path.resolve(__dirname, '..', 'dev', 'lighthouse', 'screenshots');
  fs.mkdirSync(outDir, { recursive: true });

  console.log('Starting local http-server (npx --yes http-server ./ -p 8080)');
  const serverProc = spawn('npx', ['-y', 'http-server', './', '-p', '8080'], { shell: true, stdio: 'inherit' });

  try {
    const up = await waitForServer('http://127.0.0.1:8080/', 60, 500);
    if (!up) {
      throw new Error('Local server did not start in time');
    }

    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
      await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15A372 Safari/604.1');

      const url = 'http://127.0.0.1:8080/articles/bytebreach-2025-2-writeup.html';
      const outFile = path.join(outDir, 'bytebreach-mobile.png');
      console.log(`Capturing ${url} -> ${outFile}`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      await page.screenshot({ path: outFile, fullPage: true });
      console.log('Screenshot saved to', outFile);
    } finally {
      await browser.close();
    }
  } catch (err) {
    console.error('Screenshot capture failed:', err);
    process.exitCode = 2;
  } finally {
    try {
      serverProc.kill();
    } catch (e) { /* ignore */ }
  }
})();