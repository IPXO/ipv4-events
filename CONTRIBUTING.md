## 📗 `CONTRIBUTING.md`

# Contributing to ipv4.events

Thank you for helping build the **ipv4.events** timeline!  
We aim to preserve the history of the Internet and technology through community contributions.  

## 📝 How to Contribute

**1. Fork this repository**
   - Click the “Fork” button in the top-right of GitHub.
**2. Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ipv4-events.git
   cd ipv4-events
   ```
**3. Create a new branch**
```bash
git checkout -b add-new-event
 ```
**4. Add your changes**
* Add new events inside the correct JSON file in docs/data/events/.
* Or, if needed, create a new category in docs/data/categories.json.
* Add icons to docs/icons/ if introducing a new category.

**5. Test locally**
* Open docs/index.html in your browser.
* Verify your event loads correctly, appears under the right year, with the correct category and hashtags.

**6. Commit your changes**
```bash
git add .
git commit -m "Add new event: RFC 791 IPv4"
git push origin add-new-event
```

**7. Open a Pull Request**
* Go to your fork on GitHub.
* Click New Pull Request to merge your branch into main.

## 📂 Event JSON Format

Each event must follow this structure:
```json
{
  "id": "1981_rfc791",
  "year": 1981,
  "categories": ["Standards"],
  "title": "RFC 791 — IPv4 Published",
  "overview": "The Internet Protocol version 4 (IPv4) is standardized in RFC 791, defining the dominant packet format for decades.",
  "hashtags": ["RFC791","IPv4","Standards"]
  //If an event has a relevant Wikipedia article, please add it under the `links` object:
  "links": {
    "wikipedia": "https://en.wikipedia.org/wiki/IPv4"
}
```

Notes
* id must be unique, lowercase, words separated by underscores.
* year must be an integer (e.g. 1998).
* categories must reference existing IDs in categories.json.
* overview should be concise (2–3 sentences).
* hashtags are short keywords for filtering/search.

## 📂 Adding Categories

Categories live in docs/data/categories.json. Example:
```json
{
  "id": "Cloud",
  "label": "Cloud/Virtualization",
  "group": "Infrastructure",
  "iconUrl": "/icons/cloud.ico"
}
```
* Add only if your event cannot fit an existing category.
* Make sure you upload a matching icon to docs/icons/.

## ✅ Contribution Guidelines
* Events must be factual, dated, and verifiable.
* Avoid marketing, promotion, or speculation.
* Keep descriptions clear and neutral.
* PRs should contain small, focused changes.

## 📜 License
* Code: MIT License
* Content: CC BY-SA 4.0

By contributing, you agree that your additions fall under these licenses.

👉 With these two files in place, new contributors will know exactly:
* How the repo is structured
* How to add events & categories
* How to test & submit PRs
