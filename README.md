# ipv4.events 🌐

Welcome to **ipv4.events**, a community-driven timeline of the Internet’s IPv4 era — from ARPANET and TCP/IP to cloud, AI, space, and beyond.  
The site uses a nostalgic **Windows 95-style design** and runs on GitHub Pages.

## 🌍 Live Website
[https://ipv4.events](https://ipv4.events)

## 📂 Repository Structure
```txt

├── README.md                  # General information about the project
├── CONTRIBUTING.md            # Overview how to contribute
├── docs/
│   ├── index.html             # Landing page (Windows retro style)
│   ├── css/
│   │   └── style.css          # Stylesheet
│   ├── js/
│   │   └── app.js             # Client-side logic
│   ├── icons/                 # Windows 95/98/NT/XP style icons
│   ├── data/
│   │   ├── categories.json    # Category definitions & icon mapping
│   │   └── events/            # Event data split by category
│   │        ├── manifest.json
│   │        ├── standards.json
│   │        ├── governance.json
│   │        ├── finance.json
│   │        ├── rirs.json
│   │        ├── space.json
│   │        └── … (more categories)
│   └── CNAME                  # Custom domain config (ipv4.events)
```

## 📝 Event Format
Each event is defined in JSON. Example:

```json
{
  "id": "1981_rfc791",
  "year": 1981,
  "categories": ["Standards"],
  "title": "RFC 791 — IPv4 Published",
  "overview": "The Internet Protocol version 4 (IPv4) is standardized in RFC 791, defining the dominant packet format for decades.",
  "hashtags": ["RFC791","IPv4","Standards"]
  "links": {
    "wikipedia": "https://en.wikipedia.org/wiki/IPv4"
  }  
}
```

## Fields
* id: unique identifier (lowercase, underscores, no spaces)
* year: integer (e.g. 1981)
* categories: array of category IDs from categories.json
* title: short event title
* overview: 2–3 sentence description
* hashtags: keywords for search & filtering
* `links` (object, optional) — external references  
  * `wikipedia` (string, optional) — URL to relevant Wikipedia article  
  * *(future keys may include: `official`, `archive`, `news`, etc.)*

## 📂 Categories
Categories are defined in data/categories.json with icons. Example:
```json
{
  "id": "Standards",
  "label": "Standards",
  "group": "Standards & Governance",
  "iconUrl": "icons/example.ico"
}
```
## 🤝 Contributing
We welcome contributions!
Please read CONTRIBUTING.md for guidelines on how to add new events, categories, or icons.

## 🛠 Development
The site is static HTML + JS hosted on GitHub Pages.
* Icons: Windows 95/98 Icon Set
* Design: Windows 95 nostalgia + modern filters
* Deployment: GitHub Pages auto-deploys from /docs/

## 📜 License
* Code: MIT License
* Content: CC BY-SA 4.0 (attribution required)

👾 Made with 💾 by [IPXO](https://www.ipxo.com) and contributors.
