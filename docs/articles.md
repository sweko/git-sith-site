# Articles — Writing and building

Add Markdown files to `content/articles/` with optional YAML frontmatter. Example frontmatter keys:

- `title` — article title
- `date` — YYYY-MM-DD or parseable date
- `description` — short summary

Example:

---
title: "My Article"
date: 2025-12-17
description: "Short summary"
---

## Building

1. Install dependencies:

```bash
npm install
```

2. Build articles:

```bash
npm run build:articles
```

Note: the build script is written in **TypeScript** and uses `ts-node`. Running `npm install` will install `ts-node` (dev dependency) so the script can run. The script will output HTML files into an `articles/` folder and generate an `articles/index.html` listing.

For static deployments (e.g., Cloudflare Pages), prefer committing the generated `articles/`, `assets/`, and site `index.html` to the repository so the site can be served as static files. This repo includes a `.cfignore` which excludes development-only files (TypeScript sources, scripts, node_modules, docs, source `content/`, etc.) so only the built static site files are uploaded for deployment.
