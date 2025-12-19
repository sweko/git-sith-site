import fs from 'fs/promises';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'https://gitsith.com';
const OUT = 'sitemap.xml';

const EXCLUDE_DIRS = new Set(['dev', 'docs', '.github', 'scripts', 'content', 'assets', 'node_modules', '.git']);

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const ent of entries) {
    const name = ent.name;
    const full = path.join(dir, name);
    if (ent.isDirectory()) {
      if (EXCLUDE_DIRS.has(name)) continue;
      files.push(...await walk(full));
    } else if (ent.isFile() && name.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

function toUrlPath(filePath: string) {
  // Make path relative to repo root and use posix separators
  let rel = path.relative(process.cwd(), filePath).split(path.sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'index.html'.length);
  return '/' + rel;
}

(async () => {
  try {
    const all = await walk(process.cwd());
    const filtered = all.filter(p => !p.includes('/dev/lighthouse') && !p.includes('/dev/lighthouse-reports'));

    const urls = await Promise.all(filtered.map(async (file) => {
      const stat = await fs.stat(file);
      const loc = BASE_URL.replace(/\/$/, '') + toUrlPath(file);
      return { loc, lastmod: stat.mtime.toISOString() };
    }));

    const header = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    const urlsetOpen = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    const urlsetClose = `</urlset>`;

    const body = urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`).join('\n');
    const xml = header + urlsetOpen + body + '\n' + urlsetClose + '\n';

    await fs.writeFile(OUT, xml, 'utf8');
    console.log(`Wrote ${OUT} (${urls.length} URLs) targeting ${BASE_URL}`);
  } catch (err) {
    console.error('Failed to build sitemap:', err);
    process.exitCode = 1;
  }
})();