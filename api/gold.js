// GET /api/gold — gold spot price, USD per troy ounce.
const { cached, upstream, sendJSON } = require("./_lib");

module.exports = function handler(req, res) {
  cached("gold", () =>
    upstream("https://api.gold-api.com/price/XAU").then((data) => {
      const oz = Number(data.price !== undefined ? data.price : data.value);
      if (!isFinite(oz)) throw new Error("bad gold");
      return { ounceUSD: oz };
    })
  ).then((d) => sendJSON(res, d)).catch(() => sendJSON(res, { error: "gold unavailable" }, 502));
};
