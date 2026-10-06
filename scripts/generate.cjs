// Static site generator: legal pages, tool pages, blog, sitemap, robots.
// Run: node scripts/generate.cjs   (outputs .html at repo root)
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const site = require("../content/site.js");
const legal = require("../content/legal.js");
const blog = require("../content/blog.js");
const tools = [...require("../content/tools1.js"), ...require("../content/tools2.js")];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const words = (html) => String(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;

/* ---------- shared CSS (dark navy, matches homepage) ---------- */
const CSS = `
*{box-sizing:border-box}html,body{overflow-x:clip}
body{margin:0;font-family:Inter,"Segoe UI",system-ui,Arial,sans-serif;background:#0a1931;color:#fff;line-height:1.65}
a{color:#ffc107}.wrap{max-width:1080px;margin:0 auto;padding:0 18px}
.topbar{position:sticky;top:0;z-index:60;background:#071222;border-bottom:1px solid rgba(255,255,255,.08)}
.topbar-in{display:flex;align-items:center;gap:14px;min-height:60px;flex-wrap:wrap;padding-top:6px;padding-bottom:6px}
.logo{display:flex;align-items:center;gap:8px;font-weight:800;color:#fff;text-decoration:none;white-space:nowrap}
.logo .sun{color:#ffc107;font-size:22px}.logo b{font-size:15px;display:block;line-height:1}.logo small{font-size:15px;display:block;line-height:1}
.logo .pro{background:#ffc107;color:#111;font-size:10px;font-weight:800;border-radius:5px;padding:2px 6px;margin-left:6px}
.nav{display:flex;gap:4px;align-items:center;flex-wrap:wrap}
.nav a,.dropbtn{color:#dbe4f5;text-decoration:none;font-size:13.5px;font-weight:600;padding:8px 10px;border-radius:8px;background:transparent;border:0;cursor:pointer;font-family:inherit}
.nav a:hover,.dropbtn:hover{color:#ffc107}
.drop{position:relative}.dropmenu{display:none;position:absolute;top:100%;left:0;background:#0d2140;border:1px solid rgba(255,255,255,.14);border-radius:10px;min-width:210px;padding:6px;z-index:70}
.drop:hover .dropmenu,.drop:focus-within .dropmenu{display:block}
.dropmenu b{display:block;font-size:11px;color:#8ea0c2;text-transform:uppercase;letter-spacing:.08em;padding:8px 10px 2px}
.dropmenu a{display:block;padding:7px 10px;font-size:13px}
.hsearch{margin-left:auto;display:flex;background:#fff;border-radius:8px;overflow:hidden}
.hsearch input{border:0;padding:8px 10px;font-size:13px;width:170px;outline:none;background:#fff;color:#111}
.hsearch button{background:#ffc107;border:0;padding:0 12px;cursor:pointer;font-weight:800}
main{background:#0a1931}
.card{background:#fff;color:#16215c;border-radius:14px;padding:22px;margin:18px 0}
.card h1{margin:0 0 8px;font-size:clamp(24px,3.4vw,34px);color:#1a2f8a;line-height:1.2}
.card h2{color:#1a2f8a;font-size:20px;margin:26px 0 8px}
.card h3{color:#1a2f8a;font-size:16px;margin:18px 0 6px}
.card p{font-size:14.5px;color:#33406b}.card ul,.card ol{font-size:14.5px;color:#33406b;padding-left:22px}
.card li{margin:6px 0}.lead{font-size:16px;color:#33406b}
.crumb{font-size:12.5px;color:#93a3c0;margin:16px 0 0}.crumb a{color:#8fb0ff;text-decoration:none}
.tool-title{margin:16px 0 4px;font-size:clamp(24px,3.4vw,34px);font-weight:800;line-height:1.2;color:#fff}
.ad-slot-placeholder{border:1.5px dashed rgba(255,255,255,.28);border-radius:10px;text-align:center;color:#8ea0c2;font-size:12px;letter-spacing:.1em;text-transform:uppercase;padding:14px;margin:16px 0;background:rgba(255,255,255,.02)}
.widget{background:#f4f6fb;border:1px solid #e2e7f2;border-radius:12px;padding:18px;margin:16px 0;color:#16215c}
.dropzone{border:2px dashed #9db0d0;border-radius:10px;background:#fff;padding:26px 14px;text-align:center;cursor:pointer;font-size:14px;color:#51607f}
.dropzone:hover{border-color:#1a2f8a}
.btn{background:#0b2342;color:#fff;border:0;border-radius:9px;padding:11px 18px;font-weight:800;font-size:14px;cursor:pointer}
.btn.yellow{background:#ffc107;color:#111}.btn:disabled{opacity:.5;cursor:default}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:end;margin:10px 0}
.field label{display:block;font-size:12px;color:#6b7aa5;margin-bottom:4px;font-weight:700}
.field input,.field select,.field textarea{border:1px solid #dfe5f0;border-radius:8px;padding:9px 10px;font-size:14px;color:#111;background:#fff;font-family:inherit}
textarea.ta{width:100%;min-height:160px;resize:vertical}
.out{background:#fff;border:1px solid #e2e7f2;border-radius:8px;padding:10px;font-size:13px;max-height:220px;overflow:auto;white-space:pre-wrap;color:#16215c}
.thumbs{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.thumbs img{width:86px;height:86px;object-fit:cover;border-radius:8px;border:1px solid #dfe5f0}
.stat{font-size:13px;color:#0e9f6e;font-weight:800}
.feat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0}
.feat{background:#f4f6fb;border:1px solid #e6ebf4;border-radius:10px;padding:12px}
.feat b{display:block;font-size:13.5px;color:#1a2f8a}.feat span{font-size:13px;color:#5b6584}
.steps{counter-reset:st;margin:12px 0;padding:0;list-style:none}
.steps li{position:relative;padding:10px 10px 10px 52px;background:#f4f6fb;border:1px solid #e6ebf4;border-radius:10px;margin:8px 0;font-size:14px;color:#33406b}
.steps li::before{counter-increment:st;content:counter(st);position:absolute;left:12px;top:10px;width:28px;height:28px;border-radius:50%;background:#0b2342;color:#fff;font-weight:800;display:grid;place-items:center;font-size:14px}
details.faq{border:1px solid #e2e7f2;border-radius:10px;margin:8px 0;background:#fff}
details.faq summary{cursor:pointer;padding:12px 14px;font-weight:700;font-size:14px;color:#1a2f8a;list-style:none}
details.faq summary::-webkit-details-marker{display:none}
details.faq summary::after{content:"+";float:right;color:#0e9f6e;font-weight:800}
details.faq[open] summary::after{content:"−"}
details.faq .a{padding:0 14px 14px;font-size:14px;color:#33406b}
.privacy-box{background:#e7f7ef;border:1px solid #0e9f6e;border-radius:10px;padding:14px;font-size:14px;color:#0c3b2a;margin:18px 0}
.rel{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0}
.rel a{background:#0b2342;color:#fff;border-radius:10px;padding:14px;text-decoration:none;font-weight:700;font-size:14px}
footer{background:#071222;border-top:1px solid rgba(255,255,255,.08);padding:30px 0 40px;margin-top:26px}
.fgrid{display:grid;grid-template-columns:1.3fr 1fr 1fr 1fr;gap:18px}
.fgrid h4{font-size:13px;margin:0 0 10px;color:#fff}.fgrid a{display:block;font-size:12.5px;color:#9db0d0;margin:5px 0;text-decoration:none}
.fabout{font-size:12.5px;color:#9db0d0}.copy{text-align:center;font-size:12px;color:#8ea0c2;margin-top:24px;border-top:1px solid rgba(255,255,255,.08);padding-top:16px}
.postmeta{font-size:13px;color:#8ea0c2;margin-bottom:6px}
.bloggrid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0}
.postcard{background:#fff;border-radius:12px;padding:16px;color:#16215c;text-decoration:none;display:block}
.postcard b{color:#1a2f8a;font-size:15px;display:block;margin-bottom:6px}
.postcard p{font-size:13.5px;color:#5b6584;margin:0 0 8px}.postcard small{font-size:12px;color:#8a94b5}
.cta{background:#0b2342;border-radius:12px;padding:18px;text-align:center;margin:18px 0}
.cta b{font-size:17px}.cta p{color:#c4d0e8;font-size:14px}.cta a{display:inline-block;background:#ffc107;color:#111;font-weight:800;border-radius:9px;padding:10px 22px;text-decoration:none;margin-top:8px}
table.t{width:100%;border-collapse:collapse;font-size:13px;margin:10px 0}
table.t th,table.t td{border:1px solid #e2e7f2;padding:7px;text-align:left;color:#16215c}
table.t th{background:#f4f6fb;color:#1a2f8a}
@media(max-width:680px){.feat-grid,.rel,.bloggrid{grid-template-columns:1fr}.fgrid{grid-template-columns:1fr 1fr}.hsearch{width:100%;margin:6px 0}.hsearch input{flex:1;width:auto}}
`;

/* ---------- header / footer ---------- */
function toolIndex() {
  const idx = [];
  site.categories.forEach((c) => c.links.forEach(([n, u]) => { if (u.startsWith("/tools/")) idx.push({ n, u }); }));
  tools.forEach((t) => { if (!idx.some((x) => x.u === "/tools/" + t.slug)) idx.push({ n: t.name, u: "/tools/" + t.slug }); });
  return idx;
}
function header(active) {
  const cats = site.categories.map((c) =>
    `<div><b>${esc(c.name)}</b>` + c.links.map(([n, u]) => `<a href="${u}">${esc(n)}</a>`).join("") + `</div>`
  ).join("");
  const idx = JSON.stringify(toolIndex());
  return `<header class="topbar"><div class="wrap topbar-in">
<a class="logo" href="/"><span class="sun">☀</span><span><b>SUNNY</b><small>TOOLS</small></span><span class="pro">PRO</span></a>
<nav class="nav" aria-label="Main">
<span class="drop"><button class="dropbtn">Tools ▾</button><span class="dropmenu">${cats}</span></span>
<a href="/#today">UAE</a><a href="/blog">Blog</a><a href="/#jobs">Jobs</a><a href="/#rooms">Rent</a><a href="/#prayer">Islamic</a>
</nav>
<span class="hsearch"><input id="hs" type="search" placeholder="Search tools…" aria-label="Search tools" list="hsl"><datalist id="hsl"></datalist><button id="hsb" aria-label="Search">⌕</button></span>
<button class="theme-btn" id="themeBtn">☀ Light</button>
</div></header>
<script>try{var _t=localStorage.getItem("stp-theme")||"dark";document.body.setAttribute("data-theme",_t)}catch(e){document.body.setAttribute("data-theme","dark")}</script>
<script>var TI=${idx};var dl=document.getElementById('hsl');TI.forEach(function(t){var o=document.createElement('option');o.value=t.n;dl.appendChild(o)});function goHS(){var q=(document.getElementById('hs').value||'').toLowerCase();var f=TI.find(function(t){return t.n.toLowerCase().indexOf(q)>-1});if(f)location.href=f.u}document.getElementById('hsb').onclick=goHS;document.getElementById('hs').addEventListener('keydown',function(e){if(e.key==='Enter')goHS()});</script>
<script>(function(){var b=document.getElementById('themeBtn');function lb(){if(b)b.textContent=document.body.getAttribute('data-theme')==='dark'?'☀ Light':'☾ Dark'}lb();if(b)b.onclick=function(){var n=document.body.getAttribute('data-theme')==='dark'?'light':'dark';document.body.setAttribute('data-theme',n);try{localStorage.setItem('stp-theme',n)}catch(e){}lb()}})();</script>`;
}
function footer() {
  const cols = site.categories.slice(0, 3).map((c) =>
    `<div><h4>${esc(c.name)}</h4>` + c.links.slice(0, 5).map(([n, u]) => `<a href="${u}">${esc(n)}</a>`).join("") + `</div>`
  ).join("");
  const legalLinks = site.legal.map(([n, u]) => `<a href="${u}">${esc(n)}</a>`).join("");
  return `<footer><div class="wrap"><div class="fgrid">
<div><a class="logo" href="/"><span class="sun">☀</span><span><b>SUNNY</b><small>TOOLS</small></span><span class="pro">PRO</span></a><p class="fabout">Your everyday digital toolkit with free online tools, converters and daily utilities.</p><h4 style="margin-top:12px">Legal</h4>${legalLinks}</div>
${cols}
</div><div class="copy">© 2026 SunnyToolsPro. All rights reserved. | Website Design &amp; Build by <b style="color:#fff">Sunny Janjowa &amp; Sabir Ali</b></div></div></footer>`;
}
function head({ title, desc, canonical, jsonld }) {
  return `<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="article"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${canonical}">
<meta name="twitter:card" content="summary"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}">
<link rel="stylesheet" href="/tokens.css"><style>${CSS}</style>
${jsonld ? `<script type="application/ld+json">${jsonld}</script>` : ""}`;
}
function page({ title, desc, path, jsonld, crumb, body }) {
  const canonical = site.domain + path;
  return `<!DOCTYPE html><html lang="en"><head>${head({ title, desc, canonical, jsonld })}</head><body>
${header()}<main><div class="wrap"><p class="crumb">${crumb}</p>
<div class="ad-slot-placeholder">Advertisement</div>
${body}
<div class="ad-slot-placeholder">Advertisement</div>
</div></main>${footer()}</body></html>`;
}

/* ---------- widgets ---------- */
const CDN = {
  jspdf: `<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>`,
  pdflib: `<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"></script>`,
  pdfjs: `<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script><script>if(window.pdfjsLib)pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';</script>`,
  mammoth: `<script src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js"></script>`,
};
const DLJS = `<script>function stpDown(bytes,name,mime){var b=bytes instanceof Blob?bytes:new Blob([bytes],{type:mime||'application/octet-stream'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},800)}</script>`;

function widgetHTML(w, slug) {
  const need = { "images-to-pdf": "jspdf", "text-to-pdf": "jspdf", "pdf-to-images": "pdfjs", "pdf-merge": "pdflib", "pdf-split": "pdflib", "pdf-compress": "pdflib", "word-to-pdf": "mammoth+jspdf", "pdf-to-word": "pdfjs" }[w.type];
  const libs = (need ? need.split("+").map((k) => CDN[k === "jspdf" ? "jspdf" : k]).join("") : "") + DLJS;
  let inner = "";
  if (w.type === "images-to-pdf") {
    inner = `<div class="dropzone" id="dz">Tap to upload ${esc(w.formats)} images (multiple allowed)<br><input type="file" id="fi" accept="${esc(w.accept)}" multiple hidden></div>
<div class="thumbs" id="th"></div><div class="row"><button class="btn" id="go" disabled>Convert to PDF</button></div><p class="stat" id="st"></p>
<script>var files=[];var dz=document.getElementById('dz'),fi=document.getElementById('fi');dz.onclick=function(){fi.click()};fi.onchange=function(){files=files.concat(Array.prototype.slice.call(fi.files));render()};function render(){var th=document.getElementById('th');th.innerHTML='';files.forEach(function(f){var u=URL.createObjectURL(f);th.innerHTML+='<img src="'+u+'">'});document.getElementById('go').disabled=!files.length;document.getElementById('st').textContent=files.length?files.length+' image(s) ready':''}
document.getElementById('go').onclick=function(){var js=new window.jspdf.jsPDF({unit:'mm',format:'a4'});var i=0;function next(){if(i>=files.length){js.save('${slug}.pdf')}else{var f=files[i];var img=new Image();img.onload=function(){var pw=210,ph=297;var r=Math.min(pw/img.width,ph/img.height);var w=img.width*r,h=img.height*r;if(i>0)js.addPage();js.addImage(img,(pw-w)/2,(ph-h)/2,w,h);i++;URL.revokeObjectURL(img.src);document.getElementById('st').textContent='Processing '+(i)+'/'+files.length;next()};img.src=URL.createObjectURL(f)}}if(files.length)next()};</script>`;
  } else if (w.type === "text-to-pdf") {
    inner = `<div class="field"><label for="tt">Your text</label><textarea class="ta" id="tt" placeholder="Paste or type your text here…"></textarea></div>
<div class="row"><button class="btn" id="go">Download PDF</button></div><p class="stat" id="st"></p>
<script>document.getElementById('go').onclick=function(){var t=document.getElementById('tt').value.trim();if(!t){document.getElementById('st').textContent='Please enter some text first.';return}var js=new window.jspdf.jsPDF({unit:'mm',format:'a4'});var lines=js.splitTextToSize(t,170);var y=20;lines.forEach(function(l){if(y>280){js.addPage();y=20}js.text(l,20,y);y+=7});js.save('${slug}.pdf');document.getElementById('st').textContent='Done — '+lines.length+' lines on PDF.'};</script>`;
  } else if (w.type === "pdf-to-images") {
    inner = `<div class="dropzone" id="dz">Tap to upload a PDF file<br><input type="file" id="fi" accept="application/pdf,.pdf" hidden></div>
<div class="row"><button class="btn" id="go" disabled>Convert pages to JPG</button></div><div class="thumbs" id="th"></div><div id="dls"></div><p class="stat" id="st"></p>
<script>var buf=null,fn='document';var dz=document.getElementById('dz'),fi=document.getElementById('fi');dz.onclick=function(){fi.click()};fi.onchange=function(){var f=fi.files[0];if(!f)return;fn=f.name.replace(/\\.pdf$/i,'');var r=new FileReader();r.onload=function(){buf=r.result;document.getElementById('go').disabled=false;document.getElementById('st').textContent=f.name+' loaded'};r.readAsArrayBuffer(f)};
document.getElementById('go').onclick=function(){if(!buf)return;document.getElementById('st').textContent='Rendering…';pdfjsLib.getDocument({data:buf}).promise.then(function(pdf){var th=document.getElementById('th'),dls=document.getElementById('dls');th.innerHTML='';dls.innerHTML='';var jobs=[];for(var p=1;p<=pdf.numPages;p++)(function(p){jobs.push(pdf.getPage(p).then(function(page){var v=page.getViewport({scale:2});var c=document.createElement('canvas');c.width=v.width;c.height=v.height;return page.render({canvasContext:c.getContext('2d'),viewport:v}).promise.then(function(){var img=document.createElement('img');img.src=c.toDataURL('image/jpeg',0.92);th.appendChild(img);var b=document.createElement('button');b.className='btn';b.style.margin='4px';b.textContent='Download page '+p;b.onclick=function(){c.toBlob(function(bl){stpDown(bl,fn+'-p'+p+'.jpg','image/jpeg')})};dls.appendChild(b)})}))})(p);Promise.all(jobs).then(function(){document.getElementById('st').textContent=pdf.numPages+' page(s) converted.'})})};</script>`;
  } else if (w.type === "pdf-merge") {
    inner = `<div class="dropzone" id="dz">Tap to add PDF files (in merge order)<br><input type="file" id="fi" accept="application/pdf,.pdf" multiple hidden></div>
<div class="out" id="list">No files yet.</div><div class="row"><button class="btn" id="go" disabled>Merge PDFs</button></div><p class="stat" id="st"></p>
<script>var files=[];var dz=document.getElementById('dz'),fi=document.getElementById('fi');dz.onclick=function(){fi.click()};fi.onchange=function(){files=files.concat(Array.prototype.slice.call(fi.files));document.getElementById('list').textContent=files.map(function(f,i){return (i+1)+'. '+f.name}).join('\\n');document.getElementById('go').disabled=!files.length};
document.getElementById('go').onclick=function(){if(!files.length)return;document.getElementById('st').textContent='Merging…';var out=null;var chain=PDFLib.PDFDocument.create().then(function(d){out=d;var s=Promise.resolve();files.forEach(function(f){s=s.then(function(){return f.arrayBuffer().then(function(b){return PDFLib.PDFDocument.load(b).then(function(src){return out.copyPages(src,src.getPageIndices()).then(function(pgs){pgs.forEach(function(p){out.addPage(p)})})})})})});return s});chain.then(function(){return out.save()}).then(function(bytes){stpDown(bytes,'merged.pdf','application/pdf');document.getElementById('st').textContent='Done — '+files.length+' files merged.'})};</script>`;
  } else if (w.type === "pdf-split") {
    inner = `<div class="dropzone" id="dz">Tap to upload a PDF file<br><input type="file" id="fi" accept="application/pdf,.pdf" hidden></div>
<div class="row"><div class="field"><label for="rg">Pages (e.g. 1-3, or 1,4,7, or "all")</label><input id="rg" value="1-3" style="width:220px"></div><button class="btn" id="go" disabled>Split PDF</button></div><div id="dls"></div><p class="stat" id="st"></p>
<script>var buf=null,fn='document',n=0;var dz=document.getElementById('dz'),fi=document.getElementById('fi');dz.onclick=function(){fi.click()};fi.onchange=function(){var f=fi.files[0];if(!f)return;fn=f.name.replace(/\\.pdf$/i,'');var r=new FileReader();r.onload=function(){buf=r.result;PDFLib.PDFDocument.load(buf).then(function(d){n=d.getPageCount();document.getElementById('go').disabled=false;document.getElementById('st').textContent=f.name+' — '+n+' pages'})};r.readAsArrayBuffer(f)};
function parseRg(s,total){s=s.trim().toLowerCase();if(s==='all')return Array.from({length:total},function(_,i){return [i]});var out=[];s.split(',').forEach(function(p){p=p.trim();var m=p.match(/^(\\d+)\\s*-\\s*(\\d+)$/);if(m){var a=+m[1],b=+m[2];for(var i=Math.max(1,a);i<=Math.min(total,b);i++)out.push(i-1)}else if(/^\\d+$/.test(p)&&+p>=1&&+p<=total)out.push(+p-1)});return out.length?[out]:[]}
document.getElementById('go').onclick=function(){if(!buf)return;var groups=parseRg(document.getElementById('rg').value,n);if(!groups.length){document.getElementById('st').textContent='Invalid range.';return}document.getElementById('st').textContent='Splitting…';var dls=document.getElementById('dls');dls.innerHTML='';PDFLib.PDFDocument.load(buf).then(function(src){var jobs=groups.map(function(g,gi){return PDFLib.PDFDocument.create().then(function(d){return d.copyPages(src,g).then(function(pgs){pgs.forEach(function(p){d.addPage(p)});return d.save()}).then(function(bytes){var b=document.createElement('button');b.className='btn';b.style.margin='4px';b.textContent=groups.length>1?('Download pages set '+(gi+1)):('Download '+fn+'-split.pdf');b.onclick=function(){stpDown(bytes,fn+(groups.length>1?('-part'+(gi+1)):'-split')+'.pdf','application/pdf')};dls.appendChild(b)})})});return Promise.all(jobs)}).then(function(){document.getElementById('st').textContent='Done.'})};</script>`;
  } else if (w.type === "pdf-compress") {
    inner = `<div class="dropzone" id="dz">Tap to upload a PDF file<br><input type="file" id="fi" accept="application/pdf,.pdf" hidden></div>
<div class="row"><button class="btn" id="go" disabled>Compress PDF</button></div><p class="stat" id="st"></p><div id="dls"></div>
<script>var buf=null,fn='document',sz=0;var dz=document.getElementById('dz'),fi=document.getElementById('fi');dz.onclick=function(){fi.click()};fi.onchange=function(){var f=fi.files[0];if(!f)return;fn=f.name.replace(/\\.pdf$/i,'');sz=f.size;var r=new FileReader();r.onload=function(){buf=r.result;document.getElementById('go').disabled=false;document.getElementById('st').textContent=f.name+' — '+(sz/1048576).toFixed(2)+' MB'};r.readAsArrayBuffer(f)};
document.getElementById('go').onclick=function(){if(!buf)return;document.getElementById('st').textContent='Compressing…';PDFLib.PDFDocument.load(buf).then(function(d){return d.save({useObjectStreams:true})}).then(function(bytes){var pct=Math.round((1-bytes.length/sz)*100);document.getElementById('st').textContent='Before: '+(sz/1048576).toFixed(2)+' MB → After: '+(bytes.length/1048576).toFixed(2)+' MB (saved '+pct+'%)';var dls=document.getElementById('dls');dls.innerHTML='';var b=document.createElement('button');b.className='btn';b.textContent='Download compressed PDF';b.onclick=function(){stpDown(bytes,fn+'-compressed.pdf','application/pdf')};dls.appendChild(b)})};</script>`;
  } else if (w.type === "word-to-pdf") {
    inner = `<div class="dropzone" id="dz">Tap to upload a .docx file<br><input type="file" id="fi" accept=".docx" hidden></div>
<div class="out" id="pv">Extracted text will appear here.</div><div class="row"><button class="btn" id="go" disabled>Convert to PDF</button></div><p class="stat" id="st"></p>
<script>var txt='';var dz=document.getElementById('dz'),fi=document.getElementById('fi');dz.onclick=function(){fi.click()};fi.onchange=function(){var f=fi.files[0];if(!f)return;var r=new FileReader();r.onload=function(){mammoth.extractRawText({arrayBuffer:r.result}).then(function(res){txt=res.value;document.getElementById('pv').textContent=txt.slice(0,2000);document.getElementById('go').disabled=!txt.trim();document.getElementById('st').textContent=f.name+' read.'})};r.readAsArrayBuffer(f)};
document.getElementById('go').onclick=function(){if(!txt.trim())return;var js=new window.jspdf.jsPDF({unit:'mm',format:'a4'});var y=20;txt.split(/\\n/).forEach(function(para){var lines=js.splitTextToSize(para,170);if(!lines.length)lines=[''];lines.forEach(function(l){if(y>280){js.addPage();y=20}if(l)js.text(l,20,y);y+=7});y+=2});js.save('${slug}.pdf');document.getElementById('st').textContent='PDF downloaded.'};</script>`;
  } else if (w.type === "pdf-to-word") {
    inner = `<div class="dropzone" id="dz">Tap to upload a PDF file<br><input type="file" id="fi" accept="application/pdf,.pdf" hidden></div>
<div class="out" id="pv">Extracted text will appear here.</div><div class="row"><button class="btn" id="go" disabled>Convert to Word (.doc)</button></div><p class="stat" id="st"></p>
<script>var txt='',fn='document';var dz=document.getElementById('dz'),fi=document.getElementById('fi');dz.onclick=function(){fi.click()};fi.onchange=function(){var f=fi.files[0];if(!f)return;fn=f.name.replace(/\\.pdf$/i,'');var r=new FileReader();r.onload=function(){pdfjsLib.getDocument({data:r.result}).promise.then(function(pdf){var jobs=[];for(var p=1;p<=pdf.numPages;p++)(function(p){jobs.push(pdf.getPage(p).then(function(pg){return pg.getTextContent().then(function(tc){return tc.items.map(function(it){return it.str}).join(' ')})}))})(p);Promise.all(jobs).then(function(pages){txt=pages.join('\\n\\n');document.getElementById('pv').textContent=txt.slice(0,2000)||'(No extractable text — this PDF may be scanned images.)';document.getElementById('go').disabled=!txt.trim()})})};r.readAsArrayBuffer(f)};
document.getElementById('go').onclick=function(){if(!txt.trim())return;var paras=txt.split(/\\n+/).map(function(p){return '<p>'+p.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</p>'}).join('');var doc='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"></head><body>'+paras+'</body></html>';stpDown(new Blob(['\\ufeff'+doc],{type:'application/msword'}),fn+'.doc');document.getElementById('st').textContent='Word file downloaded — opens in Word & Google Docs.'};</script>`;
  } else if (w.type === "image-compress") {
    inner = `<div class="dropzone" id="dz">Tap to upload a JPG or PNG image<br><input type="file" id="fi" accept="image/jpeg,image/png" hidden></div>
<div class="thumbs" id="th"></div><div class="row"><div class="field"><label for="q">Quality: <span id="qv">75</span>%</label><input type="range" id="q" min="10" max="95" value="75"></div><button class="btn" id="go" disabled>Compress</button></div><p class="stat" id="st"></p><div class="thumbs" id="out"></div><div id="dls"></div>
<script>var img=null,fn='image';var dz=document.getElementById('dz'),fi=document.getElementById('fi');dz.onclick=function(){fi.click()};fi.onchange=function(){var f=fi.files[0];if(!f)return;fn=f.name.replace(/\\.[^.]+$/,'');var im=new Image();im.onload=function(){img=im;var th=document.getElementById('th');th.innerHTML='';var t=im.cloneNode();t.style.width='86px';t.style.height='86px';th.appendChild(t);document.getElementById('go').disabled=false;document.getElementById('st').textContent='Original: '+Math.round(f.size/1024)+' KB, '+im.width+'×'+im.height;URL.revokeObjectURL(im.src)};im.src=URL.createObjectURL(f)};
document.getElementById('q').oninput=function(){document.getElementById('qv').textContent=this.value};
document.getElementById('go').onclick=function(){if(!img)return;var c=document.createElement('canvas');c.width=img.width;c.height=img.height;c.getContext('2d').drawImage(img,0,0);var q=document.getElementById('q').value/100;c.toBlob(function(bl){var o=document.getElementById('out');o.innerHTML='';var u=URL.createObjectURL(bl);o.innerHTML='<img src="'+u+'">';document.getElementById('st').textContent='Compressed: '+Math.round(bl.size/1024)+' KB at '+document.getElementById('q').value+'% quality';var dls=document.getElementById('dls');dls.innerHTML='';var b=document.createElement('button');b.className='btn';b.textContent='Download compressed image';b.onclick=function(){stpDown(bl,fn+'-compressed.jpg','image/jpeg')};dls.appendChild(b)},'image/jpeg',q)};</script>`;
  } else if (w.type === "image-resize") {
    inner = `<div class="dropzone" id="dz">Tap to upload an image<br><input type="file" id="fi" accept="image/*" hidden></div>
<div class="thumbs" id="th"></div><div class="row"><div class="field"><label for="w">Width (px)</label><input id="w" type="number" min="1" style="width:110px"></div><div class="field"><label for="h">Height (px)</label><input id="h" type="number" min="1" style="width:110px"></div><div class="field"><label for="lk">Aspect</label><select id="lk"><option value="1">Locked</option><option value="0">Free</option></select></div><div class="field"><label for="fm">Format</label><select id="fm"><option value="jpeg">JPG</option><option value="png">PNG</option></select></div><button class="btn" id="go" disabled>Resize</button></div><p class="stat" id="st"></p><div class="thumbs" id="out"></div><div id="dls"></div>
<script>var img=null,fn='image',ow=0,oh=0;var dz=document.getElementById('dz'),fi=document.getElementById('fi');dz.onclick=function(){fi.click()};fi.onchange=function(){var f=fi.files[0];if(!f)return;fn=f.name.replace(/\\.[^.]+$/,'');var im=new Image();im.onload=function(){img=im;ow=im.width;oh=im.height;document.getElementById('w').value=ow;document.getElementById('h').value=oh;var th=document.getElementById('th');th.innerHTML='<img src="'+im.src+'">';document.getElementById('go').disabled=false;document.getElementById('st').textContent='Original: '+ow+'×'+oh};im.src=URL.createObjectURL(f)};
document.getElementById('w').oninput=function(){if(document.getElementById('lk').value==='1'&&ow)document.getElementById('h').value=Math.round(this.value*oh/ow)};
document.getElementById('h').oninput=function(){if(document.getElementById('lk').value==='1'&&oh)document.getElementById('w').value=Math.round(this.value*ow/oh)};
document.getElementById('go').onclick=function(){if(!img)return;var w=+document.getElementById('w').value,h=+document.getElementById('h').value;if(!(w>0&&h>0))return;var fm=document.getElementById('fm').value;var c=document.createElement('canvas');c.width=w;c.height=h;var ctx=c.getContext('2d');ctx.imageSmoothingQuality='high';ctx.drawImage(img,0,0,w,h);var mime=fm==='png'?'image/png':'image/jpeg';c.toBlob(function(bl){var o=document.getElementById('out');var u=URL.createObjectURL(bl);o.innerHTML='<img src="'+u+'">';document.getElementById('st').textContent='Resized: '+w+'×'+h+', '+Math.round(bl.size/1024)+' KB';var dls=document.getElementById('dls');dls.innerHTML='';var b=document.createElement('button');b.className='btn';b.textContent='Download resized image';b.onclick=function(){stpDown(bl,fn+'-'+w+'x'+h+'.'+fm,mime)};dls.appendChild(b)},mime,0.92)};</script>`;
  } else if (w.type === "image-crop") {
    inner = `<div class="dropzone" id="dz">Tap to upload a photo<br><input type="file" id="fi" accept="image/*" hidden></div>
<div class="thumbs" id="th"></div><div class="row"><div class="field"><label>Preset</label><select id="pr"><option value="free">Free</option><option value="1">Square 1:1</option><option value="0.75">Passport 3:4</option><option value="1.333">Wide 4:3</option><option value="1.777">Banner 16:9</option></select></div><div class="field"><label for="cx">X</label><input id="cx" type="number" value="0" style="width:80px"></div><div class="field"><label for="cy">Y</label><input id="cy" type="number" value="0" style="width:80px"></div><div class="field"><label for="cw">Width</label><input id="cw" type="number" value="300" style="width:90px"></div><div class="field"><label for="ch">Height</label><input id="ch" type="number" value="300" style="width:90px"></div><button class="btn" id="pv" disabled>Preview</button><button class="btn yellow" id="go" disabled>Crop &amp; Download</button></div><div class="thumbs" id="out"></div><p class="stat" id="st"></p>
<script>var img=null,fn='image';var dz=document.getElementById('dz'),fi=document.getElementById('fi');dz.onclick=function(){fi.click()};fi.onchange=function(){var f=fi.files[0];if(!f)return;fn=f.name.replace(/\\.[^.]+$/,'');var im=new Image();im.onload=function(){img=im;document.getElementById('cw').value=Math.min(600,im.width);document.getElementById('ch').value=Math.min(600,im.height);var th=document.getElementById('th');th.innerHTML='<img src="'+im.src+'" style="width:120px;height:120px">';document.getElementById('pv').disabled=false;document.getElementById('go').disabled=false;document.getElementById('st').textContent='Loaded '+im.width+'×'+im.height+'. Set the crop box, then preview.'};im.src=URL.createObjectURL(f)};
document.getElementById('pr').onchange=function(){var v=this.value;if(v!=='free'&&img){var w=+document.getElementById('cw').value||300;document.getElementById('ch').value=Math.round(w/parseFloat(v))}};
function cropBox(){var x=Math.max(0,+document.getElementById('cx').value||0),y=Math.max(0,+document.getElementById('cy').value||0),w=+document.getElementById('cw').value||0,h=+document.getElementById('ch').value||0;if(!img)return null;w=Math.min(w,img.width-x);h=Math.min(h,img.height-y);if(w<1||h<1)return null;return [x,y,w,h]}
document.getElementById('pv').onclick=function(){var b=cropBox();if(!b){document.getElementById('st').textContent='Invalid crop box.';return}var c=document.createElement('canvas');c.width=b[2];c.height=b[3];c.getContext('2d').drawImage(img,b[0],b[1],b[2],b[3],0,0,b[2],b[3]);document.getElementById('out').innerHTML='<img src="'+c.toDataURL('image/jpeg',0.92)+'">';document.getElementById('st').textContent='Preview: '+b[2]+'×'+b[3]+' from ('+b[0]+','+b[1]+')'};
document.getElementById('go').onclick=function(){var b=cropBox();if(!b)return;var c=document.createElement('canvas');c.width=b[2];c.height=b[3];c.getContext('2d').drawImage(img,b[0],b[1],b[2],b[3],0,0,b[2],b[3]);c.toBlob(function(bl){stpDown(bl,fn+'-cropped.jpg','image/jpeg');document.getElementById('st').textContent='Cropped '+b[2]+'×'+b[3]+' downloaded.'},'image/jpeg',0.92)};</script>`;
  } else if (w.type === "currency") {
    inner = `<div class="row"><div class="field"><label for="amt">Amount</label><input id="amt" type="number" value="1000" min="0" step="any" style="width:150px"></div><div class="field"><label for="fr">From</label><select id="fr"></select></div><div class="field"><label for="to">To</label><select id="to"></select></div></div>
<div class="out" id="res" style="font-size:18px;font-weight:800">—</div><p class="stat" id="rt">Loading live rate…</p>
<script>var CUR=['AED','PKR','INR','USD','EUR','GBP','SAR','QAR','KWD','BHD','OMR','PHP','BDT','EGP','TRY','JPY','CNY','AUD','CAD','CHF'];var fr=document.getElementById('fr'),to=document.getElementById('to');CUR.forEach(function(c){fr.add(new Option(c,c));to.add(new Option(c,c))});fr.value='AED';to.value='PKR';var R=null;
function render(){if(!R)return;var a=parseFloat(document.getElementById('amt').value);var f=fr.value,t=to.value;var r=R[t];if(r==null){document.getElementById('res').textContent='Rate unavailable';return}document.getElementById('res').textContent=isNaN(a)?'Enter an amount':((a*r).toLocaleString('en-AE',{maximumFractionDigits:2})+' '+t);document.getElementById('rt').textContent='1 '+f+' = '+r.toLocaleString('en-AE',{maximumFractionDigits:5})+' '+t}
function load(){var f=fr.value;document.getElementById('rt').textContent='Loading…';fetch('/api/fx?base='+f).then(function(r){return r.json()}).then(function(d){R=d.rates;render()}).catch(function(){document.getElementById('rt').textContent='Rate unavailable — check connection.'})}
document.getElementById('amt').addEventListener('input',render);fr.addEventListener('change',load);to.addEventListener('change',render);load();</script>`;
  } else if (w.type === "vat") {
    inner = `<div class="row"><div class="field"><label for="amt">Amount (AED)</label><input id="amt" type="number" value="1000" min="0" step="any" style="width:150px"></div><div class="field"><label for="md">Mode</label><select id="md"><option value="add">Add 5% VAT</option><option value="ex">Extract VAT (inclusive)</option></select></div><button class="btn" id="go">Calculate</button></div>
<table class="t"><tr><th>Base</th><th>VAT (5%)</th><th>Total</th></tr><tr><td id="b">—</td><td id="v">—</td><td id="t">—</td></tr></table>
<script>function calc(){var a=parseFloat(document.getElementById('amt').value);if(isNaN(a))return;var b,v,t;if(document.getElementById('md').value==='add'){b=a;v=a*0.05;t=a*1.05}else{b=a/1.05;v=a-b;t=a}var f=function(n){return 'AED '+n.toLocaleString('en-AE',{minimumFractionDigits:2,maximumFractionDigits:2})};document.getElementById('b').textContent=f(b);document.getElementById('v').textContent=f(v);document.getElementById('t').textContent=f(t)}document.getElementById('go').onclick=calc;document.getElementById('amt').addEventListener('input',calc);document.getElementById('md').addEventListener('change',calc);calc();</script>`;
  } else if (w.type === "age") {
    inner = `<div class="row"><div class="field"><label for="dob">Date of birth</label><input id="dob" type="date" value="2000-01-01"></div><div class="field"><label for="ref">Age as on (default today)</label><input id="ref" type="date"></div><button class="btn" id="go">Calculate age</button></div>
<div class="out" id="res">—</div>
<script>function calc(){var d=new Date(document.getElementById('dob').value),r=document.getElementById('ref').value?new Date(document.getElementById('ref').value):new Date();if(isNaN(d)||isNaN(r)||r<d){document.getElementById('res').textContent='Enter a valid birth date.';return}var y=r.getFullYear()-d.getFullYear(),m=r.getMonth()-d.getMonth(),dd=r.getDate()-d.getDate();if(dd<0){m--;var pm=new Date(r.getFullYear(),r.getMonth(),0).getDate();dd+=pm}if(m<0){y--;m+=12}var days=Math.floor((r-d)/86400000);var nxt=new Date(r.getFullYear(),d.getMonth(),d.getDate());if(nxt<=r)nxt.setFullYear(nxt.getFullYear()+1);var toB=Math.ceil((nxt-r)/86400000);document.getElementById('res').textContent=y+' years, '+m+' months, '+dd+' days  •  '+days.toLocaleString()+' days lived  •  next birthday in '+toB+' day(s)'}document.getElementById('go').onclick=calc;calc();</script>`;
  } else if (w.type === "unit") {
    inner = `<div class="row"><div class="field"><label for="cat">Category</label><select id="cat"><option value="length">Length</option><option value="weight">Weight</option><option value="temp">Temperature</option><option value="speed">Speed</option><option value="area">Area</option><option value="data">Data size</option></select></div><div class="field"><label for="val">Value</label><input id="val" type="number" value="1" step="any" style="width:130px"></div><div class="field"><label for="un">From unit</label><select id="un"></select></div></div>
<table class="t"><thead><tr><th>Unit</th><th>Value</th></tr></thead><tbody id="tb"></tbody></table>
<script>var U={length:{m:1,mm:0.001,cm:0.01,km:1000,in:0.0254,ft:0.3048,yd:0.9144,mi:1609.344},weight:{kg:1,mg:0.000001,g:0.001,t:1000,oz:0.028349523125,lb:0.45359237,st:6.35029318},speed:{'m/s':1,'km/h':0.2777777778,mph:0.44704,knot:0.514444,'ft/s':0.3048},area:{'m²':1,'cm²':0.0001,ha:10000,'km²':1000000,'ft²':0.09290304,acre:4046.8564224,'mi²':2589988.110336},data:{B:1,KB:1000,MB:1000000,GB:1000000000,TB:1000000000000,KiB:1024,MiB:1048576,GiB:1073741824},temp:{C:1,F:1,K:1}};
function toC(v,u){return u==='C'?v:u==='F'?(v-32)*5/9:v-273.15}function fromC(v,u){return u==='C'?v:u==='F'?v*9/5+32:v+273.15}
function render(){var c=document.getElementById('cat').value,v=parseFloat(document.getElementById('val').value),u=document.getElementById('un').value;var tb=document.getElementById('tb');tb.innerHTML='';if(isNaN(v))return;if(c==='temp'){var cv=toC(v,u);Object.keys(U.temp).forEach(function(k){var r=fromC(cv,k);tb.innerHTML+='<tr><td>°'+k+'</td><td>'+(+r.toFixed(4))+'</td></tr>'})}else{var base=v*U[c][u];Object.keys(U[c]).forEach(function(k){var r=base/U[c][k];tb.innerHTML+='<tr><td>'+k+'</td><td>'+(+r.toPrecision(6))+'</td></tr>'})}}
function fillU(){var c=document.getElementById('cat').value,un=document.getElementById('un');un.innerHTML='';Object.keys(U[c]).forEach(function(k){un.add(new Option(c==='temp'?'°'+k:k,k))});render()}
document.getElementById('cat').addEventListener('change',fillU);document.getElementById('val').addEventListener('input',render);document.getElementById('un').addEventListener('change',render);fillU();</script>`;
  } else if (w.type === "qibla") {
    inner = `<div class="row"><button class="btn" id="go">Use my location</button></div>
<div class="out" id="res">Press the button and allow location access. Your coordinates never leave this page.</div>
<div style="text-align:center;margin:12px 0"><div id="dial" style="display:inline-block;width:150px;height:150px;border-radius:50%;border:3px solid #0b2342;position:relative;background:#fff"><div id="nd" style="position:absolute;top:2px;left:0;right:0;text-align:center;font-weight:800;color:#0b2342">N</div><div id="ar" style="position:absolute;left:50%;top:50%;width:4px;height:60px;background:#0e9f6e;transform-origin:50% 0;margin-left:-2px">▲</div></div></div>
<script>document.getElementById('go').onclick=function(){var res=document.getElementById('res');if(!navigator.geolocation){res.textContent='Geolocation not supported on this device.';return}res.textContent='Locating…';navigator.geolocation.getCurrentPosition(function(p){var lat=p.coords.latitude*Math.PI/180,lon=p.coords.longitude*Math.PI/180;var kLat=21.4225*Math.PI/180,kLon=39.8262*Math.PI/180;var y=Math.sin(kLon-lon);var x=Math.cos(lat)*Math.tan(kLat)-Math.sin(lat)*Math.cos(kLon-lon);var br=(Math.atan2(y,x)*180/Math.PI+360)%360;res.textContent='Your Qibla bearing: '+br.toFixed(1)+'° from true north. Rotate until this arrow points '+br.toFixed(1)+'° on a compass.';document.getElementById('ar').style.transform='rotate('+br+'deg)'},function(){res.textContent='Location denied. Enable location services and try again.'})};</script>`;
  }
  return `<div class="widget">${inner}</div>${libs}`;
}

/* ---------- tool page ---------- */
function toolPage(t) {
  const url = "/tools/" + t.slug;
  const faqJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  });
  const steps = t.steps.map((s) => `<li><b>${esc(s.t)}.</b> ${esc(s.d)}</li>`).join("");
  const feats = t.features.map((f) => `<div class="feat"><b>${esc(f.t)}</b><span>${esc(f.d)}</span></div>`).join("");
  const faqs = t.faqs.map((f) => `<details class="faq"><summary>${esc(f.q)}</summary><div class="a">${esc(f.a)}</div></details>`).join("");
  const tips = t.tips.map((x) => `<li>${esc(x)}</li>`).join("");
  const rel = t.related.map((s) => { const r = tools.find((x) => x.slug === s); return r ? `<a href="/tools/${r.slug}">→ ${esc(r.name)}</a>` : ""; }).join("");
  const body = `
<div class="tool-title">${esc(t.h1)}</div>
<p class="postmeta">Free online tool · No signup · Works on mobile</p>
${widgetHTML(t.widget, t.slug)}
<div class="card"><h1>${esc(t.h1)}</h1>
<p class="lead">${esc(t.overview[0])}</p>
${t.overview.slice(1).map((p) => `<p>${esc(p)}</p>`).join("")}
<h2>How to Use This Tool (Step-by-Step Guide)</h2>
<ol class="steps">${steps}</ol>
<h2>Key Features &amp; Benefits</h2>
<div class="feat-grid">${feats}</div>
<h2>Understanding ${esc(t.name)}</h2>
${t.understanding.map((p) => `<p>${esc(p)}</p>`).join("")}
<h2>Pro Tips for Best Results</h2>
<ul>${tips}</ul>
<h2>Frequently Asked Questions</h2>
${faqs}
<div class="privacy-box"><b>Security &amp; Privacy Guarantee.</b> Your privacy is guaranteed. All processing is done locally in your browser/deleted automatically from our servers after processing. Your files are never uploaded, stored or shared.</div>
<h2>Works Everywhere You Do</h2>
<p>This tool is fully responsive: identical features on Android, iPhone, tablets and desktops, with no app to install. Files stay on your device, results download straight to your downloads folder, and everything is free without an account.</p>
<h2>Related Tools</h2><div class="rel">${rel}</div>
<p><a href="/#tools">Explore all free tools →</a> · <a href="/blog">Read how-to guides →</a></p>
</div>
<div class="cta"><b>Try ${esc(t.name)} now — free forever</b><p>No signup · No watermark · Private by design</p><a href="#top-widget" onclick="window.scrollTo({top:0,behavior:'smooth'});return false">Open the tool ↑</a></div>`;
  // anchor for CTA scroll: mark widget
  const bodyAnchored = body.replace('<div class="widget">', '<div class="widget" id="top-widget">');
  const count = words(bodyAnchored);
  return { html: page({ title: t.title + " | SunnyToolsPro", desc: t.description, path: url, jsonld: faqJson, crumb: `<a href="/">Home</a> / Tools / ${esc(t.name)}`, body: bodyAnchored }), count };
}

