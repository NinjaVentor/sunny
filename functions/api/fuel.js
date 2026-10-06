// GET /api/fuel — monthly UAE fuel prices from data/fuel.json (single source of truth).
// data/fuel.json is refreshed monthly by scripts/update-fuel.mjs (GitHub Actions).
// Edge-cached 1 day; frontend keeps a hardcoded fallback if this fails.
export async function onRequest({ request }) {
  try {
    const res = await fetch(new URL("/data/fuel.json", request.url), {
      headers: { "user-agent": "sunnytoolspro/1.0" },
    });
    if (!res.ok) throw new Error("upstream " + res.status);
    const data = await res.json();
    if (!data || !data.prices) throw new Error("bad fuel data");
    return Response.json(data, {
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
    });
  } catch {
    return Response.json({ error: "fuel unavailable" }, { status: 502 });
  }
}
