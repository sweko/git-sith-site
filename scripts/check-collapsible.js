const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667, isMobile: true });
  await page.goto('http://127.0.0.1:8080/aoc/2025/07.html', { waitUntil: 'networkidle2' });
  const detailsCount = await page.$$eval('details.collapsible-code', els => els.length);
  console.log('details count:', detailsCount);

  if (detailsCount === 0) {
    console.error('No collapsible code blocks found on', url);
    await browser.close();
    process.exit(2);
  }

  const summaries = await page.$$eval('details.collapsible-code summary', els => els.map(s => s.textContent.trim()));
  console.log('summaries:', summaries.slice(0,5));

  // Ensure at least one summary matches expected default
  const hasShowCode = summaries.some(s => /show code/i.test(s));
  if (!hasShowCode) {
    console.error('No summary with "Show code" text found on', url);
    await browser.close();
    process.exit(3);
  }

  // Ensure none are open by default
  const openCount = await page.$$eval('details.collapsible-code[open]', els => els.length);
  console.log('details open by default:', openCount);
  if (openCount > 0) {
    console.error('Some collapsible code blocks are open by default on', url);
    await browser.close();
    process.exit(4);
  }

  await browser.close();
})();