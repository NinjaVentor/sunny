// Verify each tool page: widget markup present, required CDN present, inline JS syntax valid.
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");
const root = path.join(__dirname, "..");
const toolsDir = path.join(root, "tools");
const NEED = {
  "images-to-pdf": ["jspdf"], "text-to-pdf": ["jspdf"], "pdf-to-images": ["pdfjs"],
  "pdf-merge": ["pdflib"], "pdf-split": ["pdflib"], "pdf-compress": ["pdflib"],
  "word-to-pdf": ["mammoth"], "pdf-to-word": ["pdfjs"],
};
const CDNURL = {
  jspdf: "jspdf", pdflib: "pdf-lib", pdfjs: "pdf.js", mammoth: "mammoth",
};
let fail = 0;
fs.readdirSync(toolsDir).filter((f) => f.endsWith(".html")).forEach((f) => {
  const h = fs.readFileSync(path.join(toolsDir, f), "utf8");
  const errs = [];
  if (!h.includes('class="widget"')) errs.push("no widget");
  if (!h.includes('id="go"') && !h.includes("id=\"go\"") && !/currency-converter|unit-converter/.test(f)) errs.push("no action button");
  Object.values(CDNURL).forEach(() => {});
  // check CDN script tags referenced by widget type markers
  ["pdf-lib", "jspdf", "pdf.js", "mammoth"].forEach((lib) => {
    const usesLib = h.includes(lib === "pdf-lib" ? "PDFLib." : lib === "jspdf" ? "window.jspdf" : lib === "pdf.js" ? "pdfjsLib" : "mammoth.");
    if (usesLib && !h.includes(lib + ".min.js") && !h.includes(lib + "/")) errs.push("uses " + lib + " but CDN missing");
  });
  // syntax-check inline scripts
  const blocks = [...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  blocks.forEach((code, i) => {
    if (!code.trim()) return;
    const tmp = path.join(root, "scripts", ".tmpcheck.js");
    fs.writeFileSync(tmp, code);
    try { execSync("node --check " + tmp, { stdio: "pipe" }); }
    catch (e) { errs.push("JS syntax error in block " + i); }
  });
  try { fs.unlinkSync(path.join(root, "scripts", ".tmpcheck.js")); } catch (e) {}
  if (errs.length) { console.log("FAIL", f, "-", errs.join("; ")); fail++; }
  else console.log("OK  ", f);
});
console.log(fail ? fail + " pages with problems" : "ALL TOOL PAGES OK");
process.exit(fail ? 1 : 0);
