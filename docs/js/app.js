/* ---------- Icons ---------- */
const ICONS = {
  computer: "icons/wxp_179.ico",
  world: "icons/w98_world.ico",
  folder: "icons/w95_5.ico",
  info: "icons/w2k-help.ico"
};
(function setHeaderIcons(){
  const elPC = document.getElementById("ico-computer"); if (elPC) elPC.src = ICONS.computer;
  const elWorld = document.getElementById("ico-world"); if (elWorld) elWorld.src = ICONS.world;
  const elInfo = document.getElementById("ico-info"); if (elInfo) elInfo.src = ICONS.info;
})();

/* ---------- Loader helpers ---------- */
const L = {
  root: document.getElementById('loader'),
  fill: document.getElementById('loaderFill'),
  msg:  document.getElementById('loaderMsg'),
  pct:  document.getElementById('loaderPct'),
  total: 1,
  done: 0
};
function loaderShow(){ if (L.root) L.root.style.display = 'flex'; }
function loaderHide(){ if (L.root) L.root.style.display = 'none'; }
function loaderSet(total){ L.total = Math.max(total,1); L.done = 0; loaderTick('Starting…'); }
function loaderTick(message){
  if (!L.root) return;
  L.done = Math.min(L.done + 1, L.total);
  const p = Math.round((L.done / L.total) * 100);
  L.fill.style.width = p + '%';
  if (message) L.msg.textContent = message;
  L.pct.textContent = p + '%';
}

/* ---------- Helpers ---------- */
function decadeOf(y){
  if (y<1960) return "1950s";
  if (y<1970) return "1960s";
  if (y<1980) return "1970s";
  if (y<1990) return "1980s";
  if (y<2000) return "1990s";
  if (y<2010) return "2000s";
  if (y<2020) return "2010s";
  return "2020s";
}
function matchesFilter(ev, q, cat, dec){
  const text = (ev.title+" "+(ev.overview||"")+" "+(ev.hashtags||[]).join(" ")).toLowerCase();
  const okQ = !q || text.includes(q) || String(ev.year).includes(q);
  const okCat = !cat || (ev.categories||[]).includes(cat);
  const okDec = !dec || decadeOf(ev.year)===dec;
  return okQ && okCat && okDec;
}

/* ---------- State ---------- */
let CATS = [];
let ALL = [];
let CANON = new Set();

/* ---------- Category normalization (aliases) ---------- */
const CAT_ALIASES = new Map([
  // Networking & Backbone
  ["Backbone Speeds","Backbone"],
  ["Networks","Networking"],
  ["Cables","Submarine Cables"],
  ["Submarine Cable","Submarine Cables"],
  ["Datacenters","Data Centers"],
  ["Data Center","Data Centers"],
  ["Wireless Networking","Wireless"],

  // OS
  ["Windows","OS/Windows"],
  ["Windows OS","OS/Windows"],
  ["Mobile","Mobile OS"],

  // Programming & Software
  ["Programming Languages","Programming"],
  ["Apps","Software"],
  ["Software & Tools","Software"],
  ["Streaming","Streaming/Multimedia"],
  ["Multimedia","Streaming/Multimedia"],
  ["Gaming","Streaming/Multimedia"],

  // Social & Messaging
  ["Social Networks","Social"],
  ["Chats","Messaging"],

  // AI & Emerging
  ["Quantum","Quantum/Next-Gen"],
  ["Next-Gen","Quantum/Next-Gen"],
  ["Metaverse","Metaverse/XR"],
  ["XR","Metaverse/XR"],

  // Security & Policy (split the old combined bucket)
  ["Security & Policy","__SEC_POLICY__"],

  // Finance / Market — keep them separate!
  ["Finance & Market", ["Finance","Market"]],
  ["Finance and Market", ["Finance","Market"]],
  ["Finance & Markets", ["Finance","Market"]],

  // Cloud & Infra
  ["Cloud","Cloud/Virtualization"],
  ["Virtualization","Cloud/Virtualization"],
  ["Content Delivery Network","CDN"],
  ["CDNs","CDN"],

  // Governance
  ["Regional Internet Registries","RIRs"],
]);
function splitSecurityPolicy(ev) {
  const text = [
    ev.title || "",
    ev.overview || "",
    (ev.hashtags || []).join(" ")
  ].join(" ").toLowerCase();
  const policySignals = ["gdpr","regulation","policy","act","law","compliance","surveillance","patriot","ccpa","directive","governance","data protection","privacy regulation","hipaa","sox"];
  const securitySignals = ["ddos","botnet","ransomware","breach","exploit","vulnerability","cve","openssl","log4shell","hack","malware","phishing","mitm","zero-day","tls","ssl","pgp","encryption"];
  const hasPolicy = policySignals.some(s => text.includes(s));
  const hasSecurity = securitySignals.some(s => text.includes(s));
  if (hasPolicy && !hasSecurity) return "Policy & Regulation";
  if (!hasPolicy && hasSecurity) return "Security";
  const t = (ev.title || "").toLowerCase();
  if (/(gdpr|patriot|snowden|regulation|policy)/.test(t)) return "Policy & Regulation";
  if (/(ddos|breach|ransom|heartbleed|log4shell|tls|ssl|pgp)/.test(t)) return "Security";
  return "Security";
}
function normalizeEventCategories(ev) {
  const src = Array.isArray(ev.categories) ? ev.categories : [];
  const mapped = src.flatMap(cat => {
    if (CANON.has(cat)) return [cat];           // already canonical
    const alias = CAT_ALIASES.get(cat);
    if (alias) {
      if (alias === "__SEC_POLICY__") return [splitSecurityPolicy(ev)];
      if (Array.isArray(alias)) return alias;   // multi-map (e.g., Finance+Market)
      return [alias];
    }
    const ci = [...CANON].find(c => c.toLowerCase() === String(cat).toLowerCase());
    return ci ? [ci] : [];
  });
  ev.categories = [...new Set(mapped)].filter(c => CANON.has(c)).concat(); // dedupe + keep only canon
  return ev;
}