/* ---------- legal / contact ---------- */
const CONTACT_FORM = `<form id="cf" class="widget" style="margin-top:12px">
<div class="row"><div class="field"><label for="cn">Name</label><input id="cn" required style="width:220px" placeholder="Your name"></div>
<div class="field"><label for="ce">Email</label><input id="ce" type="email" required style="width:260px" placeholder="you@example.com"></div></div>
<div class="field"><label for="cm">Message</label><textarea class="ta" id="cm" required placeholder="How can we help?" style="min-height:120px"></textarea></div>
<div class="row"><button class="btn" type="submit">Send message</button><button class="btn yellow" type="button" id="cp">Copy support email</button></div>
<p class="stat" id="cs"></p></form>
<script>document.getElementById('cf').addEventListener('submit',function(e){e.preventDefault();var n=document.getElementById('cn').value.trim(),m=document.getElementById('ce').value.trim(),b=document.getElementById('cm').value.trim();if(!n||!m||!b){document.getElementById('cs').textContent='Please fill all fields.';return}location.href='mailto:support@yourdomain.com?subject='+encodeURIComponent('Support: '+n)+'&body='+encodeURIComponent(b+'\\n\\n— '+n+' ('+m+')');document.getElementById('cs').textContent='Opening your email app…'});document.getElementById('cp').onclick=function(){try{navigator.clipboard.writeText('support@yourdomain.com');document.getElementById('cs').textContent='Email copied.'}catch(e){document.getElementById('cs').textContent='Email: support@yourdomain.com'}};</script>`;

