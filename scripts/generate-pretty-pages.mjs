import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const ROOT = 'docs';
const CATS_JSON = join(ROOT, 'data', 'categories.json');

const slugify = s => String(s)
  .toLowerCase()
  .replace(/[/&]/g, '-')
  .replace(/\s+/g, '-')
  .replace(/[^a-z0-9-]/g, '')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');

// Generates a stub page that:
// - Has a canonical pointing to the trailing-slash URL (what GitHub Pages serves)
// - Redirects immediately to the hash-based SPA route
// - Includes a meta description for SEO
const stub = ({ title, description, canonical, hashTarget }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${title} · ipv4.events</title>
<meta name="description" content="${description}"/>
<link rel="canonical" href="${canonical}"/>
<meta http-equiv="refresh" content="0; url=${hashTarget}"/>
<script>location.replace('${hashTarget}');</script>
</head>
<body>
<p>Redirecting to <a href="${hashTarget}">${title} on ipv4.events</a>…</p>
</body>
</html>
`;

const ensure = async p => mkdir(dirname(p), { recursive: true });

const run = async () => {
  const cats = JSON.parse(await readFile(CATS_JSON, 'utf8'));

  // Category pages: /category/<slug>/ -> /#/category/<slug>
  for (const c of cats) {
    const slug = slugify(c.id) || slugify(c.label || '');
    const canonical = `https://ipv4.events/category/${slug}/`;
    const hashTarget = `/#/category/${slug}`;
    const description = `Browse all ${c.label} events in the IPv4 era timeline — a retro-styled history of internet technology.`;

    const p = join(ROOT, 'category', slug, 'index.html');
    await ensure(p);
    await writeFile(p, stub({ title: c.label || c.id, description, canonical, hashTarget }), 'utf8');
    console.log(`  category/${slug}/`);
  }

  // Decade pages: /decade/<1990s>/ -> /#/decade/1990s
  const decades = ['1950s','1960s','1970s','1980s','1990s','2000s','2010s','2020s'];
  for (const d of decades) {
    const canonical = `https://ipv4.events/decade/${d}/`;
    const hashTarget = `/#/decade/${d}`;
    const description = `Explore internet and technology milestones from the ${d} in the IPv4 era timeline.`;

    const p = join(ROOT, 'decade', d, 'index.html');
    await ensure(p);
    await writeFile(p, stub({ title: `The ${d}`, description, canonical, hashTarget }), 'utf8');
    console.log(`  decade/${d}/`);
  }

  console.log('Done.');
};

run().catch(e => { console.error(e); process.exit(1); });
