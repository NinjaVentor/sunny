// GET /api/fx?base=USD — live exchange rates for any base currency.
// Cloudflare Pages Function (file-based routing: functions/api/fx.js -> /api/fx).
export async function onRequest({ request }) {
  const base = (new URL(request.url).searchParams.get("base") || "USD").toUpperCase();
  if (!/^[A-Z]{3}$/.test(base)) {
    return Response.json({ error: "bad base" }, { status: 400 });
  }
  try {
    const upstream = await fetch("https://open.er-api.com/v6/latest/" + base, {
      headers: { "user-agent": "sunnytoolspro/1.0" },
    });
    if (!upstream.ok) throw new Error("upstream " + upstream.status);
    const data = await upstream.json();
    if (!data || !data.rates || typeof data.rates !== "object") throw new Error("bad fx");
    return Response.json(
      { base, rates: data.rates, updated: data.time_last_update_utc || null },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json({ error: "fx unavailable" }, { status: 502 });
  }
}
