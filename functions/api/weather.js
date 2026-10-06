// GET /api/weather?lat=..&lon=.. — current conditions for any coordinates.
// Cloudflare Pages Function (file-based routing: functions/api/weather.js -> /api/weather).
export async function onRequest({ request }) {
  const params = new URL(request.url).searchParams;
  const lat = Number(params.get("lat"));
  const lon = Number(params.get("lon"));
  if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return Response.json({ error: "bad coords" }, { status: 400 });
  }
  try {
    const upstream = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=" + lat +
        "&longitude=" + lon + "&current=temperature_2m,weather_code&timezone=auto",
      { headers: { "user-agent": "sunnytoolspro/1.0" } }
    );
    if (!upstream.ok) throw new Error("upstream " + upstream.status);
    const data = await upstream.json();
    const cur = data && data.current;
    if (!cur || typeof cur.temperature_2m !== "number") throw new Error("bad wx");
    return Response.json(
      { temp: cur.temperature_2m, code: cur.weather_code, time: cur.time, tz: data.timezone || null },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json({ error: "weather unavailable" }, { status: 502 });
  }
}
