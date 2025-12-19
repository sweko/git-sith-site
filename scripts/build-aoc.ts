/// <reference types="node" />
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'aoc');
const OUTPUT_DIR = path.join(__dirname, '..', 'aoc');
const SITE_TITLE = 'GitSith - Advent Of Code';
const CSS_PATH = '/assets/css/main.css';
const ARTICLE_CSS_PATH = '/assets/css/article.css';

type DayRecord = {
  year: string;
  day: string; // two-digit
  title: string;
  description?: string;
  filename: string; // like '01.html'
  srcFile?: string; // original source filename
};

function slugifyNum(n: number): string {
  return String(n).padStart(2, '0');
}

function ensureOutDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Remove previous output safely
if (fs.existsSync(OUTPUT_DIR) && path.basename(OUTPUT_DIR) === 'aoc') {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
}
ensureOutDir(OUTPUT_DIR);

const mdFiles = fs.existsSync(CONTENT_DIR) ? fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md')) : [];

// Parse files. Expect filenames like 'day-01-2025.md' or '2025-day-01.md'
const days: DayRecord[] = mdFiles.map(file => {
  const full = path.join(CONTENT_DIR, file);
  const raw = fs.readFileSync(full, 'utf8');
  const { data, content } = matter(raw);

  // Try to extract year and day from filename
  const name = path.basename(file, '.md');
  const m1 = /day-(\d{1,2})-(\d{4})/i.exec(name);
  const m2 = /(\d{4})-day-(\d{1,2})/i.exec(name);
  let dayNum = '01';
  let year = '2025';
  if (m1) { dayNum = slugifyNum(parseInt(m1[1], 10)); year = m1[2]; }
  else if (m2) { dayNum = slugifyNum(parseInt(m2[2], 10)); year = m2[1]; }
  else {
    // fallback: try to read first heading for year/day
    // look for something like '# Advent of Code 2025, Day 1'
    const heading = /#\s*.*?(20\d{2}).*?Day\s*(\d{1,2})/i.exec(content);
    if (heading) { year = heading[1]; dayNum = slugifyNum(parseInt(heading[2],10)); }
  }

  // Title: frontmatter title or first heading
  let title = data && (data as any).title ? String((data as any).title) : '';
  if (!title) {
    const h = /#\s*(.+)\s*/.exec(content);
    title = h ? h[1].trim() : `AoC ${year} Day ${parseInt(dayNum,10)}`;
  }

  // Description: frontmatter or excerpt
  const desc = (data && (data as any).description) ? String((data as any).description) : getExcerpt(content);

  return { year, day: dayNum, title, description: desc, filename: `${dayNum}.html`, srcFile: file } as DayRecord;
});

// Group by year
const years = days.reduce<Record<string, DayRecord[]>>((acc, d) => {
  acc[d.year] = acc[d.year] || [];
  acc[d.year].push(d);
  return acc;
}, {});

// Write top-level index (years)
const yearsList = Object.keys(years).sort((a,b) => b.localeCompare(a));
const indexHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Advent Of Code — ${SITE_TITLE}</title>  <link rel="canonical" href="/aoc/">
  <link rel="stylesheet" href="${CSS_PATH}">
  <link rel="stylesheet" href="${ARTICLE_CSS_PATH}">
  <script src="/assets/js/theme-switcher.js" defer></script>
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/icons/favicon-16x16.png">
  <link rel="shortcut icon" href="/assets/icons/favicon.ico">
  <link rel="manifest" href="/assets/icons/site.webmanifest">
  <meta name="theme-color" content="#764ba2">
  <script src="/assets/js/collapsible-code.js" defer></script>
</head>
<body>
  <nav class="site-nav">
    <a href="/">Home</a>
    <a href="/articles/">Articles</a>
    <a href="/aoc/">Advent Of Code</a>
    <button class="theme-toggle" aria-label="Toggle theme">Theme</button>
  </nav>
  <main>
    <div class="container">
      <h1>Advent Of Code</h1>
      <ul class="post-list">
        ${yearsList.map(y => `<li class="post-card"><h3><a href="${y}/">${y}</a></h3><p class="excerpt">${years[y].length} day(s) available</p></li>`).join('\n')}
      </ul>
    </div>
  </main>