/* ---------- Pretty URL routing ---------- */
// slugify like: "OS/Windows" -> "os-windows", "Data Centers" -> "data-centers"
function slugify(s){ return String(s).toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,''); }

/**
 * Convert a URL slug (e.g., "rirs" or "data-centers") to a canonical category id
 * by checking both category id and label, handling case/hyphens/plurals.
 */
function unslugifyCategory(slug){
  if (!slug) return null;
  const want = String(slug).toLowerCase();

  // 1) Exact slug match vs id OR label
  let hit = CATS.find(c => slugify(c.id)===want || slugify(c.label)===want);
  if (hit) return hit.id;

  // 2) Singular/plural fallback
  const wantSing = want.replace(/s$/, '');
  hit = CATS.find(c => slugify(c.id).replace(/s$/,'')===wantSing ||
                       slugify(c.label).replace(/s$/,'')===wantSing);
  if (hit) return hit.id;

  // 3) Loose contains (useful if slugs are long)
  hit = CATS.find(c => slugify(c.id).includes(want) || slugify(c.label).includes(want));
  if (hit) return hit.id;

  return null;
}

function readRoute(){
  // supports: /, /category/<slug>, /decade/<1990s>, /search/<term>
  const segs = location.pathname.replace(/\/+/g,'/').replace(/^\/|\/$/g,'').split('/');
  const state = { q:'', cat:'', dec:'' };
  for (let i=0;i<segs.length;i+=2){
    const key = segs[i]?.toLowerCase();
    const val = segs[i+1] || '';
    if (!key || !val) break;
    if (key==='category') state.cat = unslugifyCategory(val) || '';
    else if (key==='decade') state.dec = val;
    else if (key==='search') state.q = decodeURIComponent(val);
  }
  // allow legacy query params (normalize later)
  const usp = new URLSearchParams(location.search);
  state.q   = usp.get('q')   ?? state.q;
  state.cat = usp.get('cat') ?? state.cat;
  state.dec = usp.get('dec') ?? state.dec;
  return state;
}
function writeRoute({q,cat,dec}, replace=false){
  const parts = [];
  if (cat) parts.push('category', slugify(cat));
  if (dec) parts.push('decade', dec);
  if (q)   parts.push('search', encodeURIComponent(q));
  const path = '/' + parts.join('/');
  if (replace) history.replaceState(null,'', parts.length ? path : '/');
  else history.pushState(null,'', parts.length ? path : '/');
}

