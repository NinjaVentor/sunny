// Verify header search suggestions (hSearch/hSuggest) work like hero search.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const h = fs.readFileSync(path.join(root, "index.html"), "utf8");
const code = [...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).find((c) => c.includes("toolMatches"));
function El() {
  return { value: "", textContent: "", innerHTML: "", hidden: true, _l: {}, _o: [], _attr: {},
    getAttribute(k) { return this._attr[k]; }, setAttribute(k, v) { this._attr[k] = v; },
    addEventListener(e, f) { (this._l[e] = this._l[e] || []).push(f); },
    appendChild(o) { this._o.push(o); return o; },
    querySelector(s) { return this._q && this._q[s] ? this._q[s] : ((this._q = this._q || {})[s] = El()); } };
}
const els = {};
const sandbox = {
  document: { body: El(), getElementById: (id) => els[id] || (els[id] = El()), createElement: () => El(), querySelectorAll: () => [], querySelector: () => El() },
  console, matchMedia: () => ({ matches: false, addEventListener() {} }),
  setInterval: () => 0, clearInterval: () => {},
  fetch: async () => ({ ok: true, json: async () => ({}) }),
  location: { href: "" },
};
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
els.hSearch.value = "vat";
(els.hSearch._l.input || []).forEach((f) => f());
const n = els.hSuggest._o.length;
const nav = [];
sandbox.location = { set href(u) { nav.push(u); } };
(els.hSuggest._o[0]._l.mousedown || []).forEach((f) => f({ preventDefault() {} }));
console.log("header suggest 'vat' items:", n, "| navigates:", nav[0] || "(none)");
const ok = n >= 1 && nav[0] === "/tools/vat-calculator";
console.log(ok ? "HEADER SEARCH PASS" : "HEADER SEARCH FAIL");
process.exit(ok ? 0 : 1);
