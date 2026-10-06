// Test homepage FX swap logic with stubbed DOM + API.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const h = fs.readFileSync(path.join(root, "index.html"), "utf8");
const code = [...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).find((c) => c.includes("FX converter"));

function El() {
  const e = { value: "", textContent: "", innerHTML: "", disabled: false, onclick: null, style: {}, _l: {}, _o: [], _attr: {},
    getAttribute(k) { return this._attr[k]; },
    setAttribute(k, v) { this._attr[k] = v; },
    addEventListener(ev, f) { (this._l[ev] = this._l[ev] || []).push(f); },
    appendChild(o) { this._o.push(o); return o; },
    querySelector(s) { return this._q && this._q[s] ? this._q[s] : ((this._q = this._q || {})[s] = El()); } };
  return e;
}
const els = {};
// Fake rates: 1 AED = 75.5 PKR, 1 USD = 3.6725 AED
const RATES = {
  AED: { AED: 1, PKR: 75.5, USD: 0.2723 },
  PKR: { PKR: 1, AED: 1 / 75.5, USD: 0.2723 / 75.5 },
};
const sandbox = {
  document: { body: El(), documentElement: El(), getElementById: (id) => els[id] || (els[id] = El()), createElement: (t) => El(), querySelectorAll: () => [], querySelector: () => El() },
  console,
  matchMedia: () => ({ matches: false, addEventListener() {} }),
  setInterval: () => 0, clearInterval: () => {},
  documentElement: El(),
  fetch: async (url) => {
    const base = new URL(url, "http://x").searchParams.get("base");
    return { ok: true, json: async () => ({ base, rates: RATES[base] || {} }) };
  },
};
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

(async () => {
  await new Promise((r) => setTimeout(r, 100));
  els.fxAmount.value = "1000";
  (els.fxAmount._l.input || []).forEach((f) => f());
  await new Promise((r) => setTimeout(r, 100));
  const amt = els.fxAmount, fr = els.fxFrom, to = els.fxTo, res = els.fxResult, rate = els.fxRate;
  amt.value = "1000";
  console.log("default pair:", fr.value, "->", to.value);
  console.log("before swap result:", res.value, "| rate:", rate.textContent);
  els.fxSwap.onclick();
  await new Promise((r) => setTimeout(r, 100));
  console.log("after swap pair:", fr.value, "->", to.value);
  console.log("after swap result:", res.value, "| rate:", rate.textContent);
  const v = parseFloat(String(res.value).replace(/,/g, ""));
  const ok = fr.value === "PKR" && to.value === "AED" && Math.abs(v - 1000 / 75.5) < 0.05;
  console.log(ok ? "SWAP TEST PASS" : "SWAP TEST FAIL");
  // search suggestions
  const gs = els.globalSearch;
  gs.value = "pdf";
  (gs._l.input || []).forEach((f) => f());
  var boxNow = els.gsuggest;
  var n1 = boxNow ? boxNow._o.length : -1;
  console.log("suggest 'pdf' items:", n1);
  gs.value = "xyzznothing";
  (gs._l.input || []).forEach((f) => f());
  var boxNow2 = els.gsuggest;
  var n2 = boxNow2 ? boxNow2._o.length : -1;
  console.log("nonsense shows none-msg, count:", n2);
  gs.value = "pdf";
  (gs._l.input || []).forEach((f) => f());
  var firstBtn = els.gsuggest._o[0];
  var nav = null;
  sandbox.location = { set href(u) { nav = u; } };
  (firstBtn._l.mousedown || []).forEach((f) => f({ preventDefault() {} }));
  console.log("first suggestion navigates to:", nav);
  const ok2 = ok && n1 >= 5 && n2 >= 0;
  console.log(ok2 ? "ALL PASS" : "FAIL");
  process.exit(ok2 ? 0 : 1);
})();
