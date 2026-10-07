// Verify every "#i-xxx" icon reference has a matching symbol in assets/icons.svg.
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const spr = fs.readFileSync(path.join(root, "assets", "icons.svg"), "utf8");
const syms = new Set();
for (const m of spr.matchAll(/<symbol id="([^"]+)"/g)) syms.add(m[1]);
function walk(d, out) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (!/node_modules|\.git|\.kilo/.test(p)) walk(p, out);
    } else if (/\.(html|js)$/.test(f) && !/scripts\/(test|verify|audit)/.test(p)) out.push(p);
  }
}
const files = [];
walk(root, files);
const used = new Set();
files.forEach((f) => {
  const h = fs.readFileSync(f, "utf8");
  for (const m of h.matchAll(/#(i-[a-z0-9-]+)/g)) used.add(m[1]);
});
const missing = [...used].filter((u) => !syms.has(u));
console.log("symbols:", syms.size, "used:", used.size);
if (missing.length) { console.log("MISSING:", missing.join(",")); process.exit(1); }
console.log("ALL ICON REFS OK");
