// GET /api/geocode?q=.. — live city/country suggestions.
// Cloudflare Pages Function (file-based routing: functions/api/geocode.js -> /api/geocode).
export async function onRequest({ request }) {
  const q = (new URL(request.url).searchParams.get("q") || "").trim().slice(0, 80);
  if (q.length < 2) {
    return Response.json({ error: "query too short" }, { status: 400 });
  }
  try {
    const upstream = await fetch(
      "https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(q) +
        "&count=6&language=en&format=json",
      { headers: { "user-agent": "sunnytoolspro/1.0" } }
    );
    if (!upstream.ok) throw new Error("upstream " + upstream.status);
    const data = await upstream.json();
    const list = Array.isArray(data.results) ? data.results : [];
    return Response.json(
      {
        places: list.map((p) => ({
          name: p.name,
          country: p.country || "",
          cc: p.country_code || "",
          tz: p.timezone || "",
          region: p.admin1 || "",
          lat: p.latitude,
          lon: p.longitude,
        })),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json({ error: "search unavailable" }, { status: 502 });
  }
}
