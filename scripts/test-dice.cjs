// Verify hero slot-machine rotator: 8 words + loop-back, stepped transforms.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const h = fs.readFileSync(path.join(root, "index.html"), "utf8");
const start = h.indexOf("/* ——— Hero highlight slot-machine");
const end = h.indexOf("/* ——— Homepage live jobs", start);
const code = "var $=function(id){return document.getElementById(id)};" + h.slice(start, end);
function El() {
  return { textContent: "Everyday", innerHTML: "", style: {}, children: [], _l: {},
    appendChild(c) { this.children.push(c); return c; },
    addEventListener(e, f) { (this._l[e] = this._l[e] || []).push(f); } };
}
const els = { hlWord: El() };
const timers = [], timeouts = [];
const sandbox = {
  document: { getElementById: (id) => els[id] || (els[id] = El()), createElement: () => El() },
  console, Math,
  matchMedia: () => ({ matches: false }),
  setInterval: (f) => { timers.push(f); return timers.length; },
  clearInterval: () => {},
  setTimeout: (f) => { timeouts.push(f); return timeouts.length; },
  window: {},
};
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const track = els.hlWord.children[0];
const words = track.children.map((c) => c.textContent);
console.log("track words:", words.join(","));
timers[0](); timers[0](); timers[0]();
console.log("after 3 steps:", track.style.transform);
for (let k = 0; k < 5; k++) timers[0]();
console.log("after 8 steps:", track.style.transform);
timeouts.forEach((f) => f()); // loop-back reset
console.log("after reset:", JSON.stringify(track.style.transform), "| transition:", JSON.stringify(track.style.transition));
const ok = words.length === 9 && words[0] === "Everyday" && words[7] === "Money" && words[8] === "Everyday" && track.style.transform === "translateY(0)";
console.log(ok ? "SLOT TEST PASS" : "SLOT TEST FAIL");
process.exit(ok ? 0 : 1);