/* ---------- blog ---------- */
function blogCard(p) {
  return `<a class="postcard" href="/blog/${p.slug}"><b>${esc(p.title)}</b><p>${esc(p.description)}</p><small>${esc(p.date)} · ${p.readMins} min read · Related: ${esc(p.tool.name)}</small></a>`;
}

/* ---------- emit ---------- */
function write(rel, content) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  console.log("wrote", rel, content.length + "b");
}

// legal pages
legal.forEach((p) => {
  const secs = (p.slug === "contact" ? [{ h: p.sections[0].h, html: p.sections[0].html.replace("{{CONTACT_FORM}}", CONTACT_FORM) }, ...p.sections.slice(1)] : p.sections)
    .map((s) => `<h2>${esc(s.h)}</h2>${s.html}`).join("");
  write(p.slug + ".html", page({
    title: p.title + " | SunnyToolsPro", desc: p.description, path: "/" + p.slug,
    crumb: `<a href="/">Home</a> / ${esc(p.title)}`,
    body: `<div class="card"><h1>${esc(p.title)}</h1><p class="lead">${esc(p.intro)}</p>${secs}<p><a href="/">← Back to home</a></p></div>`,
  }));
});

// tool pages
let fail = 0;
tools.forEach((t) => {
  const { html, count } = toolPage(t);
  console.log("tool", t.slug, count + " words" + (count < 600 ? "  <-- BELOW 600" : ""));
  if (count < 600) fail++;
  write(path.join("tools", t.slug + ".html"), html);
});

