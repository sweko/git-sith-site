import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

function runSync(cmd: string, args: string[], opts: any = {}) {
  console.log(`> ${cmd} ${args.join(' ')}`);
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: true, ...opts });
  if (res.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(' ')}`);
  }
}

const BASE_URL = process.env.BASE_URL || 'https://gitsith.com';

// Ensure output directories exist
const reportsDir = path.join('dev', 'lighthouse', 'reports');
const screenshotsDir = path.join('dev', 'lighthouse', 'screenshots');
try { fs.mkdirSync(reportsDir, { recursive: true }); } catch (e) { /* ignore */ }
try { fs.mkdirSync(screenshotsDir, { recursive: true }); } catch (e) { /* ignore */ }

// Lighthouse flags helper
const lighthouseFlags = (outPath: string, url: string, emulation: string, chromePath: string) => [
  url,
  '--output', 'html',
  '--output-path', outPath,
  '--preset=perf',
  `--emulated-form-factor=${emulation}`,
  '--only-categories=performance,accessibility,best-practices,seo',
  '--chrome-flags="--no-sandbox --headless=new --disable-gpu --disable-dev-shm-usage"',
  `--chrome-path="${chromePath}"`
];

function runLighthouse(outPath: string, url: string, emulation: string, CHROME_PATH: string) {
  try {
    runSync('npx', ['-y', 'lighthouse', ...lighthouseFlags(outPath, url, emulation, CHROME_PATH)]);
  } catch (err) {
    if (fs.existsSync(outPath)) {
      console.warn(`Lighthouse failed but produced a report at ${outPath}; proceeding and ignoring cleanup errors.`);
    } else {
      throw err;
    }
  }
}

(async () => {
  try {
    // Determine Chrome path (prefer Puppeteer if installed)
    let CHROME_PATH = process.env.CHROME_PATH;
    try {
      if (!CHROME_PATH) {
        const puppeteer = require('puppeteer');
        CHROME_PATH = puppeteer.executablePath();
        console.log('Using Puppeteer Chromium at:', CHROME_PATH);
      }
    } catch (e) {
      if (!CHROME_PATH) {
        throw new Error('Puppeteer not installed and CHROME_PATH not set. Install puppeteer (npm i -D puppeteer) or set CHROME_PATH to your Chrome binary to run Lighthouse.');
      }
    }

    // Ensure CHROME_PATH is defined for type safety
    if (!CHROME_PATH) {
      throw new Error('CHROME_PATH is required to run Lighthouse. Set the CHROME_PATH env var or install puppeteer.');
    }

    console.log('\nRunning Lighthouse (mobile) for AoC Day 7 (prod)...');
    runLighthouse('./dev/lighthouse/reports/aoc-day07-mobile.html', `${BASE_URL}/aoc/2025/07`, 'mobile', CHROME_PATH);

    console.log('Running Lighthouse (mobile) for Introducing GitSith (prod)...');
    runLighthouse('./dev/lighthouse/reports/introducing-gitsith-mobile.html', `${BASE_URL}/articles/introducing-gitsith`, 'mobile', CHROME_PATH);

    console.log('Running Lighthouse (desktop) for AoC Day 7 (prod)...');
    runLighthouse('./dev/lighthouse/reports/aoc-day07-desktop.html', `${BASE_URL}/aoc/2025/07`, 'desktop', CHROME_PATH);

    console.log('Running Lighthouse (desktop) for Introducing GitSith (prod)...');
    runLighthouse('./dev/lighthouse/reports/introducing-gitsith-desktop.html', `${BASE_URL}/articles/introducing-gitsith`, 'desktop', CHROME_PATH);

    // Capture screenshots (use capture-screenshots script which accepts BASE_URL env)
    console.log('\nCapturing screenshots (mobile + desktop) from production site...');
    runSync('npx', ['-y', 'tsx', path.join('scripts','capture-screenshots.ts')], { env: { ...process.env, BASE_URL } });

    console.log('\nAll checks complete (prod).');
    process.exit(0);
  } catch (err: any) {
    console.error('Production lighthouse run failed:', err.message || err);
    process.exitCode = 1;
  }
})();