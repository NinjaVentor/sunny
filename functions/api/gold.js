// GET /api/gold — gold spot price, USD per troy ounce.
// Cloudflare Pages Function (file-based routing: functions/api/gold.js -> /api/gold).
export async function onRequest() {
  try {
    const upstream = await fetch("https://api.gold-api.com/price/XAU", {
      headers: { "user-agent": "sunnytoolspro/1.0" },
    });
    if (!upstream.ok) throw new Error("upstream " + upstream.status);
    const data = await upstream.json();
    const oz = Number(data.price !== undefined ? data.price : data.value);
    if (!isFinite(oz)) throw new Error("bad gold");
    return Response.json(
      { ounceUSD: oz },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json({ error: "gold unavailable" }, { status: 502 });
  }
}
