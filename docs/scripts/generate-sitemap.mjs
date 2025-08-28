// scripts/generate-sitemap.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const DOCS = path.join(ROOT, 'docs');
const DATA = path.join(DOCS, 'data');
const EVENTS_DIR = path.join(DATA, 'events');
const MANIFEST = path.join(EVENTS_DIR, 'manifest.json');
const CATEGORIES = path.join(DATA, 'categories.json');
const OUTFILE = path.join(DOCS, 'sitemap.xml');

// Base URL (override for forks/previews if needed)
const BASE = process.env.SITE_BASE_URL || 'https://ipv4.events';

// ————— helpers —————
const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');

const decadeOf = (y) => {
  if (y < 1960) return '1950s';
  if (y < 1970) return '1960s';
  if (y < 1980) return '1970s';
  if (y < 1990) return '1980s';
  if (y < 2000) return '1990s';
  if (y < 2010) return '2000s';
  if (y < 2020) return '2010s';
  return '2020s';
};

const xmlEscape = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// ————— load data —————
async function loadJSON(file) {
  const buf = await readFile(file, 'utf8');
  return JSON.parse(buf);
}

async function main() {
  if (!existsSync(DOCS)) throw new Error('docs/ missing');
  if (!existsSync(CATEGORIES)) throw new Error('docs/data/categories.json missing');

  // 1) Categories -> /category/<slug>
  const cats = await loadJSON(CATEGORIES);
  const categoryUrls = cats.map((c) => `/category/${slugify(c.id)}`);

  // 2) Decades present in events -> /decade/<1990s>
  const decades = new Set();
  if (existsSync(MANIFEST)) {
    const files = await loadJSON(MANIFEST);
    for (const f of files) {
      const fp = path.join(EVENTS_DIR, f);
      if (!existsSync(fp)) continue;
      try {
        const arr = await loadJSON(fp);
        if (Array.isArray(arr)) {
          for (const ev of arr) {
            const y = Number(ev?.year);
            if (y) decades.add(decadeOf(y));
          }
        }
      } catch { /* ignore malformed */ }
    }
  } else {
    // fall back to scanning directory if manifest is absent
    for (const f of readdirSync(EVENTS_DIR)) {
      if (!f.endsWith('.json')) continue;
      try {
        const arr = await loadJSON(path.join(EVENTS_DIR, f));
        if (Array.isArray(arr)) {
          for (const ev of arr) {
            const y = Number(ev?.year);
            if (y) decades.add(decadeOf(y));
          }
        }
      } catch { /* ignore */ }
    }
  }
  const decadeUrls = [...decades].sort().map((d) => `/decade/${d}`);

  // 3) Root
  const urls = ['/', ...categoryUrls, ...decadeUrls];

  // Build XML
  const now = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const body = urls
    .map(
      (u) =>
        `  <url>\n` +
        `    <loc>${xmlEscape(BASE + u)}</loc>\n` +
        `    <changefreq>weekly</changefreq>\n` +
        `    <priority>${u === '/' ? '1.0' : '0.6'}</priority>\n` +
        `    <lastmod>${now}</lastmod>\n` +
        `  </url>`
    )
    .join('\n');

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${body}\n` +
    `</urlset>\n`;

  // Write only if changed
  const newHash = crypto.createHash('sha1').update(xml).digest('hex');
  let oldHash = '';
  try {
    const old = await readFile(OUTFILE, 'utf8');
    oldHash = crypto.createHash('sha1').update(old).digest('hex');
  } catch {}
  if (newHash !== oldHash) {
    await writeFile(OUTFILE, xml, 'utf8');
    console.log('sitemap.xml updated:', OUTFILE);
  } else {
    console.log('sitemap.xml unchanged');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});