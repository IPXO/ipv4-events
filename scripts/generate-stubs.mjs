/**
 * Generates per-route stub HTML files under docs/category/ and docs/decade/.
 * Each stub has a unique <title>, <meta description>, canonical, OG tags,
 * and unique <body> content (so Ahrefs content-hash comparison treats them
 * as distinct pages, not duplicates). A JS redirect sends real users to the
 * hash-route SPA immediately.
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

/* ── unique body paragraphs per category ── */
const CAT_BODY = {
  'Standards': `
    <h1>Internet Standards — IPv4 Era Timeline</h1>
    <p>The history of the internet is built on open standards. This section of ipv4.events covers the foundational RFCs, protocols, and specifications that defined how the internet works — from early ARPANET protocols and TCP/IP to HTTP, DNS, BGP, TLS, and beyond.</p>
    <p>Standards milestones include landmark RFCs published by the IETF, major protocol version releases, and the standardization of technologies that underpin global connectivity today.</p>`,

  'Governance': `
    <h1>Internet Governance — IPv4 Era Timeline</h1>
    <p>Who controls the internet? This section tracks the organizations, agreements, and policy decisions that shaped how the global internet is governed — from the founding of ICANN and the transition of DNS control to debates over multi-stakeholder models and national sovereignty over the network.</p>
    <p>Key events include the creation of ICANN, the WSIS summits, IGF forums, and ongoing debates about internet fragmentation and global governance frameworks.</p>`,

  'RIRs': `
    <h1>Regional Internet Registries — IPv4 Era Timeline</h1>
    <p>The five Regional Internet Registries (RIRs) — ARIN, RIPE NCC, APNIC, LACNIC, and AFRINIC — manage the allocation of IPv4 and IPv6 address space across the globe. This section tracks their founding, major policy milestones, and the exhaustion of the IPv4 free pool.</p>
    <p>IPv4 exhaustion events are central to the RIR timeline: APNIC's free pool ran out in 2011, RIPE NCC in 2012, ARIN in 2015, LACNIC in 2014, and AFRINIC in 2021 — marking the true end of the IPv4 era's expansion phase.</p>`,

  'Networking': `
    <h1>Networking Milestones — IPv4 Era Timeline</h1>
    <p>From ARPANET's first packet-switched message to the multi-terabit internet backbone, the Networking section of ipv4.events documents the hardware, protocols, and infrastructure breakthroughs that connected the world.</p>
    <p>Key milestones include the invention of packet switching, the adoption of TCP/IP, the first commercial ISPs, the growth of BGP routing, and major network architecture innovations that enabled global internet scale.</p>`,

  'Backbone': `
    <h1>Backbone Speeds — IPv4 Era Timeline</h1>
    <p>The internet backbone has grown from kilobits-per-second ARPANET links to multi-terabit fiber networks. This section tracks the landmark speed milestones — NSFNET upgrades, OC-192 deployments, 100G and 400G commercial backbone links — that drove the internet's capacity explosion.</p>
    <p>Each speed record represents an order-of-magnitude shift in what was possible for global data transmission, enabling everything from email to streaming video to cloud computing.</p>`,

  'Submarine Cables': `
    <h1>Submarine Cables — IPv4 Era Timeline</h1>
    <p>Over 95% of international internet traffic travels through submarine fiber-optic cables laid on the ocean floor. This section tracks the deployment of major submarine cable systems — from early transatlantic cables to modern hyperscale systems carrying hundreds of terabits per second.</p>
    <p>Key milestones include TAT-8 (the first transatlantic fiber cable, 1988), the SEA-ME-WE series, and the wave of private cable systems built by Google, Meta, Amazon, and Microsoft in the 2010s and 2020s.</p>`,

  'Wireless': `
    <h1>Wireless Technology — IPv4 Era Timeline</h1>
    <p>Wi-Fi, Bluetooth, LTE, and 5G transformed how devices connect to the internet. This section covers the key milestones in wireless networking — from the IEEE 802.11 standard and early Wi-Fi deployments to Bluetooth, WiMAX, 3G/4G/5G cellular standards, and the rise of the IoT.</p>
    <p>Wireless milestones shaped the mobile internet revolution, enabling billions of smartphones, connected devices, and the always-on connectivity that defines modern life.</p>`,

  'IXP/NOG': `
    <h1>Internet Exchange Points & Network Operator Groups — IPv4 Era Timeline</h1>
    <p>Internet Exchange Points (IXPs) are the physical locations where different networks interconnect and exchange traffic. Network Operator Groups (NOGs) are the communities where operators share knowledge and coordinate. Together, they form the connective tissue of the internet.</p>
    <p>This section tracks the founding of major IXPs (AMS-IX, DE-CIX, LINX, JPNAP, etc.) and the establishment of NOGs like NANOG, RIPE, APRICOT, and LACNOG that shaped operational best practices globally.</p>`,

  'Hardware & Vendors': `
    <h1>Hardware & Networking Vendors — IPv4 Era Timeline</h1>
    <p>The companies and products that built the physical internet — from early routers and switches to the silicon and systems that run today's hyperscale data centers. This section covers Cisco's founding and dominance, the rise of Juniper, the merchant silicon revolution, and the open networking movement.</p>
    <p>Key milestones include the first commercially available routers, the multi-layer switch era, SDN and NFV transitions, and the growth of white-box networking that democratized internet infrastructure.</p>`,

  'OS/Windows': `
    <h1>Windows OS Milestones — IPv4 Era Timeline</h1>
    <p>Microsoft Windows has been central to the personal computer and internet era, shaping how billions of people access the internet. This section tracks major Windows releases — from Windows 1.0 through Windows 95 (which brought TCP/IP to mainstream users), Windows XP, Vista, 7, 10, and 11 — and their impact on internet adoption.</p>
    <p>Windows milestones are inseparable from the internet's growth story: Internet Explorer's bundling, TCP/IP stack integration, and the Windows Update infrastructure all shaped the modern web.</p>`,

  'Linux': `
    <h1>Linux Distros — IPv4 Era Timeline</h1>
    <p>Linux powers the internet. From the servers running Apache and nginx to Android smartphones, Linux kernel milestones and major distribution releases represent the backbone of the open internet. This section tracks Linus Torvalds's 1991 announcement, the growth of Debian, Red Hat, Ubuntu, and the Linux Foundation era.</p>
    <p>Linux milestones include landmark kernel versions, the open-source licensing battles, the dominance of Linux in cloud infrastructure, and the rise of containerization through Docker and Kubernetes — both built on Linux foundations.</p>`,

  'Mobile OS': `
    <h1>Mobile Operating Systems — IPv4 Era Timeline</h1>
    <p>The smartphone revolution transformed the internet from a desktop experience to a universal one. This section covers the mobile OS milestones that made it happen — Nokia's Symbian, Palm OS, BlackBerry OS, and then the iPhone's iOS (2007) and Android (2008) duopoly that defines the modern mobile internet.</p>
    <p>Mobile OS milestones trace the shift from feature phones to smartphones, the App Store revolution, and the point at which mobile traffic surpassed desktop — permanently changing how the internet is accessed and designed.</p>`,

  'Programming': `
    <h1>Programming Languages — IPv4 Era Timeline</h1>
    <p>The internet was built in code. This section tracks the programming language milestones that shaped the internet era — C's role in UNIX and TCP/IP, Perl's early web scripting, Java's "write once run anywhere" promise, PHP's dominance of web backends, Python's rise, and JavaScript's evolution from browser glue to full-stack platform.</p>
    <p>Each language milestone represents a shift in what developers could build and how they built it, from CGI scripts to microservices, from Java applets to Node.js and beyond.</p>`,

  'Software': `
    <h1>Software & Tools — IPv4 Era Timeline</h1>
    <p>The applications and developer tools that defined the internet era — from early network utilities to the IDEs, version control systems, and SaaS tools that power modern development. This section covers milestones like the launch of sendmail, Apache httpd, OpenSSH, Git, and the explosion of open-source tooling.</p>
    <p>Software milestones track how developer workflows, system administration, and the infrastructure of the web itself evolved from the early internet through the cloud-native era.</p>`,

  'Browsers': `
    <h1>Web Browsers — IPv4 Era Timeline</h1>
    <p>The web browser is the internet's primary interface. This section covers the full browser history — Mosaic (1993), Netscape Navigator, Internet Explorer's rise and browser wars, Firefox's launch, Chrome's dominance, and the modern multi-engine landscape with Chromium, WebKit, and Gecko.</p>
    <p>Browser milestones include HTML and CSS standards adoption, the JavaScript engine performance race (V8, SpiderMonkey, JavaScriptCore), WebAssembly, and the progressive web app revolution that blurred the line between web and native apps.</p>`,

  'Streaming/Multimedia': `
    <h1>Streaming & Multimedia — IPv4 Era Timeline</h1>
    <p>From RealAudio's 28.8k streams to 4K Netflix and Twitch live gaming, the streaming and multimedia section covers how video, audio, and interactive content transformed the internet. This includes Flash's rise and fall, YouTube's founding, the codec wars (H.264, VP9, AV1), and the streaming wars between Netflix, Disney+, and Amazon Prime.</p>
    <p>Gaming milestones are also tracked here — from early online multiplayer to cloud gaming platforms, Steam's launch, and esports reaching mainstream audiences through Twitch and YouTube Gaming.</p>`,

  'Social': `
    <h1>Social Networks — IPv4 Era Timeline</h1>
    <p>Social networking changed how people communicate, share information, and experience the internet. This section traces the milestones from early online communities (Usenet, GeoCities, Friendster) through MySpace, Facebook, Twitter, Instagram, TikTok, and beyond.</p>
    <p>Social network milestones also cover the dark side of the social web — the rise of misinformation, algorithmic amplification, platform moderation debates, data privacy scandals (Cambridge Analytica), and regulatory responses like GDPR.</p>`,

  'Messaging': `
    <h1>Messaging — IPv4 Era Timeline</h1>
    <p>Instant messaging and electronic communication are among the internet's defining applications. This section covers email's early history (SMTP, 1982), the rise of IRC, ICQ, AOL Instant Messenger, MSN Messenger, BlackBerry Messenger, and then the modern era of WhatsApp, Signal, Telegram, and Slack.</p>
    <p>Messaging milestones trace the shift from open email protocols to closed platform silos, the emergence of end-to-end encryption as a standard, and the role of messaging apps in global activism and everyday communication.</p>`,

  'AI': `
    <h1>Artificial Intelligence — IPv4 Era Timeline</h1>
    <p>Artificial intelligence has moved from academic research to the defining technology of the 2020s. This section tracks AI milestones through the internet era — from early neural network research, IBM Deep Blue (1997), and the ImageNet moment (2012) to AlphaGo (2016), GPT-3 (2020), and the generative AI explosion beginning in 2022.</p>
    <p>AI milestones on ipv4.events focus on developments at the intersection of AI and the internet: recommendation algorithms, search improvements, language models, and the AI infrastructure that runs on internet-connected cloud platforms.</p>`,

  'Quantum/Next-Gen': `
    <h1>Quantum Computing & Next-Gen Technologies — IPv4 Era Timeline</h1>
    <p>Quantum computing, neuromorphic chips, and post-silicon computing represent the frontier of what comes after the IPv4 era's semiconductor-driven growth. This section tracks quantum supremacy claims, quantum networking research, and emerging computing paradigms that may define the post-IPv4 internet.</p>
    <p>Milestones include Google's quantum supremacy announcement (2019), IBM's quantum roadmap, quantum key distribution experiments, and the international race to build practical quantum computers.</p>`,

  'Metaverse/XR': `
    <h1>Metaverse & Extended Reality — IPv4 Era Timeline</h1>
    <p>Virtual reality, augmented reality, and the metaverse concept represent a potential next phase of the internet — from immersive 3D spaces to spatial computing. This section covers Oculus's founding, Meta's pivot, Apple Vision Pro, and the persistent virtual worlds that have emerged from gaming and are expanding into commerce and social interaction.</p>
    <p>XR milestones track the long arc from early VR experiments, Second Life's pioneering virtual economy, to modern spatial computing platforms and the ongoing debate about what the metaverse actually is.</p>`,

  'Security': `
    <h1>Internet Security — IPv4 Era Timeline</h1>
    <p>Security is the shadow history of the internet — for every advance in connectivity, attackers found new exploits. This section covers landmark security events: the Morris Worm (1988), the SSL/TLS protocol evolution, major data breaches (Yahoo, Equifax, Colonial Pipeline), and the rise of nation-state cyber operations.</p>
    <p>Security milestones also cover defensive advances — PKI infrastructure, DNSSEC, HTTPS adoption (Let's Encrypt, 2015), zero-trust architectures, and the professionalization of the cybersecurity industry.</p>`,

  'Policy & Regulation': `
    <h1>Policy & Regulation — IPv4 Era Timeline</h1>
    <p>As the internet grew, governments and regulators began shaping its rules. This section covers landmark internet policy events — the Communications Decency Act (1996), the DMCA (1998), the EU's GDPR (2018), net neutrality battles, and antitrust actions against major tech platforms.</p>
    <p>Policy milestones trace how different countries and regions have approached internet regulation, from the open-internet principles of early US policy to China's Great Firewall, GDPR's global influence, and the Digital Services Act.</p>`,

  'Finance': `
    <h1>Internet Finance Milestones — IPv4 Era Timeline</h1>
    <p>The internet transformed financial services — from early online banking and e-commerce to PayPal, high-frequency trading, fintech disruption, and cryptocurrency. This section covers landmark financial milestones in the internet era: the dot-com boom and bust, the rise of online brokerages, Bitcoin's launch (2009), and the growth of digital payments.</p>
    <p>Finance milestones on ipv4.events focus on the intersection of internet infrastructure and financial systems — the networks that process global transactions and the innovations that changed how value moves across the internet.</p>`,

  'Market': `
    <h1>Internet Market Milestones — IPv4 Era Timeline</h1>
    <p>The internet created some of the most valuable companies in history. This section tracks the market milestones that defined the internet economy — Amazon's founding, Google's IPO, Facebook's rise, the dot-com bubble and bust, cloud computing's market impact, and the emergence of trillion-dollar tech platforms.</p>
    <p>Market milestones include major acquisitions (YouTube by Google, Instagram by Facebook, LinkedIn by Microsoft), landmark IPOs, and the structural shifts in how internet companies generate and capture economic value.</p>`,

  'Cloud/Virtualization': `
    <h1>Cloud Computing & Virtualization — IPv4 Era Timeline</h1>
    <p>Cloud computing transformed how software is built and deployed, shifting from physical servers to elastic, on-demand infrastructure. This section covers the milestones of cloud history — VMware's virtualization breakthrough, Amazon EC2's launch (2006), the rise of AWS, Azure, and Google Cloud, and the containerization revolution led by Docker and Kubernetes.</p>
    <p>Cloud milestones trace the journey from mainframe time-sharing through virtualization, IaaS, PaaS, SaaS, and the serverless and cloud-native architectures that define modern internet infrastructure.</p>`,

  'Serverless': `
    <h1>Serverless Computing — IPv4 Era Timeline</h1>
    <p>Serverless computing abstracts infrastructure management away entirely, letting developers deploy code that scales automatically without managing servers. This section tracks the serverless evolution — AWS Lambda's launch (2014), the proliferation of FaaS platforms, and the emergence of edge functions and serverless databases.</p>
    <p>Serverless milestones represent the logical endpoint of cloud abstraction, where the unit of deployment shrinks from servers to functions, enabling new architectures for event-driven and API-first internet applications.</p>`,

  'Edge': `
    <h1>Edge Computing — IPv4 Era Timeline</h1>
    <p>Edge computing moves processing closer to the user — reducing latency by running code at the network edge rather than in centralized cloud data centers. This section covers the edge computing milestones that matter: CDN vendors adding compute capabilities, Cloudflare Workers, Fastly Compute@Edge, and telco edge deployments for 5G.</p>
    <p>Edge milestones reflect the internet's maturation from a hub-and-spoke architecture to a distributed compute fabric, enabling real-time applications, IoT processing, and low-latency experiences at global scale.</p>`,

  'CDN': `
    <h1>Content Delivery Networks — IPv4 Era Timeline</h1>
    <p>Content Delivery Networks are the caching and distribution layer that makes the modern internet fast. This section covers CDN history from Akamai's founding in 1998 through the growth of Fastly, Cloudflare, CloudFront, and the hyperscaler CDNs that serve the majority of the web's content today.</p>
    <p>CDN milestones include the first CDN deployments during the Dot-com boom, the shift from static asset caching to dynamic content delivery, DDoS mitigation at scale, and the convergence of CDN and edge compute platforms.</p>`,

  'Data Centers': `
    <h1>Data Centers — IPv4 Era Timeline</h1>
    <p>Data centers are the physical infrastructure of the internet — the buildings, power systems, cooling, and networking that run every cloud service, website, and internet application. This section tracks the evolution from early server rooms to hyperscale data centers and the sustainability challenges of powering the internet.</p>
    <p>Data center milestones include the first hyperscale builds by Google, Facebook, and Amazon; the PUE efficiency revolution; submarine cable landings that connect data centers globally; and the growth of colocation and carrier-neutral facilities.</p>`,

  'Satellite Internet': `
    <h1>Satellite Internet — IPv4 Era Timeline</h1>
    <p>Satellite internet has evolved from high-latency geostationary systems (Hughes, ViaSat) to the low-Earth orbit revolution led by SpaceX Starlink. This section tracks satellite internet milestones — early broadband satellite deployments, Iridium's bankruptcy and revival, OneWeb, and Starlink's rapid growth to millions of subscribers.</p>
    <p>Satellite internet milestones represent the effort to connect the final unconnected — rural users, ships, aircraft, and remote infrastructure — and the technical breakthroughs in LEO constellations that made affordable, low-latency satellite internet possible.</p>`,

  'Space': `
    <h1>Space Technology Milestones — IPv4 Era Timeline</h1>
    <p>Space exploration and internet technology have grown together — from early satellite communications to GPS, Earth observation, and the commercial space era that is redefining connectivity and computing. This section covers space milestones from Sputnik through the Space Shuttle, the ISS, SpaceX's reusable rockets, and the new space economy.</p>
    <p>Space milestones on ipv4.events focus on the intersections between space technology and the internet: GPS enabling location-aware applications, Earth observation powering geospatial analytics, and LEO satellite constellations transforming global connectivity.</p>`,
};

