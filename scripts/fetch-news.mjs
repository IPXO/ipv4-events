/**
 * Fetches RSS/Atom feeds from IPv4 & internet news sources,
 * merges and sorts the results, and writes docs/data/news.json.
 *
 * Run manually: node scripts/fetch-news.mjs
 * Run in CI:    see .github/workflows/fetch-news.yml
 */
import { writeFile, mkdir } from 'node:fs/promises';

const SOURCES = [
  { name: 'RIPE Labs',   icon: '🌍', url: 'https://labs.ripe.net/feed.xml' },
  { name: 'APNIC',       icon: '🌏', url: 'https://blog.apnic.net/feed/' },
  { name: 'ARIN',        icon: '🌎', url: 'https://www.arin.net/blog/rss.xml' },
  { name: 'Cloudflare',  icon: '☁️',  url: 'https://blog.cloudflare.com/rss/' },
  { name: 'The Register',icon: '📰',  url: 'https://www.theregister.com/on_prem/networks/headlines.atom' },
];

const MAX_PER_SOURCE = 10;
const MAX_TOTAL      = 40;
const TIMEOUT_MS     = 12000;

/* ── XML helpers ── */

function stripHtml(s) {
  return (s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function extractField(block, tags) {
  for (const tag of [].concat(tags)) {
    const re = new RegExp(
      `<${tag}(?:\\s[^>]*)?>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))<\\/${tag}>`,
      'i'
    );
    const m = re.exec(block);
    if (m) return (m[1] != null ? m[1] : m[2] ?? '').trim();
  }
  return '';
}

function extractLink(block) {
  // Atom: any tag with href="https://..."
  const m1 = /href="(https?:\/\/[^"]+)"/.exec(block);
  if (m1) return m1[1];
  // RSS 2.0: <link>url</link>
  const m2 = /<link>\s*(https?:\/\/[^\s<]+)\s*<\/link>/i.exec(block);
  if (m2) return m2[1];
  // GUID fallback
  const m3 = /<guid[^>]*>\s*(https?:\/\/[^\s<]+)\s*<\/guid>/i.exec(block);
  if (m3) return m3[1];
  return '';
}

/* ── Per-source fetch ── */

async function fetchSource(src) {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(src.url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'ipv4.events-newsfetcher/1.0 (https://ipv4.events)' },
    });
    clearTimeout(timer);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const xml = await r.text();

    const items = [];
    const re = /<(?:item|entry)(?:\s[^>]*)?>[\s\S]*?<\/(?:item|entry)>/gi;
    let m;
    while ((m = re.exec(xml)) !== null && items.length < MAX_PER_SOURCE) {
      const block = m[0];
      const title = stripHtml(extractField(block, 'title'));
      const link  = extractLink(block);
      const desc  = stripHtml(
        extractField(block, ['description', 'summary', 'content:encoded', 'content'])
      );
      const dateStr = extractField(block, ['pubDate', 'published', 'updated', 'dc:date']);
      const pubDate = dateStr ? (() => { try { return new Date(dateStr).toISOString(); } catch { return null; } })() : null;

      if (title && link.startsWith('http')) {
        items.push({
          title,
          link,
          description: desc.length > 280 ? desc.slice(0, 280) + '…' : desc,
          pubDate,
          source:     src.name,
          sourceIcon: src.icon,
        });
      }
    }

    console.log(`  ✓ ${src.name}: ${items.length} items`);
    return items;
  } catch (e) {
    clearTimeout(timer);
    console.warn(`  ✗ ${src.name}: ${e.message}`);
    return [];
  }
}

/* ── Main ── */

const results = await Promise.allSettled(SOURCES.map(fetchSource));
const all = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);

all.sort((a, b) => {
  if (!a.pubDate && !b.pubDate) return 0;
  if (!a.pubDate) return 1;
  if (!b.pubDate) return -1;
  return new Date(b.pubDate) - new Date(a.pubDate);
});

const news = all.slice(0, MAX_TOTAL);

await mkdir('docs/data', { recursive: true });
await writeFile('docs/data/news.json', JSON.stringify(news, null, 2) + '\n', 'utf8');
console.log(`\nWritten ${news.length} items → docs/data/news.json`);