/**
 * Syncs the visible UI with the current route state.
 * - Updates the search, category, and decade inputs.
 * - Highlights the active category pill (adds/removes `.is-active`).
 * Call on initial load, after history navigation, and after user interactions
 * so the UI always reflects the current state.
 */
function syncUIFromState(s) {
  // Set selects
  const qEl   = document.getElementById("q");
  const catEl = document.getElementById("cat");
  const decEl = document.getElementById("dec");
  if (qEl)   qEl.value   = s.q   || '';
  if (catEl) catEl.value = s.cat || '';
  if (decEl) decEl.value = s.dec || '';

  // Highlight the active category pill
  const pills = document.querySelectorAll('.cat-pill');
  pills.forEach(b => b.classList.toggle('is-active', !!(s.cat && b.dataset.cat === s.cat)));
}

/* ---------- Data loading ---------- */
async function loadCategories(){
  loaderTick('Loading categories…');
  const res = await fetch("data/categories.json");
  if(!res.ok) throw new Error("Failed to load data/categories.json");
  CATS = await res.json();

  // Canonical set
  CANON = new Set(CATS.map(c => c.id));

  // Fill select
  const sel = document.getElementById("cat");
  sel.innerHTML = '<option value="">All categories</option>' +
    CATS.map(c=>`<option value="${c.id}">${c.label}</option>`).join("");

  // Category pill bar
  const bar = document.getElementById("catbar");
  bar.innerHTML = CATS.map(c =>
    `<button class="cat-pill" data-cat="${c.id}" title="${c.group||''}">
      <img class="icon" src="${String(c.iconUrl||'').replace(/^\/+/,'')}" alt="${c.label} icon"> ${c.label}
    </button>`).join("");

  // Keep pill clicks in sync with selects + route + render
  bar.querySelectorAll(".cat-pill").forEach(b=>{
    b.addEventListener("click",()=>{
      const q = (document.getElementById("q")?.value)||'';
      const dec = (document.getElementById("dec")?.value)||'';
      document.getElementById("cat").value = b.dataset.cat;
      syncUIFromState({ q, cat: b.dataset.cat, dec });
      render();
    });
  });
}

async function loadAllEventsViaManifest(){
  const m = await fetch("data/events/manifest.json");
  if(!m.ok) throw new Error("Failed to load data/events/manifest.json");
  const files = await m.json();
  loaderSet(files.length + 2);
  loaderTick('Loaded manifest…');

  const base = "data/events/";
  const all = [];
  for (const f of files){
    try{
      const r = await fetch(base + f);
      if (!r.ok) { loaderTick(`Missing: ${f}`); continue; }
      const arr = await r.json();
      if (Array.isArray(arr)) {
        all.push(...arr.map(ev => normalizeEventCategories(ev)));
        loaderTick(`Loaded: ${f}`);
      } else {
        loaderTick(`Bad JSON (not array): ${f}`);
      }
    }catch(e){
      loaderTick(`Error: ${f}`);
    }
  }
  return all;
}

