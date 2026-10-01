// GET /api/geocode?q=.. — live city/country suggestions.
const { cached, upstream, sendJSON, query } = require("./_lib");

module.exports = function handler(req, res) {
  const q = (query(req).get("q") || "").trim().slice(0, 80);
  if (q.length < 2) return sendJSON(res, { error: "query too short" }, 400);
  cached("geo:" + q.toLowerCase(), () =>
    upstream(
      "https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(q) +
      "&count=6&language=en&format=json"
    ).then((data) => {
      const list = Array.isArray(data.results) ? data.results : [];
      return {
        places: list.map((p) => ({
          name: p.name,
          country: p.country || "",
          cc: p.country_code || "",
          tz: p.timezone || "",
          region: p.admin1 || "",
          lat: p.latitude,
          lon: p.longitude,
        })),
      };
    })
  ).then((d) => sendJSON(res, d)).catch(() => sendJSON(res, { error: "search unavailable" }, 502));
};
