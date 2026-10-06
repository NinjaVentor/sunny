// GET /api/jobs — live remote jobs via Jobicy (no key needed).
// Walks ALL cursor pages server-side (cap ~5 pages / ~1000 jobs), merges +
// dedupes by id, edge-caches the merged result ~1 hour (polite polling).
// Query: ?count=200 (page size for full walk) | small count (<50) = single page.
//   ?industry=&tag= filters pass through on the first page only.
// Credit: jobs by Jobicy (https://jobicy.com). Apply links always go to the
// job's original URL (required by Jobicy's terms — do not break this).
const MAX_PAGES = 5;
const strip = (s) => String(s || "").replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim().slice(0, 800);
const salaryOf = (j) => {
  if (!j.salaryMin && !j.salaryMax) return "";
  const cur = j.salaryCurrency || "";
  const fmt = (n) => Number(n).toLocaleString("en-US");
  const range = j.salaryMin && j.salaryMax ? fmt(j.salaryMin) + "–" + fmt(j.salaryMax) : fmt(j.salaryMax || j.salaryMin);
  return (cur ? cur + " " : "") + range + (j.salaryPeriod ? " / " + j.salaryPeriod : "");
};
function slim(j) {
  return {
    id: j.id,
    title: j.jobTitle || "Untitled role",
    company: j.companyName || "Company",
    geo: j.jobGeo || "Remote",
    type: Array.isArray(j.jobType) ? j.jobType.join(", ") : j.jobType || "Full-Time",
    industry: Array.isArray(j.jobIndustry) ? j.jobIndustry.join(", ") : j.jobIndustry || "",
    level: j.jobLevel || "",
    excerpt: (j.jobExcerpt || "").replace(/&hellip;|…/g, "").slice(0, 160),
    description: strip(j.jobDescription),
    salary: salaryOf(j),
    url: j.url || "https://jobicy.com/remote-jobs",
    date: j.pubDate || null,
  };
}
export async function onRequest({ request }) {
  const params = new URL(request.url).searchParams;
  const count = Math.min(Math.max(parseInt(params.get("count") || "200", 10) || 200, 1), 200);
  const industry = (params.get("industry") || "").trim();
  const tag = (params.get("tag") || "").trim().slice(0, 40);
  const fullWalk = count >= 50;

  // Serve the merged feed from edge cache when available.
  const cacheKey = new Request(new URL("/__cache/jobs-full", request.url).href);
  let cache = null;
  try { cache = caches.default; } catch (_) { /* non-edge runtime */ }
  if (cache && fullWalk && !industry && !tag) {
    try {
      const hit = await cache.match(cacheKey);
      if (hit) return new Response(hit.body, { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Cache": "HIT" } });
    } catch (_) { /* fall through to live walk */ }
  }

  try {
    let base = "https://jobicy.com/api/v2/remote-jobs?count=" + count;
    if (industry && /^[a-zA-Z &+-]{0,40}$/.test(industry)) base += "&industry=" + encodeURIComponent(industry.toLowerCase());
    if (tag) base += "&tag=" + encodeURIComponent(tag.toLowerCase());
    const seen = new Set();
    const jobs = [];
    let cursor = null, pages = 0;
    do {
      const url = cursor ? base + "&cursor=" + encodeURIComponent(cursor) : base;
      const res = await fetch(url, { headers: { "user-agent": "sunnytoolspro/1.0" } });
      if (!res.ok) throw new Error("upstream " + res.status);
      const data = await res.json();
      const batch = Array.isArray(data.jobs) ? data.jobs : [];
      for (const j of batch) {
        if (j == null || j.id == null || seen.has(j.id)) continue;
        seen.add(j.id);
        jobs.push(slim(j));
      }
      cursor = data.hasMore ? data.nextCursor || null : null;
      pages++;
    } while (fullWalk && cursor && pages < MAX_PAGES && jobs.length < 1000);

    const payload = JSON.stringify({ jobs, pages, credit: { name: "Jobicy", url: "https://jobicy.com" } });
    if (cache && fullWalk && !industry && !tag) {
      try {
        await cache.put(cacheKey, new Response(payload, { headers: { "Content-Type": "application/json; charset=utf-8" } }));
      } catch (_) { /* caching is best-effort */ }
    }
    return new Response(payload, { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "jobs unavailable" }, { status: 502 });
  }
}
