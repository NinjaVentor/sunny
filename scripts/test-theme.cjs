// Verify theme toggle works on a generated tool page.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const h = fs.readFileSync(path.join(root, "tools", "pdf-merge.html"), "utf8");
const blocks = [...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).filter((c) => c.trim());
function El() {
  return { value: "", textContent: "", _attr: {}, _l: {},
    getAttribute(k) { return this._attr[k]; }, setAttribute(k, v) { this._attr[k] = v; },
    addEventListener(e, f) { (this._l[e] = this._l[e] || []).push(f); },
    appendChild() {}, add() {}, querySelector() { return El(); } };
}
const store = {};
const els = {};
const sandbox = {
  document: { body: El(), getElementById: (id) => els[id] || (els[id] = El()), createElement: () => El(), querySelectorAll: () => [] },
  localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = v; } },
  console,
};
vm.createContext(sandbox);
blocks.forEach((c) => vm.runInContext(c, sandbox));
const body = sandbox.document.body;
const btn = els.themeBtn;
console.log("initial theme:", body.getAttribute("data-theme"), "| btn:", btn.innerHTML);
btn.onclick();
console.log("after click:", body.getAttribute("data-theme"), "| btn:", btn.innerHTML, "| stored:", store["stp-theme"]);
btn.onclick();
console.log("after 2nd click:", body.getAttribute("data-theme"), "| btn:", btn.innerHTML);
const lightCss = h.includes('body[data-theme="light"]{background:#edf1f7');
console.log("light CSS present:", lightCss);
const ok = body.getAttribute("data-theme") === "dark" && btn.innerHTML.includes("Light") && store["stp-theme"] === "dark" && lightCss;
console.log(ok ? "THEME TEST PASS" : "THEME TEST FAIL");
process.exit(ok ? 0 : 1);
