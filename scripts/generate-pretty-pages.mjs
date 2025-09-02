import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const ROOT = 'docs';
const CATS_JSON = join(ROOT, 'data', 'categories.json');

const slugify = s => String(s).toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'');

const stub = (title, targetQS, canonical) => `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"/>
<title>${title} · ipv4.events</title>
<link rel="canonical" href="${canonical}"/>
<meta http-equiv="refresh" content="0; url=${targetQS}"/>
<script>location.replace('${targetQS}');</script>
</head><body></body></html>`;

const ensure = async p => mkdir(dirname(p), { recursive: true });

const run = async () => {
  const cats = JSON.parse(await readFile(CATS_JSON, 'utf8'));

  // Category pages: /category/<slug> -> /?cat=<ID>
  for (const c of cats) {
    const slug = slugify(c.id) || slugify(c.label || '');
    const p = join(ROOT, 'category', slug, 'index.html');
    await ensure(p);
    await writeFile(
      p,
      stub(c.label || c.id, `/?cat=${encodeURIComponent(c.id)}`, `https://ipv4.events/category/${slug}`),
      'utf8'
    );
  }

  // Decade pages: /decade/<1990s> -> /?dec=1990s
  const decades = ['1950s','1960s','1970s','1980s','1990s','2000s','2010s','2020s'];
  for (const d of decades) {
    const p = join(ROOT, 'decade', d, 'index.html');
    await ensure(p);
    await writeFile(
      p,
      stub(d, `/?dec=${encodeURIComponent(d)}`, `https://ipv4.events/decade/${d}`),
      'utf8'
    );
  }
};

run().catch(e => { console.error(e); process.exit(1); });
