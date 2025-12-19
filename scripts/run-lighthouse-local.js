const { spawnSync, spawn } = require('child_process');
const http = require('http');
const path = require('path');

function runSync(cmd, args, opts = {}) {
  console.log(`> ${cmd} ${args.join(' ')}`);
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: true, ...opts });
  if (res.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(' ')}`);
  }
}

async function waitForServer(url, attempts = 10, delay = 500) {
  for (let i = 0; i < attempts; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, res => {
          res.destroy();
          resolve();
        });
        req.on('error', reject);
      });
      return true;
    } catch (e) {
      await new Promise(r => setTimeout(r, delay));
    }
  }
  return false;
}

(async () => {
  try {
    // Build static site
    runSync('npm', ['run', 'build']);

    // Start a local static server via npx http-server
    console.log('Starting local http-server on port 8080...');
    const server = spawn('npx', ['http-server', './', '-p', '8080'], { stdio: 'inherit', shell: true });

    // Wait for server
    const up = await waitForServer('http://127.0.0.1:8080/');
    if (!up) {
      server.kill();
      throw new Error('Local server did not start in time');
    }

    // Ensure collapsible code blocks exist
    console.log('\nRunning collapsible code checks...');
    runSync('node', [path.join('scripts','check-collapsible.js')]);

    // Determine Puppeteer's Chromium path for reproducible Lighthouse runs
    const CHROME_PATH = spawnSync('node', ['-e', "console.log(require('puppeteer').executablePath())"], { encoding: 'utf8', shell: true }).stdout.trim();
    console.log('Using Chrome at:', CHROME_PATH);

    // Run Lighthouse audits (mobile + desktop) for representative pages
    const lighthouseFlags = (outPath, url, emulation) => [
      url,
      '--output', 'html',
      '--output-path', outPath,
      '--preset=perf',
      `--emulated-form-factor=${emulation}`,
      '--only-categories=performance,accessibility,best-practices,seo',
      '--chrome-flags="--no-sandbox --headless=new --disable-gpu --disable-dev-shm-usage"',
      `--chrome-path="${CHROME_PATH}"`
    ];

    console.log('\nRunning Lighthouse (mobile) for AoC Day 7...');
    runSync('npx', ['-y', 'lighthouse', ...lighthouseFlags('./dev/lighthouse-reports/aoc-day07-mobile.html', 'http://127.0.0.1:8080/aoc/2025/07.html', 'mobile')]);

    console.log('Running Lighthouse (mobile) for Introducing GitSith...');
    runSync('npx', ['-y', 'lighthouse', ...lighthouseFlags('./dev/lighthouse-reports/introducing-gitsith-mobile.html', 'http://127.0.0.1:8080/articles/introducing-gitsith.html', 'mobile')]);

    console.log('Running Lighthouse (desktop) for AoC Day 7...');
    runSync('npx', ['-y', 'lighthouse', ...lighthouseFlags('./dev/lighthouse-reports/aoc-day07-desktop.html', 'http://127.0.0.1:8080/aoc/2025/07.html', 'desktop')]);

    console.log('Running Lighthouse (desktop) for Introducing GitSith...');
    runSync('npx', ['-y', 'lighthouse', ...lighthouseFlags('./dev/lighthouse-reports/introducing-gitsith-desktop.html', 'http://127.0.0.1:8080/articles/introducing-gitsith.html', 'desktop')]);

    // Capture screenshots
    console.log('\nCapturing screenshots (mobile + desktop)...');
    runSync('node', [path.join('scripts','capture-screenshots.js')]);

    console.log('\nAll checks complete. Shutting down local server.');
    server.kill();
    process.exit(0);
  } catch (err) {
    console.error('Local lighthouse run failed:', err.message || err);
    process.exitCode = 1;
  }
})();
