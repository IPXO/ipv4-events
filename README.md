# 🖥️ ipv4.events

> *A retro Windows 95–style timeline of the Internet's IPv4 era.*
> From ARPANET to dual-stack — and beyond. 📡

**[▶ Launch ipv4.events](https://ipv4.events)**

Curated by [IPXO](https://www.ipxo.com) and a growing community of contributors. 500+ milestones, 34 categories, 7 decades of Internet history — rendered in glorious silver-gray panels with beveled borders.

---

## 🗂️ Repository Structure

```txt
ipv4-events/
├── docs/                          # 💾 Public site root (served by GitHub Pages)
│   ├── index.html                 # Main app — Win95 UI, loads data & renders timeline
│   ├── 404.html                   # Blue Screen of Death 404 page
│   ├── robots.txt                 # Crawling rules + sitemap pointer
│   ├── sitemap.xml                # SEO sitemap (all URLs with trailing slashes)
│   ├── icons/                     # 🖱️ Win95/98/NT/W2K/XP .ico files + social card
│   ├── css/style.css              # All styles — retro theme, grouped catbar, modal
│   ├── js/app.js                  # Data fetch, hash routing, filters, render, modal
│   ├── category/<slug>/           # 🌐 Pretty URL stubs → /#/category/<slug>
│   ├── decade/<1990s>/            # 🌐 Pretty URL stubs → /#/decade/<1990s>
│   └── data/                      # 📋 Human-editable JSON (the real source of truth)
│       ├── categories.json        # Category IDs / labels / groups / icons
│       └── events/                # Events split by topic
│           ├── manifest.json      # Load order for all event JSON files
│           └── *.json             # One file per category
├── scripts/
│   └── generate-pretty-pages.mjs # 🔧 Regenerates category/* and decade/* stubs
├── .github/workflows/sitemap.yml  # ⚙️ CI: regenerates sitemap on push to main
├── CONTRIBUTING.md                # How to add events and categories
└── LICENSE
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

34 categories organized into **10 groups** displayed as a grouped pill bar on the homepage:

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

Each category in `categories.json`:

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

### 🔧 After adding a new category

Regenerate the pretty-URL stubs so crawlers can find it:

```bash
node scripts/generate-pretty-pages.mjs
# then add the new URL to docs/sitemap.xml
```

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
| `docs/js/app.js` | Parallel data fetch, hash routing, grouped pill bar, contribute modal |
| `docs/css/style.css` | Retro theme, grouped catbar, modal, decade jump nav |
| `docs/data/categories.json` | Canonical category list — edit to add/rename categories |
| `docs/data/events/manifest.json` | Load order for all event JSON files |
| `scripts/generate-pretty-pages.mjs` | Run after adding categories to regenerate stub pages |

---

## 🌐 SEO

- Canonical `<link>` tags on every pretty-URL stub page
- `docs/sitemap.xml` — all URLs with trailing slashes (matches GitHub Pages)
- `docs/robots.txt` — references the HTTPS sitemap
- Meta descriptions under 155 characters

---

## 📜 License

- **Code**: MIT License
- **Content**: CC BY-SA 4.0 (attribution required)

Made with 💾 by [IPXO](https://www.ipxo.com) and contributors.
