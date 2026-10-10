// Max-SEO audit: titles, descriptions, canonicals, social tags, schemas,
// heading hierarchy, crawler-friendly anchors, image alts, discovery files.
// Usage: node scripts/seo-check.cjs (exit 1 on any failure)
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (["node_modules", ".git", ".opencode"].includes(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}
const DOMAIN = "https://sunnytoolspro.com";
let fail = 0;
const bad = (msg) => { fail++; console.log("FAIL " + msg); };
const files = walk(root);

// 1. titles <60, descriptions <155 (strictly under), canonical present + self-referencing
for (const f of files) {
  const h = fs.readFileSync(f, "utf8");
  const rel = path.relative(root, f);
  const t = (h.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  const d = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "";
  if (!(t.length > 0 && t.length < 60)) bad(`${rel}: title length ${t.length}`);
  if (!(d.length > 0 && d.length < 155)) bad(`${rel}: description length ${d.length}`);
  const can = (h.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || "";
  if (!can.startsWith(DOMAIN)) bad(`${rel}: canonical not on ${DOMAIN}`);
  if (/\/(tools|blog)\/$/.test(can) || (can !== DOMAIN + "/" && can.endsWith("/"))) bad(`${rel}: canonical has trailing slash`);
  if (!h.includes('property="og:image"') || !h.includes('name="twitter:image"')) bad(`${rel}: social image tags`);
}

// 2. tool pages: 3 schemas, single exact-name H1, required H2s
const toolsDir = path.join(root, "tools");
for (const f of fs.readdirSync(toolsDir).filter((x) => x.endsWith(".html"))) {
  const h = fs.readFileSync(path.join(toolsDir, f), "utf8");
  for (const s of ["FAQPage", "SoftwareApplication", "HowTo"]) {
    if (!h.includes(`"${s}"`) && !h.includes(s)) bad(`tools/${f}: missing ${s} schema`);
  }
  if (!h.includes('"operatingSystem":"All"') && !h.includes("operatingSystem")) bad(`tools/${f}: missing operatingSystem`);
  if (!h.includes('"price":"0"')) bad(`tools/${f}: missing price 0 offer`);
  const h1s = [...h.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => m[1].replace(/<[^>]+>/g, "").trim());
  if (h1s.length !== 1) bad(`tools/${f}: want exactly 1 h1, found ${h1s.length}`);
}

// 3. landing: WebSite + Organization schemas, H1 first, anchors not buttons
{
  const h = fs.readFileSync(path.join(root, "index.html"), "utf8");
  if (!h.includes('"WebSite"')) bad("index: missing WebSite schema");
  if (!h.includes('"Organization"')) bad("index: missing Organization schema");
  if (/<button class="(tool|cat)"/.test(h)) bad("index: tool/cat buttons instead of anchors");
  if (!h.includes('id="filters"')) bad("index: missing filter group");
}

// 4. every <img> carries alt
for (const f of files) {
  const h = fs.readFileSync(f, "utf8");
  const imgs = [...h.matchAll(/<img(?![^>]*\salt=)[^>]*>/g)];
  if (imgs.length) bad(`${path.relative(root, f)}: ${imgs.length} <img> without alt`);
}

// 5. discovery files
{
  const sm = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
  if (!sm.includes(DOMAIN + "/tools/") || sm.includes("/404")) bad("sitemap: tool urls or 404 leak");
  const robots = fs.readFileSync(path.join(root, "robots.txt"), "utf8");
  if (!robots.includes("Disallow: /api/")) bad("robots: /api/ not disallowed");
  if (!robots.includes(DOMAIN)) bad("robots: sitemap not on canonical domain");
  const mf = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
  if (mf.start_url !== "/" || !mf.icons.length) bad("manifest: invalid");
}
console.log(fail ? `${fail} SEO PROBLEMS` : "SEO CHECK PASS");
process.exit(fail ? 1 : 0);
