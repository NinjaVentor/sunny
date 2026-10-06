// Monthly UAE fuel-price updater. Sources: Khaleej Times / Gulf News energy pages
// (+ emirates247 fallback). No API keys, no quotas — plain fetch + regex.
// Run: node scripts/update-fuel.mjs   (GitHub Actions: monthly + manual dispatch)
//
// Strategy: find this month's announcement article, prefer a comparison table
// ("Petrol <Month> <PrevMonth>" — new prices come FIRST there), else fall back
// to first-match on the article. VALIDATES before writing; aborts on garbage.
// If all sources fail: exit 0 quietly, fuel.json untouched.
const UA = { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36" };
const FUELS = ["Super 98", "Special 95", "E-Plus 91", "Diesel"];
const SOURCES = [
  "https://www.khaleejtimes.com/business/energy",
  "https://gulfnews.com/business/energy",
  "https://www.emirates247.com/news/emirates",
];

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function targetMonth(now = new Date()) {
  return { name: MONTHS[now.getUTCMonth()], year: now.getUTCFullYear() };
}
function abs(base, href) {
  try { return new URL(href, base).href; } catch { return null; }
}
async function getText(url) {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return await r.text();
}
function pageText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/\s+/g, " ");
}
// Candidate article links mentioning fuel prices (+ target month when possible).
function findArticles(html, base, monthName) {
  const out = [];
  const re = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]{0,400}?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) && out.length < 60) {
    const txt = m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (!/fuel.?price|petrol.?price/i.test(txt)) continue;
    const url = abs(base, m[1]);
    if (!url || !/^https:\/\//.test(url)) continue;
    out.push({ url, text: txt.slice(0, 160), hasMonth: new RegExp(monthName, "i").test(txt) });
  }
  out.sort((a, b) => (b.hasMonth ? 1 : 0) - (a.hasMonth ? 1 : 0));
  return out.slice(0, 4);
}
function firstPrice(segment, fuel) {
  const re = new RegExp("(" + fuel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")[^\\d]*(\\d+\\.\\d{2})", "i");
  const m = segment.match(re);
  return m ? parseFloat(m[2]) : null;
}
// Prefer a comparison-table segment ("Petrol <Month> <Prev>...") where the
// FIRST price per fuel is the new month's; else first-match on whole article.
function extractPrices(articleText, monthName) {
  const tableRe = new RegExp("petrol\\s+" + monthName + "[\\s\\S]{0,1200}", "i");
  const tm = articleText.match(tableRe);
  const segments = tm ? [tm[0], articleText] : [articleText];
  for (const seg of segments) {
    const prices = {};
    let ok = true;
    for (const f of FUELS) {
      const v = firstPrice(seg, f);
      if (v == null) { ok = false; break; }
      prices[f] = v;
    }
    if (ok) return prices;
  }
  return null;
}
function valid(prices) {
  if (!prices) return false;
  return FUELS.every((f) => typeof prices[f] === "number" && prices[f] >= 1.0 && prices[f] <= 10.0);
}

async function main() {
  const { name, year } = targetMonth();
  console.log("Target:", name, year);
  for (const src of SOURCES) {
    let html;
    try { html = await getText(src); }
    catch (e) { console.log("SKIP source (fetch):", src, String(e).slice(0, 100)); continue; }
    const articles = findArticles(html, src, name);
    console.log("Source:", src, "-", articles.length, "candidate(s)");
    for (const a of articles) {
      try {
        const text = pageText(await getText(a.url));
        if (!new RegExp(name, "i").test(text) && !new RegExp(String(year)).test(text)) {
          console.log("  skip (wrong month):", a.url.slice(0, 110));
          continue;
        }
        const prices = extractPrices(text, name);
        console.log("  tried:", a.url.slice(0, 110), "->", JSON.stringify(prices));
        if (!valid(prices)) { console.log("  invalid, next"); continue; }
        const key = { "Super 98": "super_98", "Special 95": "special_95", "E-Plus 91": "e_plus_91", "Diesel": "diesel" };
        const payload = {
          month: name + " " + year,
          updated: new Date().toISOString().slice(0, 10),
          prices: Object.fromEntries(FUELS.map((f) => [key[f], prices[f]])),
          source: "UAE Fuel Price Committee",
        };
        const { writeFileSync } = await import("node:fs");
        const { join, dirname } = await import("node:path");
        const { fileURLToPath } = await import("node:url");
        const out = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "fuel.json");
        writeFileSync(out, JSON.stringify(payload) + "\n");
        console.log("WROTE", out, JSON.stringify(payload));
        return;
      } catch (e) { console.log("  error:", String(e).slice(0, 120)); }
    }
  }
  console.log("All sources failed — fuel.json untouched.");
}

main();