/* ---------- Render ---------- */
function render(){
  const q = (document.getElementById("q").value||"").toLowerCase();
  const cat = document.getElementById("cat").value;
  const dec = document.getElementById("dec").value;

  const filtered = ALL.filter(e=>matchesFilter(e,q,cat,dec));
  const byYear = {};
  filtered.forEach(e => { (byYear[e.year] = byYear[e.year] || []).push(e); });
  const years = Object.keys(byYear).map(n=>+n).sort((a,b)=>a-b);

  const root = document.getElementById("years");
  root.innerHTML = "";
  if (!years.length){
    const empty = document.createElement("div");
    empty.className = "panel";
    empty.style.padding = "14px";
    empty.textContent = "No events match your filters.";
    root.appendChild(empty);
    // keep URL in sync even for empty states
    writeRoute({ q, cat, dec }, /*replace=*/true);
    return;
  }

  years.forEach(y=>{
    const card = document.createElement("section"); card.className="year-card panel"; card.id = `year-${y}`;
    const head = document.createElement("div"); head.className="year-head";
    head.innerHTML = `<div class="year-title"><img class="icon" src="${ICONS.folder}" alt="Year ${y}"> ${y}</div><div>${decadeOf(y)}</div>`;
    const ul = document.createElement("ul"); ul.className="event-list";

    byYear[y].sort((a,b)=>(a.categories?.[0]||"").localeCompare(b.categories?.[0]||"")||a.title.localeCompare(b.title));
    byYear[y].forEach(e=>{
      const li = document.createElement("li"); li.className="event";
      const img = document.createElement("img"); img.className="icon";
      const catId = (e.categories||[])[0];
      const catObj = CATS.find(c=>c.id===catId);
      img.src = catObj ? String(catObj.iconUrl||'').replace(/^\/+/,'') : ICONS.folder;
      img.alt = catObj ? `${catObj.label} icon` : "Folder icon";

      const body = document.createElement("div");
      const title = document.createElement("div"); title.className="event-title"; title.textContent = e.title;
      const overview = document.createElement("div"); overview.className="muted"; overview.textContent = e.overview || "";

      const chips = document.createElement("div"); chips.className="chip-row";
      (e.hashtags||[]).forEach(h=>{
        const c = document.createElement("a"); c.className="chip"; c.textContent="#"+h; c.href = `?q=${encodeURIComponent(h)}`;
        c.addEventListener("click",(ev)=>{
          ev.preventDefault();
          document.getElementById("q").value = h;
          render();
        });
        chips.appendChild(c);
      });

      // Optional: Wikipedia badge if provided
      if (e.links?.wikipedia) {
        const wp = document.createElement('a');
        wp.href = e.links.wikipedia;
        wp.target = "_blank";
        wp.rel = "noopener";
        wp.className = "wp-link";
        wp.title = "Wikipedia";
        wp.textContent = " Ⓦ";
        title.appendChild(wp);
      }

      li.appendChild(img);
      body.appendChild(title); body.appendChild(overview); body.appendChild(chips);
      li.appendChild(body);
      ul.appendChild(li);
    });

    card.appendChild(head); card.appendChild(ul); root.appendChild(card);
  });

  // Pretty URLs (replace so typing in search doesn’t spam history)
  writeRoute({ q, cat, dec }, /*replace=*/true);
}


/* ---------- Mobile filter drawer (iOS-safe) ---------- */
(function drawerSetup(){
  const btn = document.getElementById('filterToggle');
  const drawer = document.getElementById('filters');
  const backdrop = document.getElementById('backdrop');
  const qInput = document.getElementById('q');
  if (!btn || !drawer || !backdrop) return;

  function closeDrawer() {
    drawer.classList.remove('is-open');
    document.body.classList.remove('drawer-open');
    btn.setAttribute('aria-expanded', 'false');
    backdrop.hidden = true;
  }
  function openDrawer() {
    drawer.classList.add('is-open');
    document.body.classList.add('drawer-open');
    btn.setAttribute('aria-expanded', 'true');
    backdrop.hidden = false;
    setTimeout(() => { try { qInput && qInput.focus(); } catch(_){} }, 50);
  }

  btn.addEventListener('click', () => {
    const open = drawer.classList.contains('is-open');
    open ? closeDrawer() : openDrawer();
  });

  backdrop.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

  ['cat','dec'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', closeDrawer);
  });
})();

/* ---------- Boot ---------- */
(async function start(){
  try{
    loaderShow();
    loaderSet(3);
    loaderTick('Initializing…');

    await loadCategories();
    ALL = await loadAllEventsViaManifest();

    // Initialize state from pretty path or legacy query, then normalize URL
    const s = readRoute();
    // console.debug('[route:init]', location.pathname, s);
    syncUIFromState(s);
    writeRoute({ q:s.q||'', cat:s.cat||'', dec:s.dec||'' }, /*replace=*/true);

    // Listen for back/forward navigation (keep UI synced)
    window.addEventListener('popstate', () => {
      const s2 = readRoute();
      syncUIFromState(s2);
      render();
    });

    document.getElementById("q").addEventListener("input", render);
    document.getElementById("cat").addEventListener("change", render);
    document.getElementById("dec").addEventListener("change", render);

    render();
  }catch(e){
    console.error(e);
    const yearsEl = document.getElementById("years");
    if (yearsEl){
      yearsEl.innerHTML = `<div class="panel" style="padding:14px">Error loading data. Please refresh or check console.</div>`;
    }
  }finally{
    setTimeout(loaderHide, 250);
  }
})();