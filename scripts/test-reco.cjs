// Verify fuzzy reco: typo shows close tools, gibberish shows popular tools.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const h = fs.readFileSync(path.join(root, "index.html"), "utf8");
const code = [...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).find((c) => c.includes("fuzzySuggest"));
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
function type(q) {
  els.globalSearch.value = q;
  (els.globalSearch._l.input || []).forEach((f) => f());
  return els.searchReco._o.filter((x) => x.href).map((x) => x.href);
}
const typo = type("cruncy");
console.log("typo 'cruncy' reco:", JSON.stringify(typo));
const gib = type("xyzznothing");
console.log("gibberish reco:", JSON.stringify(gib.slice(-4)));
const gibHidden = els.searchReco.hidden;
const exact = type("vat");
console.log("exact 'vat' reco hidden:", els.searchReco.hidden);
const ok = typo.includes("/tools/currency-converter") && gib.slice(-4).length === 4 && gibHidden === false && els.searchReco.hidden === true;
console.log(ok ? "RECO TEST PASS" : "RECO TEST FAIL");
process.exit(ok ? 0 : 1);