// blog listing
write("blog.html", page({
  title: "Blog & How-To Guides | SunnyToolsPro", desc: "Step-by-step guides for PDF tools, image compression, VAT, Qibla and expat money tips.", path: "/blog",
  crumb: `<a href="/">Home</a> / Blog`,
  body: `<div class="card"><h1>Blog &amp; How-To Guides</h1><p class="lead">Practical, step-by-step guides for our free tools — written for real tasks like job applications, visa files and everyday conversions.</p><div class="bloggrid">${blog.map(blogCard).join("")}</div></div>`,
}));

// blog articles
blog.forEach((p) => {
  const jsonld = JSON.stringify({
    "@context": "https://schema.org", "@type": "Article", headline: p.title, description: p.description,
    datePublished: p.date, author: { "@type": "Organization", name: "SunnyToolsPro" },
  });
  write(path.join("blog", p.slug + ".html"), page({
    title: p.title + " | SunnyToolsPro Blog", desc: p.description, path: "/blog/" + p.slug, jsonld,
    crumb: `<a href="/">Home</a> / <a href="/blog">Blog</a> / ${esc(p.title)}`,
    body: `<div class="card"><h1>${esc(p.title)}</h1><p class="postmeta">${esc(p.date)} · ${p.readMins} min read</p>${p.body}
<div class="cta"><b>Try it right now — free</b><p>Related tool: ${esc(p.tool.name)} · No signup needed</p><a href="${p.tool.url}">Open ${esc(p.tool.name)} →</a></div>
<p><a href="/blog">← All guides</a></p></div>`,
  }));
});

// sitemap + robots
const urls = ["/", "/about", "/contact", "/privacy-policy", "/terms-of-service", "/dmca", "/blog", "/jobs", "/rooms",
  ...blog.map((p) => "/blog/" + p.slug), ...tools.map((t) => "/tools/" + t.slug)];
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
  urls.map((u) => `<url><loc>${site.domain + u}</loc><lastmod>2026-10-06</lastmod><changefreq>monthly</changefreq></url>`).join("") + `</urlset>`);
write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${site.domain}/sitemap.xml\n`);

if (fail) { console.error(fail + " tool pages below 600 words"); process.exit(1); }
console.log("done: " + tools.length + " tools, " + blog.length + " posts, " + legal.length + " legal pages");