/* ── unique body paragraphs per decade ── */
const DEC_BODY = {
  '1950s': `
    <h1>1950s Technology Milestones — IPv4 Era Timeline</h1>
    <p>The 1950s laid the conceptual and technical foundations for the internet decades before it existed. This era brought the first practical computers, Claude Shannon's information theory, early packet switching research, and the launch of Sputnik — which directly motivated ARPA's creation and, eventually, ARPANET.</p>
    <p>Key 1950s milestones include UNIVAC I (1951), IBM's System/360 architecture origins, the invention of the transistor, and the first theoretical frameworks for network communication that would become TCP/IP.</p>`,

  '1960s': `
    <h1>1960s Technology Milestones — IPv4 Era Timeline</h1>
    <p>The 1960s saw the birth of networking theory and the first experimental networks. ARPA funded the research that would become ARPANET, Paul Baran published his landmark papers on packet-switched networks, and Donald Davies independently developed packet switching in the UK. The decade ended with ARPANET's first node going live in 1969.</p>
    <p>Other 1960s milestones include the development of timesharing operating systems, the founding of Intel (1968), and the first email-like messages exchanged on CTSS — all precursors to the networked internet.</p>`,

  '1970s': `
    <h1>1970s Technology Milestones — IPv4 Era Timeline</h1>
    <p>The 1970s were the decade TCP/IP was born. Vint Cerf and Bob Kahn published "A Protocol for Packet Network Interconnection" in 1974, defining the architecture that still powers the internet today. ARPANET grew from a handful of nodes to a research network spanning the US, and email became the killer app of early networking.</p>
    <p>The 1970s also brought the first personal computers (Apple I, 1976; Apple II, 1977), Ethernet's invention at Xerox PARC, and DNS's conceptual precursors — the HOSTS.TXT file that mapped names to addresses on the early internet.</p>`,

  '1980s': `
    <h1>1980s Technology Milestones — IPv4 Era Timeline</h1>
    <p>The 1980s were the decade TCP/IP took over. On January 1, 1983 — "Flag Day" — ARPANET switched to TCP/IP. The DNS system was formalized (1983), the first commercial ISPs emerged, and the internet began its transition from military research network to global public infrastructure.</p>
    <p>The 1980s also saw the IBM PC revolution, the rise of Unix workstations, the establishment of the first RIRs, and the Morris Worm (1988) — the first major internet security incident, demonstrating the vulnerabilities of a connected network.</p>`,

  '1990s': `
    <h1>1990s Technology Milestones — IPv4 Era Timeline</h1>
    <p>The 1990s transformed the internet from a research tool to a global phenomenon. Tim Berners-Lee proposed the World Wide Web in 1989 (published 1991), Mosaic launched in 1993 making the web accessible to non-technical users, and Netscape's IPO in 1995 kicked off the dot-com era. By decade's end, over 300 million people were online.</p>
    <p>1990s milestones include the commercialization of the internet backbone, Amazon and eBay's founding, the browser wars between Netscape and Internet Explorer, the launch of Google (1998), and the IPv4 address allocation policies that would eventually lead to exhaustion in the 2010s.</p>`,

  '2000s': `
    <h1>2000s Technology Milestones — IPv4 Era Timeline</h1>
    <p>The 2000s opened with the dot-com bust but quickly recovered with a more mature, infrastructure-driven internet. Web 2.0 emerged as a concept and reality — Wikipedia (2001), Friendster, MySpace, YouTube (2005), and Facebook (2004) defined the participatory web. Meanwhile, broadband replaced dial-up and mobile internet took its first steps.</p>
    <p>Infrastructure milestones of the 2000s include Amazon Web Services' launch (2006), the iPhone (2007), the growth of Tier 1 backbone networks, and the first ARIN warnings about IPv4 exhaustion — setting the stage for the IPv6 transition efforts of the following decade.</p>`,

  '2010s': `
    <h1>2010s Technology Milestones — IPv4 Era Timeline</h1>
    <p>The 2010s were the decade IPv4 exhaustion became real. APNIC (2011), RIPE NCC (2012), and ARIN (2015) all ran out of IPv4 addresses from their free pools. Meanwhile, the cloud computing revolution accelerated, mobile internet surpassed desktop traffic, and hyperscale data centers from AWS, Google, and Azure became the new internet backbone.</p>
    <p>The 2010s also brought the Snowden revelations (2013), the HTTPS migration of the web (Let's Encrypt, 2015), the rise of Kubernetes and containerization, 4G LTE global rollout, and the first AI breakthroughs in deep learning that set the stage for the 2020s AI era.</p>`,

  '2020s': `
    <h1>2020s Technology Milestones — IPv4 Era Timeline</h1>
    <p>The 2020s are the twilight of the IPv4 era and the dawn of what comes next. AFRINIC's IPv4 exhaustion (2021), the global COVID-19 pandemic accelerating remote work and cloud adoption, SpaceX Starlink reaching millions of subscribers, and the generative AI explosion following ChatGPT (2022) define this decade so far.</p>
    <p>2020s milestones include the maturation of 5G networks, the metaverse hype cycle, quantum computing milestones, and the AI infrastructure buildout that is reshaping data center investment worldwide — all happening as the last IPv4 addresses are traded on the secondary market.</p>`,
};

/* ── stub template ── */
function stub({ title, description, canonical, hashRoute, bodyHtml }) {
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
  ${bodyHtml.trim()}
  <p><a href="https://ipv4.events/${hashRoute}">Open the full interactive ipv4.events timeline →</a></p>
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
  const bodyHtml  = CAT_BODY[cat.id] || `<h1>${label} — IPv4 Era Timeline</h1>\n    <p>${desc}</p>`;

  await writeFile(join(dir, 'index.html'), stub({ title, description: desc, canonical, hashRoute, bodyHtml }), 'utf8');
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
  const bodyHtml  = DEC_BODY[dec] || `<h1>${dec} Milestones — IPv4 Era Timeline</h1>\n    <p>${desc}</p>`;

  await writeFile(join(dir, 'index.html'), stub({ title, description: desc, canonical, hashRoute, bodyHtml }), 'utf8');
  console.log(`  ✓ decade/${dec}/index.html`);
}

console.log('\nDone — stub files written.');
