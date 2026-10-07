// One-off link + SEO audit for generated site.
const fs = require("node:fs");
const path = require("node:path");
const root = __dirname + "/..";
const exists = (p) => {
  p = String(p).replace(/^\//, "");
  if (p === "") p = "index.html";
  if (p.endsWith("/")) {
    const dir = path.join(root, p);
    if (fs.existsSync(path.join(dir, "index.html"))) return true;
    const sib = path.join(root, p.slice(0, -1) + ".html");
    if (fs.existsSync(sib)) return true;
    return false;
  }
  const f = path.join(root, p);
  if (fs.existsSync(f) && fs.statSync(f).isFile()) return true;
  if (fs.existsSync(f + ".html")) return true;
  return false;
};
const tf = fs.readdirSync(path.join(root, "tools")).filter((f) => f.endsWith(".html"));
const bf = fs.readdirSync(path.join(root, "blog")).filter((f) => f.endsWith(".html"));
const rootHtml = fs.readdirSync(root).filter((f) => f.endsWith(".html"));
console.log("root pages:", rootHtml.length, "tools:", tf.length, "blog posts:", bf.length);
const docs = [
  ...rootHtml.map((f) => ({ n: f, h: fs.readFileSync(path.join(root, f), "utf8") })),
  ...tf.map((f) => ({ n: "tools/" + f, h: fs.readFileSync(path.join(root, "tools", f), "utf8") })),
  ...bf.map((f) => ({ n: "blog/" + f, h: fs.readFileSync(path.join(root, "blog", f), "utf8") })),
];
const hrefs = new Set();
docs.forEach((d) => {
  const re = /href="(\/[^"]*)"/g;
  let m;
  while ((m = re.exec(d.h))) hrefs.add(m[1]);
});
let bad = 0;
hrefs.forEach((h) => {
  if (h.startsWith("/api/")) return;
  const clean = h.split("#")[0].split("?")[0];
  if (!exists(clean)) { console.log("BROKEN:", h); bad++; }
});
console.log("internal links:", hrefs.size, "broken:", bad);
let noFaq = 0, noMeta = 0, noAd = 0;
tf.forEach((f) => {
  const h = fs.readFileSync(path.join(root, "tools", f), "utf8");
  if (!h.includes("FAQPage")) { console.log("NO FAQ:", f); noFaq++; }
  if (!h.includes('rel="canonical"') || !h.includes("og:title")) { console.log("NO META:", f); noMeta++; }
  if (!h.includes("ad-slot-placeholder")) { console.log("NO ADSLOT:", f); noAd++; }
});
console.log("faq missing:", noFaq, "meta missing:", noMeta, "adslot missing:", noAd);
const idx = fs.readFileSync(path.join(root, "index.html"), "utf8");
const foot = (idx.split("<footer>")[1] || "").split("</footer>")[0];
console.log("footer dead # links:", (foot.match(/href="#"/g) || []).length);
const must = ["about.html", "contact.html", "privacy-policy.html", "terms-of-service.html", "dmca.html", "blog.html", "sitemap.xml", "robots.txt"];
must.forEach((f) => { if (!fs.existsSync(path.join(root, f))) { console.log("MISSING FILE:", f); bad++; } });
console.log(bad === 0 && noFaq === 0 ? "AUDIT PASS" : "AUDIT FAIL");
process.exit(bad || noFaq ? 1 : 0);
