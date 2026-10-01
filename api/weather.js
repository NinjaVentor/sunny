// GET /api/weather?lat=..&lon=.. — current conditions for any coordinates.
const { cached, upstream, sendJSON, query } = require("./_lib");

module.exports = function handler(req, res) {
  const p = query(req);
  const lat = Number(p.get("lat"));
  const lon = Number(p.get("lon"));
  if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return sendJSON(res, { error: "bad coords" }, 400);
  }
  cached("wx:" + lat.toFixed(3) + "," + lon.toFixed(3), () =>
    upstream(
      "https://api.open-meteo.com/v1/forecast?latitude=" + lat +
      "&longitude=" + lon + "&current=temperature_2m,weather_code&timezone=auto"
    ).then((data) => {
      const cur = data && data.current;
      if (!cur || typeof cur.temperature_2m !== "number") throw new Error("bad wx");
      return { temp: cur.temperature_2m, code: cur.weather_code, time: cur.time, tz: data.timezone || null };
    })
  ).then((d) => sendJSON(res, d)).catch(() => sendJSON(res, { error: "weather unavailable" }, 502));
};
