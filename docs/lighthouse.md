# Lighthouse scripts and usage ⚡️

This document explains the repository's Lighthouse tooling: how to run local audits, run production audits against https://gitsith.com, capture screenshots, and what environment variables and outputs are used.

---

## Prerequisites ✅

- Node.js (current LTS recommended; CI uses Node 20).
- npm (or pnpm/yarn) and the repo installed: `npm ci`.
- Optional: Puppeteer (installed as a devDependency in this repo) or set `CHROME_PATH` to a Chrome/Chromium binary if you want reproducible Lighthouse runs.

Note: scripts are written in TypeScript and run with `tsx` (no build step required).

---

## Main scripts (npm) 🧭

- `npm run lighthouse` — Run the full local Lighthouse flow. This will:
  - Start a local static server (http-server via npx) if not already running.
  - Run the collapsible-code checks and Lighthouse audits (mobile + desktop) for representative pages.
  - Capture screenshots.

- `npm run lighthouse:prod` — Run Lighthouse against the production site (defaults to `https://gitsith.com`). This script does NOT start a local server — it targets the configured `BASE_URL`.

- `npm run screenshots` — Capture screenshots for a few representative pages. Accepts `BASE_URL` to target a non-local site.
- `npm run build:sitemap` — Generate `sitemap.xml` for the site (defaults to https://gitsith.com).
---

## Environment variables 🧩

- `BASE_URL` — Base URL to use when fetching pages. Defaults to `http://127.0.0.1:8080` for local scripts, and `https://gitsith.com` for the production script. Examples:

  - Local (default): `npm run lighthouse`
  - Production (default): `npm run lighthouse:prod`
  - Custom: `BASE_URL=https://staging.gitsith.com npm run lighthouse:prod`

- `CHROME_PATH` — Optional: path to a Chrome/Chromium binary to use for Lighthouse. The scripts will prefer Puppeteer's bundled Chromium if Puppeteer is installed; otherwise set `CHROME_PATH`.

---

## Output locations 📁

- Lighthouse HTML reports: `./dev/lighthouse/reports/*.html`
- Screenshots: `./dev/lighthouse/screenshots/*.png`

These are safe to upload as CI artifacts (the GitHub workflow already uploads reports and screenshots).

---

## Implementation notes 🔧

- Scripts are TypeScript files in `scripts/` and run with `tsx` (no build step). See:
  - `scripts/run-lighthouse-local.ts` — local runner (starts http-server)
  - `scripts/run-lighthouse-prod.ts` — production runner (targets `https://gitsith.com` by default)
  - `scripts/capture-screenshots.ts` — capture screenshots (accepts `BASE_URL`)
  - `scripts/check-collapsible.ts` — test collapsible code blocks (accepts `BASE_URL`)

- The GitHub workflow (`.github/workflows/lighthouse-pr.yml`) calls the `check-collapsible` and `capture-screenshots` steps using `npx -y tsx` so the workflow runs without a global install.

---

## Troubleshooting & tips 🛠️

- If the local server fails to start, ensure `http-server` can be run (the script will prefer local `node_modules/.bin/http-server` or fall back to `npx http-server`).
- If Lighthouse cannot find Chrome, either install `puppeteer` (the script will discover Puppeteer's Chromium) or export `CHROME_PATH` to your Chrome/Chromium binary.
- To test real production behaviour (e.g., Cloudflare optimizations), run `npm run lighthouse:prod` and compare results to running Lighthouse against `127.0.0.1`.

---

## Quick examples ✨

- Run local flow (build site first):

```bash
npm ci
npm run build
npm run lighthouse
```

- Run production audits (default `gitsith.com`):

```bash
npm run lighthouse:prod
```

- Run production audits against staging:

```bash
BASE_URL=https://staging.gitsith.com npm run lighthouse:prod
```

- Capture screenshots against production:

```bash
BASE_URL=https://gitsith.com npm run screenshots
```
