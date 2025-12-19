const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667, isMobile: true });
  await page.goto('http://127.0.0.1:8080/aoc/2025/07.html', { waitUntil: 'networkidle2' });
  const detailsCount = await page.$$eval('details.collapsible-code', els => els.length);
  console.log('details count:', detailsCount);
  if (detailsCount > 0) {
    const firstSummary = await page.$eval('details.collapsible-code summary', s => s.textContent.trim());
    console.log('first summary:', firstSummary);
  }
  await browser.close();
})();