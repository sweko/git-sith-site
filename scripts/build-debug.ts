/// <reference types="node" />
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'debug');
const OUTPUT_DIR = path.join(__dirname, '..', 'debug');
const SITE_TITLE = 'GitSith - DEBUG: A Novel in Code';
const CSS_PATH = '/assets/css/main.css';
const ARTICLE_CSS_PATH = '/assets/css/article.css';

const BASE_URL = (process.env.BASE_URL || 'https://gitsith.com').replace(/\/$/, '');

type ChapterRecord = {
  title: string;
  chapter?: string;
  description?: string;
  slug: string;
  filename: string;
  order?: number;
};

function slugify(name: string): string {
  return name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function ensureOutDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function build() {
  // Remove previous build output to avoid stale files
  if (fs.existsSync(OUTPUT_DIR) && path.basename(OUTPUT_DIR) === 'debug') {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }

  ensureOutDir(OUTPUT_DIR);

  const mdFiles: string[] = fs.readdirSync(CONTENT_DIR).filter((f: string) => f.endsWith('.md'));

  const chapters: ChapterRecord[] = mdFiles.map((file: string) => {
    const full = path.join(CONTENT_DIR, file);
    const raw = fs.readFileSync(full, 'utf8');
    const { data, content } = matter(raw);
    let html = marked(content);

    // Remove leading H1 from markdown content if it matches the chapter title (prevents duplicated H1)
    const title = (data && (data as any).title) ? String((data as any).title) : path.basename(file, '.md');
    const leadH1 = /^\s*<h1[^>]*>([\s\S]*?)<\/h1>\s*/i.exec(html);
    if (leadH1 && leadH1[1]) {
      const leadText = leadH1[1].replace(/<[^>]*>/g, '').trim();
      if (leadText && leadText.toLowerCase() === title.toLowerCase()) {
        html = html.replace(leadH1[0], '');
      }
    }

    const slug = slugify(title);
    const chapter = (data && (data as any).chapter) ? String((data as any).chapter) : '';
    const description = (data && (data as any).description) ? String((data as any).description) : '';
    const order = (data && (data as any).order) ? Number((data as any).order) : 0;
    const outFile = path.join(OUTPUT_DIR, `${slug}.html`);

    const excerpt = getExcerpt(html, description);
    const readingMinutes = getReadingTime(html);

    const page = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} — ${SITE_TITLE}</title>
  <meta name="description" content="${escapeHtml(description || excerpt)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description || excerpt)}">
  <link rel="canonical" href="${BASE_URL}/debug/${slug}/">
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
    <a href="/debug/">DEBUG</a>
    <button class="theme-toggle" aria-label="Toggle theme">Theme</button>
  </nav>
  <main>
    <div class="article-container container">
      <header class="article-header">
        <h1>${escapeHtml(title)}</h1>
        <div class="article-meta">${chapter ? `${chapter} · ` : ''}${readingMinutes} min read</div>
        ${description ? `<p class="article-description">${escapeHtml(description)}</p>` : ''}
      </header>
      <div class="article-content">
        ${html}
      </div>
      <footer class="article-footer">
        <nav class="chapter-nav">
          <p><a href="/debug/">← Back to Table of Contents</a></p>
        </nav>
        <p>Part of "DEBUG: A Novel in Code" — originally published on GitSith.</p>
      </footer>
    </div>
  </main>
</body>
</html>`;

    fs.writeFileSync(outFile, page, 'utf8');

    return { title, chapter, description, slug, filename: `${slug}.html`, order } as ChapterRecord;
  });

  // Sort chapters by order for proper table of contents
  chapters.sort((a, b) => (a.order || 0) - (b.order || 0));

  const indexHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>DEBUG: A Novel in Code — ${SITE_TITLE}</title>
  <meta name="description" content="A tech thriller novel told through code">
  <link rel="canonical" href="${BASE_URL}/debug/">
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
    <a href="/debug/">DEBUG</a>
    <button class="theme-toggle" aria-label="Toggle theme">Theme</button>
  </nav>
  <main>
    <div class="container">
      <header class="page-header">
        <h1>DEBUG: A Novel in Code</h1>
        <p class="subtitle">A tech thriller told through the language we live in</p>
      </header>
      
      <div class="book-description">
        <p>What if debugging wasn't just about fixing code, but fixing time itself? Follow our protagonist as they discover a mysterious debugging interface that allows them to step through their own life, set breakpoints in their past, and maybe—just maybe—fix the critical bugs that have led them to this moment.</p>
        <p>A story told through terminal windows, code snippets, and the familiar desperation of a developer trying to understand why everything is broken.</p>
      </div>

      <nav class="table-of-contents">
        <h2>Table of Contents</h2>
        <ol class="chapter-list">
          ${chapters.map(chapter => {
            const excerpt = escapeHtml(getExcerptFromFile(path.join(OUTPUT_DIR, chapter.filename), chapter.description));
            return `<li class="chapter-card">
              <h3><a href="${chapter.filename}">${escapeHtml(chapter.title)}</a></h3>
              ${chapter.chapter ? `<div class="chapter-meta"><small>${escapeHtml(chapter.chapter)}</small></div>` : ''}
              ${excerpt ? `<p class="chapter-excerpt">${excerpt}</p>` : ''}
            </li>`
          }).join('\n')}
        </ol>
      </nav>
    </div>
  </main>
</body>
</html>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexHtml, 'utf8');

  // Helper functions used during build
  function getExcerpt(htmlStr: string, fallback?: string) {
    if (fallback) return fallback;
    const m = /<p>(.*?)<\/p>/i.exec(htmlStr);
    if (m && m[1]) {
      const text = stripTags(m[1]);
      return text.slice(0, 240) + (text.length > 240 ? '…' : '');
    }
    const bodyText = stripTags(htmlStr);
    return bodyText.slice(0, 220) + (bodyText.length > 220 ? '…' : '');
  }

  function getReadingTime(htmlStr: string) {
    const text = stripTags(htmlStr);
    const words = (text.match(/\w+/g) || []).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  function stripTags(s: string) {
    return s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  function getExcerptFromFile(filePath: string, fallback?: string) {
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const m = /<div class="article-content">([\s\S]*?)<\/div>/i.exec(raw);
      if (m && m[1]) return getExcerpt(m[1], fallback);
    } catch (e) {
      // ignore
    }
    return fallback || '';
  }

  console.log(`Built ${chapters.length} chapters to ${OUTPUT_DIR}`);
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

build();