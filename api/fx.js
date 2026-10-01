// GET /api/fx?base=USD — live exchange rates for any base currency.
const { cached, upstream, sendJSON, query } = require("./_lib");

module.exports = function handler(req, res) {
  const base = (query(req).get("base") || "USD").toUpperCase();
  if (!/^[A-Z]{3}$/.test(base)) return sendJSON(res, { error: "bad base" }, 400);
  cached("fx:" + base, () =>
    upstream("https://open.er-api.com/v6/latest/" + base).then((data) => {
      if (!data || !data.rates || typeof data.rates !== "object") throw new Error("bad fx");
      return { base, rates: data.rates, updated: data.time_last_update_utc || null };
    })
  ).then((d) => sendJSON(res, d)).catch(() => sendJSON(res, { error: "fx unavailable" }, 502));
};
