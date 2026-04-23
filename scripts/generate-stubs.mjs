/**
 * Generates per-route stub HTML files under docs/category/ and docs/decade/.
 * Each stub has a unique <title>, <meta description>, <link rel="canonical">,
 * and an inline JS redirect to the hash-route SPA.
 *
 * Run: node scripts/generate-stubs.mjs
 */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT  = join(__dir, '..');
const DOCS  = join(ROOT, 'docs');

/* ── slugify (must match app.js) ── */
function slugify(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[\s\/&+]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');
}

/* ── stub template ── */
function stub({ title, description, canonical, hashRoute }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${title}</title>
  <meta name="description" content="${description}"/>
  <meta name="robots" content="index,follow"/>
  <link rel="canonical" href="${canonical}"/>
  <meta property="og:type" content="website"/>
  <meta property="og:url" content="${canonical}"/>
  <meta property="og:title" content="${title}"/>
  <meta property="og:description" content="${description}"/>
  <meta property="og:image" content="https://ipv4.events/icons/social-card.png"/>
  <script>location.replace('https://ipv4.events/${hashRoute}');<\/script>
</head>
<body>
  <p>Redirecting to <a href="https://ipv4.events/${hashRoute}">ipv4.events</a>…</p>
</body>
</html>
`;
}

/* ── categories ── */
const catsRaw = JSON.parse(await readFile(join(DOCS, 'data', 'categories.json'), 'utf8'));

for (const cat of catsRaw) {
  const slug  = slugify(cat.id);
  const label = cat.label;
  const dir   = join(DOCS, 'category', slug);
  await mkdir(dir, { recursive: true });

  const canonical = `https://ipv4.events/category/${slug}/`;
  const hashRoute = `#/category/${slug}`;
  const title     = `${label} | ipv4.events — IPv4 Era Timeline`;
  const desc      = `Browse IPv4 era milestones in the ${label} category — key standards, breakthroughs and moments in internet history.`;

  await writeFile(join(dir, 'index.html'), stub({ title, description: desc, canonical, hashRoute }), 'utf8');
  console.log(`  ✓ category/${slug}/index.html`);
}

/* ── decades ── */
const DECADES = ['1950s','1960s','1970s','1980s','1990s','2000s','2010s','2020s'];

for (const dec of DECADES) {
  const dir = join(DOCS, 'decade', dec);
  await mkdir(dir, { recursive: true });

  const canonical = `https://ipv4.events/decade/${dec}/`;
  const hashRoute = `#/decade/${dec}`;
  const title     = `${dec} Milestones | ipv4.events — IPv4 Era Timeline`;
  const desc      = `Explore technology milestones from the ${dec} on the ipv4.events timeline — networking, software, security and more.`;

  await writeFile(join(dir, 'index.html'), stub({ title, description: desc, canonical, hashRoute }), 'utf8');
  console.log(`  ✓ decade/${dec}/index.html`);
}

console.log('\nDone — stub files written.');
