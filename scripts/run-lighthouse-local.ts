import { spawnSync, spawn } from 'child_process';
import http from 'http';
import path from 'path';
import fs from 'fs';
import os from 'os';

function runSync(cmd: string, args: string[], opts: any = {}) {
  console.log(`> ${cmd} ${args.join(' ')}`);
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: true, ...opts });
  if (res.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(' ')}`);
  }
}

async function waitForServer(url: string, attempts = 60, delay = 500) {
  // Wait longer to accommodate npx installs on first run
  for (let i = 0; i < attempts; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, res => {
          res.destroy();
          resolve(undefined);
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
    // Start http-server: prefer local node_modules/.bin/http-server, otherwise fall back to npx
    const localBin = path.join(process.cwd(), 'node_modules', '.bin', process.platform === 'win32' ? 'http-server.cmd' : 'http-server');
    let server: any;
    let serverExited = false;

    if (fs.existsSync(localBin)) {
      console.log(`Starting http-server from ${localBin} on port 8080...`);
      // spawn via shell so it works cross-platform when giving the exec string
      server = spawn(`${localBin} ./ -p 8080`, { shell: true, stdio: 'inherit' });
    } else {
      console.log('Starting http-server via npx --yes http-server ./ -p 8080 ...');
      try {
        server = spawn('npx --yes http-server ./ -p 8080', { shell: true, stdio: 'inherit' });
      } catch (err) {
        throw new Error("Failed to spawn 'npx' to run http-server. Install 'http-server' locally (npm i -D http-server) or ensure npx is available in your PATH.");
      }
    }

    server.on('exit', (code: number, sig: string) => {
      serverExited = true;
      console.error(`Local server process exited early (code=${code}, signal=${sig})`);
    });
    server.on('error', (err: any) => {
      serverExited = true;
      console.error('Failed to start local server:', err);
    });

    // Wait for server (allow longer for initial npx install)
    const up = await waitForServer('http://127.0.0.1:8080/');
    if (!up || serverExited) {
      try { server.kill(); } catch (e) {}
      throw new Error('Local server did not start in time');
    }

    // Ensure collapsible code blocks exist
    console.log('\nRunning collapsible code checks...');
    runSync('npx', ['-y', 'tsx', path.join('scripts', 'check-collapsible.ts')]);

    // Determine Puppeteer's Chromium path for reproducible Lighthouse runs (prefer Puppeteer)
    let CHROME_PATH = process.env.CHROME_PATH;
    let usingSystemChrome = false;
    try {
      if (!CHROME_PATH) {
        const puppeteer = require('puppeteer');
        CHROME_PATH = puppeteer.executablePath();
        console.log('Using Puppeteer Chromium at:', CHROME_PATH);
      } else {
        usingSystemChrome = true;
        console.warn('Using CHROME_PATH from environment:', CHROME_PATH, '(system Chrome). This may affect running user Chrome instances. Set CHROME_PATH to Puppeteer Chromium or install puppeteer for an isolated Chrome.');
      }
    } catch (e) {
      if (process.env.CHROME_PATH) {
        CHROME_PATH = process.env.CHROME_PATH;
        usingSystemChrome = true;
        console.warn('Puppeteer not available; falling back to CHROME_PATH env:', CHROME_PATH);
      } else {
        throw new Error('Puppeteer not installed and CHROME_PATH not set. Install puppeteer (npm i -D puppeteer) or set CHROME_PATH to your Chrome binary to run Lighthouse locally.');
      }
    }

    // Ensure output directories exist
    const reportsDir = path.join('dev', 'lighthouse', 'reports');
    const screenshotsDir = path.join('dev', 'lighthouse', 'screenshots');
    try { fs.mkdirSync(reportsDir, { recursive: true }); } catch (e) { /* ignore */ }
    try { fs.mkdirSync(screenshotsDir, { recursive: true }); } catch (e) { /* ignore */ }

    // Run Lighthouse audits (mobile + desktop) for representative pages
    const lighthouseFlags = (outPath: string, url: string, emulation: string) => [
      url,
      '--output', 'html',
      '--output-path', outPath,
      '--preset=perf',
      `--emulated-form-factor=${emulation}`,
      '--only-categories=performance,accessibility,best-practices,seo',
      '--chrome-flags="--no-sandbox --headless=new --disable-gpu --disable-dev-shm-usage"',
      `--chrome-path="${CHROME_PATH}"`
    ];

    // Cleanup: remove recent Chrome/Puppeteer temp directories (safe, age-limited, retried)
    function cleanupChromeTempDirs({ ageMinutes = 10, retries = 5, delayMs = 500 } = {}) {
      const tmp = os.tmpdir();
      const now = Date.now();
      const cutoff = now - ageMinutes * 60 * 1000;
      let touched: Array<{ dir: string; removed: boolean }> = [];
      try {
        const entries = fs.readdirSync(tmp, { withFileTypes: true });
        const candidates = entries
          .filter(e => e.isDirectory())
          .map(e => path.join(tmp, e.name))
          .filter(p => /chrome|puppeteer|lighthouse/i.test(path.basename(p)));

        for (const dir of candidates) {
          try {
            const stat = fs.statSync(dir);
            if (stat.mtimeMs < cutoff) continue; // skip old dirs
          } catch (e) { continue; }

          let removed = false;
          for (let i = 0; i < retries; i++) {
            try {
              fs.rmSync(dir, { recursive: true, force: true });
              console.log(`Removed temp dir: ${dir}`);
              removed = true;
              touched.push({ dir, removed: true });
              break;
            } catch (err: any) {
              // on Windows, concurrent handles can cause EPERM; wait and retry
              const wait = delayMs * (i + 1);
              console.warn(`Failed to remove ${dir} (attempt ${i + 1}/${retries}): ${err.code || err}. Retrying in ${wait}ms`);
              Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, wait);
            }
          }
          if (!removed) {
            console.warn(`Could not remove temp dir after ${retries} attempts: ${dir}`);
            touched.push({ dir, removed: false });
          }
        }
      } catch (e) {
        console.warn('Error during temp dir cleanup:', (e as any).message || e);
      }
      return touched;
    }

    function runLighthouse(outPath: string, url: string, emulation: string) {
      try {
        runSync('npx', ['-y', 'lighthouse', ...lighthouseFlags(outPath, url, emulation)]);
        // Best-effort cleanup after success
        try { cleanupChromeTempDirs(); } catch (e) { /* ignore */ }
      } catch (err) {
        // Try cleanup if Lighthouse errored (often due to Chrome cleanup problems)
        try { cleanupChromeTempDirs({ retries: 6, delayMs: 600 }); } catch (e) { /* ignore */ }
        if (fs.existsSync(outPath)) {
          console.warn(`Lighthouse failed but produced a report at ${outPath}; proceeding and ignoring cleanup errors.`);
        } else {
          throw err;
        }
      }
    }

    console.log('\nRunning Lighthouse (mobile) for AoC Day 7...');
    runLighthouse('./dev/lighthouse/reports/aoc-day07-mobile.html', 'http://127.0.0.1:8080/aoc/2025/07.html', 'mobile');

    console.log('Running Lighthouse (mobile) for Introducing GitSith...');
    runLighthouse('./dev/lighthouse/reports/introducing-gitsith-mobile.html', 'http://127.0.0.1:8080/articles/introducing-gitsith.html', 'mobile');

    console.log('Running Lighthouse (desktop) for AoC Day 7...');
    runLighthouse('./dev/lighthouse/reports/aoc-day07-desktop.html', 'http://127.0.0.1:8080/aoc/2025/07.html', 'desktop');

    console.log('Running Lighthouse (desktop) for Introducing GitSith...');
    runLighthouse('./dev/lighthouse/reports/introducing-gitsith-desktop.html', 'http://127.0.0.1:8080/articles/introducing-gitsith.html', 'desktop');

    // Capture screenshots
    console.log('\nCapturing screenshots (mobile + desktop)...');
    runSync('npx', ['-y', 'tsx', path.join('scripts', 'capture-screenshots.ts')]);

    console.log('\nPerforming final Chrome temp directory cleanup...');
    cleanupChromeTempDirs();

    console.log('\nAll checks complete. Shutting down local server.');
    try { server.close(); } catch (e) {}


    process.exit(0);
  } catch (err: any) {
    console.error('Local lighthouse run failed:', err.message || err);
    process.exitCode = 1;
  }
})();