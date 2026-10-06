// Runtime-test jobs.html render + pager with 65 stub jobs (no network).
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const h = fs.readFileSync(path.join(root, "jobs.html"), "utf8");
const code = [...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).find((c) => c.includes("var ALL="));

const created = [];
function El() {
  const e = {
    value: "", textContent: "", disabled: false, onclick: null,
    style: {}, dataset: {}, _l: {}, _kids: {}, children: [],
    addEventListener(ev, f) { (this._l[ev] = this._l[ev] || []).push(f); },
    appendChild(c) { this.children.push(c); return c; },
    add() {},
    scrollIntoView() {},
    querySelector(s) { return this._kids[s] || (this._kids[s] = El()); },
  };
  let _html = "";
  Object.defineProperty(e, "innerHTML", {
    get() { return _html; },
    set(v) { _html = v; e.children = []; },
  });
  created.push(e);
  return e;
}
const els = {};
const sandbox = {
  document: { getElementById: (id) => els[id] || (els[id] = El()), createElement: () => El() },
  console,
  fetch: async () => { throw new Error("no network in test"); },
};
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
vm.runInContext("ALL = Array.from({length:65},function(_,i){return {title:'Dev '+i,company:'Co',geo:'Remote',type:'Full-Time',industry:'IT',excerpt:'x',description:'d',salary:'',url:'https://jobicy.com/jobs/'+i,date:'2026-10-01'}}); render();", sandbox);

const jobsBox = els.jobs;
const pager = els.pager;
const cards1 = jobsBox.children.length;
const info1 = pager.children.map((c) => c.textContent).join(" | ");
console.log("page1 cards:", cards1);
console.log("page1 pager:", info1);

// click Next
const next = pager.children.find((c) => c.textContent === "Next →");
if (!next || !next.onclick) { console.log("FAIL: no working Next button"); process.exit(1); }
jobsBox.children = [];
pager.children = [];
next.onclick();
const cards2 = els.jobs.children.length;
const info2 = els.pager.children.map((c) => c.textContent).join(" | ");
console.log("page2 cards:", cards2);
console.log("page2 pager:", info2);

// filter narrows + resets to page 1
els.jq.value = "dev 6";
els.jq._l.input.forEach((f) => f());
const cardsF = els.jobs.children.length;
const infoF = els.pager.children.map((c) => c.textContent).join(" | ");
console.log("filter 'dev 6' cards:", cardsF);
console.log("filter pager:", infoF);

const ok = cards1 === 30 && /Showing 1–30 of 65/.test(info1) && cards2 === 30 && /Showing 31–60 of 65/.test(info2) && cardsF === 6 && /of 6 jobs/.test(infoF);
console.log(ok ? "PAGER TEST PASS" : "PAGER TEST FAIL");
process.exit(ok ? 0 : 1);
