# 🖥️ ipv4.events

> *A retro Windows 95–style timeline of the Internet's IPv4 era.*
> From ARPANET to dual-stack — and beyond. 📡

**[▶ Launch ipv4.events](https://ipv4.events)**

Curated by [IPXO](https://www.ipxo.com) and a growing community of contributors. 500+ milestones, 32 categories, 8 decades of Internet history — rendered in glorious silver-gray panels with beveled borders.

---

## 🗂️ Repository Structure

```txt
ipv4-events/
├── docs/                          # 💾 Public site root (served by GitHub Pages)
│   ├── index.html                 # Main app — Win95 UI, loads data & renders timeline
│   ├── 404.html                   # Blue Screen of Death 404 page
│   ├── CNAME                      # Custom domain: ipv4.events (apex)
│   ├── robots.txt                 # Crawling rules + sitemap pointer
│   ├── sitemap.xml                # SEO sitemap (homepage only — SPA canonical)
│   ├── icons/                     # 🖱️ Win95/98/NT/W2K/XP .ico files + social card
│   ├── css/style.css              # All styles — retro theme, tabs, filters, modal
│   ├── js/app.js                  # Data fetch, hash routing, filters, render, modal
│   └── data/                      # 📋 Human-editable JSON (the real source of truth)
│       ├── categories.json        # Category IDs / labels / groups / icons
│       ├── news.json              # Daily news feed (updated by GitHub Actions)
│       └── events/                # Events split by topic
│           ├── manifest.json      # Load order for all event JSON files
│           └── *.json             # One file per category
├── scripts/
│   └── fetch-news.mjs             # 📰 Fetches RSS feeds → docs/data/news.json
└── .github/workflows/
    └── fetch-news.yml             # ⚙️ Runs fetch-news.mjs daily at 06:00 UTC
```

---

## 📋 Event Format

Each event lives in `docs/data/events/<category>.json`:

```json
{
  "id": "1981_rfc791",
  "year": 1981,
  "categories": ["Standards"],
  "title": "RFC 791 — IPv4 Published",
  "overview": "The Internet Protocol version 4 (IPv4) is standardized in RFC 791, defining the dominant packet format for decades.",
  "hashtags": ["RFC791", "IPv4", "Standards"],
  "links": {
    "wikipedia": "https://en.wikipedia.org/wiki/IPv4"
  }
}
```

### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | ✅ | Unique key — lowercase, underscores, no spaces |
| `year` | integer | ✅ | e.g. `1981` |
| `categories` | string[] | ✅ | One or more IDs from `categories.json` |
| `title` | string | ✅ | Short event title |
| `overview` | string | ✅ | 2–3 sentences describing the event |
| `hashtags` | string[] | ✅ | Keywords for search and filtering |
| `links.wikipedia` | string | ☑️ | Wikipedia article URL |

---

## 🖱️ Categories

32 categories organized into **10 groups** displayed as a grouped pill bar on the homepage:

| Group | Categories |
|---|---|
| 📜 Standards & Governance | Standards, Governance, RIRs |
| 📡 Networking & Backbone | Networking, Backbone Speeds, Submarine Cables, Wireless, IXPs & NOGs, Hardware & Vendors |
| 💻 Operating Systems | Windows OS, Linux Distros, Mobile OS |
| 👨‍💻 Programming & Software | Programming Languages, Software & Tools, Web Browsers, Streaming & Multimedia |
| 💬 Social & Messaging | Social Networks, Messaging |
| 🤖 AI & Emerging Tech | Artificial Intelligence, Quantum & Next-Gen, Metaverse & XR |
| 🔒 Security & Policy | Security, Policy & Regulation |
| 💰 Economy | Finance, Market |
| ☁️ Cloud & Infrastructure | Cloud & Virtualization, Serverless, Edge Computing, CDN, Data Centers |
| 🚀 Space & Satellite | Satellite Internet, Space |

Each entry in `categories.json`:

```json
{
  "id": "Standards",
  "label": "Standards",
  "group": "Standards & Governance",
  "iconUrl": "icons/w98_help_book_small.ico"
}
```

---

## 💾 Contributing

The easiest way: click **"+ Propose an Event"** on the homepage — it opens a pre-filled GitHub issue, no fork required.

To contribute JSON directly, read [CONTRIBUTING.md](CONTRIBUTING.md).

---

## ⚙️ Development

Pure static HTML + vanilla JS on GitHub Pages — **no build step**.

### Running locally

```bash
npx serve docs
# open http://localhost:3000
```

### Key files

| File | What it does |
|---|---|
| `docs/js/app.js` | Parallel data fetch, hash routing, category pill bar, news tab, contribute modal, dynamic meta tags |
| `docs/css/style.css` | Retro Win95 theme, view tabs, filter controls, decade jump nav, news cards |
| `docs/data/categories.json` | Canonical category list — edit to add/rename categories |
| `docs/data/events/manifest.json` | Load order for all event JSON files |
| `docs/data/news.json` | Auto-generated daily — do not edit by hand |
| `scripts/fetch-news.mjs` | Fetches RSS from RIPE Labs, APNIC, ARIN, Cloudflare, etc. |

### Hash routing

The app uses client-side hash routing. All routes are handled by `app.js`:

| URL | View |
|---|---|
| `https://ipv4.events/` | Timeline, defaults to 2020s |
| `https://ipv4.events/#/category/networking` | Timeline filtered by category |
| `https://ipv4.events/#/decade/1990s` | Timeline filtered by decade |
| `https://ipv4.events/#/search/arpanet` | Timeline filtered by search term |
| `https://ipv4.events/#/news` | News view |

### Dynamic meta tags

`updatePageMeta()` in `app.js` updates `<title>` and `<meta name="description">` on every route change. This ensures Google's JS-rendering crawl indexes unique titles and descriptions per category, decade, and search view.

### Asset cache busting

CSS and JS are loaded with a `?v=` query param in `index.html`. Bump the version string on every deploy that changes these files:

```html
<link rel="stylesheet" href="css/style.css?v=20260423i">
<script src="js/app.js?v=20260423i" defer></script>
```

---

## 📰 News Feed

The **News** tab shows the latest articles from IPv4/internet news sources, fetched daily by a GitHub Actions workflow.

**Sources:** RIPE Labs, APNIC, ARIN, Cloudflare, The Register, IETF, CircleID

**Workflow:** `.github/workflows/fetch-news.yml` — runs `scripts/fetch-news.mjs` daily at 06:00 UTC and commits the result to `docs/data/news.json` via the GitHub Contents API (signed commit, satisfies branch protection).

To trigger manually: GitHub → Actions → "Fetch news feed" → Run workflow.

---

## 🌐 SEO

This is a pure client-side SPA. SEO approach:

- **Single canonical URL** — `https://ipv4.events/` is the only URL in `sitemap.xml`. Category/decade/news routes are hash-based and not separately indexed.
- **Dynamic meta tags** — `updatePageMeta()` sets unique `<title>` and `<meta description>` per route for Google's JS-rendering crawl.
- **HTTPS enforced** — GitHub Pages "Enforce HTTPS" is enabled on the repo (Settings → Pages). All `http://` requests get a server-side 301 redirect. A JS fallback in `index.html` handles edge cases.
- **`robots.txt`** — references the HTTPS sitemap.
- **Open Graph + Twitter cards** — set in `index.html` `<head>`.

> **Note:** Do not add category or decade URLs back to `sitemap.xml`. When Ahrefs (or other crawlers that don't execute JS) encounter these paths, they see thin-content pages and flag them as duplicates, which tanks the health score. The `updatePageMeta()` approach handles SEO for JS-capable crawlers (Google) without creating duplicate-content issues for non-JS crawlers.

---

## 📜 License

- **Code**: MIT License
- **Content**: CC BY-SA 4.0 (attribution required)

Made with 💾 by [IPXO](https://www.ipxo.com) and contributors.
