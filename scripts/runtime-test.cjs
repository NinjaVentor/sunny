// Runtime-test the no-CDN widgets by executing their inline scripts with DOM stubs.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");

function makeEnv() {
  const els = {};
  function El() {
    return {
      value: "", textContent: "", innerHTML: "", disabled: false,
      onclick: null, _l: {}, _o: [],
      addEventListener(e, f) { (this._l[e] = this._l[e] || []).push(f); },
      add(o) { this._o.push(o); }, appendChild() {},
      style: {}, dataset: {}, files: [],
    };
  }
  const document = {
    getElementById: (id) => els[id] || (els[id] = El()),
    createElement: () => El(),
  };
  return { els, document };
}
function runWidget(slug, preset, fire) {
  const h = fs.readFileSync(path.join(root, "tools", slug + ".html"), "utf8");
  const found = [...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).filter((c) => c.includes("getElementById"));
  const code = found[found.length - 1];
  const { els, document } = makeEnv();
  const sandbox = { document, console, Option: function (t, v) { this.text = t; this.value = v; } };
  if (preset) preset(els, sandbox);
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  if (fire) fire(els, sandbox);
  return { els, sandbox };
}
let pass = 0, total = 0;
function check(name, cond, extra) {
  total++;
  if (cond) { pass++; console.log("PASS", name); }
  else console.log("FAIL", name, "-", extra || "");
}

// VAT add + extract
let r = runWidget("vat-calculator", (els, sb) => {
  sb.document.getElementById("amt").value = "1000";
  sb.document.getElementById("md").value = "add";
}, null);
r.els.go.onclick();
check("vat add 1000 -> total 1,050.00", r.els.t.textContent.includes("1,050.00"), r.els.t.textContent);
r.els.amt.value = "1050"; r.els.md.value = "ex"; r.els.go.onclick();
check("vat extract 1050 -> base 1,000.00 + vat 50.00", r.els.b.textContent.includes("1,000.00") && r.els.v.textContent.includes("50.00"), r.els.b.textContent + " / " + r.els.v.textContent);

// Age
r = runWidget("age-calculator", () => {}, null);
r.els.dob.value = "2000-01-01"; r.els.ref.value = "2026-01-01"; r.els.go.onclick();
check("age 2000->2026 = 26 years", r.els.res.textContent.startsWith("26 years"), r.els.res.textContent);

// Unit length + temp
r = runWidget("unit-converter", (els, sb) => {
  const d = sb.document;
  d.getElementById("cat").value = "length"; d.getElementById("val").value = "1";
}, null);
r.els.un.value = "m";
r.els.val._l.input.forEach((f) => f());
check("unit 1m -> 100cm", r.els.tb.innerHTML.includes("cm") && r.els.tb.innerHTML.includes(">100<"), r.els.tb.innerHTML.slice(0, 120));
r = runWidget("unit-converter", (els, sb) => {
  const d = sb.document;
  d.getElementById("cat").value = "temp"; d.getElementById("val").value = "0";
}, null);
r.els.un.value = "C";
r.els.un._l.change.forEach((f) => f());
check("unit 0C -> 32F", r.els.tb.innerHTML.includes("32"), r.els.tb.innerHTML.slice(0, 200));

// Qibla (stub GPS = Dubai)
r = runWidget("qibla-finder", (els, sb) => {
  sb.navigator = { geolocation: { getCurrentPosition: (ok) => ok({ coords: { latitude: 25.2, longitude: 55.3 } }) } };
}, null);
r.els.go.onclick();
const m = r.els.res.textContent.match(/([\d.]+)°/);
check("qibla Dubai ~258deg", m && +m[1] > 250 && +m[1] < 265, r.els.res.textContent);

// Currency (stub fetch)
(async () => {
  const h = fs.readFileSync(path.join(root, "tools", "currency-converter.html"), "utf8");
  const code = [...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((x) => x[1]).find((c) => c.includes("getElementById") && c.includes("fetch"));
  const { els, document } = makeEnv();
  document.getElementById("amt").value = "1000";
  const sandbox = { document, console, Option: function (t, v) { this.text = t; this.value = v; }, fetch: async () => ({ json: async () => ({ rates: { PKR: 75.47, AED: 1 } }) }) };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  await new Promise((res) => setTimeout(res, 100));
  check("currency 1000 AED -> ~75,470 PKR", els.res.textContent.replace(/,/g, "").includes("75470"), els.res.textContent);
  console.log(`\n${pass}/${total} runtime checks passed`);
  process.exit(pass === total ? 0 : 1);
})();
