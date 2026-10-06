// GET /api/jobs?count=12&industry=&tag= — live remote jobs via Jobicy (no key needed).
// Trimmed to what the UI needs. Credit: jobs by Jobicy (https://jobicy.com).
const ALLOWED_INDUSTRY = /^[a-zA-Z &+-]{0,40}$/;
export async function onRequest({ request }) {
  const params = new URL(request.url).searchParams;
  const count = Math.min(Math.max(parseInt(params.get("count") || "12", 10) || 12, 1), 30);
  const industry = (params.get("industry") || "").trim();
  const tag = (params.get("tag") || "").trim().slice(0, 40);
  let upstream = "https://jobicy.com/api/v2/remote-jobs?count=" + count;
  if (industry && ALLOWED_INDUSTRY.test(industry)) upstream += "&industry=" + encodeURIComponent(industry.toLowerCase());
  if (tag) upstream += "&tag=" + encodeURIComponent(tag.toLowerCase());
  try {
    const res = await fetch(upstream, { headers: { "user-agent": "sunnytoolspro/1.0" } });
    if (!res.ok) throw new Error("upstream " + res.status);
    const data = await res.json();
    const jobs = Array.isArray(data.jobs) ? data.jobs : [];
    return Response.json(
      {
        jobs: jobs.map((j) => ({
          id: j.id,
          title: j.jobTitle || "Untitled role",
          company: j.companyName || "Company",
          geo: j.jobGeo || "Remote",
          type: Array.isArray(j.jobType) ? j.jobType.join(", ") : j.jobType || "Full-Time",
          industry: Array.isArray(j.jobIndustry) ? j.jobIndustry.join(", ") : j.jobIndustry || "",
          level: j.jobLevel || "",
          excerpt: (j.jobExcerpt || "").replace(/&hellip;|…/g, "").slice(0, 160),
          url: j.url || "https://jobicy.com/remote-jobs",
          date: j.pubDate || null,
        })),
        credit: { name: "Jobicy", url: "https://jobicy.com" },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json({ error: "jobs unavailable" }, { status: 502 });
  }
}