</body>
</html>`;

fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexHtml, 'utf8');

// For each year, create directory and index and day pages
for (const y of Object.keys(years)) {
  const ydir = path.join(OUTPUT_DIR, y);
  ensureOutDir(ydir);

  // Year index: list days
  const daysForYear = years[y].sort((a,b) => a.day.localeCompare(b.day));
  const yearIndex = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AoC ${y} — ${SITE_TITLE}</title>
  <link rel="canonical" href="/aoc/${y}/">
  <link rel="stylesheet" href="${CSS_PATH}">
  <link rel="stylesheet" href="${ARTICLE_CSS_PATH}">
  <script src="/assets/js/theme-switcher.js" defer></script>
</head>
<body>
  <nav class="site-nav">
    <a href="/">Home</a>
    <a href="/articles/">Articles</a>
    <a href="/aoc/">Advent Of Code</a>
    <button class="theme-toggle" aria-label="Toggle theme">Theme</button>
  </nav>
  <main>
    <div class="container">
      <h1>Advent Of Code ${y}</h1>
      <ul class="post-list">
        ${daysForYear.map(d => `<li class="post-card"><h3><a href="${d.filename}">Day ${parseInt(d.day,10)} — ${escapeHtml(d.title)}</a></h3><div class="article-meta">${d.description ? `<p class="excerpt">${escapeHtml(d.description)}</p>` : ''}</div></li>`).join('\n')}
      </ul>
    </div>
  </main>
</body>
</html>`;

  fs.writeFileSync(path.join(ydir, 'index.html'), yearIndex, 'utf8');

  // Write day pages (with previous/next links when available)
  for (let i = 0; i < daysForYear.length; i++) {
    const d = daysForYear[i];
    const prev = i > 0 ? daysForYear[i - 1] : null;
    const next = i < daysForYear.length - 1 ? daysForYear[i + 1] : null;

    const srcFile = d.srcFile ? d.srcFile : `day-${d.day}-${y}.md`;
    const src = path.join(CONTENT_DIR, srcFile);
    let raw = '';
    if (fs.existsSync(src)) raw = fs.readFileSync(src, 'utf8');
    const { data, content } = matter(raw || '');
    let html = marked(content || '');
    // Remove leading H1 if it's the same as title
    const leadH1 = /^\s*<h1[^>]*>([\s\S]*?)<\/h1>\s*/i.exec(html);
    if (leadH1 && leadH1[1]) {
      const leadText = leadH1[1].replace(/<[^>]*>/g,'').trim();
      // Remove leading H1 if it matches the title, or if the author provided an explicit frontmatter title
      if ((data && (data as any).title) || leadText.toLowerCase() === d.title.toLowerCase()) {
        html = html.replace(leadH1[0], '');
      }
    }

    const excerpt = d.description || getExcerpt(content || '');
    const readingMinutes = getReadingTime(content || '');

    const navLinks = [] as string[];
    if (prev) navLinks.push(`<a class="prev" href="${prev.filename}" rel="prev" aria-label="Previous: Day ${parseInt(prev.day,10)} — ${escapeHtml(prev.title)}">← Day ${parseInt(prev.day,10)} — ${escapeHtml(prev.title)}</a>`);
    if (next) navLinks.push(`<a class="next" href="${next.filename}" rel="next" aria-label="Next: Day ${parseInt(next.day,10)} — ${escapeHtml(next.title)}">Day ${parseInt(next.day,10)} — ${escapeHtml(next.title)} →</a>`);
    const navHtml = navLinks.length ? `<nav class="aoc-nav" aria-label="Advent Of Code navigation">${navLinks.join('\n')}</nav>` : '';

    const page = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Day ${parseInt(d.day,10)}/${y} - ${escapeHtml(d.title)} — AoC ${y} — ${SITE_TITLE}</title>
  <meta name="description" content="${escapeHtml(d.description || excerpt)}">
  <link rel="canonical" href="/aoc/${y}/${d.day}/">
  <link rel="stylesheet" href="${CSS_PATH}">
  <link rel="stylesheet" href="${ARTICLE_CSS_PATH}">
  <script src="/assets/js/theme-switcher.js" defer></script>
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/icons/favicon-16x16.png">
  <link rel="shortcut icon" href="/assets/icons/favicon.ico">
  <link rel="manifest" href="/assets/icons/site.webmanifest">
  <meta name="theme-color" content="#764ba2">
  <script src="/assets/js/collapsible-code.js" defer></script>
  <script src="/assets/js/aoc-nav.js" defer></script>
</head>
<body>
  <nav class="site-nav">
    <a href="/">Home</a>
    <a href="/articles/">Articles</a>
    <a href="/aoc/">Advent Of Code</a>
    <button class="theme-toggle" aria-label="Toggle theme">Theme</button>
  </nav>
  <main>
    <div class="article-container container">
      <header class="article-header">
        <h1>Day ${parseInt(d.day,10)}/${y} - ${escapeHtml(d.title)}</h1>
        <div class="article-meta"><time datetime="${y}">${y}</time> · ${readingMinutes} min read</div>
      </header>
      <div class="article-content">
        ${html}
      </div>
      <footer class="article-footer">
        <p>Advent Of Code ${y} — Day ${parseInt(d.day,10)}</p>
        ${navHtml}
      </footer>
    </div>
  </main>
</body>
</html>`;

    fs.writeFileSync(path.join(ydir, d.filename), page, 'utf8');
  }
}

console.log(`Built AoC pages for years: ${Object.keys(years).join(', ') || 'none'}`);

// Helpers
function getExcerpt(md: string) {
  const m = /^(?:#.*\n)?([\s\S]*?)\n\n/m.exec(md);
  if (m && m[1]) {
    return stripTags(marked(m[1])).slice(0, 240);
  }
  return stripTags(marked(md)).slice(0,220);
}

function getReadingTime(md: string) {
  const text = stripTags(marked(md));
  const words = (text.match(/\w+/g) || []).length;
  return Math.max(1, Math.ceil(words / 200));
}

function stripTags(s: string) { return s.replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim(); }

function escapeHtml(s: string) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
